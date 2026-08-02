import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCompany, useCompanyContacts, useCompanyOutstandingInvoices } from '@/features/companies/useCompanies';
import { useQuotationsList } from '@/features/quotations/useQuotations';
import { quotationStatusColor, quotationStatusLabel } from '@/features/quotations/status';
import { useSalesOrdersList } from '@/features/sales-orders/useSalesOrders';
import { salesOrderStatusColor, salesOrderStatusLabel } from '@/features/sales-orders/status';
import { useCompanyVisits } from '@/features/visits/useVisits';
import { useCompanyCommunications } from '@/features/communications/useCommunications';
import { communicationChannelLabel, communicationDirectionLabel } from '@/features/communications/status';

function companyTypeLabel(companyType: string): string {
  return companyType
    .split('_')
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(' ');
}

function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

function EmptyRow({ text }: { text: string }) {
  return <Text style={styles.emptyRow}>{text}</Text>;
}

/** Customer/Dealer Profile (MOBILE_PRD.md section 7.5) - read-only: contact info, outstanding
 *  balance, recent quotations/orders, previous visits, communication history. */
export default function CustomerProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: company, isLoading, isError } = useCompany(id);
  const contacts = useCompanyContacts(id);
  const outstandingInvoices = useCompanyOutstandingInvoices(id);
  const quotations = useQuotationsList({ customerCompanyId: id, pageSize: 5 });
  const orders = useSalesOrdersList({ customerCompanyId: id, pageSize: 5 });
  const visits = useCompanyVisits(id);
  const communications = useCompanyCommunications(id);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (isError || !company) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>Unable to load this customer.</Text>
      </SafeAreaView>
    );
  }

  const outstandingTotal = (outstandingInvoices.data?.data ?? []).reduce(
    (sum, invoice) => sum + Number(invoice.outstandingAmount),
    0,
  );
  const visitRows = (visits.data?.data ?? []).filter((followUp) => followUp.followUpType === 'visit');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>{'< Sales'}</Text>
        </Pressable>

        <Text style={styles.name}>{company.name}</Text>
        <View style={styles.badgeRow}>
          <Text style={styles.typeBadge}>{companyTypeLabel(company.companyType)}</Text>
          {company.isCustomer && <Text style={styles.typeBadge}>Customer</Text>}
          {company.isSupplier && <Text style={styles.typeBadge}>Dealer</Text>}
        </View>

        <View style={styles.contactRow}>
          {company.phone && (
            <Pressable onPress={() => void Linking.openURL(`tel:${company.phone}`)}>
              <Text style={styles.contactLink}>{company.phone}</Text>
            </Pressable>
          )}
          {company.email && (
            <Pressable onPress={() => void Linking.openURL(`mailto:${company.email}`)}>
              <Text style={styles.contactLink}>{company.email}</Text>
            </Pressable>
          )}
          {!company.phone && !company.email && <Text style={styles.emptyRow}>No contact info on file</Text>}
        </View>

        <SectionTitle>Outstanding Balance</SectionTitle>
        <SectionCard>
          {outstandingInvoices.isLoading ? (
            <ActivityIndicator />
          ) : outstandingInvoices.isError ? (
            <Text style={styles.errorText}>Unable to load balance.</Text>
          ) : outstandingTotal === 0 ? (
            <EmptyRow text="No outstanding invoices" />
          ) : (
            <>
              <Text style={styles.balanceAmount}>₹{outstandingTotal.toFixed(2)}</Text>
              <Text style={styles.balanceMeta}>
                Across {outstandingInvoices.data?.data.length} open invoice
                {outstandingInvoices.data?.data.length === 1 ? '' : 's'}
              </Text>
            </>
          )}
        </SectionCard>

        <SectionTitle>Contacts</SectionTitle>
        <SectionCard>
          {contacts.isLoading ? (
            <ActivityIndicator />
          ) : contacts.isError ? (
            <Text style={styles.errorText}>Unable to load contacts.</Text>
          ) : !contacts.data || contacts.data.data.length === 0 ? (
            <EmptyRow text="No contacts yet" />
          ) : (
            contacts.data.data.map((contact) => (
              <View key={contact.id} style={styles.listRow}>
                <Text style={styles.listRowTitle}>
                  {contact.firstName} {contact.lastName ?? ''}
                </Text>
                <Text style={styles.listRowSubtitle}>{contact.jobTitle ?? contact.phone ?? contact.email ?? '—'}</Text>
              </View>
            ))
          )}
        </SectionCard>

        <SectionTitle>Recent Quotations</SectionTitle>
        <SectionCard>
          {quotations.isLoading ? (
            <ActivityIndicator />
          ) : quotations.isError ? (
            <Text style={styles.errorText}>Unable to load quotations.</Text>
          ) : !quotations.data || quotations.data.data.length === 0 ? (
            <EmptyRow text="No quotations yet" />
          ) : (
            quotations.data.data.map((quotation) => (
              <Pressable
                key={quotation.id}
                style={styles.listRow}
                onPress={() => router.push({ pathname: '/orders/quotations/[id]', params: { id: quotation.id } })}
              >
                <View>
                  <Text style={styles.listRowTitle}>{quotation.quotationNumber}</Text>
                  <Text style={[styles.listRowSubtitle, { color: quotationStatusColor(quotation.status) }]}>
                    {quotationStatusLabel(quotation.status)}
                  </Text>
                </View>
                <Text style={styles.listRowAmount}>
                  {quotation.currencyCode} {quotation.totalAmount}
                </Text>
              </Pressable>
            ))
          )}
        </SectionCard>

        <SectionTitle>Recent Orders</SectionTitle>
        <SectionCard>
          {orders.isLoading ? (
            <ActivityIndicator />
          ) : orders.isError ? (
            <Text style={styles.errorText}>Unable to load orders.</Text>
          ) : !orders.data || orders.data.data.length === 0 ? (
            <EmptyRow text="No orders yet" />
          ) : (
            orders.data.data.map((order) => (
              <Pressable
                key={order.id}
                style={styles.listRow}
                onPress={() => router.push({ pathname: '/orders/orders/[id]', params: { id: order.id } })}
              >
                <View>
                  <Text style={styles.listRowTitle}>{order.salesOrderNumber}</Text>
                  <Text style={[styles.listRowSubtitle, { color: salesOrderStatusColor(order.status) }]}>
                    {salesOrderStatusLabel(order.status)}
                  </Text>
                </View>
                <Text style={styles.listRowAmount}>
                  {order.currencyCode} {order.totalAmount}
                </Text>
              </Pressable>
            ))
          )}
        </SectionCard>

        <SectionTitle>Previous Visits</SectionTitle>
        <SectionCard>
          {visits.isLoading ? (
            <ActivityIndicator />
          ) : visits.isError ? (
            <Text style={styles.errorText}>Unable to load visits.</Text>
          ) : visitRows.length === 0 ? (
            <EmptyRow text="No visits yet" />
          ) : (
            visitRows.map((visit) => (
              <View key={visit.id} style={styles.listRow}>
                <View>
                  <Text style={styles.listRowTitle}>{new Date(visit.scheduledAt).toLocaleString()}</Text>
                  <Text style={styles.listRowSubtitle}>
                    {visit.assignee.firstName} {visit.assignee.lastName}
                  </Text>
                </View>
                <Text style={styles.listRowSubtitle}>{visit.status}</Text>
              </View>
            ))
          )}
        </SectionCard>

        <SectionTitle>Communication History</SectionTitle>
        <SectionCard>
          {communications.isLoading ? (
            <ActivityIndicator />
          ) : communications.isError ? (
            <Text style={styles.errorText}>Unable to load communication history.</Text>
          ) : !communications.data || communications.data.data.length === 0 ? (
            <EmptyRow text="No communication history yet" />
          ) : (
            communications.data.data.map((communication) => (
              <View key={communication.id} style={styles.listRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.listRowTitle}>
                    {communicationChannelLabel(communication.channel)} · {communicationDirectionLabel(communication.direction)}
                  </Text>
                  <Text style={styles.listRowSubtitle} numberOfLines={1}>
                    {communication.subject ?? communication.messageBody ?? '—'}
                  </Text>
                </View>
                <Text style={styles.listRowSubtitle}>{new Date(communication.createdAt).toLocaleDateString()}</Text>
              </View>
            ))
          )}
        </SectionCard>
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
  name: { fontSize: 20, fontWeight: '700', color: '#0f172a' },
  badgeRow: { flexDirection: 'row', gap: 6, marginTop: 6 },
  typeBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3b5bdb',
    backgroundColor: '#eef2ff',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    overflow: 'hidden',
  },
  contactRow: { flexDirection: 'row', gap: 16, marginTop: 10 },
  contactLink: { fontSize: 14, color: '#3b5bdb', fontWeight: '600' },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    textTransform: 'uppercase',
    marginTop: 20,
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    gap: 10,
  },
  emptyRow: { fontSize: 13, color: '#64748b' },
  balanceAmount: { fontSize: 22, fontWeight: '700', color: '#0f172a' },
  balanceMeta: { fontSize: 12, color: '#64748b' },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  listRowTitle: { fontSize: 14, fontWeight: '600', color: '#0f172a' },
  listRowSubtitle: { fontSize: 12, color: '#64748b', marginTop: 2 },
  listRowAmount: { fontSize: 13, fontWeight: '600', color: '#0f172a' },
});
