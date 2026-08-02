import type {
  AuthenticatedUser,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  RefreshResponse,
  RequestLoginOtpRequest,
  VerifyLoginOtpRequest,
} from '@crm/types';
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

  /** Same session-issuing shape as login() - a valid OTP is an alternative to a password, not a different kind of session. */
  async loginWithOtp(request: VerifyLoginOtpRequest): Promise<AuthenticatedUser> {
    const { data } = await apiClient.post<LoginResponse>('/auth/login-otp/verify', request);
    setAccessToken(data.accessToken);
    if (data.refreshToken) {
      await setStoredRefreshToken(data.refreshToken);
    }
    return data.user;
  },

  /** No auth-state change - unauthenticated request, same shape as phoneApi.requestOtp. */
  async requestLoginOtp(request: RequestLoginOtpRequest): Promise<void> {
    await apiClient.post('/auth/login-otp/request', request);
  },

  /** No auth-state change - the user completes the actual reset in a browser, then logs in again. */
  async forgotPassword(request: ForgotPasswordRequest): Promise<void> {
    await apiClient.post('/auth/forgot-password', request);
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

  /** Revokes every other session but keeps this one signed in - see auth.service.ts's changePassword. */
  async changePassword(request: ChangePasswordRequest): Promise<void> {
    await apiClient.post('/auth/change-password', request);
  },

  /** Revokes every session including this one, so this clears local tokens exactly like logout(). */
  async logoutAll(): Promise<void> {
    try {
      await apiClient.post('/auth/logout-all');
    } finally {
      setAccessToken(null);
      await clearStoredRefreshToken();
    }
  },
};
