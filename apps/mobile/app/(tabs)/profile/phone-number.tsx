import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ApiError } from '@/lib/api/api-error';
import { useAuth } from '@/lib/auth/useAuth';
import { phoneApi } from '@/features/auth/phone-api';
import { phoneNumberSchema, type PhoneNumberFormValues } from '@/features/auth/schemas/phone-number.schema';

/** Mirrors change-password.tsx's form structure. Sending the code hands off to verify-otp.tsx, not the session. */
export default function PhoneNumberScreen() {
  const { user } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PhoneNumberFormValues>({ resolver: zodResolver(phoneNumberSchema) });

  async function onSubmit(values: PhoneNumberFormValues) {
    setFormError(null);

    try {
      await phoneApi.requestOtp({ newPhone: values.newPhone });
      router.push({ pathname: '/profile/verify-otp', params: { newPhone: values.newPhone } });
    } catch (error) {
      const apiError = error instanceof ApiError ? error : null;

      if (apiError?.isValidationError) {
        const [message] = apiError.fieldErrors('newPhone');
        if (message) {
          setError('newPhone', { message });
          return;
        }
      }

      setFormError(apiError?.message ?? 'Something went wrong. Please try again.');
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>{'< Profile'}</Text>
        </Pressable>

        <View style={styles.card}>
          <Text style={styles.title}>Phone Number</Text>
          <Text style={styles.subtitle}>
            {user?.phone ? `Current number: ${user.phone}` : 'No phone number on file yet.'}
          </Text>

          {formError && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{formError}</Text>
            </View>
          )}

          <View style={styles.field}>
            <Text style={styles.label}>New Phone Number</Text>
            <Controller
              control={control}
              name="newPhone"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.newPhone && styles.inputError]}
                  keyboardType="phone-pad"
                  autoComplete="tel"
                  textContentType="telephoneNumber"
                  placeholder="+91XXXXXXXXXX"
                  value={value ?? ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  editable={!isSubmitting}
                />
              )}
            />
            {errors.newPhone && <Text style={styles.fieldError}>{errors.newPhone.message}</Text>}
          </View>

          <Pressable
            style={[styles.button, isSubmitting && styles.buttonDisabled]}
            onPress={() => void handleSubmit(onSubmit)()}
            disabled={isSubmitting}
          >
            {isSubmitting ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.buttonText}>Send Code</Text>}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 8 },
  back: { fontSize: 15, color: '#3b5bdb', marginBottom: 16 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  title: { fontSize: 20, fontWeight: '700', color: '#0f172a' },
  subtitle: { fontSize: 13, color: '#475569', marginTop: 4, marginBottom: 20 },
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#0f172a', marginBottom: 6 },
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
  inputError: { borderColor: '#dc2626' },
  fieldError: { fontSize: 12, color: '#dc2626', marginTop: 4 },
  errorBanner: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  errorBannerText: { color: '#b91c1c', fontSize: 13 },
  button: {
    backgroundColor: '#3b5bdb',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#ffffff', fontSize: 15, fontWeight: '600' },
});
