import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { sharedStyles, BRAND, formatCents, formatDate } from './shared'

interface LineItem {
  description: string
  quantity: number
  unit_price_cents: number
  total_cents: number
}

interface BudgetPDFProps {
  budgetNumber: string
  status: string
  createdAt: string
  expiresAt: string | null
  firmName: string
  firmAddress?: string
  firmNif?: string
  clientName: string
  clientNif?: string
  clientAddress?: string
  caseName?: string
  lineItems: LineItem[]
  totalCents: number
  ivaCents: number
  grandTotalCents: number
  notes?: string
}

const s = StyleSheet.create({
  colDesc: { flex: 1 },
  colQty: { width: 40, textAlign: 'right' },
  colPrice: { width: 80, textAlign: 'right' },
  colTotal: { width: 80, textAlign: 'right' },
})

export function BudgetPDF({
  budgetNumber, status, createdAt, expiresAt,
  firmName, firmAddress, firmNif,
  clientName, clientNif, clientAddress,
  caseName, lineItems, totalCents, ivaCents, grandTotalCents, notes,
}: BudgetPDFProps) {
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
            <Text style={sharedStyles.docType}>PRESUPUESTO</Text>
            <Text style={sharedStyles.docNumber}>{budgetNumber}</Text>
            <Text style={sharedStyles.docDate}>Fecha: {formatDate(createdAt)}</Text>
            {expiresAt && <Text style={sharedStyles.docDate}>Válido hasta: {formatDate(expiresAt)}</Text>}
          </View>
        </View>

        {/* CLIENT */}
        <View style={sharedStyles.section}>
          <Text style={sharedStyles.sectionTitle}>Cliente</Text>
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
              <Text style={sharedStyles.label}>Asunto:</Text>
              <Text style={sharedStyles.value}>{caseName}</Text>
            </View>
          )}
        </View>

        {/* LINE ITEMS */}
        <View style={sharedStyles.section}>
          <Text style={sharedStyles.sectionTitle}>Servicios jurídicos</Text>
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
              <Text style={sharedStyles.totalsValue}>{formatCents(totalCents)}</Text>
            </View>
            <View style={sharedStyles.totalsRow}>
              <Text style={sharedStyles.totalsLabel}>IVA (21%)</Text>
              <Text style={sharedStyles.totalsValue}>{formatCents(ivaCents)}</Text>
            </View>
            <View style={[sharedStyles.totalsRow, sharedStyles.totalsRowTotal, { borderBottomWidth: 0 }]}>
              <Text style={sharedStyles.totalsLabelTotal}>TOTAL</Text>
              <Text style={sharedStyles.totalsValueTotal}>{formatCents(grandTotalCents)}</Text>
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

        {/* DISCLAIMER */}
        <View style={sharedStyles.disclaimer}>
          <Text style={sharedStyles.disclaimerText}>
            Este presupuesto tiene carácter orientativo y está sujeto a variaciones en función de la complejidad definitiva del asunto. Los honorarios no incluyen provisiones de fondos, aranceles judiciales, honorarios de peritos ni otros gastos procesales. Generado por IURALEX · Cliender Tech · iuralex.cliender.com
          </Text>
        </View>

        {/* FOOTER */}
        <View style={sharedStyles.footer} fixed>
          <Text style={sharedStyles.footerText}>{firmName} — Documento generado por IURALEX</Text>
          <Text style={sharedStyles.footerText} render={({ pageNumber, totalPages }) => `Página ${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}
