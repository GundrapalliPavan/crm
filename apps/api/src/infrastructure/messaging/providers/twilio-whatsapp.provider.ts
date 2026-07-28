import { Injectable, Logger } from '@nestjs/common';
import twilio from 'twilio';
import { AppConfigService } from '../../../config/app-config.service';
import type {
  CommunicationProvider,
  CommunicationSendParams,
  CommunicationSendResult,
} from '../communication-provider.interface';

/**
 * Twilio's WhatsApp Business API - chosen because it shares one account and
 * SDK with `TwilioSmsProvider`, keeping the two transactional/rich channels
 * from this pass down to two vendor integrations instead of three. Degrades
 * to an honest "not configured" failure (CLAUDE.md section 31) when its own
 * variables are absent - no real Twilio account exists in this environment
 * yet, so nothing here can actually send until an operator supplies one.
 */
@Injectable()
export class TwilioWhatsAppProvider implements CommunicationProvider {
  private readonly logger = new Logger(TwilioWhatsAppProvider.name);

  constructor(private readonly config: AppConfigService) {}

  async send(params: CommunicationSendParams): Promise<CommunicationSendResult> {
    const accountSid = this.config.twilioAccountSid;
    const authToken = this.config.twilioAuthToken;
    const from = this.config.twilioWhatsAppFrom;

    if (!accountSid || !authToken || !from) {
      return {
        status: 'failed',
        failureReason:
          'Twilio WhatsApp is not configured for this environment (set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN and TWILIO_WHATSAPP_FROM).',
      };
    }

    try {
      const client = twilio(accountSid, authToken);
      const message = await client.messages.create({
        from,
        to: `whatsapp:${params.recipient}`,
        body: params.messageBody,
      });
      return { status: 'sent', providerMessageId: message.sid };
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Twilio WhatsApp send failed.';
      this.logger.warn(`WhatsApp send to ${params.recipient} failed: ${reason}`);
      return { status: 'failed', failureReason: reason };
    }
  }
}
