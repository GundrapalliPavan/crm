import { Button } from '@/components/common/Button';
import { useAuth } from '@/lib/auth/useAuth';

/**
 * UX.md section 74: kept restrained. Global search and quick-create are
 * listed there as *potential* content, not required - deferred until a
 * second module exists to search across.
 */
export function TopBar() {
  const { user, logout } = useAuth();

  return (
    <header className="flex h-14 shrink-0 items-center justify-end gap-3 border-b border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-6">
      <span className="text-sm text-[var(--color-text-secondary)]">
        {user?.firstName} {user?.lastName}
      </span>
      <Button variant="secondary" size="sm" onClick={() => void logout()}>
        Sign out
      </Button>
    </header>
  );
}
