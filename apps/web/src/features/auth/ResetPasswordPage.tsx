import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Button } from '@/components/common/Button';
import { TextField } from '@/components/common/TextField';
import { authService } from '@/lib/auth/auth-service';
import { ApiError } from '@/lib/api/api-error';
import { setPasswordSchema, type SetPasswordFormValues } from './schemas/set-password.schema';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SetPasswordFormValues>({ resolver: zodResolver(setPasswordSchema) });

  async function onSubmit(values: SetPasswordFormValues) {
    setFormError(null);
    try {
      await authService.resetPassword({ token, newPassword: values.password });
      navigate('/login', { state: { message: 'Your password has been reset. Sign in with your new password.' } });
    } catch (error) {
      const apiError = error instanceof ApiError ? error : null;
      setFormError(apiError?.message ?? 'This reset link is invalid or has expired.');
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-bg-app)] px-4">
      <div className="w-full max-w-sm rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="font-serif text-2xl font-bold text-[var(--color-text-primary)]">Reset password</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Choose a new password for your account.</p>
        </div>

        {!token && (
          <div
            role="alert"
            className="mb-4 rounded-[var(--radius-input)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] px-3 py-2 text-sm text-[var(--color-danger-text)]"
          >
            This link is missing its reset token. Request a new one below.
          </div>
        )}

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
              label="New password"
              type="password"
              autoComplete="new-password"
              autoFocus
              required
              error={errors.password?.message}
              {...register('password')}
            />

            <TextField
              label="Confirm new password"
              type="password"
              autoComplete="new-password"
              required
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <Button type="submit" size="lg" isLoading={isSubmitting} disabled={!token} className="mt-2 w-full">
              {isSubmitting ? 'Resetting…' : 'Reset password'}
            </Button>

            <Link to="/forgot-password" className="text-center text-sm font-medium text-[var(--color-info-text)] underline">
              Request a new link
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
