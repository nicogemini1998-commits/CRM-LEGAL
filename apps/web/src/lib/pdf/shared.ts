import { StyleSheet } from '@react-pdf/renderer'

export const BRAND = {
  purple: '#8F7EE9',
  navy: '#1E2839',
  black: '#14181E',
  cream: '#EBEAE4',
  gray: '#6B7280',
  lightGray: '#F3F4F6',
  border: '#E5E7EB',
}

export const sharedStyles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: BRAND.black,
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 48,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: BRAND.purple,
  },
  headerLeft: {
    gap: 2,
  },
  firmName: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: BRAND.navy,
  },
  firmSub: {
    fontSize: 9,
    color: BRAND.gray,
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  docType: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: BRAND.purple,
  },
  docNumber: {
    fontSize: 11,
    color: BRAND.navy,
  },
  docDate: {
    fontSize: 9,
    color: BRAND.gray,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: BRAND.purple,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 2,
  },
  label: {
    fontSize: 9,
    color: BRAND.gray,
    width: 80,
  },
  value: {
    fontSize: 9,
    color: BRAND.black,
    flex: 1,
  },
  table: {
    marginTop: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: BRAND.navy,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  tableHeaderCell: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#FFFFFF',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: BRAND.border,
  },
  tableRowAlt: {
    backgroundColor: BRAND.lightGray,
  },
  tableCell: {
    fontSize: 9,
    color: BRAND.black,
  },
  totalsBox: {
    alignSelf: 'flex-end',
    width: 220,
    marginTop: 12,
    borderWidth: 1,
    borderColor: BRAND.border,
    borderRadius: 6,
    overflow: 'hidden',
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: BRAND.border,
  },
  totalsRowTotal: {
    backgroundColor: BRAND.purple,
  },
  totalsLabel: {
    fontSize: 9,
    color: BRAND.gray,
  },
  totalsValue: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: BRAND.black,
  },
  totalsLabelTotal: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#FFFFFF',
  },
  totalsValueTotal: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#FFFFFF',
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 48,
    right: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: BRAND.border,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 8,
    color: BRAND.gray,
  },
  disclaimer: {
    marginTop: 24,
    padding: 10,
    backgroundColor: BRAND.lightGray,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: BRAND.purple,
  },
  disclaimerText: {
    fontSize: 8,
    color: BRAND.gray,
    lineHeight: 1.4,
  },
})

export function formatCents(cents: number): string {
  return (cents / 100).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
}
