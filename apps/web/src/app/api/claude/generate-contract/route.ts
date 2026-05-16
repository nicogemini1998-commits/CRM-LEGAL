import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { createServerClient } from '@/lib/supabase/server'
import { streamClaudeAPI, callClaudeAPI } from '@/lib/claude/client'
import { SYSTEM_PROMPT_CONTRACT_GENERATION, CONTRACT_TYPE_PROMPTS } from '@/lib/claude/prompts'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { contractType, fields, caseId, stream = true } = await req.json()

  if (!contractType || !CONTRACT_TYPE_PROMPTS[contractType]) {
    return NextResponse.json({ error: 'Tipo de contrato no válido' }, { status: 400 })
  }

  const fieldsList = Object.entries(fields || {})
    .map(([k, v]) => `- ${k}: ${v}`)
    .join('\n')

  const userMessage = `${CONTRACT_TYPE_PROMPTS[contractType]}

DATOS PROPORCIONADOS:
${fieldsList || '(Sin datos adicionales — usa placeholders entre [corchetes])'}

Genera el contrato completo en Markdown.`

  if (!stream) {
    const { content, usage } = await callClaudeAPI(
      SYSTEM_PROMPT_CONTRACT_GENERATION,
      [{ role: 'user', content: userMessage }],
      { maxTokens: 3500 }
    )

    const supabase = createServerClient()
    const { data: saved } = await supabase
      .from('generated_contracts')
      .insert({
        user_id: session.user.id,
        case_id: caseId || null,
        contract_type: contractType,
        content,
        field_values: fields || {},
        tokens_used: usage.input_tokens + usage.output_tokens,
      })
      .select()
      .single()

    return NextResponse.json({ contract: saved, cost_eur_cents: usage.cost_eur_cents })
  }

  // Streaming SSE
  const encoder = new TextEncoder()
  const supabase = createServerClient()

  const readable = new ReadableStream({
    async start(controller) {
      let fullText = ''
      try {
        const streamObj = streamClaudeAPI(
          SYSTEM_PROMPT_CONTRACT_GENERATION,
          [{ role: 'user', content: userMessage }],
          { maxTokens: 3500 }
        )

        for await (const event of streamObj) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            fullText += event.delta.text
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'delta', text: event.delta.text })}\n\n`))
          }
        }

        const finalMessage = await streamObj.finalMessage()
        const usage = finalMessage.usage
        const tokensUsed = usage.input_tokens + usage.output_tokens
        const cacheRead = (usage as unknown as Record<string, number>).cache_read_input_tokens || 0
        const costCents = Math.round(
          ((usage.input_tokens / 1_000_000) * 0.80 +
            (usage.output_tokens / 1_000_000) * 4.00 +
            (cacheRead / 1_000_000) * 0.08) * 0.92 * 100
        )

        const { data: saved } = await supabase
          .from('generated_contracts')
          .insert({
            user_id: session.user.id,
            case_id: caseId || null,
            contract_type: contractType,
            content: fullText,
            field_values: fields || {},
            tokens_used: tokensUsed,
          })
          .select()
          .single()

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done', contract: saved, cost_eur_cents: costCents })}\n\n`))
      } catch (err) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: (err as Error).message })}\n\n`))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(readable, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' },
  })
}
