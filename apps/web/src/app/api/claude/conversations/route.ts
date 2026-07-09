import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { createServerClient } from '@/lib/supabase/server'
import { withErrorHandler, UnauthorizedError } from '@/lib/security/apiResponse'
import { clearConversations } from '@/lib/dev/persist'

const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === '1' ||
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

export async function GET(_req: NextRequest) {
  return withErrorHandler(async () => {
    const session = await auth().catch(() => null)
    if (!session?.user?.id) throw new UnauthorizedError()

    if (IS_DEMO) {
      const { DEMO_CONVERSATIONS } = await import('@/lib/dev/demo-data')
      const list = DEMO_CONVERSATIONS.map(c => ({
        id: c.id, title: c.title, created_at: c.created_at, updated_at: c.updated_at, client_id: c.client_id,
      }))
      return NextResponse.json({ conversations: list })
    }

    const supabase = createServerClient()
    const { data: conversations } = await supabase
      .from('chat_conversations')
      .select('id, title, created_at, updated_at')
      .eq('user_id', session.user.id)
      .order('updated_at', { ascending: false })
      .limit(50)

    return NextResponse.json({ conversations: conversations || [] })
  })
}

export async function DELETE() {
  return withErrorHandler(async () => {
    const session = await auth().catch(() => null)
    if (!session?.user?.id) throw new UnauthorizedError()

    if (IS_DEMO) {
      const { DEMO_CONVERSATIONS } = await import('@/lib/dev/demo-data')
      DEMO_CONVERSATIONS.splice(0, DEMO_CONVERSATIONS.length)
      clearConversations()
      return NextResponse.json({ ok: true, deleted: 0 })
    }

    const supabase = createServerClient()
    const { data: convs } = await supabase
      .from('chat_conversations')
      .select('id')
      .eq('user_id', session.user.id)

    const ids = (convs || []).map(c => c.id)
    if (ids.length > 0) {
      await supabase.from('chat_messages').delete().in('conversation_id', ids)
      await supabase.from('chat_conversations').delete().eq('user_id', session.user.id)
    }
    return NextResponse.json({ ok: true, deleted: ids.length })
  })
}

