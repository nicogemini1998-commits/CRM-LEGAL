import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { createServerClient } from '@/lib/supabase/server'
import { withErrorHandler, UnauthorizedError } from '@/lib/security/apiResponse'

const IS_DEV_WITHOUT_DB =
  process.env.NEXT_PUBLIC_DEMO_MODE === '1' ||
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

// GET /api/documents/:docId/analysis
// Returns the most recent analysis for a document.
// Response: { analysis: {...} | null, status: 'pending' | 'done' | 'error' | 'missing' }
export async function GET(req: NextRequest, ctx: { params: Promise<{ docId: string }> }) {
  return withErrorHandler(async () => {
    const session = await auth().catch(() => null)
    if (!session?.user?.id) throw new UnauthorizedError()

    const { docId } = await ctx.params

    if (IS_DEV_WITHOUT_DB) {
      const { getDemoAnalysisForDoc } = await import('@/lib/dev/demo-data')
      const found = getDemoAnalysisForDoc(docId)
      if (!found) return NextResponse.json({ analysis: null, status: 'missing' })
      return NextResponse.json({ analysis: found, status: found.status || 'done' })
    }

    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('document_analyses')
      .select('*')
      .eq('document_id', docId)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) throw new Error(error.message)
    if (!data) return NextResponse.json({ analysis: null, status: 'pending' })
    return NextResponse.json({ analysis: data, status: 'done' })
  })
}
