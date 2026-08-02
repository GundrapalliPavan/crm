import { router } from 'expo-router';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { RecentActivityEntityType } from '@crm/types';
import { useDashboard } from '@/features/dashboard/useDashboard';

function visitStatusLabel(checkInAt: string | null, checkOutAt: string | null): string {
  if (checkOutAt) return 'Completed';
  if (checkInAt) return 'Checked in';
  return 'Not started';
}

function recentActivityRoute(entityType: RecentActivityEntityType, entityId: string) {
  switch (entityType) {
    case 'lead':
      return { pathname: '/leads/[id]' as const, params: { id: entityId } };
    case 'visit':
      return { pathname: '/visits/[id]' as const, params: { id: entityId } };
    case 'quotation':
      return { pathname: '/orders/quotations/[id]' as const, params: { id: entityId } };
  }
}

function StatTile({
  label,
  value,
  onPress,
}: {
  label: string;
  value: string | number;
  onPress?: () => void;
}) {
  const content = (
    <>
      <Text style={styles.tileValue}>{value}</Text>
      <Text style={styles.tileLabel}>{label}</Text>
    </>
  );

  if (onPress) {
    return (
      <Pressable style={styles.tile} onPress={onPress}>
        {content}
      </Pressable>
    );
  }

  return <View style={styles.tile}>{content}</View>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.tileRow}>{children}</View>
    </View>
  );
}

/**
 * "See -> Act -> Update -> Move On" (MOBILE_PRD.md section 5) - the start-
 * here screen. Only renders the sections the API actually returns, since
 * `GET /reports/dashboard` already scopes them to the caller's permissions
 * (DashboardResponse - only unlocked sections are present).
 */
export default function DashboardScreen() {
  const { data, isLoading, isError, refetch, isRefetching } = useDashboard();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (isError || !data) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>Unable to load your dashboard. Pull down to try again.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} />}
      >
        <Text style={styles.heading}>Today</Text>

        {data.followUps && (
          <Section title="Follow-ups">
            <StatTile label="Due today" value={data.followUps.dueToday} />
            <StatTile label="Overdue" value={data.followUps.overdue} />
          </Section>
        )}

        {data.leads && (
          <Section title="Leads">
            <StatTile label="My open leads" value={data.leads.myOpen} />
            <StatTile label="New this week" value={data.leads.newThisWeek} />
          </Section>
        )}

        {data.sales && (
          <Section title="Sales">
            <StatTile label="My quotations pending" value={data.sales.myQuotationsPendingApproval} />
            <StatTile label="Orders confirmed this month" value={data.sales.confirmedOrdersThisMonth} />
          </Section>
        )}

        {data.billing && (
          <Section title="Billing">
            <StatTile
              label="Total outstanding"
              value={data.billing.totalOutstanding}
              onPress={() => router.push('/billing')}
            />
            <StatTile
              label="Overdue invoices"
              value={data.billing.overdueInvoiceCount}
              onPress={() => router.push('/billing')}
            />
          </Section>
        )}

        {data.followUps && data.followUps.items.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Coming up</Text>
            {data.followUps.items.map((item) => (
              <View key={item.id} style={styles.followUpRow}>
                <Text style={styles.followUpEntity}>{item.entityLabel}</Text>
                <Text style={[styles.followUpMeta, item.isOverdue && styles.followUpOverdue]}>
                  {item.followUpType} - {new Date(item.scheduledAt).toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        )}

        {data.visits && data.visits.items.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today&apos;s Visits</Text>
            {data.visits.items.map((visit) => (
              <Pressable
                key={visit.id}
                style={styles.followUpRow}
                onPress={() => router.push({ pathname: '/visits/[id]', params: { id: visit.id } })}
              >
                <Text style={styles.followUpEntity}>{visit.entityLabel}</Text>
                <Text style={styles.followUpMeta}>
                  {new Date(visit.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                  {visitStatusLabel(visit.checkInAt, visit.checkOutAt)}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {data.recentActivity && data.recentActivity.items.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            {data.recentActivity.items.map((item) => (
              <Pressable
                key={`${item.entityType}-${item.id}`}
                style={styles.followUpRow}
                onPress={() => router.push(recentActivityRoute(item.entityType, item.entityId))}
              >
                <Text style={styles.followUpEntity}>{item.label}</Text>
                <Text style={styles.followUpMeta}>
                  {item.description} - {new Date(item.occurredAt).toLocaleString()}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: 20 },
  content: { padding: 16, paddingBottom: 32 },
  heading: { fontSize: 22, fontWeight: '700', color: '#0f172a', marginBottom: 16 },
  errorText: { fontSize: 14, color: '#475569', textAlign: 'center' },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: '#475569', textTransform: 'uppercase', marginBottom: 8 },
  tileRow: { flexDirection: 'row', gap: 12 },
  tile: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
  },
  tileValue: { fontSize: 22, fontWeight: '700', color: '#0f172a' },
  tileLabel: { fontSize: 12, color: '#475569', marginTop: 2 },
  followUpRow: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    marginBottom: 8,
  },
  followUpEntity: { fontSize: 14, fontWeight: '600', color: '#0f172a' },
  followUpMeta: { fontSize: 12, color: '#475569', marginTop: 2 },
  followUpOverdue: { color: '#dc2626', fontWeight: '600' },
});
