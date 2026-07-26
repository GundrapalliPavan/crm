import { SetMetadata } from '@nestjs/common';

export const REQUIRED_PERMISSION_KEY = 'requiredPermission';

/**
 * Declares the permission code a route requires (Step 4 sections 29-31).
 *
 * Enforced by `PermissionsGuard` against the caller's freshly resolved
 * permission set - never against anything embedded in the access token.
 * Authorization here is the backend's alone; any frontend `can()` check using
 * the same code is UX only (ARCHITECTURE.md section 58).
 *
 * Usage: `@RequirePermission('user.create')`
 */
export const RequirePermission = (permissionCode: string) =>
  SetMetadata(REQUIRED_PERMISSION_KEY, permissionCode);
