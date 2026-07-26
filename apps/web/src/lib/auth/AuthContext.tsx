import type { AuthenticatedUser, LoginRequest } from '@crm/types';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { AuthContext, type AuthContextValue, type AuthStatus } from './auth-context';
import { authService } from './auth-service';
import { onSessionExpired } from './auth-events';

/**
 * The single source of frontend authentication state (FRONTEND.md section 57).
 *
 * On mount, attempts a silent refresh using the httpOnly cookie before
 * fetching the current user (Step 4 section 58) - a page reload always clears
 * the in-memory access token, so this is what turns "cookie still valid" back
 * into a usable session without asking the user to sign in again.
 *
 * Deliberately plain state, not a React Query resource: the bootstrap
 * sequence is refresh-then-fetch, an ordered two-step process, not a single
 * cacheable query - modelling it as one would fight the library rather than
 * use it.
 */
export function AuthProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const queryClient = useQueryClient();

  const becomeUnauthenticated = useCallback(() => {
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        await authService.refresh();
        const currentUser = await authService.fetchCurrentUser();
        if (!cancelled) {
          setUser(currentUser);
          setStatus('authenticated');
        }
      } catch {
        if (!cancelled) {
          becomeUnauthenticated();
        }
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [becomeUnauthenticated]);

  useEffect(
    () =>
      onSessionExpired(() => {
        queryClient.clear();
        becomeUnauthenticated();
      }),
    [queryClient, becomeUnauthenticated],
  );

  const login = useCallback(async (credentials: LoginRequest) => {
    const currentUser = await authService.login(credentials);
    setUser(currentUser);
    setStatus('authenticated');
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      // Client state always clears, even if the network call failed - the
      // user asked to leave, and protected content must not remain reachable
      // through stale application state either way (Step 4 section 66).
      queryClient.clear();
      becomeUnauthenticated();
    }
  }, [queryClient, becomeUnauthenticated]);

  const can = useCallback(
    (permissionCode: string) => user?.permissions.includes(permissionCode) ?? false,
    [user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, login, logout, can }),
    [status, user, login, logout, can],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
