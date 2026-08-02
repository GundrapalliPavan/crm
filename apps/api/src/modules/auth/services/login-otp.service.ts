import { createHash, randomInt } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type { LoginOtpCode } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { LOGIN_OTP_LENGTH, LOGIN_OTP_TTL_MINUTES } from '../auth.constants';

export type LoginOtpValidation = { status: 'valid'; code: LoginOtpCode } | { status: 'invalid' };

function hashCode(rawCode: string): string {
  return createHash('sha256').update(rawCode).digest('hex');
}

/**
 * Code lifecycle for login-by-OTP, mirroring PhoneVerificationService's shape
 * exactly (generate -> validate -> consume). Deliberately a separate table/
 * service from PhoneVerificationService: that one proves ownership of a
 * *new* phone being saved to the profile; this one proves ownership of the
 * phone *already on file*, to start a session - a different
 * security-sensitive operation.
 */
@Injectable()
export class LoginOtpService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Invalidates any code already outstanding for this user before issuing a
   * new one, so at most one code is ever valid at a time (also how a
   * "Resend code" tap behaves - no separate logic needed).
   */
  async generateCode(userId: string): Promise<string> {
    const rawCode = randomInt(0, 10 ** LOGIN_OTP_LENGTH).toString().padStart(LOGIN_OTP_LENGTH, '0');

    await this.prisma.$transaction([
      this.prisma.loginOtpCode.updateMany({
        where: { userId, consumedAt: null },
        data: { consumedAt: new Date() },
      }),
      this.prisma.loginOtpCode.create({
        data: {
          userId,
          codeHash: hashCode(rawCode),
          expiresAt: new Date(Date.now() + LOGIN_OTP_TTL_MINUTES * 60 * 1000),
        },
      }),
    ]);

    return rawCode;
  }

  async validateCode(userId: string, rawCode: string): Promise<LoginOtpValidation> {
    const code = await this.prisma.loginOtpCode.findFirst({
      where: { userId, consumedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    if (!code || code.codeHash !== hashCode(rawCode) || code.expiresAt.getTime() <= Date.now()) {
      return { status: 'invalid' };
    }

    return { status: 'valid', code };
  }

  /** Single-use: marks the code consumed so it cannot be replayed. */
  async consumeCode(id: string): Promise<void> {
    await this.prisma.loginOtpCode.update({
      where: { id },
      data: { consumedAt: new Date() },
    });
  }
}
