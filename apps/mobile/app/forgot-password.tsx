import { zodResolver } from '@hookform/resolvers/zod';
import { Redirect, router } from 'expo-router';
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
import { authService } from '@/lib/auth/auth-service';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '@/features/auth/schemas/forgot-password.schema';

/**
 * Request-only: the reset link the backend emails points at the web app's
 * URL, not a mobile deep link (no Universal Links/App Links wiring exists),
 * so completing the reset happens in a browser - this screen only mirrors
 * apps/web's ForgotPasswordPage's email-in/generic-success UX.
 */
export default function ForgotPasswordScreen() {
  const { status } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({ resolver: zodResolver(forgotPasswordSchema) });

  if (status === 'authenticated') {
    return <Redirect href="/(tabs)" />;
  }

  async function onSubmit(values: ForgotPasswordFormValues) {
    setFormError(null);

    try {
      await authService.forgotPassword(values);
      setSubmitted(true);
    } catch (error) {
      const apiError = error instanceof ApiError ? error : null;
      setFormError(apiError?.message ?? 'Something went wrong. Please try again.');
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Forgot Password</Text>
          <Text style={styles.subtitle}>Enter your email and we&apos;ll send you a link to reset it.</Text>

          {formError && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{formError}</Text>
            </View>
          )}

          {submitted ? (
            <View style={styles.successBanner}>
              <Text style={styles.successBannerText}>
                If an account is eligible, password reset instructions will be sent.
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.field}>
                <Text style={styles.label}>Email</Text>
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[styles.input, errors.email && styles.inputError]}
                      autoCapitalize="none"
                      autoComplete="email"
                      keyboardType="email-address"
                      textContentType="emailAddress"
                      value={value ?? ''}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      editable={!isSubmitting}
                    />
                  )}
                />
                {errors.email && <Text style={styles.fieldError}>{errors.email.message}</Text>}
              </View>

              <Pressable
                style={[styles.button, isSubmitting && styles.buttonDisabled]}
                onPress={() => void handleSubmit(onSubmit)()}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.buttonText}>Send Reset Link</Text>
                )}
              </Pressable>
            </>
          )}

          <Pressable onPress={() => router.back()} style={styles.backLink}>
            <Text style={styles.backLinkText}>Back to sign in</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 20 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  title: { fontSize: 20, fontWeight: '700', color: '#0f172a', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#475569', textAlign: 'center', marginTop: 4, marginBottom: 20 },
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
    padding: 12,
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
  backLink: { alignItems: 'center', marginTop: 16 },
  backLinkText: { color: '#3b5bdb', fontSize: 14, fontWeight: '600' },
});
