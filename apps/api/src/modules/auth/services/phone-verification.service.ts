import { createHash, randomInt } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type { PhoneVerificationCode } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { PHONE_OTP_LENGTH, PHONE_OTP_TTL_MINUTES } from '../auth.constants';

export type PhoneCodeValidation =
  | { status: 'valid'; code: PhoneVerificationCode }
  | { status: 'invalid' };

function hashCode(rawCode: string): string {
  return createHash('sha256').update(rawCode).digest('hex');
}

/**
 * Code lifecycle for self-service phone number changes, mirroring
 * PasswordResetService's shape exactly (generate -> validate -> consume),
 * but for a short numeric SMS code tied to a specific `newPhone` rather than
 * a long token emailed as a link.
 */
@Injectable()
export class PhoneVerificationService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Invalidates any code already outstanding for this user before issuing a
   * new one, so at most one code is ever valid at a time (also how a
   * "Resend code" tap behaves - no separate logic needed).
   */
  async generateCode(userId: string, newPhone: string): Promise<string> {
    const rawCode = randomInt(0, 10 ** PHONE_OTP_LENGTH).toString().padStart(PHONE_OTP_LENGTH, '0');

    await this.prisma.$transaction([
      this.prisma.phoneVerificationCode.updateMany({
        where: { userId, consumedAt: null },
        data: { consumedAt: new Date() },
      }),
      this.prisma.phoneVerificationCode.create({
        data: {
          userId,
          newPhone,
          codeHash: hashCode(rawCode),
          expiresAt: new Date(Date.now() + PHONE_OTP_TTL_MINUTES * 60 * 1000),
        },
      }),
    ]);

    return rawCode;
  }

  async validateCode(userId: string, rawCode: string): Promise<PhoneCodeValidation> {
    const code = await this.prisma.phoneVerificationCode.findFirst({
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
    await this.prisma.phoneVerificationCode.update({
      where: { id },
      data: { consumedAt: new Date() },
    });
  }
}
