import * as Location from 'expo-location';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { FollowUpType } from '@crm/types';
import { useLead } from '@/features/leads/useLeads';
import { useCancelFollowUp, useCheckIn, useCompleteFollowUp, useFollowUp } from '@/features/visits/useVisits';
import { ApiError } from '@/lib/api/api-error';

const FOLLOW_UP_TYPE_LABEL: Record<FollowUpType, string> = {
  call: 'Call',
  meeting: 'Meeting',
  visit: 'Site Visit',
  email: 'Email',
  whatsapp: 'WhatsApp',
  other: 'Other',
};

const OUTCOME_OPTIONS = ['Interested', 'Order placed', 'Follow-up needed', 'Not interested', 'Other'];

/** Requests location permission inline (MOBILE_PRD.md section 8 - only at point of use) and returns coordinates as decimal strings, or undefined if unavailable/denied. */
async function captureLocation(): Promise<{ latitude: string; longitude: string } | undefined> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return undefined;
    const position = await Location.getCurrentPositionAsync({});
    return { latitude: String(position.coords.latitude), longitude: String(position.coords.longitude) };
  } catch {
    return undefined;
  }
}

function openInMaps(latitude: string, longitude: string) {
  void Linking.openURL(`https://maps.google.com/?q=${latitude},${longitude}`);
}

