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
import { changePasswordSchema, type ChangePasswordFormValues } from '@/features/auth/schemas/change-password.schema';

/** Mirrors app/login.tsx's form structure. Success stays signed in (the backend keeps this
 *  session alive and only revokes others) - so this just confirms and returns to Profile. */
export default function ChangePasswordScreen() {
  const { changePassword } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({ resolver: zodResolver(changePasswordSchema) });

  async function onSubmit(values: ChangePasswordFormValues) {
    setFormError(null);
    setSuccess(false);

    try {
      await changePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword });
      setSuccess(true);
      setTimeout(() => router.back(), 1200);
    } catch (error) {
      const apiError = error instanceof ApiError ? error : null;

      if (apiError?.isValidationError) {
        for (const field of ['currentPassword', 'newPassword'] as const) {
          const [message] = apiError.fieldErrors(field);
          if (message) {
            setError(field, { message });
          }
        }
        return;
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
          <Text style={styles.title}>Change Password</Text>
          <Text style={styles.subtitle}>Other devices will be signed out; this one stays signed in.</Text>

          {formError && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{formError}</Text>
            </View>
          )}

          {success && (
            <View style={styles.successBanner}>
              <Text style={styles.successBannerText}>Password changed.</Text>
            </View>
          )}

          <View style={styles.field}>
            <Text style={styles.label}>Current Password</Text>
            <Controller
              control={control}
              name="currentPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.currentPassword && styles.inputError]}
                  secureTextEntry
                  autoComplete="current-password"
                  textContentType="password"
                  value={value ?? ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  editable={!isSubmitting}
                />
              )}
            />
            {errors.currentPassword && <Text style={styles.fieldError}>{errors.currentPassword.message}</Text>}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>New Password</Text>
            <Controller
              control={control}
              name="newPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.newPassword && styles.inputError]}
                  secureTextEntry
                  autoComplete="new-password"
                  textContentType="newPassword"
                  value={value ?? ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  editable={!isSubmitting}
                />
              )}
            />
            {errors.newPassword && <Text style={styles.fieldError}>{errors.newPassword.message}</Text>}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Confirm New Password</Text>
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.confirmPassword && styles.inputError]}
                  secureTextEntry
                  autoComplete="new-password"
                  textContentType="newPassword"
                  value={value ?? ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  editable={!isSubmitting}
                />
              )}
            />
            {errors.confirmPassword && <Text style={styles.fieldError}>{errors.confirmPassword.message}</Text>}
          </View>

          <Pressable
            style={[styles.button, isSubmitting && styles.buttonDisabled]}
            onPress={() => void handleSubmit(onSubmit)()}
            disabled={isSubmitting}
          >
            {isSubmitting ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.buttonText}>Save</Text>}
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
  successBanner: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  successBannerText: { color: '#15803d', fontSize: 13 },
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
