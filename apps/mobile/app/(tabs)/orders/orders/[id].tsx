import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSalesOrder } from '@/features/sales-orders/useSalesOrders';
import { salesOrderStatusColor, salesOrderStatusLabel } from '@/features/sales-orders/status';

/** Read-only Sales Order detail (MOBILE_PRD.md 7.6 "View Orders") - no action buttons; orders
 *  are only reachable via a quotation's Convert to Order action. */
export default function SalesOrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: order, isLoading, isError } = useSalesOrder(id);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (isError || !order) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>Unable to load this order.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>{'< Sales'}</Text>
        </Pressable>

        <Text style={styles.number}>{order.salesOrderNumber}</Text>
        <Text style={styles.customer}>{order.customer.name}</Text>
        <Text style={[styles.status, { color: salesOrderStatusColor(order.status) }]}>
          {salesOrderStatusLabel(order.status)}
        </Text>
        {order.quotationId && <Text style={styles.hint}>Converted from a quotation.</Text>}

        <View style={styles.card}>
          {order.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.itemMain}>
                <Text style={styles.itemName}>{item.productName}</Text>
                <Text style={styles.itemMeta}>
                  {item.quantity} {item.unit} x {order.currencyCode} {item.unitPrice}
                </Text>
              </View>
              <Text style={styles.itemTotal}>
                {order.currencyCode} {item.lineTotal}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsCard}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Subtotal</Text>
            <Text style={styles.totalsValue}>
              {order.currencyCode} {order.subtotal}
            </Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Discount</Text>
            <Text style={styles.totalsValue}>
              -{order.currencyCode} {order.discountAmount}
            </Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Tax</Text>
            <Text style={styles.totalsValue}>
              {order.currencyCode} {order.taxAmount}
            </Text>
          </View>
          <View style={[styles.totalsRow, styles.grandTotalRow]}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>
              {order.currencyCode} {order.totalAmount}
            </Text>
          </View>
        </View>

        {order.notes && (
          <>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notes}>{order.notes}</Text>
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
