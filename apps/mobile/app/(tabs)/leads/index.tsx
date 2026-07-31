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
import type { Lead, LeadStatus } from '@crm/types';
import { LEAD_STATUSES } from '@crm/types';
import { useLeadsList } from '@/features/leads/useLeads';
import { leadPriorityColor, leadPriorityLabel, leadStatusColor, leadStatusLabel } from '@/features/leads/status';
import { useAuth } from '@/lib/auth/useAuth';

function LeadRow({ lead }: { lead: Lead }) {
  return (
    <Pressable style={styles.row} onPress={() => router.push({ pathname: '/leads/[id]', params: { id: lead.id } })}>
      <View style={styles.rowMain}>
        <Text style={styles.rowName}>
          {lead.firstName} {lead.lastName ?? ''}
        </Text>
        {lead.companyName && <Text style={styles.rowCompany}>{lead.companyName}</Text>}
      </View>
      <View style={styles.rowBadges}>
        <Text style={[styles.badge, { color: leadStatusColor(lead.status) }]}>{leadStatusLabel(lead.status)}</Text>
        <Text style={[styles.badge, { color: leadPriorityColor(lead.priority) }]}>
          {leadPriorityLabel(lead.priority)}
        </Text>
      </View>
    </Pressable>
  );
}

export default function LeadsListScreen() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<LeadStatus | undefined>(undefined);

  const params = useMemo(
    () => ({ assignedTo: user?.id, status, search: search.trim() || undefined, pageSize: 50 }),
    [user?.id, status, search],
  );
  const { data, isLoading, isError, refetch, isRefetching } = useLeadsList(params);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.heading}>My Leads</Text>
        <Pressable style={styles.newButton} onPress={() => router.push('/leads/create')}>
          <Text style={styles.newButtonText}>+ New</Text>
        </Pressable>
      </View>

      <TextInput
        style={styles.search}
        placeholder="Search name, company, phone, email"
        value={search}
        onChangeText={setSearch}
        autoCapitalize="none"
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow} contentContainerStyle={styles.chipRowContent}>
        <Pressable style={[styles.chip, !status && styles.chipActive]} onPress={() => setStatus(undefined)}>
          <Text style={[styles.chipText, !status && styles.chipTextActive]}>All</Text>
        </Pressable>
        {LEAD_STATUSES.map((value) => (
          <Pressable
            key={value}
            style={[styles.chip, status === value && styles.chipActive]}
            onPress={() => setStatus(value)}
          >
            <Text style={[styles.chipText, status === value && styles.chipTextActive]}>{leadStatusLabel(value)}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
        </View>
      ) : isError || !data ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>Unable to load leads. Pull down to try again.</Text>
        </View>
      ) : data.data.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>No leads found</Text>
          <Text style={styles.emptyBody}>
            {search || status ? 'Try a different search or filter.' : 'Leads assigned to you will show up here.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={data.data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <LeadRow lead={item} />}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} />}
        />
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
  rowName: { fontSize: 15, fontWeight: '600', color: '#0f172a' },
  rowCompany: { fontSize: 13, color: '#475569', marginTop: 2 },
  rowBadges: { alignItems: 'flex-end', gap: 2 },
  badge: { fontSize: 12, fontWeight: '600' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  errorText: { fontSize: 14, color: '#475569', textAlign: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#0f172a' },
  emptyBody: { fontSize: 13, color: '#475569', marginTop: 6, textAlign: 'center' },
});
