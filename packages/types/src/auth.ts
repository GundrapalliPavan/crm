/**
 * Shared authentication and authorization contracts.
 *
 * These describe the wire format between the API and any client (web today,
 * mobile later) - never the database model. `AuthenticatedUser` in particular
 * must stay exactly the safe subset of the `User` row: no password hash, no
 * session internals (BACKEND.md section 22, Step 4 section 22).
 */

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
  status: 'active' | 'inactive' | 'suspended';
  roles: RoleSummary[];
  permissions: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

/** `accessToken` is a JWT the client attaches as `Authorization: Bearer`. */
export interface LoginResponse {
  accessToken: string;
  accessTokenExpiresAt: string;
  user: AuthenticatedUser;
}

export interface RefreshResponse {
  accessToken: string;
  accessTokenExpiresAt: string;
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
