import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { sharedStyles, BRAND, formatCents, formatDate } from './shared'

interface LineItem {
  description: string
  quantity: number
  unit_price_cents: number
  total_cents: number
}

interface InvoicePDFProps {
  invoiceNumber: string
  series: string
  status: string
  issueDate: string
  dueDate: string | null
  firmName: string
  firmAddress?: string
  firmNif?: string
  clientName: string
  clientNif?: string
  clientAddress?: string
  caseName?: string
  lineItems: LineItem[]
  baseCents: number
  ivaCents: number
  irpfCents: number
  totalCents: number
  notes?: string | null
}

const s = StyleSheet.create({
  colDesc: { flex: 1 },
  colQty: { width: 40, textAlign: 'right' },
  colPrice: { width: 80, textAlign: 'right' },
  colTotal: { width: 80, textAlign: 'right' },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  statusText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#FFFFFF',
  },
})

const STATUS_COLORS: Record<string, string> = {
  draft: '#6B7280',
  issued: '#2563EB',
  paid: '#16A34A',
  overdue: '#DC2626',
  cancelled: '#9CA3AF',
}

export function InvoicePDF({
  invoiceNumber, issueDate, dueDate,
  firmName, firmAddress, firmNif,
  clientName, clientNif, clientAddress,
  caseName, lineItems, baseCents, ivaCents, irpfCents, totalCents, notes, status,
}: InvoicePDFProps) {
  const statusColor = STATUS_COLORS[status] || '#6B7280'

  return (
    <Document>
      <Page size="A4" style={sharedStyles.page}>
        {/* HEADER */}
        <View style={sharedStyles.header}>
          <View style={sharedStyles.headerLeft}>
            <Text style={sharedStyles.firmName}>{firmName}</Text>
            {firmAddress && <Text style={sharedStyles.firmSub}>{firmAddress}</Text>}
            {firmNif && <Text style={sharedStyles.firmSub}>NIF: {firmNif}</Text>}
          </View>
          <View style={sharedStyles.headerRight}>
            <Text style={sharedStyles.docType}>FACTURA</Text>
            <Text style={sharedStyles.docNumber}>{invoiceNumber}</Text>
            <Text style={sharedStyles.docDate}>Fecha emisión: {formatDate(issueDate)}</Text>
            {dueDate && <Text style={sharedStyles.docDate}>Vencimiento: {formatDate(dueDate)}</Text>}
            <View style={[s.statusBadge, { backgroundColor: statusColor }]}>
              <Text style={s.statusText}>{status.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* CLIENT */}
        <View style={sharedStyles.section}>
          <Text style={sharedStyles.sectionTitle}>Datos del cliente</Text>
          <View style={sharedStyles.row}>
            <Text style={sharedStyles.label}>Nombre:</Text>
            <Text style={sharedStyles.value}>{clientName}</Text>
          </View>
          {clientNif && (
            <View style={sharedStyles.row}>
              <Text style={sharedStyles.label}>NIF/CIF:</Text>
              <Text style={sharedStyles.value}>{clientNif}</Text>
            </View>
          )}
          {clientAddress && (
            <View style={sharedStyles.row}>
              <Text style={sharedStyles.label}>Dirección:</Text>
              <Text style={sharedStyles.value}>{clientAddress}</Text>
            </View>
          )}
          {caseName && (
            <View style={sharedStyles.row}>
              <Text style={sharedStyles.label}>Concepto:</Text>
              <Text style={sharedStyles.value}>{caseName}</Text>
            </View>
          )}
        </View>

        {/* LINE ITEMS */}
        <View style={sharedStyles.section}>
          <Text style={sharedStyles.sectionTitle}>Servicios facturados</Text>
          <View style={sharedStyles.table}>
            <View style={sharedStyles.tableHeader}>
              <Text style={[sharedStyles.tableHeaderCell, s.colDesc]}>Descripción</Text>
              <Text style={[sharedStyles.tableHeaderCell, s.colQty]}>Ud.</Text>
              <Text style={[sharedStyles.tableHeaderCell, s.colPrice]}>Precio unit.</Text>
              <Text style={[sharedStyles.tableHeaderCell, s.colTotal]}>Total</Text>
            </View>
            {lineItems.map((item, i) => (
              <View key={i} style={[sharedStyles.tableRow, i % 2 === 1 ? sharedStyles.tableRowAlt : {}]}>
                <Text style={[sharedStyles.tableCell, s.colDesc]}>{item.description}</Text>
                <Text style={[sharedStyles.tableCell, s.colQty]}>{item.quantity}</Text>
                <Text style={[sharedStyles.tableCell, s.colPrice]}>{formatCents(item.unit_price_cents)}</Text>
                <Text style={[sharedStyles.tableCell, s.colTotal]}>{formatCents(item.total_cents)}</Text>
              </View>
            ))}
          </View>

          {/* TOTALS */}
          <View style={sharedStyles.totalsBox}>
            <View style={sharedStyles.totalsRow}>
              <Text style={sharedStyles.totalsLabel}>Base imponible</Text>
              <Text style={sharedStyles.totalsValue}>{formatCents(baseCents)}</Text>
            </View>
            <View style={sharedStyles.totalsRow}>
              <Text style={sharedStyles.totalsLabel}>IVA (21%)</Text>
              <Text style={sharedStyles.totalsValue}>{formatCents(ivaCents)}</Text>
            </View>
            {irpfCents > 0 && (
              <View style={sharedStyles.totalsRow}>
                <Text style={sharedStyles.totalsLabel}>IRPF (-15%)</Text>
                <Text style={sharedStyles.totalsValue}>-{formatCents(irpfCents)}</Text>
              </View>
            )}
            <View style={[sharedStyles.totalsRow, sharedStyles.totalsRowTotal, { borderBottomWidth: 0 }]}>
              <Text style={sharedStyles.totalsLabelTotal}>TOTAL</Text>
              <Text style={sharedStyles.totalsValueTotal}>{formatCents(totalCents)}</Text>
            </View>
          </View>
        </View>

        {/* NOTES */}
        {notes && (
          <View style={sharedStyles.section}>
            <Text style={sharedStyles.sectionTitle}>Observaciones</Text>
            <Text style={{ fontSize: 9, color: BRAND.black }}>{notes}</Text>
          </View>
        )}

        {/* LEGAL */}
        <View style={sharedStyles.disclaimer}>
          <Text style={sharedStyles.disclaimerText}>
            Factura emitida conforme a la Ley 37/1992 del IVA y el Real Decreto 1619/2012 de obligaciones de facturación. Retención aplicable a profesionales persona física según art. 95 LIRPF. Generado por IURALEX · Cliender Tech · iuralex.cliender.com
          </Text>
        </View>

        {/* FOOTER */}
        <View style={sharedStyles.footer} fixed>
          <Text style={sharedStyles.footerText}>{firmName} — Factura {invoiceNumber}</Text>
          <Text style={sharedStyles.footerText} render={({ pageNumber, totalPages }) => `Página ${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}
