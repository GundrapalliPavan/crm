import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePayment } from '@/features/payments/usePayments';
import { paymentMethodLabel, paymentStatusColor, paymentStatusLabel } from '@/features/payments/status';

/** Read-only Payment detail (MOBILE_PRD.md 7.7) - no action buttons; "No payment recording
 *  from mobile in V1". Allocations link back into the Billing invoice detail screen. */
export default function PaymentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: payment, isLoading, isError } = usePayment(id);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (isError || !payment) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>Unable to load this payment.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>{'< Billing'}</Text>
        </Pressable>

        <Text style={styles.number}>{payment.paymentNumber}</Text>
        <Text style={styles.customer}>{payment.customer.name}</Text>
        <Text style={[styles.status, { color: paymentStatusColor(payment.status) }]}>
          {paymentStatusLabel(payment.status)}
        </Text>

        <View style={styles.totalsCard}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Amount</Text>
            <Text style={styles.totalsValue}>
              {payment.currencyCode} {payment.amount}
            </Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Unallocated</Text>
            <Text style={styles.totalsValue}>
              {payment.currencyCode} {payment.unallocatedAmount}
            </Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Method</Text>
            <Text style={styles.totalsValue}>{paymentMethodLabel(payment.paymentMethod)}</Text>
          </View>
          {payment.referenceNumber && (
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Reference</Text>
              <Text style={styles.totalsValue}>{payment.referenceNumber}</Text>
            </View>
          )}
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Date</Text>
            <Text style={styles.totalsValue}>{new Date(payment.paymentDate).toLocaleDateString()}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Allocations</Text>
        <View style={styles.card}>
          {payment.allocations.length === 0 ? (
            <Text style={styles.emptyRow}>Not allocated to any invoice yet</Text>
          ) : (
            payment.allocations.map((allocation) => (
              <Pressable
                key={allocation.id}
                style={styles.itemRow}
                onPress={() =>
                  router.push({ pathname: '/billing/invoices/[id]', params: { id: allocation.invoiceId } })
                }
              >
                <Text style={styles.itemName}>{allocation.invoiceNumber}</Text>
                <Text style={styles.itemTotal}>
                  {payment.currencyCode} {allocation.allocatedAmount}
                </Text>
              </Pressable>
            ))
          )}
        </View>

        {payment.notes && (
          <>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notes}>{payment.notes}</Text>
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
  totalsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    marginTop: 16,
    gap: 6,
  },
  totalsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  totalsLabel: { fontSize: 13, color: '#64748b' },
  totalsValue: { fontSize: 13, color: '#0f172a' },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: '#475569', textTransform: 'uppercase', marginTop: 20, marginBottom: 8 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 4,
  },
  emptyRow: { fontSize: 13, color: '#64748b', padding: 12 },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  itemName: { fontSize: 14, fontWeight: '600', color: '#0f172a' },
  itemTotal: { fontSize: 14, fontWeight: '600', color: '#0f172a' },
  notes: { fontSize: 14, color: '#0f172a' },
});
