import type { AuthenticatedUser, ChangePasswordRequest, LoginRequest, VerifyLoginOtpRequest } from '@crm/types';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { AuthContext, type AuthContextValue, type AuthStatus } from './auth-context';
import { authService } from './auth-service';
import { onSessionExpired } from './auth-events';

/**
 * The single source of mobile authentication state - mirrors
 * apps/web/src/lib/auth/AuthContext.tsx's bootstrap/login/logout shape
 * exactly; the only difference is *where* the refresh credential survives a
 * restart (SecureStore here vs. an httpOnly cookie for web), which is
 * already abstracted behind `authService`.
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
        const hasSession = await authService.refresh();
        if (!hasSession) {
          if (!cancelled) becomeUnauthenticated();
          return;
        }

        const currentUser = await authService.fetchCurrentUser();
        if (!cancelled) {
          setUser(currentUser);
          setStatus('authenticated');
        }
      } catch {
        if (!cancelled) becomeUnauthenticated();
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

  const loginWithOtp = useCallback(async (request: VerifyLoginOtpRequest) => {
    const currentUser = await authService.loginWithOtp(request);
    setUser(currentUser);
    setStatus('authenticated');
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      queryClient.clear();
      becomeUnauthenticated();
    }
  }, [queryClient, becomeUnauthenticated]);

  const changePassword = useCallback(async (request: ChangePasswordRequest) => {
    await authService.changePassword(request);
  }, []);

  const logoutAll = useCallback(async () => {
    try {
      await authService.logoutAll();
    } finally {
      queryClient.clear();
      becomeUnauthenticated();
    }
  }, [queryClient, becomeUnauthenticated]);

  const refreshUser = useCallback(async () => {
    const currentUser = await authService.fetchCurrentUser();
    setUser(currentUser);
  }, []);

  const can = useCallback(
    (permissionCode: string) => user?.permissions.includes(permissionCode) ?? false,
    [user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, login, loginWithOtp, logout, changePassword, logoutAll, refreshUser, can }),
    [status, user, login, loginWithOtp, logout, changePassword, logoutAll, refreshUser, can],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
