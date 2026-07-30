import type { AuthenticatedUser, LoginRequest, LoginResponse, RefreshResponse } from '@crm/types';
import { apiClient } from '@/lib/api/client';
import { clearStoredRefreshToken, getStoredRefreshToken, setStoredRefreshToken } from './refresh-token-store';
import { setAccessToken } from './token-store';

/**
 * The only module that calls `/auth/*` directly - mirrors
 * apps/web/src/lib/auth/auth-service.ts, adapted for a client with no cookie
 * jar: the refresh token this API returns in the body (because the request
 * carried `X-Client-Type: mobile`, see lib/api/client.ts) is persisted to
 * SecureStore here instead of arriving as a Set-Cookie header.
 */
export const authService = {
  async login(credentials: LoginRequest): Promise<AuthenticatedUser> {
    const { data } = await apiClient.post<LoginResponse>('/auth/login', credentials);
    setAccessToken(data.accessToken);
    if (data.refreshToken) {
      await setStoredRefreshToken(data.refreshToken);
    }
    return data.user;
  },

  /**
   * Silent refresh on app start, using whatever refresh token SecureStore
   * still has from a previous session. Resolves to `false` (not an error)
   * when there is nothing stored - that's an ordinary "not logged in yet",
   * not a failure.
   */
  async refresh(): Promise<boolean> {
    const storedRefreshToken = await getStoredRefreshToken();
    if (!storedRefreshToken) {
      return false;
    }

    const { data } = await apiClient.post<RefreshResponse>('/auth/refresh', {
      refreshToken: storedRefreshToken,
    });
    setAccessToken(data.accessToken);
    if (data.refreshToken) {
      await setStoredRefreshToken(data.refreshToken);
    }
    return true;
  },

  async fetchCurrentUser(): Promise<AuthenticatedUser> {
    const { data } = await apiClient.get<AuthenticatedUser>('/auth/me');
    return data;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      setAccessToken(null);
      await clearStoredRefreshToken();
    }
  },
};
