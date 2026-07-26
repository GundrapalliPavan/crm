import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Navigate, useLocation, useNavigate, type Location } from 'react-router';
import { Button } from '@/components/common/Button';
import { TextField } from '@/components/common/TextField';
import { ApiError } from '@/lib/api/api-error';
import { useAuth } from '@/lib/auth/useAuth';
import { loginSchema, type LoginFormValues } from './schemas/login.schema';

interface LocationState {
  from?: Location;
}

/**
 * The minimum production-quality login screen (Step 4 sections 59-62).
 *
 * Deliberately plain: no marketing layout, no decoration beyond what the
 * design system already defines. This is a daily tool for distributor staff,
 * not a consumer landing page.
 */
export function LoginPage() {
  const { status, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  // Already signed in (e.g. followed a link to /login manually) - leave
  // immediately rather than showing a form there is nothing to submit.
  if (status === 'authenticated') {
    return <Navigate to="/" replace />;
  }

  async function onSubmit(values: LoginFormValues) {
    setFormError(null);

    try {
      await login(values);
      const from = (location.state as LocationState | null)?.from;
      navigate(from ?? '/', { replace: true });
    } catch (error) {
      const apiError = error instanceof ApiError ? error : null;

      if (apiError?.isValidationError) {
        for (const field of ['email', 'password'] as const) {
          const [message] = apiError.fieldErrors(field);
          if (message) {
            setError(field, { message });
          }
        }
        return;
      }

      // INVALID_CREDENTIALS, ACCOUNT_INACTIVE, RATE_LIMITED and network
      // failures all land here - every one of them already carries a safe,
      // specific message from the backend (or the client's own normaliser).
      setFormError(apiError?.message ?? 'Something went wrong. Please try again.');
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-bg-app)] px-4">
      <div className="w-full max-w-sm rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="font-serif text-2xl font-bold text-[var(--color-text-primary)]">
            Electrical Distribution CRM
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Sign in to continue</p>
        </div>

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

            <TextField
              label="Password"
              type="password"
              autoComplete="current-password"
              required
              error={errors.password?.message}
              {...register('password')}
            />

            <Button type="submit" size="lg" isLoading={isSubmitting} className="mt-2 w-full">
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
