import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router';
import { Button } from '@/components/common/Button';
import { TextField } from '@/components/common/TextField';
import { authService } from '@/lib/auth/auth-service';
import { ApiError } from '@/lib/api/api-error';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from './schemas/forgot-password.schema';

/** No user-enumeration: the same success message shows whether or not the email matched an account (matches the backend's own design). */
export function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({ resolver: zodResolver(forgotPasswordSchema) });

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
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-bg-app)] px-4">
      <div className="w-full max-w-sm rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="font-serif text-2xl font-bold text-[var(--color-text-primary)]">Forgot password</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Enter your email and we'll send you a link to reset it.
          </p>
        </div>

        {submitted ? (
          <div className="flex flex-col gap-4">
            <div
              role="status"
              className="rounded-[var(--radius-input)] border border-[var(--color-success-border)] bg-[var(--color-success-bg)] px-3 py-2 text-sm text-[var(--color-success-text)]"
            >
              If an account is eligible, password reset instructions will be sent.
            </div>
            <Link to="/login" className="text-center text-sm font-medium text-[var(--color-info-text)] underline">
              Back to sign in
            </Link>
          </div>
        ) : (
          <form noValidate onSubmit={(event) => void handleSubmit(onSubmit)(event)}>
            <div className="flex flex-col gap-4">
              {formError && (
                <div
                  role="alert"
                  className="rounded-[var(--radius-input)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] px-3 py-2 text-sm text-[var(--color-danger-text)]"
                >
                  {formError}
                </div>
              )}

              <TextField
                label="Email"
                type="email"
                autoComplete="email"
                autoFocus
                required
                error={errors.email?.message}
                {...register('email')}
              />

              <Button type="submit" size="lg" isLoading={isSubmitting} className="mt-2 w-full">
                {isSubmitting ? 'Sending…' : 'Send reset link'}
              </Button>

              <Link to="/login" className="text-center text-sm font-medium text-[var(--color-info-text)] underline">
                Back to sign in
              </Link>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
