import { createHash, randomBytes } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type { PasswordResetToken } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { PASSWORD_RESET_TOKEN_TTL_MINUTES } from '../auth.constants';

const RESET_TOKEN_BYTES = 32;

export type ResetTokenValidation =
  | { status: 'valid'; token: PasswordResetToken }
  | { status: 'invalid' };

function hashToken(rawToken: string): string {
  return createHash('sha256').update(rawToken).digest('hex');
}

/**
 * Secure token lifecycle for password resets (Step 4 sections 42-45).
 *
 * Delivery is out of scope here by design: no email/SMS provider is
 * configured yet (Phase 0), so this service only generates, stores and
 * consumes the token. See `AuthService.forgotPassword` for how the
 * not-yet-delivered token is surfaced in development.
 */
@Injectable()
export class PasswordResetService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Invalidates any tokens already outstanding for this user before issuing a
   * new one, so at most one reset link is ever valid at a time.
   */
  async createToken(userId: string): Promise<string> {
    const rawToken = randomBytes(RESET_TOKEN_BYTES).toString('base64url');

    await this.prisma.$transaction([
      this.prisma.passwordResetToken.updateMany({
        where: { userId, consumedAt: null },
        data: { consumedAt: new Date() },
      }),
      this.prisma.passwordResetToken.create({
        data: {
          userId,
          tokenHash: hashToken(rawToken),
          expiresAt: new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MINUTES * 60 * 1000),
        },
      }),
    ]);

    return rawToken;
  }

  async validateToken(rawToken: string): Promise<ResetTokenValidation> {
    const token = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash: hashToken(rawToken) },
    });

    if (!token || token.consumedAt || token.expiresAt.getTime() <= Date.now()) {
      return { status: 'invalid' };
    }

    return { status: 'valid', token };
  }

  /** Single-use: marks the token consumed so it cannot be replayed (section 44). */
  async consumeToken(tokenId: string): Promise<void> {
    await this.prisma.passwordResetToken.update({
      where: { id: tokenId },
      data: { consumedAt: new Date() },
    });
  }
}