export default function VisitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: task, isLoading, isError } = useFollowUp(id);
  const { data: relatedLead } = useLead(task?.leadId ?? '');
  const checkIn = useCheckIn(id);
  const complete = useCompleteFollowUp(id);
  const cancel = useCancelFollowUp(id);

  const [isCapturingLocation, setIsCapturingLocation] = useState(false);
  const [outcome, setOutcome] = useState('');
  const [notes, setNotes] = useState('');

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (isError || !task) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>Unable to load this task.</Text>
      </SafeAreaView>
    );
  }

  const relatedLabel = task.leadId
    ? (relatedLead ? `${relatedLead.firstName} ${relatedLead.lastName ?? ''}`.trim() : 'Lead')
    : task.contactId
      ? 'Contact'
      : task.companyId
        ? 'Company'
        : null;

  async function handleCheckIn() {
    setIsCapturingLocation(true);
    try {
      const location = await captureLocation();
      await checkIn.mutateAsync(location ?? {});
    } catch (error) {
      Alert.alert('Unable to check in', error instanceof ApiError ? error.message : 'Please try again.');
    } finally {
      setIsCapturingLocation(false);
    }
  }

  async function handleCheckOut() {
    setIsCapturingLocation(true);
    try {
      const location = await captureLocation();
      await complete.mutateAsync({
        outcome: outcome || undefined,
        notes: notes || undefined,
        checkOutLatitude: location?.latitude,
        checkOutLongitude: location?.longitude,
      });
      router.back();
    } catch (error) {
      Alert.alert('Unable to check out', error instanceof ApiError ? error.message : 'Please try again.');
    } finally {
      setIsCapturingLocation(false);
    }
  }

  async function handleComplete() {
    try {
      await complete.mutateAsync({ outcome: outcome || undefined, notes: notes || undefined });
      router.back();
    } catch (error) {
      Alert.alert('Unable to complete', error instanceof ApiError ? error.message : 'Please try again.');
    }
  }

  async function handleCancel() {
    try {
      await cancel.mutateAsync();
      router.back();
    } catch (error) {
      Alert.alert('Unable to cancel', error instanceof ApiError ? error.message : 'Please try again.');
    }
  }

  const isVisit = task.followUpType === 'visit';
  const isBusy = isCapturingLocation || checkIn.isPending || complete.isPending || cancel.isPending;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>{'< Visits & Tasks'}</Text>
        </Pressable>

        <Text style={styles.title}>{FOLLOW_UP_TYPE_LABEL[task.followUpType]}</Text>
        {relatedLabel && <Text style={styles.subtitle}>{relatedLabel}</Text>}
        <Text style={styles.meta}>{new Date(task.scheduledAt).toLocaleString()}</Text>
        <Text style={styles.status}>{task.status === 'pending' && task.isOverdue ? 'Overdue' : task.status}</Text>

        {task.notes && <Text style={styles.notesText}>{task.notes}</Text>}

        {task.status !== 'pending' ? (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Outcome</Text>
            <Text style={styles.summaryValue}>{task.outcome ?? '-'}</Text>
            {isVisit && task.checkInAt && (
              <>
                <Text style={styles.summaryLabel}>Checked in</Text>
                <Text style={styles.summaryValue}>{new Date(task.checkInAt).toLocaleString()}</Text>
              </>
            )}
            {isVisit && task.checkOutAt && (
              <>
                <Text style={styles.summaryLabel}>Checked out</Text>
                <Text style={styles.summaryValue}>{new Date(task.checkOutAt).toLocaleString()}</Text>
              </>
            )}
          </View>
        ) : isVisit && !task.checkInAt ? (
          <Pressable style={styles.primaryButton} onPress={() => void handleCheckIn()} disabled={isBusy}>
            {isBusy ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.primaryButtonText}>Check In</Text>}
          </Pressable>
        ) : isVisit ? (
          <>
            <View style={styles.checkedInCard}>
              <Text style={styles.summaryLabel}>Checked in</Text>
              <Text style={styles.summaryValue}>{new Date(task.checkInAt!).toLocaleString()}</Text>
              {task.checkInLatitude && task.checkInLongitude && (
                <Pressable onPress={() => openInMaps(task.checkInLatitude!, task.checkInLongitude!)}>
                  <Text style={styles.link}>Open in Maps</Text>
                </Pressable>
              )}
            </View>

            <Text style={styles.label}>Outcome</Text>
            <View style={styles.chipWrap}>
              {OUTCOME_OPTIONS.map((option) => (
                <Pressable
                  key={option}
                  style={[styles.chip, outcome === option && styles.chipActive]}
                  onPress={() => setOutcome(option)}
                >
                  <Text style={[styles.chipText, outcome === option && styles.chipTextActive]}>{option}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              multiline
              placeholder="What happened at this visit?"
            />

            <Pressable style={styles.primaryButton} onPress={() => void handleCheckOut()} disabled={isBusy}>
              {isBusy ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.primaryButtonText}>Check Out</Text>}
            </Pressable>
          </>
        ) : (
          <>
            <Text style={styles.label}>Outcome</Text>
            <TextInput
              style={styles.notesInput}
              value={outcome}
              onChangeText={setOutcome}
              placeholder="e.g. Connected, left voicemail..."
            />
            <Text style={styles.label}>Notes</Text>
            <TextInput style={styles.notesInput} value={notes} onChangeText={setNotes} multiline />

            <View style={styles.actionsRow}>
              <Pressable style={styles.primaryButton} onPress={() => void handleComplete()} disabled={isBusy}>
                {complete.isPending ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.primaryButtonText}>Complete</Text>
                )}
              </Pressable>
              <Pressable style={styles.secondaryButton} onPress={() => void handleCancel()} disabled={isBusy}>
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </Pressable>
            </View>
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
  title: { fontSize: 22, fontWeight: '700', color: '#0f172a' },
  subtitle: { fontSize: 15, color: '#334155', marginTop: 2 },
  meta: { fontSize: 13, color: '#475569', marginTop: 6 },
  status: { fontSize: 13, fontWeight: '600', color: '#2563eb', marginTop: 4, textTransform: 'capitalize' },
  notesText: { fontSize: 14, color: '#0f172a', marginTop: 12 },
  label: { fontSize: 13, fontWeight: '600', color: '#0f172a', marginTop: 18, marginBottom: 8 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
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
  notesInput: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#ffffff',
    minHeight: 44,
  },
  primaryButton: {
    backgroundColor: '#3b5bdb',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  primaryButtonText: { color: '#ffffff', fontSize: 15, fontWeight: '600' },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
    flex: 1,
  },
  secondaryButtonText: { color: '#b91c1c', fontSize: 15, fontWeight: '600' },
  actionsRow: { flexDirection: 'row', gap: 10 },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    marginTop: 16,
    gap: 4,
  },
  checkedInCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    marginTop: 16,
    gap: 4,
  },
  summaryLabel: { fontSize: 12, color: '#64748b', marginTop: 6 },
  summaryValue: { fontSize: 14, color: '#0f172a', fontWeight: '600' },
  link: { fontSize: 13, color: '#3b5bdb', marginTop: 4 },
});
