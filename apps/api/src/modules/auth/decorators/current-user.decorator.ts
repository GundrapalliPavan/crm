import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { AuthenticatedUser } from '@crm/types';
import type { Request } from 'express';

/**
 * Injects the resolved current user into a controller method.
 *
 * Only valid on routes behind `JwtAuthGuard` (the default for every route
 * that is not `@Public()`) - `authenticatedUser` is guaranteed present there.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedUser => {
    const request = context.switchToHttp().getRequest<Request>();
    // Non-null: this decorator is only used on routes JwtAuthGuard already
    // protected, which sets this field or rejects the request first.
    return request.authenticatedUser!;
  },
);
