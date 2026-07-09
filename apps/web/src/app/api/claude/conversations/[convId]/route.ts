import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { createServerClient } from '@/lib/supabase/server'
import { withErrorHandler, UnauthorizedError, ValidationError } from '@/lib/security/apiResponse'
import { removeConversation } from '@/lib/dev/persist'
import { validateUUID } from '@/lib/security/sanitize'

const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === '1' ||
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

export async function GET(req: NextRequest, { params }: { params: Promise<{ convId: string }> }) {
  return withErrorHandler(async () => {
    const session = await auth().catch(() => null)
    if (!session?.user?.id) throw new UnauthorizedError()

    const { convId } = await params

    if (IS_DEMO) {
      const { DEMO_CONVERSATIONS } = await import('@/lib/dev/demo-data')
      const conv = DEMO_CONVERSATIONS.find(c => c.id === convId)
      if (!conv) throw new ValidationError('Conversación no encontrada')
      return NextResponse.json({ messages: conv.messages.map(m => ({ role: m.role, content: m.content })) })
    }

    const id = validateUUID(convId)
    const supabase = createServerClient()
    const { data: conv } = await supabase
      .from('chat_conversations')
      .select('id')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single()
    if (!conv) throw new ValidationError('Conversación no encontrada')
    const { data: messages } = await supabase
      .from('chat_messages')
      .select('role, content, tokens_output, created_at')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true })
    return NextResponse.json({ messages: (messages || []).map(m => ({ role: m.role, content: m.content })) })
  })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ convId: string }> }) {
  return withErrorHandler(async () => {
    const session = await auth().catch(() => null)
    if (!session?.user?.id) throw new UnauthorizedError()

    const { convId } = await params

    if (IS_DEMO) {
      const { deleteDemoConversation } = await import('@/lib/dev/demo-data')
      deleteDemoConversation(convId)
      removeConversation(convId)
      return NextResponse.json({ ok: true })
    }

    const id = validateUUID(convId)
    const supabase = createServerClient()
    await supabase.from('chat_messages').delete().eq('conversation_id', id)
    const { error } = await supabase
      .from('chat_conversations')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id)
    if (error) throw new Error(error.message)
    return NextResponse.json({ ok: true })
  })
}

