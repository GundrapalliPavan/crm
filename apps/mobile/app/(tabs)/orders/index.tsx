import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { QUOTATION_STATUSES, SALES_ORDER_STATUSES } from '@crm/types';
import type { QuotationStatus, QuotationSummary, SalesOrderStatus, SalesOrderSummary } from '@crm/types';
import { useQuotationsList } from '@/features/quotations/useQuotations';
import { quotationStatusColor, quotationStatusLabel } from '@/features/quotations/status';
import { useSalesOrdersList } from '@/features/sales-orders/useSalesOrders';
import { salesOrderStatusColor, salesOrderStatusLabel } from '@/features/sales-orders/status';
import { useAuth } from '@/lib/auth/useAuth';

type Segment = 'quotations' | 'orders';

function QuotationRow({ quotation }: { quotation: QuotationSummary }) {
  return (
    <Pressable
      style={styles.row}
      onPress={() => router.push({ pathname: '/orders/quotations/[id]', params: { id: quotation.id } })}
    >
      <View style={styles.rowMain}>
        <Text style={styles.rowTitle}>{quotation.customer.name}</Text>
        <Text style={styles.rowSubtitle}>{quotation.quotationNumber}</Text>
      </View>
      <View style={styles.rowBadges}>
        <Text style={[styles.badge, { color: quotationStatusColor(quotation.status) }]}>
          {quotationStatusLabel(quotation.status)}
        </Text>
        <Text style={styles.rowAmount}>
          {quotation.currencyCode} {quotation.totalAmount}
        </Text>
      </View>
    </Pressable>
  );
}

function SalesOrderRow({ order }: { order: SalesOrderSummary }) {
  return (
    <Pressable
      style={styles.row}
      onPress={() => router.push({ pathname: '/orders/orders/[id]', params: { id: order.id } })}
    >
      <View style={styles.rowMain}>
        <Text style={styles.rowTitle}>{order.customer.name}</Text>
        <Text style={styles.rowSubtitle}>{order.salesOrderNumber}</Text>
      </View>
      <View style={styles.rowBadges}>
        <Text style={[styles.badge, { color: salesOrderStatusColor(order.status) }]}>
          {salesOrderStatusLabel(order.status)}
        </Text>
        <Text style={styles.rowAmount}>
          {order.currencyCode} {order.totalAmount}
        </Text>
      </View>
    </Pressable>
  );
}

