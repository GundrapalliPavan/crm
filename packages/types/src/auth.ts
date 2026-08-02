/**
 * Shared authentication and authorization contracts.
 *
 * These describe the wire format between the API and any client (web today,
 * mobile later) - never the database model. `AuthenticatedUser` in particular
 * must stay exactly the safe subset of the `User` row: no password hash, no
 * session internals (BACKEND.md section 22, Step 4 section 22).
 */

import type { TeamSummary } from './crm';

export interface RoleSummary {
  id: string;
  name: string;
}

/**
 * The user shape returned by `/auth/login` and `/auth/me`.
 *
 * `permissions` is the resolved, current set of permission codes - not a
 * cached or embedded claim - so a role change takes effect on the next
 * request rather than staying stale until a token expires (Step 4 section 34).
 */
export interface AuthenticatedUser {
  id: string;
  firstName: string;
  lastName: string;
  /** Display handle only - login is always by email. Null for accounts created before this field existed. */
  username: string | null;
  email: string;
  phone: string | null;
  status: 'active' | 'inactive' | 'suspended';
  roles: RoleSummary[];
  permissions: string[];
  /** First active team membership, if any - a user may belong to several; this is display-only (e.g. mobile's "Region"). */
  team: TeamSummary | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * `accessToken` is a JWT the client attaches as `Authorization: Bearer`.
 *
 * `refreshToken` is present only for a client that sent `X-Client-Type:
 * mobile` on the request - the web app never receives it in the body, since
 * its refresh token stays exclusively in the httpOnly cookie a mobile app
 * cannot use (MOBILE_ARCHITECTURE.md section 3.2/5).
 */
export interface LoginResponse {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken?: string;
  user: AuthenticatedUser;
}

export interface RefreshResponse {
  accessToken: string;
  accessTokenExpiresAt: string;
  /** Present only when the request supplied its refresh token in the body rather than a cookie - see `LoginResponse.refreshToken`. */
  refreshToken?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/** Sends a 6-digit code by SMS to `newPhone`, proving the caller controls it before it replaces `user.phone`. */
export interface RequestPhoneChangeRequest {
  newPhone: string;
}

export interface VerifyPhoneChangeRequest {
  code: string;
}

export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone?: string;
}

/**
 * The new account starts `inactive` with no password - an invite email (with
 * a verification link, not a temporary password) is sent to `user.email`,
 * and the account activates itself when the recipient completes
 * `POST /auth/accept-invite`. Nothing secret is ever returned here.
 */
export interface CreateUserResponse {
  user: AuthenticatedUser;
}

export interface UpdateUserStatusRequest {
  status: UserStatus;
}

export interface AssignUserRolesRequest {
  roleIds: string[];
}

/** The token from the invite email's link, plus the password the invited user is choosing for themselves. */
export interface AcceptInviteRequest {
  token: string;
  password: string;
}

export interface PermissionSummary {
  id: string;
  code: string;
  name: string;
  module: string;
}
