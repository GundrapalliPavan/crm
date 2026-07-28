import { Injectable, Logger } from '@nestjs/common';
import sgMail from '@sendgrid/mail';
import { AppConfigService } from '../../../config/app-config.service';
import type {
  CommunicationProvider,
  CommunicationSendParams,
  CommunicationSendResult,
} from '../communication-provider.interface';

/** SendGrid - a mature, well-documented transactional email API with a simple API-key auth model. */
@Injectable()
export class SendGridEmailProvider implements CommunicationProvider {
  private readonly logger = new Logger(SendGridEmailProvider.name);

  constructor(private readonly config: AppConfigService) {}

  async send(params: CommunicationSendParams): Promise<CommunicationSendResult> {
    const apiKey = this.config.sendGridApiKey;
    const from = this.config.sendGridFromEmail;

    if (!apiKey || !from) {
      return {
        status: 'failed',
        failureReason: 'SendGrid is not configured for this environment (set SENDGRID_API_KEY and SENDGRID_FROM_EMAIL).',
      };
    }

    try {
      sgMail.setApiKey(apiKey);
      const [response] = await sgMail.send({
        to: params.recipient,
        from,
        subject: params.subject ?? '(No subject)',
        text: params.messageBody,
      });
      const providerMessageId = response.headers['x-message-id'] as string | undefined;
      return { status: 'sent', providerMessageId };
    } catch (error) {
      const reason = this.extractFailureReason(error);
      this.logger.warn(`Email send to ${params.recipient} failed: ${reason}`);
      return { status: 'failed', failureReason: reason };
    }
  }

  private extractFailureReason(error: unknown): string {
    if (error && typeof error === 'object' && 'response' in error) {
      const response = (error as { response?: { body?: { errors?: { message: string }[] } } }).response;
      const firstError = response?.body?.errors?.[0]?.message;
      if (firstError) return firstError;
    }
    return error instanceof Error ? error.message : 'SendGrid send failed.';
  }
}