/** Sales (MOBILE_PRD.md section 7.6) - Quotations (Read/Create) and read-only Orders in one segmented view. */
export default function OrdersScreen() {
  const { can } = useAuth();
  const [segment, setSegment] = useState<Segment>('quotations');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<QuotationStatus | undefined>(undefined);
  const [orderStatus, setOrderStatus] = useState<SalesOrderStatus | undefined>(undefined);

  const quotationParams = useMemo(
    () => ({ q: search.trim() || undefined, status, pageSize: 50 }),
    [search, status],
  );
  const quotations = useQuotationsList(quotationParams);

  const orderParams = useMemo(() => ({ status: orderStatus, pageSize: 50 }), [orderStatus]);
  const orders = useSalesOrdersList(orderParams);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.heading}>Sales</Text>
        {segment === 'quotations' && can('quotation.create') && (
          <Pressable style={styles.newButton} onPress={() => router.push('/orders/quotations/create')}>
            <Text style={styles.newButtonText}>+ New</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.segmentRow}>
        <Pressable
          style={[styles.segment, segment === 'quotations' && styles.segmentActive]}
          onPress={() => setSegment('quotations')}
        >
          <Text style={[styles.segmentText, segment === 'quotations' && styles.segmentTextActive]}>Quotations</Text>
        </Pressable>
        <Pressable
          style={[styles.segment, segment === 'orders' && styles.segmentActive]}
          onPress={() => setSegment('orders')}
        >
          <Text style={[styles.segmentText, segment === 'orders' && styles.segmentTextActive]}>Orders</Text>
        </Pressable>
      </View>

      {segment === 'quotations' ? (
        <>
          <TextInput
            style={styles.search}
            placeholder="Search quotation number"
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipRow}
            contentContainerStyle={styles.chipRowContent}
          >
            <Pressable style={[styles.chip, !status && styles.chipActive]} onPress={() => setStatus(undefined)}>
              <Text style={[styles.chipText, !status && styles.chipTextActive]}>All</Text>
            </Pressable>
            {QUOTATION_STATUSES.map((value) => (
              <Pressable
                key={value}
                style={[styles.chip, status === value && styles.chipActive]}
                onPress={() => setStatus(value)}
              >
                <Text style={[styles.chipText, status === value && styles.chipTextActive]}>
                  {quotationStatusLabel(value)}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {quotations.isLoading ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" />
            </View>
          ) : quotations.isError || !quotations.data ? (
            <View style={styles.centered}>
              <Text style={styles.errorText}>Unable to load quotations. Pull down to try again.</Text>
            </View>
          ) : quotations.data.data.length === 0 ? (
            <View style={styles.centered}>
              <Text style={styles.emptyTitle}>No quotations found</Text>
              <Text style={styles.emptyBody}>
                {search || status ? 'Try a different search or filter.' : 'Quotations you create will show up here.'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={quotations.data.data}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <QuotationRow quotation={item} />}
              contentContainerStyle={styles.list}
              refreshControl={
                <RefreshControl refreshing={quotations.isRefetching} onRefresh={() => void quotations.refetch()} />
              }
            />
          )}
        </>
      ) : (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipRow}
            contentContainerStyle={styles.chipRowContent}
          >
            <Pressable
              style={[styles.chip, !orderStatus && styles.chipActive]}
              onPress={() => setOrderStatus(undefined)}
            >
              <Text style={[styles.chipText, !orderStatus && styles.chipTextActive]}>All</Text>
            </Pressable>
            {SALES_ORDER_STATUSES.map((value) => (
              <Pressable
                key={value}
                style={[styles.chip, orderStatus === value && styles.chipActive]}
                onPress={() => setOrderStatus(value)}
              >
                <Text style={[styles.chipText, orderStatus === value && styles.chipTextActive]}>
                  {salesOrderStatusLabel(value)}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {orders.isLoading ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" />
            </View>
          ) : orders.isError || !orders.data ? (
            <View style={styles.centered}>
              <Text style={styles.errorText}>Unable to load orders. Pull down to try again.</Text>
            </View>
          ) : orders.data.data.length === 0 ? (
            <View style={styles.centered}>
              <Text style={styles.emptyTitle}>No orders found</Text>
              <Text style={styles.emptyBody}>
                {orderStatus ? 'Try a different filter.' : 'Orders converted from quotations will show up here.'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={orders.data.data}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <SalesOrderRow order={item} />}
              contentContainerStyle={styles.list}
              refreshControl={<RefreshControl refreshing={orders.isRefetching} onRefresh={() => void orders.refetch()} />}
            />
          )}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  heading: { fontSize: 22, fontWeight: '700', color: '#0f172a' },
  newButton: { backgroundColor: '#3b5bdb', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  newButtonText: { color: '#ffffff', fontSize: 14, fontWeight: '600' },
  segmentRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#e2e8f0',
    borderRadius: 8,
    padding: 3,
  },
  segment: { flex: 1, paddingVertical: 8, borderRadius: 6, alignItems: 'center' },
  segmentActive: { backgroundColor: '#ffffff' },
  segmentText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  segmentTextActive: { color: '#0f172a' },
  search: {
    marginHorizontal: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#ffffff',
  },
  chipRow: { marginTop: 12, flexGrow: 0 },
  chipRowContent: { paddingHorizontal: 16, gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipActive: { backgroundColor: '#3b5bdb', borderColor: '#3b5bdb' },
  chipText: { fontSize: 13, color: '#475569' },
  chipTextActive: { color: '#ffffff', fontWeight: '600' },
  list: { padding: 16, paddingTop: 12, gap: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
  },
  rowMain: { flex: 1, marginRight: 8 },
  rowTitle: { fontSize: 15, fontWeight: '600', color: '#0f172a' },
  rowSubtitle: { fontSize: 13, color: '#475569', marginTop: 2 },
  rowBadges: { alignItems: 'flex-end', gap: 2 },
  badge: { fontSize: 12, fontWeight: '600' },
  rowAmount: { fontSize: 13, color: '#0f172a', fontWeight: '600' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  errorText: { fontSize: 14, color: '#475569', textAlign: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#0f172a' },
  emptyBody: { fontSize: 13, color: '#475569', marginTop: 6, textAlign: 'center' },
});
