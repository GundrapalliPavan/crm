import { router } from 'expo-router';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { FollowUp, FollowUpType } from '@crm/types';
import { useMyTasks } from '@/features/visits/useVisits';

const FOLLOW_UP_TYPE_LABEL: Record<FollowUpType, string> = {
  call: 'Call',
  meeting: 'Meeting',
  visit: 'Site Visit',
  email: 'Email',
  whatsapp: 'WhatsApp',
  other: 'Other',
};

function startOfTodayIso(): string {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}

function endOfTodayIso(): string {
  const date = new Date();
  date.setHours(23, 59, 59, 999);
  return date.toISOString();
}

function TaskRow({ task }: { task: FollowUp }) {
  const statusLabel = task.status === 'pending' && task.isOverdue ? 'Overdue' : task.status;
  const statusColor =
    task.status === 'pending' && task.isOverdue
      ? '#dc2626'
      : task.status === 'completed'
        ? '#16a34a'
        : task.status === 'cancelled'
          ? '#64748b'
          : '#2563eb';

  return (
    <Pressable style={styles.row} onPress={() => router.push({ pathname: '/visits/[id]', params: { id: task.id } })}>
      <View style={styles.rowMain}>
        <Text style={styles.rowType}>{FOLLOW_UP_TYPE_LABEL[task.followUpType]}</Text>
        <Text style={styles.rowTime}>{new Date(task.scheduledAt).toLocaleString()}</Text>
      </View>
      <Text style={[styles.badge, { color: statusColor }]}>{statusLabel}</Text>
    </Pressable>
  );
}

function TaskSection({ title, tasks }: { title: string; tasks: FollowUp[] }) {
  if (tasks.length === 0) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {tasks.map((task) => (
        <TaskRow key={task.id} task={task} />
      ))}
    </View>
  );
}

/** Today's task list (MOBILE_PRD.md section 7.4) - every follow-up type, not just visits; only visit rows get check-in/out on the detail screen. */
export default function VisitsListScreen() {
  const today = useMyTasks({ status: 'pending', dateFrom: startOfTodayIso(), dateTo: endOfTodayIso() });
  const overdue = useMyTasks({ status: 'pending', overdue: true });

  const isLoading = today.isLoading || overdue.isLoading;
  const isError = today.isError || overdue.isError;
  const isRefetching = today.isRefetching || overdue.isRefetching;

  async function refetchAll() {
    await Promise.all([today.refetch(), overdue.refetch()]);
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (isError || !today.data || !overdue.data) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>Unable to load your tasks. Pull down to try again.</Text>
      </SafeAreaView>
    );
  }

  const hasAnything = today.data.data.length > 0 || overdue.data.data.length > 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Text style={styles.heading}>Visits &amp; Tasks</Text>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => void refetchAll()} />}
      >
        <TaskSection title="Overdue" tasks={overdue.data.data} />
        <TaskSection title="Today" tasks={today.data.data} />
        {!hasAnything && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Nothing due today</Text>
            <Text style={styles.emptyBody}>Follow-ups and visits you schedule will show up here.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: 20 },
  errorText: { fontSize: 14, color: '#475569', textAlign: 'center' },
  heading: { fontSize: 22, fontWeight: '700', color: '#0f172a', paddingHorizontal: 16, paddingTop: 8 },
  content: { padding: 16, paddingBottom: 32 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: '#475569', textTransform: 'uppercase', marginBottom: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    marginBottom: 8,
  },
  rowMain: { flex: 1, marginRight: 8 },
  rowType: { fontSize: 15, fontWeight: '600', color: '#0f172a' },
  rowTime: { fontSize: 13, color: '#475569', marginTop: 2 },
  badge: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#0f172a' },
  emptyBody: { fontSize: 13, color: '#475569', marginTop: 6, textAlign: 'center' },
});
