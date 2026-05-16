import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { createServerClient } from '@/lib/supabase/server'
import { sanitizeText, sanitizeEmail } from '@/lib/security/sanitize'
import { withErrorHandler, ValidationError, UnauthorizedError } from '@/lib/security/apiResponse'
import { auditLog } from '@/lib/security/gdpr'
import { z } from 'zod'

const ClientSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email().max(255).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  type: z.enum(['individual', 'company']).default('individual'),
  nif_cif: z.string().max(20).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
})

const IS_DEV_WITHOUT_DB = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

export async function GET() {
  return withErrorHandler(async () => {
    const session = await auth().catch(() => null)
    if (!session?.user?.id) throw new UnauthorizedError()

    if (IS_DEV_WITHOUT_DB) {
      const { DEMO_CLIENTS } = await import('@/lib/dev/demo-data')
      return NextResponse.json({ clients: DEMO_CLIENTS })
    }

    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', session.user.id)
      .order('name', { ascending: true })
      .limit(500)

    if (error) throw new Error(error.message)
    return NextResponse.json({ clients: data })
  })
}

export async function POST(req: NextRequest) {
  return withErrorHandler(async () => {
    const session = await auth().catch(() => null)
    if (!session?.user?.id) throw new UnauthorizedError()

    const body = await req.json()

    // Sanitize inputs
    if (body.name) body.name = sanitizeText(body.name)
    if (body.email) body.email = sanitizeEmail(body.email)
    if (body.phone) body.phone = sanitizeText(body.phone)
    if (body.nif_cif) body.nif_cif = sanitizeText(body.nif_cif)
    if (body.address) body.address = sanitizeText(body.address)

    const parsed = ClientSchema.safeParse(body)
    if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message || 'Datos inválidos')

    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('clients')
      .insert({ ...parsed.data, user_id: session.user.id })
      .select()
      .single()

    if (error) throw new Error(error.message)

    await auditLog({
      userId: session.user.id,
      action: 'CREATE_CLIENT',
      resourceType: 'client',
      resourceId: data.id,
      ipAddress: req.headers.get('x-forwarded-for') || undefined,
    })

    return NextResponse.json({ client: data }, { status: 201 })
  })
}
