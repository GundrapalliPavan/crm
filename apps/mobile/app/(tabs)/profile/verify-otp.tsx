import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
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
import { otpSchema, type OtpFormValues } from '@/features/auth/schemas/otp.schema';

/**
 * Mirrors change-password.tsx's form structure. On success, refreshUser()
 * picks up the new phone into AuthContext without a re-login, and
 * dismissTo collapses both this screen and phone-number.tsx back to Profile.
 */
export default function VerifyOtpScreen() {
  const { newPhone } = useLocalSearchParams<{ newPhone: string }>();
  const { refreshUser } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [resent, setResent] = useState(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<OtpFormValues>({ resolver: zodResolver(otpSchema) });

  async function onSubmit(values: OtpFormValues) {
    setFormError(null);

    try {
      await phoneApi.verifyOtp({ code: values.code });
      await refreshUser();
      router.dismissTo('/profile');
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
    if (!newPhone) return;

    setFormError(null);
    setResent(false);
    setIsResending(true);
    try {
      await phoneApi.requestOtp({ newPhone });
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
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>{'< Phone Number'}</Text>
        </Pressable>

        <View style={styles.card}>
          <Text style={styles.title}>Enter Verification Code</Text>
          <Text style={styles.subtitle}>
            {newPhone ? `We sent a 6-digit code to ${newPhone}.` : 'Enter the 6-digit code we sent you.'}
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
            <Text style={styles.label}>Verification Code</Text>
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
            disabled={isResending || !newPhone}
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
