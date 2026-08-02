import type { AuthenticatedUser, ChangePasswordRequest, LoginRequest, VerifyLoginOtpRequest } from '@crm/types';
import { createContext } from 'react';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthContextValue {
  status: AuthStatus;
  user: AuthenticatedUser | null;
  login: (credentials: LoginRequest) => Promise<void>;
  /** A valid OTP is an alternative to a password - same resulting session as login(). */
  loginWithOtp: (request: VerifyLoginOtpRequest) => Promise<void>;
  logout: () => Promise<void>;
  /** Revokes every other session but keeps the caller signed in on this one. */
  changePassword: (request: ChangePasswordRequest) => Promise<void>;
  /** Revokes every session including this one - resolves to the same signed-out state as logout(). */
  logoutAll: () => Promise<void>;
  /** Re-fetches /auth/me and updates `user` in place, e.g. after a phone number change - no session impact. */
  refreshUser: () => Promise<void>;
  /** UX only - the backend is authoritative for every permission check. */
  can: (permissionCode: string) => boolean;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
