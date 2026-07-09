import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { createServerClient } from '@/lib/supabase/server'
import { sanitizeText, validateUUID } from '@/lib/security/sanitize'
import { withErrorHandler, ValidationError, UnauthorizedError } from '@/lib/security/apiResponse'
import { auditLog } from '@/lib/security/gdpr'
import { z } from 'zod'

const PatchSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(5000).nullable().optional(),
  status: z.enum(['open', 'closed', 'archived', 'pending']).optional(),
  case_number: z.string().max(100).nullable().optional(),
  area: z.string().max(100).nullable().optional(),
  amount: z.number().nullable().optional(),
  client_id: z.string().uuid().nullable().optional(),
})

const IS_DEV_WITHOUT_DB =
  process.env.NEXT_PUBLIC_DEMO_MODE === '1' ||
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

// Memory mock for IS_DEV_WITHOUT_DB. Map of overrides keyed by case id,
// merged on top of DEMO_CASES at read time. Lives on globalThis to
// survive HMR reloads during dev.
const memoryCaseOverrides: Map<string, Record<string, unknown>> = (() => {
  const g = globalThis as unknown as { __caseOverrides?: Map<string, Record<string, unknown>> }
  if (!g.__caseOverrides) g.__caseOverrides = new Map()
  return g.__caseOverrides
})()

export async function GET(_req: NextRequest, ctx: { params: Promise<{ caseId: string }> }) {
  return withErrorHandler(async () => {
    const session = await auth().catch(() => null)
    if (!session?.user?.id) throw new UnauthorizedError()

    const { caseId } = await ctx.params

    if (IS_DEV_WITHOUT_DB) {
      const { DEMO_CASES, DEMO_CLIENTS } = await import('@/lib/dev/demo-data')
      const base = DEMO_CASES.find((c) => c.id === caseId)
      if (!base) return NextResponse.json({ error: 'Caso no encontrado' }, { status: 404 })
      const override = memoryCaseOverrides.get(caseId) || {}
      const merged: Record<string, unknown> = { ...base, ...override }
      if (override.client_id) {
        const client = DEMO_CLIENTS.find((c) => c.id === override.client_id)
        if (client) merged.clients = { name: client.name, email: client.email }
      }
      return NextResponse.json({ case: merged })
    }

    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('cases')
      .select('*, clients(name, email)')
      .eq('id', caseId)
      .eq('user_id', session.user.id)
      .single()

    if (error) throw new Error(error.message)
    return NextResponse.json({ case: data })
  })
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ caseId: string }> }) {
  return withErrorHandler(async () => {
    const session = await auth().catch(() => null)
    if (!session?.user?.id) throw new UnauthorizedError()

    const { caseId } = await ctx.params
    const body = await req.json()

    if (typeof body.title === 'string') body.title = sanitizeText(body.title)
    if (typeof body.description === 'string') body.description = sanitizeText(body.description)
    if (typeof body.case_number === 'string') body.case_number = sanitizeText(body.case_number)
    if (typeof body.area === 'string') body.area = sanitizeText(body.area)
    if (body.client_id && body.client_id !== 'null' && body.client_id !== null) {
      body.client_id = validateUUID(body.client_id)
    } else if (body.client_id === 'null' || body.client_id === '') {
      body.client_id = null
    }
    if (typeof body.amount === 'string') {
      const n = Number(body.amount)
      body.amount = Number.isFinite(n) ? n : null
    }

    const parsed = PatchSchema.safeParse(body)
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues[0]?.message || 'Datos inválidos')
    }

    if (IS_DEV_WITHOUT_DB) {
      const { DEMO_CASES, DEMO_CLIENTS } = await import('@/lib/dev/demo-data')
      const base = DEMO_CASES.find((c) => c.id === caseId)
      if (!base) return NextResponse.json({ error: 'Caso no encontrado' }, { status: 404 })

      const prev = memoryCaseOverrides.get(caseId) || {}
      const nextOverride: Record<string, unknown> = {
        ...prev,
        ...parsed.data,
        updated_at: new Date().toISOString(),
      }
      memoryCaseOverrides.set(caseId, nextOverride)
      const merged: Record<string, unknown> = { ...base, ...nextOverride }
      if (nextOverride.client_id) {
        const client = DEMO_CLIENTS.find((c) => c.id === nextOverride.client_id)
        if (client) merged.clients = { name: client.name, email: client.email }
      }
      return NextResponse.json({ case: merged })
    }

    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('cases')
      .update({ ...parsed.data, updated_at: new Date().toISOString() })
      .eq('id', caseId)
      .eq('user_id', session.user.id)
      .select('*, clients(name, email)')
      .single()

    if (error) throw new Error(error.message)

    await auditLog({
      userId: session.user.id,
      action: 'UPDATE_CASE',
      resourceType: 'case',
      resourceId: caseId,
      ipAddress: req.headers.get('x-forwarded-for') || undefined,
    })

    return NextResponse.json({ case: data })
  })
}
