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
  email: string;
  phone?: string;
}

/**
 * Returned exactly once, only to the administrator who created the account
 * (Step 4 section 84: no hardcoded or predictable credentials). The plaintext
 * value is never stored and never retrievable again.
 */
export interface CreateUserResponse {
  user: AuthenticatedUser;
  temporaryPassword: string;
}

export interface UpdateUserStatusRequest {
  status: UserStatus;
}

export interface AssignUserRolesRequest {
  roleIds: string[];
}

export interface PermissionSummary {
  id: string;
  code: string;
  name: string;
  module: string;
}
