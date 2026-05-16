import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { createServerClient } from '@/lib/supabase/server'
import { streamClaudeAPI } from '@/lib/claude/client'
import { SYSTEM_PROMPT_LEGAL_CHAT } from '@/lib/claude/prompts'
import { sanitizeText, validateUUID } from '@/lib/security/sanitize'
import { withErrorHandler, ValidationError, UnauthorizedError } from '@/lib/security/apiResponse'
import { auditLog } from '@/lib/security/gdpr'

const MAX_HISTORY = 10
const MAX_MESSAGE_LENGTH = 4000

export async function POST(req: NextRequest) {
  return withErrorHandler(async () => {
    const session = await auth().catch(() => null)
    if (!session?.user?.id) throw new UnauthorizedError()

    const body = await req.json()
    const message = sanitizeText(body.message)
    if (!message?.trim()) throw new ValidationError('Mensaje vacío')
    if (message.length > MAX_MESSAGE_LENGTH) throw new ValidationError(`Mensaje demasiado largo (máximo ${MAX_MESSAGE_LENGTH} caracteres)`)

    let conversationId: string | null = null
    if (body.conversationId && body.conversationId !== 'null') {
      conversationId = validateUUID(body.conversationId)
    }

    const supabase = createServerClient()

    // Create conversation if needed, verify ownership if provided
    let convId = conversationId
    if (!convId) {
      const { data: conv } = await supabase
        .from('chat_conversations')
        .insert({ user_id: session.user.id, title: message.slice(0, 60) })
        .select()
        .single()
      convId = conv?.id ?? null
    } else {
      // Verify conversation belongs to user
      const { data: convCheck } = await supabase
        .from('chat_conversations')
        .select('id')
        .eq('id', convId)
        .eq('user_id', session.user.id)
        .single()
      if (!convCheck) throw new ValidationError('Conversación no encontrada')
    }

    // Recover history (last MAX_HISTORY messages)
    const { data: history } = await supabase
      .from('chat_messages')
      .select('role, content')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: false })
      .limit(MAX_HISTORY)

    const messages = [
      ...(history || []).reverse().map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      { role: 'user' as const, content: message },
    ]

    // Save user message
    await supabase.from('chat_messages').insert({
      conversation_id: convId,
      role: 'user',
      content: message,
      tokens_output: 0,
    })

    await auditLog({
      userId: session.user.id,
      action: 'CHAT_MESSAGE',
      resourceType: 'conversation',
      resourceId: convId ?? undefined,
      ipAddress: req.headers.get('x-forwarded-for') || undefined,
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        let fullResponse = ''
        try {
          const streamObj = streamClaudeAPI(SYSTEM_PROMPT_LEGAL_CHAT, messages, { maxTokens: 1500 })

          for await (const event of streamObj) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              fullResponse += event.delta.text
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'delta', text: event.delta.text })}\n\n`))
            }
          }

          const finalMessage = await streamObj.finalMessage()
          const outputTokens = finalMessage.usage.output_tokens
          const cacheRead = (finalMessage.usage as unknown as Record<string, number>).cache_read_input_tokens || 0
          const costCents = Math.round(
            ((finalMessage.usage.input_tokens / 1_000_000) * 0.80 +
              (outputTokens / 1_000_000) * 4.00 +
              (cacheRead / 1_000_000) * 0.08) * 0.92 * 100
          )

          await supabase.from('chat_messages').insert({
            conversation_id: convId,
            role: 'assistant',
            content: fullResponse,
            tokens_output: outputTokens,
          })

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done', conversation_id: convId, cost_eur_cents: costCents })}\n\n`))
        } catch {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: 'Error procesando respuesta' })}\n\n`))
        } finally {
          controller.close()
        }
      },
    })

    return new Response(readable, {
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' },
    }) as unknown as NextResponse
  })
}

export async function GET() {
  return withErrorHandler(async () => {
    const session = await auth().catch(() => null)
    if (!session?.user?.id) throw new UnauthorizedError()

    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('chat_conversations')
      .select('id, title, created_at')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) throw new Error(error.message)
    return NextResponse.json({ conversations: data })
  })
}
