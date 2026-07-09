import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'

const IS_DEV = process.env.NEXT_PUBLIC_DEMO_MODE === '1' || !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth().catch(() => null)
  if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params

  try {
    let budget: any, client: any, caseData: any

    if (IS_DEV) {
      const { DEMO_BUDGETS, DEMO_CLIENTS, DEMO_CASES } = await import('@/lib/dev/demo-data')
      budget = DEMO_BUDGETS.find(b => b.id === id)
      if (!budget) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
      client = DEMO_CLIENTS.find(c => c.id === budget.client_id)
      caseData = DEMO_CASES.find(c => c.id === budget.case_id)
    } else {
      const { createServerClient } = await import('@/lib/supabase/server')
      const supabase = createServerClient()
      const { data } = await supabase.from('budgets').select('*, client:clients(*), case:cases(id,title)').eq('id', id).eq('user_id', session.user.id).single()
      if (!data) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
      budget = data
      client = data.client
      caseData = data.case
    }

    const { createElement } = await import('react')
    const { BudgetPDF } = await import('@/lib/pdf/BudgetPDF')
    const { renderToBuffer } = await import('@/lib/pdf/render')

    const doc = createElement(BudgetPDF, {
      budgetNumber: budget.budget_number,
      status: budget.status,
      createdAt: budget.created_at,
      expiresAt: budget.expires_at,
      firmName: 'Despacho Jurídico — IURALEX',
      firmAddress: 'Calle Mayor 1, 28001 Madrid',
      firmNif: 'B00000001',
      clientName: client?.name || 'Cliente',
      clientNif: client?.nif_cif,
      clientAddress: client?.address,
      caseName: caseData?.title,
      lineItems: budget.line_items || [],
      totalCents: budget.total_cents,
      ivaCents: budget.iva_cents,
      grandTotalCents: budget.grand_total_cents,
    })

    const pdfBuffer = await renderToBuffer(doc)

    return new NextResponse(pdfBuffer.buffer as ArrayBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${budget.budget_number}.pdf"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    console.error('[budget/pdf] error:', err)
    return NextResponse.json({ error: 'Error generando PDF' }, { status: 500 })
  }
}
