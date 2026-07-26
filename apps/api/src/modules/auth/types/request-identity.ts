import type { AuthenticatedUser } from '@crm/types';

/**
 * Minimal identity carried by every authenticated request, decoded once by
 * `JwtAuthGuard` (Step 4 section 24: route handlers must not re-decode
 * identity independently).
 *
 * No `organizationId` or `branchId` field exists here by design: Step 3
 * deliberately built a single-organization schema (DATABASE.md sections
 * 157-158) with no `organizations` or `branches` table, so there is no
 * tenant/branch context to carry. If multi-organization support is ever
 * added, it is created here first - every authorization decision in this
 * codebase already reads identity through this one type.
 */
export interface RequestIdentity {
  userId: string;
  sessionId: string;
}

/**
 * Express request augmentation.
 *
 * `identity` is the token-derived claims; `authenticatedUser` is the fully
 * resolved, API-safe user (status, roles, permissions) that `JwtAuthGuard`
 * loads from the database on every request so authorization decisions never
 * use stale data (Step 4 section 34). Both are set together - if one is
 * present, so is the other.
 */
declare module 'express' {
  interface Request {
    identity?: RequestIdentity;
    authenticatedUser?: AuthenticatedUser;
  }
}
