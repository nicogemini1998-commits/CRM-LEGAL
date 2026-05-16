import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { createServerClient } from '@/lib/supabase/server'
import { withErrorHandler, UnauthorizedError } from '@/lib/security/apiResponse'

export async function GET(req: NextRequest) {
  return withErrorHandler(async () => {
    const session = await auth().catch(() => null)
    if (!session?.user?.id) throw new UnauthorizedError()

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
