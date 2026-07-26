import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { AccountInactiveError, AuthenticationError } from '../../../common/errors/app-error';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { PermissionsService } from '../services/permissions.service';
import { TokenService } from '../services/token.service';
import { PrismaService } from '../../../database/prisma.service';

const BEARER_PREFIX = 'Bearer ';

/**
 * Global authentication guard (Step 4 section 23).
 *
 * Deny-by-default: every route requires a valid access token unless marked
 * `@Public()`. Two deliberate DB round trips per authenticated request - not
 * one, not N+1:
 *   1. the session the token was minted from, so a *revoked* session rejects
 *      the request even while its access token remains cryptographically
 *      valid (Step 4 section 80 - logout and deactivation take effect
 *      immediately, not only after the token's own expiry);
 *   2. the caller's current roles and permissions, so authorization never
 *      reads a stale set embedded in the token (section 34).
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokenService: TokenService,
    private readonly permissionsService: PermissionsService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const claims = this.tokenService.verifyAccessToken(this.extractBearerToken(request));

    if (!claims) {
      throw new AuthenticationError();
    }

    const session = await this.prisma.session.findUnique({
      where: { id: claims.sid },
      include: { user: true },
    });

    if (
      !session ||
      session.revokedAt !== null ||
      session.expiresAt.getTime() <= Date.now() ||
      session.userId !== claims.sub
    ) {
      throw new AuthenticationError();
    }

    if (session.user.status !== 'active') {
      throw new AccountInactiveError();
    }

    const { roles, permissions } = await this.permissionsService.loadRolesAndPermissions(
      session.user.id,
    );

    request.identity = { userId: session.user.id, sessionId: session.id };
    request.authenticatedUser = {
      id: session.user.id,
      firstName: session.user.firstName,
      lastName: session.user.lastName,
      email: session.user.email,
      status: session.user.status,
      roles,
      permissions,
    };

    return true;
  }

  private extractBearerToken(request: Request): string {
    const header = request.headers.authorization;

    if (!header?.startsWith(BEARER_PREFIX)) {
      throw new AuthenticationError();
    }

    return header.slice(BEARER_PREFIX.length);
  }
}
