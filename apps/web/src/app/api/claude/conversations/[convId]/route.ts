import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { createServerClient } from '@/lib/supabase/server'
import { withErrorHandler, UnauthorizedError, ValidationError } from '@/lib/security/apiResponse'
import { validateUUID } from '@/lib/security/sanitize'

export async function GET(req: NextRequest, { params }: { params: Promise<{ convId: string }> }) {
  return withErrorHandler(async () => {
    const session = await auth().catch(() => null)
    if (!session?.user?.id) throw new UnauthorizedError()

    const { convId } = await params
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

    return Response.json({ messages: (messages || []).map(m => ({ role: m.role, content: m.content })) })
  })
}
