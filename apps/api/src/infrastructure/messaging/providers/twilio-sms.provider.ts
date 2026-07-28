import { Injectable, Logger } from '@nestjs/common';
import twilio from 'twilio';
import { AppConfigService } from '../../../config/app-config.service';
import type {
  CommunicationProvider,
  CommunicationSendParams,
  CommunicationSendResult,
} from '../communication-provider.interface';

/** Twilio SMS - see TwilioWhatsAppProvider for why Twilio was chosen for both transactional channels. */
@Injectable()
export class TwilioSmsProvider implements CommunicationProvider {
  private readonly logger = new Logger(TwilioSmsProvider.name);

  constructor(private readonly config: AppConfigService) {}

  async send(params: CommunicationSendParams): Promise<CommunicationSendResult> {
    const accountSid = this.config.twilioAccountSid;
    const authToken = this.config.twilioAuthToken;
    const from = this.config.twilioSmsFrom;

    if (!accountSid || !authToken || !from) {
      return {
        status: 'failed',
        failureReason:
          'Twilio SMS is not configured for this environment (set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN and TWILIO_SMS_FROM).',
      };
    }

    try {
      const client = twilio(accountSid, authToken);
      const message = await client.messages.create({ from, to: params.recipient, body: params.messageBody });
      return { status: 'sent', providerMessageId: message.sid };
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Twilio SMS send failed.';
      this.logger.warn(`SMS send to ${params.recipient} failed: ${reason}`);
      return { status: 'failed', failureReason: reason };
    }
  }
}
