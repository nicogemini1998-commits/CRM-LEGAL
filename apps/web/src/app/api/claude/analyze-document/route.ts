import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { createServerClient } from '@/lib/supabase/server'
import { streamClaudeAPI, callClaudeAPI } from '@/lib/claude/client'
import { SYSTEM_PROMPT_DOCUMENT_ANALYSIS } from '@/lib/claude/prompts'
import { getDocumentText } from '@/lib/storage'
import { validateUUID } from '@/lib/security/sanitize'
import { auditLog } from '@/lib/security/gdpr'

// POST /api/claude/analyze-document
// Body: { documentId, stream?: boolean, analysisType?: 'FULL'|'QUICK' }
export async function POST(req: NextRequest) {
  const session = await auth().catch(() => null)
  if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  if (!body.documentId) return NextResponse.json({ error: 'documentId requerido' }, { status: 400 })

  let documentId: string
  try {
    documentId = validateUUID(body.documentId as string)
  } catch {
    return NextResponse.json({ error: 'documentId inválido' }, { status: 400 })
  }

  const stream = body.stream === true
  const analysisType = body.analysisType === 'QUICK' ? 'QUICK' : 'FULL'

  const supabase = createServerClient()

  const { data: doc, error: docError } = await supabase
    .from('documents')
    .select('*')
    .eq('id', documentId)
    .eq('user_id', session.user.id)
    .single()

  if (docError || !doc) return NextResponse.json({ error: 'Documento no encontrado' }, { status: 404 })

  // Devolver caché si existe — coste 0
  const { data: existing } = await supabase
    .from('document_analyses')
    .select('*')
    .eq('document_id', documentId)
    .eq('analysis_type', analysisType)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existing) {
    if (stream) {
      const encoder = new TextEncoder()
      const readable = new ReadableStream({
        start(controller) {
          const cached = JSON.stringify({ type: 'cached', analysis: existing })
          controller.enqueue(encoder.encode(`data: ${cached}\n\n`))
          controller.close()
        },
      })
      return new Response(readable, {
        headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' },
      })
    }
    return NextResponse.json({ analysis: existing, cached: true })
  }

  let documentText = doc.content || ''
  if (!documentText && doc.storage_path) {
    try {
      documentText = await getDocumentText(doc.storage_path)
    } catch {
      return NextResponse.json({ error: 'No se pudo leer el archivo' }, { status: 422 })
    }
  }
  if (!documentText) return NextResponse.json({ error: 'Documento sin contenido' }, { status: 422 })

  const limit = analysisType === 'QUICK' ? 4500 : 40000
  const textToAnalyze = documentText.slice(0, limit)
  const userMessage = `Analiza este documento:\n\nTÍTULO: ${doc.title}\nTIPO: ${doc.document_type}\n\n${textToAnalyze}`

  if (!stream) {
    const { content, usage } = await callClaudeAPI(
      SYSTEM_PROMPT_DOCUMENT_ANALYSIS,
      [{ role: 'user', content: userMessage }],
      { maxTokens: 3000 }
    )

    let parsedContent: Record<string, unknown> = { raw: content }
    try {
      const match = content.match(/\{[\s\S]*\}/)
      if (match) parsedContent = JSON.parse(match[0])
    } catch { /* keep raw */ }

    const { data: saved } = await supabase
      .from('document_analyses')
      .insert({
        document_id: documentId,
        user_id: session.user.id,
        case_id: doc.case_id || null,
        analysis_type: analysisType,
        content: parsedContent,
        tokens_input: usage.input_tokens,
        tokens_output: usage.output_tokens,
        tokens_cache: usage.cache_read_tokens,
      })
      .select()
      .single()

    await auditLog({
      userId: session.user.id,
      action: 'ANALYZE_DOCUMENT',
      resourceType: 'document',
      resourceId: documentId,
      ipAddress: req.headers.get('x-forwarded-for') || undefined,
    })

    return NextResponse.json({ analysis: saved, cached: false, cost_eur_cents: usage.cost_eur_cents })
  }

  // SSE streaming mode
  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      let fullText = ''
      try {
        const streamObj = streamClaudeAPI(
          SYSTEM_PROMPT_DOCUMENT_ANALYSIS,
          [{ role: 'user', content: userMessage }],
          { maxTokens: 3000 }
        )

        for await (const event of streamObj) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            fullText += event.delta.text
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'delta', text: event.delta.text })}\n\n`))
          }
        }

        const finalMessage = await streamObj.finalMessage()
        const usage = finalMessage.usage

        let parsedContent: Record<string, unknown> = { raw: fullText }
        try {
          const match = fullText.match(/\{[\s\S]*\}/)
          if (match) parsedContent = JSON.parse(match[0])
        } catch { /* keep raw */ }

        const { data: saved } = await supabase
          .from('document_analyses')
          .insert({
            document_id: documentId,
            user_id: session.user.id,
            case_id: doc.case_id || null,
            analysis_type: analysisType,
            content: parsedContent,
            tokens_input: usage.input_tokens,
            tokens_output: usage.output_tokens,
            tokens_cache: (usage as unknown as Record<string, number>).cache_read_input_tokens || 0,
          })
          .select()
          .single()

        const cacheReadTokens = (usage as unknown as Record<string, number>).cache_read_input_tokens || 0
        const costCents = Math.round(
          ((usage.input_tokens / 1_000_000) * 0.80 +
            (usage.output_tokens / 1_000_000) * 4.00 +
            (cacheReadTokens / 1_000_000) * 0.08) * 0.92 * 100
        )

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'done',
          analysis: saved,
          tokens_input: usage.input_tokens,
          tokens_output: usage.output_tokens,
          tokens_cache: cacheReadTokens,
          cost_eur_cents: costCents,
        })}\n\n`))

        await auditLog({
          userId: session.user.id,
          action: 'ANALYZE_DOCUMENT',
          resourceType: 'document',
          resourceId: documentId,
          ipAddress: req.headers.get('x-forwarded-for') || undefined,
        })
      } catch {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: 'Error al procesar el análisis' })}\n\n`))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
