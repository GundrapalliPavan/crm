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
import { loginOtpPhoneSchema, type LoginOtpPhoneFormValues } from '@/features/auth/schemas/login-otp.schema';

/** Phone-entry step of login-by-OTP. Mirrors (tabs)/profile/phone-number.tsx's navigation to a verify step. */
export default function LoginOtpScreen() {
  const { status } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginOtpPhoneFormValues>({ resolver: zodResolver(loginOtpPhoneSchema) });

  if (status === 'authenticated') {
    return <Redirect href="/(tabs)" />;
  }

  async function onSubmit(values: LoginOtpPhoneFormValues) {
    setFormError(null);

    try {
      await authService.requestLoginOtp({ phone: values.phone });
      router.push({ pathname: '/login-otp-verify', params: { phone: values.phone } });
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
          <Text style={styles.title}>Log In with OTP</Text>
          <Text style={styles.subtitle}>Enter your registered phone number to receive a login code.</Text>

          {formError && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{formError}</Text>
            </View>
          )}

          <View style={styles.field}>
            <Text style={styles.label}>Phone Number</Text>
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.phone && styles.inputError]}
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
            {errors.phone && <Text style={styles.fieldError}>{errors.phone.message}</Text>}
          </View>

          <Pressable
            style={[styles.button, isSubmitting && styles.buttonDisabled]}
            onPress={() => void handleSubmit(onSubmit)()}
            disabled={isSubmitting}
          >
            {isSubmitting ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.buttonText}>Send Code</Text>}
          </Pressable>

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
