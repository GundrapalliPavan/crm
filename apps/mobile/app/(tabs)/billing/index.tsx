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
import { INVOICE_STATUSES, PAYMENT_STATUSES } from '@crm/types';
import type { InvoiceStatus, InvoiceSummary, PaymentStatus, PaymentSummary } from '@crm/types';
import { useInvoicesList } from '@/features/invoices/useInvoices';
import { invoiceStatusColor, invoiceStatusLabel } from '@/features/invoices/status';
import { usePaymentsList } from '@/features/payments/usePayments';
import { paymentStatusColor, paymentStatusLabel } from '@/features/payments/status';

type Segment = 'invoices' | 'payments';

function InvoiceRow({ invoice }: { invoice: InvoiceSummary }) {
  return (
    <Pressable
      style={styles.row}
      onPress={() => router.push({ pathname: '/billing/invoices/[id]', params: { id: invoice.id } })}
    >
      <View style={styles.rowMain}>
        <Text style={styles.rowTitle}>{invoice.customer.name}</Text>
        <Text style={styles.rowSubtitle}>{invoice.invoiceNumber}</Text>
      </View>
      <View style={styles.rowBadges}>
        <Text style={[styles.badge, { color: invoiceStatusColor(invoice.status) }]}>
          {invoiceStatusLabel(invoice.status)}
        </Text>
        <Text style={styles.rowAmount}>
          {invoice.currencyCode} {invoice.totalAmount}
        </Text>
      </View>
    </Pressable>
  );
}

function PaymentRow({ payment }: { payment: PaymentSummary }) {
  return (
    <Pressable
      style={styles.row}
      onPress={() => router.push({ pathname: '/billing/payments/[id]', params: { id: payment.id } })}
    >
      <View style={styles.rowMain}>
        <Text style={styles.rowTitle}>{payment.customer.name}</Text>
        <Text style={styles.rowSubtitle}>{payment.paymentNumber}</Text>
      </View>
      <View style={styles.rowBadges}>
        <Text style={[styles.badge, { color: paymentStatusColor(payment.status) }]}>
          {paymentStatusLabel(payment.status)}
        </Text>
        <Text style={styles.rowAmount}>
          {payment.currencyCode} {payment.amount}
        </Text>
      </View>
    </Pressable>
  );
}

/** Billing (MOBILE_PRD.md section 7.7) - read-only Invoice List + Payment Status, reached via
 *  a Dashboard drill-down rather than its own bottom tab (see (tabs)/_layout.tsx). */
export default function BillingScreen() {
  const [segment, setSegment] = useState<Segment>('invoices');
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [invoiceStatus, setInvoiceStatus] = useState<InvoiceStatus | undefined>(undefined);
  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | undefined>(undefined);

  const invoiceParams = useMemo(
    () => ({ q: invoiceSearch.trim() || undefined, status: invoiceStatus, pageSize: 50 }),
    [invoiceSearch, invoiceStatus],
  );
  const invoices = useInvoicesList(invoiceParams);

  const paymentParams = useMemo(
    () => ({ q: paymentSearch.trim() || undefined, status: paymentStatus, pageSize: 50 }),
    [paymentSearch, paymentStatus],
  );
  const payments = usePaymentsList(paymentParams);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>{'< Dashboard'}</Text>
        </Pressable>
      </View>

      <View style={styles.segmentRow}>
        <Pressable
          style={[styles.segment, segment === 'invoices' && styles.segmentActive]}
          onPress={() => setSegment('invoices')}
        >
          <Text style={[styles.segmentText, segment === 'invoices' && styles.segmentTextActive]}>Invoices</Text>
        </Pressable>
        <Pressable
          style={[styles.segment, segment === 'payments' && styles.segmentActive]}
          onPress={() => setSegment('payments')}
        >
          <Text style={[styles.segmentText, segment === 'payments' && styles.segmentTextActive]}>Payments</Text>
        </Pressable>
      </View>

      {segment === 'invoices' ? (
        <>
          <TextInput
            style={styles.search}
            placeholder="Search invoice number"
            value={invoiceSearch}
            onChangeText={setInvoiceSearch}
            autoCapitalize="none"
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipRow}
            contentContainerStyle={styles.chipRowContent}
          >
            <Pressable
              style={[styles.chip, !invoiceStatus && styles.chipActive]}
              onPress={() => setInvoiceStatus(undefined)}
            >
              <Text style={[styles.chipText, !invoiceStatus && styles.chipTextActive]}>All</Text>
            </Pressable>
            {INVOICE_STATUSES.map((value) => (
              <Pressable
                key={value}
                style={[styles.chip, invoiceStatus === value && styles.chipActive]}
                onPress={() => setInvoiceStatus(value)}
              >
                <Text style={[styles.chipText, invoiceStatus === value && styles.chipTextActive]}>
                  {invoiceStatusLabel(value)}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {invoices.isLoading ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" />
            </View>
          ) : invoices.isError || !invoices.data ? (
            <View style={styles.centered}>
              <Text style={styles.errorText}>Unable to load invoices. Pull down to try again.</Text>
            </View>
          ) : invoices.data.data.length === 0 ? (
            <View style={styles.centered}>
              <Text style={styles.emptyTitle}>No invoices found</Text>
              <Text style={styles.emptyBody}>
                {invoiceSearch || invoiceStatus ? 'Try a different search or filter.' : 'Invoices will show up here.'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={invoices.data.data}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <InvoiceRow invoice={item} />}
              contentContainerStyle={styles.list}
              refreshControl={
                <RefreshControl refreshing={invoices.isRefetching} onRefresh={() => void invoices.refetch()} />
              }
            />
          )}
        </>
      ) : (
        <>
          <TextInput
            style={styles.search}
            placeholder="Search payment number"
            value={paymentSearch}
            onChangeText={setPaymentSearch}
            autoCapitalize="none"
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipRow}
            contentContainerStyle={styles.chipRowContent}
          >
            <Pressable
              style={[styles.chip, !paymentStatus && styles.chipActive]}
              onPress={() => setPaymentStatus(undefined)}
            >
              <Text style={[styles.chipText, !paymentStatus && styles.chipTextActive]}>All</Text>
            </Pressable>
            {PAYMENT_STATUSES.map((value) => (
              <Pressable
                key={value}
                style={[styles.chip, paymentStatus === value && styles.chipActive]}
                onPress={() => setPaymentStatus(value)}
              >
                <Text style={[styles.chipText, paymentStatus === value && styles.chipTextActive]}>
                  {paymentStatusLabel(value)}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {payments.isLoading ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" />
            </View>
          ) : payments.isError || !payments.data ? (
            <View style={styles.centered}>
              <Text style={styles.errorText}>Unable to load payments. Pull down to try again.</Text>
            </View>
          ) : payments.data.data.length === 0 ? (
            <View style={styles.centered}>
              <Text style={styles.emptyTitle}>No payments found</Text>
              <Text style={styles.emptyBody}>
                {paymentSearch || paymentStatus ? 'Try a different search or filter.' : 'Payments will show up here.'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={payments.data.data}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <PaymentRow payment={item} />}
              contentContainerStyle={styles.list}
              refreshControl={
                <RefreshControl refreshing={payments.isRefetching} onRefresh={() => void payments.refetch()} />
              }
            />
          )}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  header: { paddingHorizontal: 16, paddingTop: 8 },
  back: { fontSize: 15, color: '#3b5bdb', marginBottom: 8 },
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
