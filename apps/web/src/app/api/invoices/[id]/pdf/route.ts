import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'

const IS_DEV = process.env.NEXT_PUBLIC_DEMO_MODE === '1' || !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth().catch(() => null)
  if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const { id } = await params

  try {
    let invoice: any, client: any, caseData: any

    if (IS_DEV) {
      const { DEMO_INVOICES, DEMO_CLIENTS, DEMO_CASES } = await import('@/lib/dev/demo-data')
      invoice = DEMO_INVOICES.find(i => i.id === id)
      if (!invoice) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
      client = DEMO_CLIENTS.find(c => c.id === invoice.client_id)
      caseData = DEMO_CASES.find(c => c.id === invoice.case_id)
    } else {
      const { createServerClient } = await import('@/lib/supabase/server')
      const supabase = createServerClient()
      const { data } = await supabase.from('invoices').select('*, client:clients(*), case:cases(id,title)').eq('id', id).eq('user_id', session.user.id).single()
      if (!data) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
      invoice = data
      client = data.client
      caseData = data.case
    }

    const { createElement } = await import('react')
    const { InvoicePDF } = await import('@/lib/pdf/InvoicePDF')
    const { renderToBuffer } = await import('@/lib/pdf/render')

    const doc = createElement(InvoicePDF, {
      invoiceNumber: invoice.invoice_number,
      series: invoice.series,
      status: invoice.status,
      issueDate: invoice.issue_date,
      dueDate: invoice.due_date,
      firmName: 'Despacho Jurídico — IURALEX',
      firmAddress: 'Calle Mayor 1, 28001 Madrid',
      firmNif: 'B00000001',
      clientName: client?.name || 'Cliente',
      clientNif: client?.nif_cif,
      clientAddress: client?.address,
      caseName: caseData?.title,
      lineItems: invoice.line_items || [],
      baseCents: invoice.base_cents,
      ivaCents: invoice.iva_cents,
      irpfCents: invoice.irpf_cents || 0,
      totalCents: invoice.total_cents,
      notes: invoice.notes,
    })

    const pdfBuffer = await renderToBuffer(doc)

    return new NextResponse(pdfBuffer.buffer as ArrayBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${invoice.invoice_number}.pdf"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    console.error('[invoice/pdf] error:', err)
    return NextResponse.json({ error: 'Error generando PDF' }, { status: 500 })
  }
}
