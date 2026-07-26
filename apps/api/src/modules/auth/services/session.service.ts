import { createHash, randomBytes } from 'node:crypto';
import { Injectable, Logger } from '@nestjs/common';
import type { Session } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { AppConfigService } from '../../../config/app-config.service';

const REFRESH_TOKEN_BYTES = 32;

export interface DeviceContext {
  userAgent?: string;
  ipAddress?: string;
}

export interface IssuedSession {
  session: Session;
  /** Raw refresh token - returned to the client exactly once, never persisted. */
  rawToken: string;
}

export type RefreshValidation =
  | { status: 'valid'; session: Session }
  | { status: 'invalid' }
  | { status: 'expired' }
  /** The token was already rotated or revoked and is being presented again -
   *  a signal of token theft, not an ordinary expiry. */
  | { status: 'reused' };

function hashToken(rawToken: string): string {
  return createHash('sha256').update(rawToken).digest('hex');
}

/**
 * Owns the full lifecycle of refresh-token-backed sessions: issuance,
 * rotation, revocation and reuse detection (Step 4 sections 15, 19-21, 79-81).
 *
 * The access token (JWT) never appears here - it is stateless and handled by
 * `TokenService`. This service is the only thing that touches the `sessions`
 * table, so rotation and revocation logic exist in exactly one place.
 */
@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: AppConfigService,
  ) {}

  private refreshTokenExpiry(): Date {
    return new Date(Date.now() + this.config.authRefreshTokenTtlDays * 24 * 60 * 60 * 1000);
  }

  /** Issues a brand-new session at login. */
  async createSession(userId: string, device: DeviceContext): Promise<IssuedSession> {
    const rawToken = randomBytes(REFRESH_TOKEN_BYTES).toString('base64url');

    const session = await this.prisma.session.create({
      data: {
        userId,
        refreshTokenHash: hashToken(rawToken),
        userAgent: device.userAgent?.slice(0, 500),
        ipAddress: device.ipAddress,
        expiresAt: this.refreshTokenExpiry(),
      },
    });

    return { session, rawToken };
  }

  /**
   * Validates a presented refresh token and reports exactly one of four
   * outcomes. Reuse of a rotated/revoked token revokes every session for the
   * user as a side effect - the caller does not need to do this separately.
   */
  async validateRefreshToken(rawToken: string): Promise<RefreshValidation> {
    const session = await this.prisma.session.findUnique({
      where: { refreshTokenHash: hashToken(rawToken) },
    });

    if (!session) {
      return { status: 'invalid' };
    }

    if (session.revokedAt) {
      this.logger.warn(
        { userId: session.userId, sessionId: session.id },
        'Revoked or rotated refresh token presented again - revoking all sessions for user',
      );
      await this.revokeAllForUser(session.userId);
      return { status: 'reused' };
    }

    if (session.expiresAt.getTime() <= Date.now()) {
      return { status: 'expired' };
    }

    return { status: 'valid', session };
  }

  /**
   * Rotates a valid session forward: the presented token is revoked and
   * linked to a freshly issued replacement, atomically. A refresh token is
   * therefore single-use - presenting it again after this call is a reuse
   * (Step 4 section 20).
   */
  async rotateSession(current: Session, device: DeviceContext): Promise<IssuedSession> {
    const rawToken = randomBytes(REFRESH_TOKEN_BYTES).toString('base64url');

    // An interactive transaction, not the array form: linking the old session
    // to its replacement needs the new session's generated ID, which does not
    // exist until the create() below has run.
    const newSession = await this.prisma.$transaction(async (tx) => {
      const created = await tx.session.create({
        data: {
          userId: current.userId,
          refreshTokenHash: hashToken(rawToken),
          userAgent: device.userAgent?.slice(0, 500) ?? current.userAgent,
          ipAddress: device.ipAddress ?? current.ipAddress,
          expiresAt: this.refreshTokenExpiry(),
        },
      });

      await tx.session.update({
        where: { id: current.id },
        data: { revokedAt: new Date(), lastUsedAt: new Date(), replacedBySessionId: created.id },
      });

      return created;
    });

    return { session: newSession, rawToken };
  }

  /** Logout: revoke exactly the session presented. */
  async revokeSession(sessionId: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: { id: sessionId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  /** Logout-all, deactivation, password change, or reuse-detected theft response. */
  async revokeAllForUser(userId: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
