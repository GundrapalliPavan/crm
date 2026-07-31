import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { FollowUpType, LeadLostReason, LeadStatus } from '@crm/types';
import { FOLLOW_UP_TYPES, LEAD_LOST_REASONS, LEAD_STATUSES } from '@crm/types';
import {
  useConvertLead,
  useCreateFollowUp,
  useCreateLeadActivity,
  useLead,
  useLeadActivities,
  useTransitionLeadStatus,
} from '@/features/leads/useLeads';
import {
  leadPriorityColor,
  leadPriorityLabel,
  leadStatusColor,
  leadStatusLabel,
  leadTypeLabel,
  lostReasonLabel,
} from '@/features/leads/status';
import { useAuth } from '@/lib/auth/useAuth';
import { ApiError } from '@/lib/api/api-error';

const FOLLOW_UP_TYPE_LABEL: Record<FollowUpType, string> = {
  call: 'Call',
  meeting: 'Meeting',
  visit: 'Site Visit',
  email: 'Email',
  whatsapp: 'WhatsApp',
  other: 'Other',
};

/** Module-level (not closed over component state) so the eslint-plugin-react-hooks
 *  purity rule doesn't mistake this impure Date.now() read for a render-time call. */
function scheduleAtHoursFromNow(hours: number): string {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}

const QUICK_SCHEDULE = [
  { label: 'In 1 hour', hours: 1 },
  { label: 'Tomorrow', hours: 24 },
  { label: 'In 3 days', hours: 72 },
] as const;

function ActivityRow({
  activityType,
  title,
  description,
  performedBy,
  activityAt,
}: {
  activityType: string;
  title: string;
  description: string | null;
  performedBy: { firstName: string; lastName: string } | null;
  activityAt: string;
}) {
  return (
    <View style={styles.activityRow}>
      <Text style={styles.activityType}>{title}</Text>
      {description && <Text style={styles.activityDescription}>{description}</Text>}
      <Text style={styles.activityMeta}>
        {performedBy ? `${performedBy.firstName} ${performedBy.lastName}` : 'System'} ·{' '}
        {new Date(activityAt).toLocaleString()}
      </Text>
    </View>
  );
}

