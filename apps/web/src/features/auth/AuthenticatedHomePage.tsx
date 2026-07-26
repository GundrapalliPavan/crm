import { Button } from '@/components/common/Button';
import { useAuth } from '@/lib/auth/useAuth';

/**
 * Minimal authenticated landing (Step 4 section 65) - a placeholder until the
 * production application shell and dashboard exist. Deliberately not that:
 * no sidebar, no navigation, no module content.
 */
export function AuthenticatedHomePage() {
  const { user, logout } = useAuth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--color-bg-app)] px-4 text-center">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
          Welcome, {user?.firstName}
        </h1>
        <p className="mt-1 text-[var(--color-text-secondary)]">Authentication successful.</p>
      </div>

      <Button variant="secondary" onClick={() => void logout()}>
        Sign out
      </Button>
    </main>
  );
}
