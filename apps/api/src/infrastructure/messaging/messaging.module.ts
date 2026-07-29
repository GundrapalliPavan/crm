import { Module } from '@nestjs/common';
import { COMMUNICATION_PROVIDER } from './communication-provider.interface';
import { CompositeCommunicationProvider } from './providers/composite-communication.provider';
import { SendGridEmailProvider } from './providers/sendgrid-email.provider';
import { TwilioSmsProvider } from './providers/twilio-sms.provider';
import { TwilioWhatsAppProvider } from './providers/twilio-whatsapp.provider';

/**
 * Wires the real `CommunicationProvider` binding once, so every module that
 * needs to send a message - the Communications business module, but also
 * system/transactional senders like Auth's account-invite and password-reset
 * email, which are not a Lead/Company-facing "communication" worth logging
 * to the `communications` table - depends on the same interface without each
 * re-registering Twilio/SendGrid (CLAUDE.md sections 25-27).
 */
@Module({
  providers: [
    TwilioWhatsAppProvider,
    TwilioSmsProvider,
    SendGridEmailProvider,
    { provide: COMMUNICATION_PROVIDER, useClass: CompositeCommunicationProvider },
  ],
  exports: [COMMUNICATION_PROVIDER],
})
export class MessagingModule {}
