import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LEAD_PRIORITIES, LEAD_TYPES } from '@crm/types';
import { useLead, useUpdateLead } from '@/features/leads/useLeads';
import { leadPriorityLabel, leadTypeLabel } from '@/features/leads/status';
import { leadFormSchema, type LeadFormValues } from '@/features/leads/schemas/lead.schema';
import { ApiError } from '@/lib/api/api-error';

/** Edit Lead (MOBILE_PRD.md section 7.3) - same form as create.tsx, prefilled and PATCHed. */
export default function LeadEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: lead, isLoading } = useLead(id);
  const updateLead = useUpdateLead(id);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LeadFormValues>({ resolver: zodResolver(leadFormSchema) });

  useEffect(() => {
    if (!lead) return;
    reset({
      firstName: lead.firstName,
      lastName: lead.lastName ?? '',
      companyName: lead.companyName ?? '',
      phone: lead.phone ?? '',
      email: lead.email ?? '',
      leadType: lead.leadType ?? undefined,
      priority: lead.priority,
      notes: lead.notes ?? '',
    });
  }, [lead, reset]);

  async function onSubmit(values: LeadFormValues) {
    try {
      await updateLead.mutateAsync({
        firstName: values.firstName,
        lastName: values.lastName || undefined,
        companyName: values.companyName || undefined,
        phone: values.phone || undefined,
        email: values.email || undefined,
        leadType: values.leadType,
        priority: values.priority,
        notes: values.notes || undefined,
      });
      router.back();
    } catch (error) {
      const apiError = error instanceof ApiError ? error : null;
      if (apiError?.isValidationError) {
        for (const field of ['firstName', 'phone', 'email'] as const) {
          const [message] = apiError.fieldErrors(field);
          if (message) setError(field, { message });
        }
        return;
      }
      setError('firstName', { message: apiError?.message ?? 'Unable to save changes. Please try again.' });
    }
  }

  if (isLoading || !lead) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.back}>Cancel</Text>
          </Pressable>
          <Text style={styles.heading}>Edit Lead</Text>
          <View style={{ width: 50 }} />
        </View>

        <Text style={styles.label}>First name *</Text>
        <Controller
          control={control}
          name="firstName"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput style={styles.input} value={value ?? ''} onChangeText={onChange} onBlur={onBlur} />
          )}
        />
        {errors.firstName && <Text style={styles.fieldError}>{errors.firstName.message}</Text>}

        <Text style={styles.label}>Last name</Text>
        <Controller
          control={control}
          name="lastName"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput style={styles.input} value={value ?? ''} onChangeText={onChange} onBlur={onBlur} />
          )}
        />

        <Text style={styles.label}>Company</Text>
        <Controller
          control={control}
          name="companyName"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput style={styles.input} value={value ?? ''} onChangeText={onChange} onBlur={onBlur} />
          )}
        />

        <Text style={styles.label}>Phone</Text>
        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="phone-pad"
            />
          )}
        />
        {errors.phone && <Text style={styles.fieldError}>{errors.phone.message}</Text>}

        <Text style={styles.label}>Email</Text>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          )}
        />
        {errors.email && <Text style={styles.fieldError}>{errors.email.message}</Text>}

        <Text style={styles.label}>Lead type *</Text>
        <Controller
          control={control}
          name="leadType"
          render={({ field: { onChange, value } }) => (
            <View style={styles.chipWrap}>
              {LEAD_TYPES.map((type) => (
                <Pressable
                  key={type}
                  style={[styles.chip, value === type && styles.chipActive]}
                  onPress={() => onChange(type)}
                >
                  <Text style={[styles.chipText, value === type && styles.chipTextActive]}>
                    {leadTypeLabel(type)}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        />
        {errors.leadType && <Text style={styles.fieldError}>Select a lead type.</Text>}

        <Text style={styles.label}>Priority</Text>
        <Controller
          control={control}
          name="priority"
          render={({ field: { onChange, value } }) => (
            <View style={styles.chipWrap}>
              {LEAD_PRIORITIES.map((priority) => (
                <Pressable
                  key={priority}
                  style={[styles.chip, value === priority && styles.chipActive]}
                  onPress={() => onChange(priority)}
                >
                  <Text style={[styles.chipText, value === priority && styles.chipTextActive]}>
                    {leadPriorityLabel(priority)}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        />

        <Text style={styles.label}>Notes</Text>
        <Controller
          control={control}
          name="notes"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, styles.multiline]}
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              multiline
              numberOfLines={4}
            />
          )}
        />

        <Pressable
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={() => void handleSubmit(onSubmit)()}
          disabled={isSubmitting}
        >
          {isSubmitting ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.submitText}>Save Changes</Text>}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' },
  content: { padding: 16, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  back: { fontSize: 15, color: '#3b5bdb' },
  heading: { fontSize: 17, fontWeight: '700', color: '#0f172a' },
  label: { fontSize: 13, fontWeight: '600', color: '#0f172a', marginTop: 14, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#0f172a',
    backgroundColor: '#ffffff',
  },
  multiline: { minHeight: 90, textAlignVertical: 'top' },
  fieldError: { fontSize: 12, color: '#dc2626', marginTop: 4 },
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
  submitButton: {
    backgroundColor: '#3b5bdb',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonDisabled: { opacity: 0.7 },
  submitText: { color: '#ffffff', fontSize: 15, fontWeight: '600' },
});
