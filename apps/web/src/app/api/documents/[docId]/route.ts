import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { createServerClient } from '@/lib/supabase/server'
import { withErrorHandler, UnauthorizedError, NotFoundError } from '@/lib/security/apiResponse'

const IS_DEV_WITHOUT_DB =
  process.env.NEXT_PUBLIC_DEMO_MODE === '1' ||
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ docId: string }> }
) {
  return withErrorHandler(async () => {
    const session = await auth().catch(() => null)
    if (!session?.user?.id) throw new UnauthorizedError()

    const { docId } = await params

    if (IS_DEV_WITHOUT_DB) {
      const { DEMO_DOCUMENTS } = await import('@/lib/dev/demo-data')
      const doc = (DEMO_DOCUMENTS as Array<Record<string, unknown>>).find(d => d.id === docId)
      if (!doc) throw new NotFoundError('Documento no encontrado')
      return NextResponse.json({ document: doc })
    }

    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('documents')
      .select('id, title, document_type, confidential, created_at, storage_path, case_id, content_markdown')
      .eq('id', docId)
      .eq('user_id', session.user.id)
      .is('deleted_at', null)
      .single()

    if (error || !data) throw new NotFoundError('Documento no encontrado')
    return NextResponse.json({ document: data })
  })
}
