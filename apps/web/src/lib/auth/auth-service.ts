import type {
  AcceptInviteRequest,
  AuthenticatedUser,
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  RefreshResponse,
  ResetPasswordRequest,
} from '@crm/types';
import { apiClient } from '@/lib/api/client';
import { setAccessToken } from './token-store';

/**
 * The only module that calls `/auth/*` directly (FRONTEND.md section 33 -
 * API calls are organised by domain, not scattered through components).
 * `AuthProvider` is the only caller; feature code reads auth state through
 * `useAuth()` instead.
 */
export const authService = {
  async login(credentials: LoginRequest): Promise<AuthenticatedUser> {
    const { data } = await apiClient.post<LoginResponse>('/auth/login', credentials);
    setAccessToken(data.accessToken);
    return data.user;
  },

  /** Silent refresh using the httpOnly cookie - no credentials to pass. */
  async refresh(): Promise<void> {
    const { data } = await apiClient.post<RefreshResponse>('/auth/refresh');
    setAccessToken(data.accessToken);
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
    }
  },

  async forgotPassword(request: ForgotPasswordRequest): Promise<void> {
    await apiClient.post('/auth/forgot-password', request);
  },

  async resetPassword(request: ResetPasswordRequest): Promise<void> {
    await apiClient.post('/auth/reset-password', request);
  },

  async acceptInvite(request: AcceptInviteRequest): Promise<void> {
    await apiClient.post('/auth/accept-invite', request);
  },
};
