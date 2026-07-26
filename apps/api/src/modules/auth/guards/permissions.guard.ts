import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { AuthorizationError } from '../../../common/errors/app-error';
import { REQUIRED_PERMISSION_KEY } from '../decorators/require-permission.decorator';

/**
 * Enforces `@RequirePermission(...)` against the caller's resolved permission
 * set (Step 4 sections 31-32).
 *
 * Runs after `JwtAuthGuard` in the guard chain, so `request.authenticatedUser`
 * is always present here - there is no super-admin bypass; the seeded
 * Administrator role is granted every permission explicitly in the database
 * (see apps/api/prisma/seed.ts), not through a role-name special case
 * (Step 4 section 35).
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermission = this.reflector.getAllAndOverride<string | undefined>(
      REQUIRED_PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermission) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const permissions = request.authenticatedUser?.permissions ?? [];

    if (!permissions.includes(requiredPermission)) {
      throw new AuthorizationError();
    }

    return true;
  }
}
