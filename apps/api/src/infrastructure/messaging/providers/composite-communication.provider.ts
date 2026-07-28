import { Injectable } from '@nestjs/common';
import type {
  CommunicationProvider,
  CommunicationSendParams,
  CommunicationSendResult,
} from '../communication-provider.interface';
import { SendGridEmailProvider } from './sendgrid-email.provider';
import { TwilioSmsProvider } from './twilio-sms.provider';
import { TwilioWhatsAppProvider } from './twilio-whatsapp.provider';

/**
 * The single `COMMUNICATION_PROVIDER` binding (communications.module.ts)
 * routes to one real vendor per channel - `CommunicationsService` still only
 * ever talks to `CommunicationProvider`, never a specific vendor
 * (CLAUDE.md sections 25-27). Adding, removing or swapping a channel's
 * vendor later only touches this file and the one it delegates to.
 */
@Injectable()
export class CompositeCommunicationProvider implements CommunicationProvider {
  constructor(
    private readonly whatsapp: TwilioWhatsAppProvider,
    private readonly sms: TwilioSmsProvider,
    private readonly email: SendGridEmailProvider,
  ) {}

  send(params: CommunicationSendParams): Promise<CommunicationSendResult> {
    switch (params.channel) {
      case 'whatsapp':
        return this.whatsapp.send(params);
      case 'sms':
        return this.sms.send(params);
      case 'email':
        return this.email.send(params);
    }
  }
}
