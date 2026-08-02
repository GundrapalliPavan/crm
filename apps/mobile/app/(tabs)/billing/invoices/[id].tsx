import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useInvoice } from '@/features/invoices/useInvoices';
import { invoiceStatusColor, invoiceStatusLabel } from '@/features/invoices/status';

/** Read-only Invoice detail (MOBILE_PRD.md 7.7) - no action buttons; matches Sales Orders'
 *  read-only detail screen (orders/orders/[id].tsx), extended with the GST split. */
export default function InvoiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: invoice, isLoading, isError } = useInvoice(id);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (isError || !invoice) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>Unable to load this invoice.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>{'< Billing'}</Text>
        </Pressable>

        <Text style={styles.number}>{invoice.invoiceNumber}</Text>
        <Text style={styles.customer}>{invoice.customer.name}</Text>
        <Text style={[styles.status, { color: invoiceStatusColor(invoice.status) }]}>
          {invoiceStatusLabel(invoice.status)}
        </Text>
        {invoice.salesOrderId && <Text style={styles.hint}>Generated from a sales order.</Text>}

        <View style={styles.card}>
          {invoice.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.itemMain}>
                <Text style={styles.itemName}>{item.productName}</Text>
                <Text style={styles.itemMeta}>
                  {item.quantity} {item.unit} x {invoice.currencyCode} {item.unitPrice}
                </Text>
              </View>
              <Text style={styles.itemTotal}>
                {invoice.currencyCode} {item.lineTotal}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsCard}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Subtotal</Text>
            <Text style={styles.totalsValue}>
              {invoice.currencyCode} {invoice.subtotal}
            </Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Discount</Text>
            <Text style={styles.totalsValue}>
              -{invoice.currencyCode} {invoice.discountAmount}
            </Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Taxable amount</Text>
            <Text style={styles.totalsValue}>
              {invoice.currencyCode} {invoice.taxableAmount}
            </Text>
          </View>
          {Number(invoice.cgstAmount) > 0 && (
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>CGST</Text>
              <Text style={styles.totalsValue}>
                {invoice.currencyCode} {invoice.cgstAmount}
              </Text>
            </View>
          )}
          {Number(invoice.sgstAmount) > 0 && (
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>SGST</Text>
              <Text style={styles.totalsValue}>
                {invoice.currencyCode} {invoice.sgstAmount}
              </Text>
            </View>
          )}
          {Number(invoice.igstAmount) > 0 && (
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>IGST</Text>
              <Text style={styles.totalsValue}>
                {invoice.currencyCode} {invoice.igstAmount}
              </Text>
            </View>
          )}
          <View style={[styles.totalsRow, styles.grandTotalRow]}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>
              {invoice.currencyCode} {invoice.totalAmount}
            </Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Paid</Text>
            <Text style={styles.totalsValue}>
              {invoice.currencyCode} {invoice.paidAmount}
            </Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Outstanding</Text>
            <Text style={styles.totalsValue}>
              {invoice.currencyCode} {invoice.outstandingAmount}
            </Text>
          </View>
        </View>

        {invoice.notes && (
          <>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notes}>{invoice.notes}</Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: 20 },
  errorText: { fontSize: 14, color: '#475569', textAlign: 'center' },
  content: { padding: 16, paddingBottom: 40 },
  back: { fontSize: 15, color: '#3b5bdb', marginBottom: 16 },
  number: { fontSize: 20, fontWeight: '700', color: '#0f172a' },
  customer: { fontSize: 15, color: '#334155', marginTop: 2 },
  status: { fontSize: 13, fontWeight: '600', marginTop: 6 },
  hint: { fontSize: 13, color: '#64748b', marginTop: 6 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 4,
    marginTop: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  itemMain: { flex: 1, marginRight: 8 },
  itemName: { fontSize: 14, fontWeight: '600', color: '#0f172a' },
  itemMeta: { fontSize: 12, color: '#64748b', marginTop: 2 },
  itemTotal: { fontSize: 14, fontWeight: '600', color: '#0f172a' },
  totalsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    marginTop: 12,
    gap: 6,
  },
  totalsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  totalsLabel: { fontSize: 13, color: '#64748b' },
  totalsValue: { fontSize: 13, color: '#0f172a' },
  grandTotalRow: { marginTop: 4, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  grandTotalLabel: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  grandTotalValue: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: '#475569', textTransform: 'uppercase', marginTop: 20, marginBottom: 8 },
  notes: { fontSize: 14, color: '#0f172a' },
});
