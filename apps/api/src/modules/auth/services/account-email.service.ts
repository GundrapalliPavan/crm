import { Inject, Injectable, Logger } from '@nestjs/common';
import type { User } from '@prisma/client';
import { AppConfigService } from '../../../config/app-config.service';
import {
  COMMUNICATION_PROVIDER,
  type CommunicationProvider,
} from '../../../infrastructure/messaging/communication-provider.interface';

/**
 * System/transactional account email - invite-to-activate and forgot-
 * password links. Deliberately separate from the Communications business
 * module: these are not a Lead/Company-facing interaction worth logging to
 * the `communications` table, but they still go through the same
 * `CommunicationProvider` abstraction rather than a vendor SDK directly
 * (CLAUDE.md sections 25-27). A failed send is never surfaced as an error to
 * the caller (CLAUDE.md section 31) - `forgotPassword` must not leak whether
 * an account exists, and a failed invite email still leaves the account
 * created; both flows already log the raw link outside production so the
 * flow can be completed locally when no vendor is configured.
 */
@Injectable()
export class AccountEmailService {
  private readonly logger = new Logger(AccountEmailService.name);

  constructor(
    @Inject(COMMUNICATION_PROVIDER) private readonly provider: CommunicationProvider,
    private readonly config: AppConfigService,
  ) {}

  async sendInviteEmail(user: Pick<User, 'email' | 'firstName'>, rawToken: string): Promise<void> {
    const link = `${this.config.webOrigin}/accept-invite?token=${rawToken}`;
    const result = await this.provider.send({
      channel: 'email',
      recipient: user.email,
      subject: "You've been invited",
      messageBody:
        `Hi ${user.firstName},\n\n` +
        `An administrator created an account for you. Open the link below to verify your email and set your password:\n\n${link}\n\n` +
        `This link expires soon and can only be used once.`,
    });

    if (result.status === 'failed') {
      this.logger.warn(`Invite email to ${user.email} failed: ${result.failureReason}`);
    }
  }

  async sendPasswordResetEmail(user: Pick<User, 'email' | 'firstName'>, rawToken: string): Promise<void> {
    const link = `${this.config.webOrigin}/reset-password?token=${rawToken}`;
    const result = await this.provider.send({
      channel: 'email',
      recipient: user.email,
      subject: 'Reset your password',
      messageBody:
        `Hi ${user.firstName},\n\n` +
        `Use the link below to reset your password:\n\n${link}\n\n` +
        `If you did not request this, you can ignore this email - your password will not change.`,
    });

    if (result.status === 'failed') {
      this.logger.warn(`Password reset email to ${user.email} failed: ${result.failureReason}`);
    }
  }
}
