import { Module } from '@nestjs/common';
import { COMMUNICATION_PROVIDER } from '../../infrastructure/messaging/communication-provider.interface';
import { CompositeCommunicationProvider } from '../../infrastructure/messaging/providers/composite-communication.provider';
import { SendGridEmailProvider } from '../../infrastructure/messaging/providers/sendgrid-email.provider';
import { TwilioSmsProvider } from '../../infrastructure/messaging/providers/twilio-sms.provider';
import { TwilioWhatsAppProvider } from '../../infrastructure/messaging/providers/twilio-whatsapp.provider';
import { CommunicationsController } from './communications.controller';
import { CommunicationsService } from './communications.service';

@Module({
  controllers: [CommunicationsController],
  providers: [
    CommunicationsService,
    TwilioWhatsAppProvider,
    TwilioSmsProvider,
    SendGridEmailProvider,
    // Twilio (WhatsApp + SMS) and SendGrid (Email) - swap any single
    // channel's vendor by changing only that provider class, or the whole
    // binding for a different composition; nothing else in this module
    // changes (CLAUDE.md sections 25-27).
    { provide: COMMUNICATION_PROVIDER, useClass: CompositeCommunicationProvider },
  ],
})
export class CommunicationsModule {}
