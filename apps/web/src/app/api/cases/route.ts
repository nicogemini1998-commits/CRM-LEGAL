import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { createServerClient } from '@/lib/supabase/server'
import { sanitizeText, validateUUID } from '@/lib/security/sanitize'
import { withErrorHandler, ValidationError, UnauthorizedError } from '@/lib/security/apiResponse'
import { auditLog } from '@/lib/security/gdpr'
import { z } from 'zod'

const CaseSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(5000).optional(),
  status: z.enum(['open', 'closed', 'archived']).default('open'),
  case_number: z.string().max(100).optional().nullable(),
  client_id: z.string().uuid().optional().nullable(),
})

const IS_DEV_WITHOUT_DB = process.env.NEXT_PUBLIC_DEMO_MODE === '1' || !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

export async function GET() {
  return withErrorHandler(async () => {
    const session = await auth().catch(() => null)
    if (!session?.user?.id) throw new UnauthorizedError()

    if (IS_DEV_WITHOUT_DB) {
      const { DEMO_CASES } = await import('@/lib/dev/demo-data')
      return NextResponse.json({ cases: DEMO_CASES })
    }

    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('cases')
      .select('*, clients(name, email)')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(200)

    if (error) throw new Error(error.message)
    return NextResponse.json({ cases: data })
  })
}

export async function POST(req: NextRequest) {
  return withErrorHandler(async () => {
    const session = await auth().catch(() => null)
    if (!session?.user?.id) throw new UnauthorizedError()

    const body = await req.json()

    // Sanitize before schema validation
    if (body.title) body.title = sanitizeText(body.title)
    if (body.description) body.description = sanitizeText(body.description)
    if (body.case_number) body.case_number = sanitizeText(body.case_number)
    if (body.client_id && body.client_id !== 'null') {
      body.client_id = validateUUID(body.client_id)
      // Verify client belongs to user
      const supabase = createServerClient()
      const { data: clientCheck } = await supabase
        .from('clients').select('id').eq('id', body.client_id).eq('user_id', session.user.id).single()
      if (!clientCheck) throw new ValidationError('Cliente no encontrado')
    }

    const parsed = CaseSchema.safeParse(body)
    if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message || 'Datos inválidos')

    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('cases')
      .insert({ ...parsed.data, user_id: session.user.id })
      .select()
      .single()

    if (error) throw new Error(error.message)

    await auditLog({
      userId: session.user.id,
      action: 'CREATE_CASE',
      resourceType: 'case',
      resourceId: data.id,
      ipAddress: req.headers.get('x-forwarded-for') || undefined,
    })

    return NextResponse.json({ case: data }, { status: 201 })
  })
}
