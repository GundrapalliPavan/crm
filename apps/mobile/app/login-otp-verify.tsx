import { zodResolver } from '@hookform/resolvers/zod';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
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
import { otpSchema, type OtpFormValues } from '@/features/auth/schemas/otp.schema';

/**
 * On success, loginWithOtp() flips global auth status to 'authenticated' -
 * the guard below then redirects on the next render, mirroring how
 * app/login.tsx returns to the tab bar (no manual navigation here).
 */
export default function LoginOtpVerifyScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { status, loginWithOtp } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [resent, setResent] = useState(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<OtpFormValues>({ resolver: zodResolver(otpSchema) });

  if (status === 'authenticated') {
    return <Redirect href="/(tabs)" />;
  }

  async function onSubmit(values: OtpFormValues) {
    setFormError(null);

    try {
      await loginWithOtp({ phone, code: values.code });
    } catch (error) {
      const apiError = error instanceof ApiError ? error : null;

      if (apiError?.isValidationError) {
        const [message] = apiError.fieldErrors('code');
        if (message) {
          setError('code', { message });
          return;
        }
      }

      setFormError(apiError?.message ?? 'Something went wrong. Please try again.');
    }
  }

  async function handleResend() {
    if (!phone) return;

    setFormError(null);
    setResent(false);
    setIsResending(true);
    try {
      await authService.requestLoginOtp({ phone });
      setResent(true);
    } catch (error) {
      const apiError = error instanceof ApiError ? error : null;
      setFormError(apiError?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setIsResending(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>{'< Phone Number'}</Text>
        </Pressable>

        <View style={styles.card}>
          <Text style={styles.title}>Enter Login Code</Text>
          <Text style={styles.subtitle}>
            {phone ? `We sent a 6-digit code to ${phone}.` : 'Enter the 6-digit code we sent you.'}
          </Text>

          {formError && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{formError}</Text>
            </View>
          )}

          {resent && (
            <View style={styles.successBanner}>
              <Text style={styles.successBannerText}>A new code has been sent.</Text>
            </View>
          )}

          <View style={styles.field}>
            <Text style={styles.label}>Login Code</Text>
            <Controller
              control={control}
              name="code"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.code && styles.inputError]}
                  keyboardType="number-pad"
                  maxLength={6}
                  textContentType="oneTimeCode"
                  autoComplete="sms-otp"
                  placeholder="123456"
                  value={value ?? ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  editable={!isSubmitting}
                />
              )}
            />
            {errors.code && <Text style={styles.fieldError}>{errors.code.message}</Text>}
          </View>

          <Pressable
            style={[styles.button, isSubmitting && styles.buttonDisabled]}
            onPress={() => void handleSubmit(onSubmit)()}
            disabled={isSubmitting}
          >
            {isSubmitting ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.buttonText}>Verify</Text>}
          </Pressable>

          <Pressable
            style={styles.resendLink}
            onPress={() => void handleResend()}
            disabled={isResending || !phone}
          >
            <Text style={styles.resendLinkText}>{isResending ? 'Resending…' : 'Resend code'}</Text>
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
  resendLink: { alignItems: 'center', marginTop: 16 },
  resendLinkText: { color: '#3b5bdb', fontSize: 14, fontWeight: '600' },
});