export default function LeadDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, can } = useAuth();
  const { data: lead, isLoading, isError } = useLead(id);
  const { data: activities } = useLeadActivities(id);
  const transitionStatus = useTransitionLeadStatus(id);
  const convertLead = useConvertLead(id);
  const createActivity = useCreateLeadActivity(id);
  const createFollowUp = useCreateFollowUp();

  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [pickedStatus, setPickedStatus] = useState<LeadStatus | null>(null);
  const [pickedLostReason, setPickedLostReason] = useState<LeadLostReason | null>(null);
  const [statusNotes, setStatusNotes] = useState('');

  const [followUpModalOpen, setFollowUpModalOpen] = useState(false);
  const [followUpType, setFollowUpType] = useState<FollowUpType>('call');
  const [followUpNotes, setFollowUpNotes] = useState('');

  const [noteText, setNoteText] = useState('');

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (isError || !lead) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>Unable to load this lead.</Text>
      </SafeAreaView>
    );
  }

  async function submitStatusChange() {
    if (!pickedStatus) return;
    try {
      await transitionStatus.mutateAsync({
        status: pickedStatus,
        lostReason: pickedStatus === 'lost' ? (pickedLostReason ?? undefined) : undefined,
        notes: statusNotes || undefined,
      });
      setStatusModalOpen(false);
      setPickedStatus(null);
      setPickedLostReason(null);
      setStatusNotes('');
    } catch (error) {
      Alert.alert('Unable to change status', error instanceof ApiError ? error.message : 'Please try again.');
    }
  }

  async function handleConvert() {
    Alert.alert('Convert lead?', 'This creates (or links) a Company and Contact from this lead.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Convert',
        onPress: () => {
          void convertLead.mutateAsync({}).catch((error: unknown) => {
            Alert.alert('Unable to convert', error instanceof ApiError ? error.message : 'Please try again.');
          });
        },
      },
    ]);
  }

  async function submitFollowUpWithSchedule(hours: number) {
    if (!user || !lead) return;
    try {
      await createFollowUp.mutateAsync({
        leadId: lead.id,
        assignedTo: user.id,
        followUpType,
        scheduledAt: scheduleAtHoursFromNow(hours),
        notes: followUpNotes || undefined,
      });
      setFollowUpModalOpen(false);
      setFollowUpNotes('');
      Alert.alert('Follow-up scheduled', followUpType === 'visit' ? 'Find it on the Visits tab.' : undefined);
    } catch (error) {
      Alert.alert('Unable to schedule', error instanceof ApiError ? error.message : 'Please try again.');
    }
  }

  async function submitNote() {
    if (!noteText.trim()) return;
    try {
      await createActivity.mutateAsync({ activityType: 'note', title: 'Note', description: noteText.trim() });
      setNoteText('');
    } catch (error) {
      Alert.alert('Unable to add note', error instanceof ApiError ? error.message : 'Please try again.');
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.back}>{'< Leads'}</Text>
          </Pressable>
          {can('lead.update') && (
            <Pressable onPress={() => router.push({ pathname: '/leads/edit/[id]', params: { id: lead.id } })}>
              <Text style={styles.editLink}>Edit</Text>
            </Pressable>
          )}
        </View>

        <Text style={styles.name}>
          {lead.firstName} {lead.lastName ?? ''}
        </Text>
        {lead.companyName && <Text style={styles.company}>{lead.companyName}</Text>}

        <View style={styles.badgeRow}>
          <Text style={[styles.badge, { color: leadStatusColor(lead.status) }]}>{leadStatusLabel(lead.status)}</Text>
          <Text style={[styles.badge, { color: leadPriorityColor(lead.priority) }]}>
            {leadPriorityLabel(lead.priority)} priority
          </Text>
          {lead.leadType && <Text style={styles.badgeNeutral}>{leadTypeLabel(lead.leadType)}</Text>}
        </View>

        <View style={styles.card}>
          {lead.phone && (
            <Pressable onPress={() => void Linking.openURL(`tel:${lead.phone}`)}>
              <Text style={styles.link}>{lead.phone}</Text>
            </Pressable>
          )}
          {lead.email && (
            <Pressable onPress={() => void Linking.openURL(`mailto:${lead.email}`)}>
              <Text style={styles.link}>{lead.email}</Text>
            </Pressable>
          )}
          {lead.estimatedValue && (
            <Text style={styles.meta}>
              Estimated value: {lead.currencyCode} {lead.estimatedValue}
            </Text>
          )}
          {lead.notes && <Text style={styles.notes}>{lead.notes}</Text>}
        </View>

        <View style={styles.actionsRow}>
          {can('lead.update') && (
            <Pressable style={styles.actionButton} onPress={() => setStatusModalOpen(true)}>
              <Text style={styles.actionButtonText}>Change Status</Text>
            </Pressable>
          )}
          {can('lead.convert') && lead.status !== 'converted' && (
            <Pressable style={styles.actionButton} onPress={() => void handleConvert()}>
              <Text style={styles.actionButtonText}>Convert</Text>
            </Pressable>
          )}
          {can('follow_up.create') && (
            <Pressable style={styles.actionButton} onPress={() => setFollowUpModalOpen(true)}>
              <Text style={styles.actionButtonText}>Schedule Follow-up</Text>
            </Pressable>
          )}
        </View>

        <Text style={styles.sectionTitle}>Timeline</Text>
        {can('lead.update') && (
          <View style={styles.noteRow}>
            <TextInput
              style={styles.noteInput}
              placeholder="Add a note..."
              value={noteText}
              onChangeText={setNoteText}
              multiline
            />
            <Pressable style={styles.noteButton} onPress={() => void submitNote()}>
              <Text style={styles.noteButtonText}>Add</Text>
            </Pressable>
          </View>
        )}
        {activities?.data.length ? (
          activities.data.map((activity) => (
            <ActivityRow
              key={activity.id}
              activityType={activity.activityType}
              title={activity.title}
              description={activity.description}
              performedBy={activity.performedBy}
              activityAt={activity.activityAt}
            />
          ))
        ) : (
          <Text style={styles.emptyBody}>No activity yet.</Text>
        )}
      </ScrollView>

      <Modal visible={statusModalOpen} transparent animationType="slide" onRequestClose={() => setStatusModalOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Change Status</Text>
            <View style={styles.chipWrap}>
              {LEAD_STATUSES.map((value) => (
                <Pressable
                  key={value}
                  style={[styles.chip, pickedStatus === value && styles.chipActive]}
                  onPress={() => setPickedStatus(value)}
                >
                  <Text style={[styles.chipText, pickedStatus === value && styles.chipTextActive]}>
                    {leadStatusLabel(value)}
                  </Text>
                </Pressable>
              ))}
            </View>

            {pickedStatus === 'lost' && (
              <>
                <Text style={styles.modalLabel}>Lost reason *</Text>
                <View style={styles.chipWrap}>
                  {LEAD_LOST_REASONS.map((reason) => (
                    <Pressable
                      key={reason}
                      style={[styles.chip, pickedLostReason === reason && styles.chipActive]}
                      onPress={() => setPickedLostReason(reason)}
                    >
                      <Text style={[styles.chipText, pickedLostReason === reason && styles.chipTextActive]}>
                        {lostReasonLabel(reason)}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </>
            )}

            <TextInput
              style={[styles.noteInput, styles.modalNotes]}
              placeholder="Notes (optional)"
              value={statusNotes}
              onChangeText={setStatusNotes}
              multiline
            />

            <View style={styles.modalActions}>
              <Pressable style={styles.modalCancel} onPress={() => setStatusModalOpen(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.modalConfirm,
                  (!pickedStatus || (pickedStatus === 'lost' && !pickedLostReason)) && styles.modalConfirmDisabled,
                ]}
                disabled={!pickedStatus || (pickedStatus === 'lost' && !pickedLostReason) || transitionStatus.isPending}
                onPress={() => void submitStatusChange()}
              >
                {transitionStatus.isPending ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.modalConfirmText}>Save</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={followUpModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setFollowUpModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Schedule Follow-up</Text>
            <View style={styles.chipWrap}>
              {FOLLOW_UP_TYPES.map((type) => (
                <Pressable
                  key={type}
                  style={[styles.chip, followUpType === type && styles.chipActive]}
                  onPress={() => setFollowUpType(type)}
                >
                  <Text style={[styles.chipText, followUpType === type && styles.chipTextActive]}>
                    {FOLLOW_UP_TYPE_LABEL[type]}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.modalLabel}>When</Text>
            <View style={styles.chipWrap}>
              {QUICK_SCHEDULE.map((option) => (
                <Pressable
                  key={option.label}
                  style={styles.chip}
                  disabled={createFollowUp.isPending}
                  onPress={() => void submitFollowUpWithSchedule(option.hours)}
                >
                  <Text style={styles.chipText}>{option.label}</Text>
                </Pressable>
              ))}
            </View>

            <TextInput
              style={[styles.noteInput, styles.modalNotes]}
              placeholder="Notes (optional)"
              value={followUpNotes}
              onChangeText={setFollowUpNotes}
              multiline
            />

            <View style={styles.modalActions}>
              <Pressable style={styles.modalCancel} onPress={() => setFollowUpModalOpen(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: 20 },
  errorText: { fontSize: 14, color: '#475569', textAlign: 'center' },
  content: { padding: 16, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  back: { fontSize: 15, color: '#3b5bdb' },
  editLink: { fontSize: 15, color: '#3b5bdb', fontWeight: '600' },
  name: { fontSize: 22, fontWeight: '700', color: '#0f172a' },
  company: { fontSize: 14, color: '#475569', marginTop: 2 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 },
  badge: { fontSize: 13, fontWeight: '600' },
  badgeNeutral: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    marginTop: 16,
    gap: 6,
  },
  link: { fontSize: 14, color: '#3b5bdb' },
  meta: { fontSize: 13, color: '#475569' },
  notes: { fontSize: 14, color: '#0f172a', marginTop: 4 },
  actionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  actionButton: {
    borderWidth: 1,
    borderColor: '#3b5bdb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionButtonText: { fontSize: 13, fontWeight: '600', color: '#3b5bdb' },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: '#475569', textTransform: 'uppercase', marginTop: 24, marginBottom: 10 },
  noteRow: { flexDirection: 'row', gap: 8, marginBottom: 12, alignItems: 'flex-end' },
  noteInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#ffffff',
    minHeight: 40,
  },
  noteButton: { backgroundColor: '#3b5bdb', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10 },
  noteButtonText: { color: '#ffffff', fontSize: 13, fontWeight: '600' },
  activityRow: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    marginBottom: 8,
  },
  activityType: { fontSize: 14, fontWeight: '600', color: '#0f172a', textTransform: 'capitalize' },
  activityDescription: { fontSize: 13, color: '#334155', marginTop: 4 },
  activityMeta: { fontSize: 12, color: '#94a3b8', marginTop: 6 },
  emptyBody: { fontSize: 13, color: '#475569' },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
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
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.4)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#ffffff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20 },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#0f172a', marginBottom: 14 },
  modalLabel: { fontSize: 13, fontWeight: '600', color: '#0f172a', marginBottom: 8 },
  modalNotes: { minHeight: 70, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 16 },
  modalCancel: { paddingHorizontal: 14, paddingVertical: 10 },
  modalCancelText: { fontSize: 14, color: '#475569' },
  modalConfirm: { backgroundColor: '#3b5bdb', borderRadius: 8, paddingHorizontal: 18, paddingVertical: 10 },
  modalConfirmDisabled: { opacity: 0.5 },
  modalConfirmText: { color: '#ffffff', fontSize: 14, fontWeight: '600' },
});
