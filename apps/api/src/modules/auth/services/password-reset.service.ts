import { createHash, randomBytes } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type { PasswordResetToken, TokenPurpose } from '@prisma/client';
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
 * Secure token lifecycle shared by two flows that must never be
 * interchangeable (Step 4 sections 42-45): resetting a forgotten password on
 * an already-active account, and activating an invited one for the first
 * time. `purpose` keeps a token from one flow from being replayable against
 * the other - `validateToken` checks it alongside expiry and single use.
 *
 * Delivery goes through `AccountEmailService`; if no provider is configured,
 * the caller (`AuthService`) still logs the raw link outside production so
 * the flow can be completed locally.
 */
@Injectable()
export class PasswordResetService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Invalidates any tokens of the same purpose already outstanding for this
   * user before issuing a new one, so at most one link per purpose is ever
   * valid at a time.
   */
  async createToken(userId: string, purpose: TokenPurpose = 'password_reset'): Promise<string> {
    const rawToken = randomBytes(RESET_TOKEN_BYTES).toString('base64url');

    await this.prisma.$transaction([
      this.prisma.passwordResetToken.updateMany({
        where: { userId, purpose, consumedAt: null },
        data: { consumedAt: new Date() },
      }),
      this.prisma.passwordResetToken.create({
        data: {
          userId,
          purpose,
          tokenHash: hashToken(rawToken),
          expiresAt: new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MINUTES * 60 * 1000),
        },
      }),
    ]);

    return rawToken;
  }

  async validateToken(rawToken: string, purpose: TokenPurpose = 'password_reset'): Promise<ResetTokenValidation> {
    const token = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash: hashToken(rawToken) },
    });

    if (!token || token.purpose !== purpose || token.consumedAt || token.expiresAt.getTime() <= Date.now()) {
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
