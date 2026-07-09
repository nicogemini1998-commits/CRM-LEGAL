import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { withErrorHandler, UnauthorizedError } from '@/lib/security/apiResponse'

const IS_DEV = process.env.NEXT_PUBLIC_DEMO_MODE === '1' || !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

export async function GET(req: NextRequest) {
  return withErrorHandler(async () => {
    const session = await auth().catch(() => null)
    if (!session?.user?.id) throw new UnauthorizedError()

    const url = new URL(req.url)
    const caseId = url.searchParams.get('case_id')
    const clientId = url.searchParams.get('client_id')
    const status = url.searchParams.get('status')

    if (IS_DEV) {
      const { DEMO_INVOICES, DEMO_CLIENTS, DEMO_CASES } = await import('@/lib/dev/demo-data')
      let data = [...DEMO_INVOICES]
      if (caseId) data = data.filter(i => i.case_id === caseId)
      if (clientId) data = data.filter(i => i.client_id === clientId)
      if (status) data = data.filter(i => i.status === status)
      data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      const enriched = data.map(inv => ({
        ...inv,
        client: DEMO_CLIENTS.find(c => c.id === inv.client_id),
        case: DEMO_CASES.find(c => c.id === inv.case_id),
      }))
      return NextResponse.json({ invoices: enriched })
    }

    const { createServerClient } = await import('@/lib/supabase/server')
    const supabase = createServerClient()
    let q = supabase.from('invoices').select('*, client:clients(id,name,nif_cif), case:cases(id,title,case_number)').eq('user_id', session.user.id).order('created_at', { ascending: false })
    if (caseId) q = q.eq('case_id', caseId)
    if (clientId) q = q.eq('client_id', clientId)
    if (status) q = q.eq('status', status)
    const { data, error } = await q
    if (error) throw new Error(error.message)
    return NextResponse.json({ invoices: data || [] })
  })
}

export async function POST(req: NextRequest) {
  return withErrorHandler(async () => {
    const session = await auth().catch(() => null)
    if (!session?.user?.id) throw new UnauthorizedError()
    const body = await req.json()

    if (IS_DEV) {
      const { DEMO_INVOICES } = await import('@/lib/dev/demo-data')
      const seq = DEMO_INVOICES.length + 1
      const series = body.series || 'F'
      const invoiceNumber = `${series}-${new Date().getFullYear()}-${String(seq).padStart(4, '0')}`
      const newInv = {
        id: `inv-${Date.now()}`,
        user_id: session.user.id,
        invoice_number: invoiceNumber,
        series,
        status: 'draft' as const,
        issue_date: new Date().toISOString().slice(0, 10),
        due_date: null,
        paid_date: null,
        irpf_cents: 0,
        notes: null,
        created_at: new Date().toISOString(),
        ...body,
      }
      DEMO_INVOICES.push(newInv)
      return NextResponse.json({ invoice: newInv }, { status: 201 })
    }

    const { createServerClient } = await import('@/lib/supabase/server')
    const supabase = createServerClient()
    const series = body.series || 'F'
    const year = new Date().getFullYear()
    const { data: numData } = await supabase.rpc('next_invoice_number', { p_user_id: session.user.id, p_series: series, p_year: year })
    const invoiceNumber = `${series}-${year}-${String(numData).padStart(4, '0')}`
    const { data, error } = await supabase.from('invoices').insert({ ...body, user_id: session.user.id, invoice_number: invoiceNumber, status: 'draft' }).select().single()
    if (error) throw new Error(error.message)
    return NextResponse.json({ invoice: data }, { status: 201 })
  })
}
