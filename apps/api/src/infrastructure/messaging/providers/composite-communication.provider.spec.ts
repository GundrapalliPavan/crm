import type { CommunicationSendResult } from '../communication-provider.interface';
import { CompositeCommunicationProvider } from './composite-communication.provider';
import type { SendGridEmailProvider } from './sendgrid-email.provider';
import type { TwilioSmsProvider } from './twilio-sms.provider';
import type { TwilioWhatsAppProvider } from './twilio-whatsapp.provider';

function fakeProvider(result: CommunicationSendResult) {
  return { send: jest.fn().mockResolvedValue(result) };
}

describe('CompositeCommunicationProvider', () => {
  it('routes a whatsapp send to the Twilio WhatsApp provider only', async () => {
    const whatsapp = fakeProvider({ status: 'sent', providerMessageId: 'wa-1' });
    const sms = fakeProvider({ status: 'sent' });
    const email = fakeProvider({ status: 'sent' });
    const composite = new CompositeCommunicationProvider(
      whatsapp as unknown as TwilioWhatsAppProvider,
      sms as unknown as TwilioSmsProvider,
      email as unknown as SendGridEmailProvider,
    );

    const params = { channel: 'whatsapp' as const, recipient: '+919876543210', messageBody: 'Hi' };
    const result = await composite.send(params);

    expect(result).toEqual({ status: 'sent', providerMessageId: 'wa-1' });
    expect(whatsapp.send).toHaveBeenCalledWith(params);
    expect(sms.send).not.toHaveBeenCalled();
    expect(email.send).not.toHaveBeenCalled();
  });

  it('routes an sms send to the Twilio SMS provider only', async () => {
    const whatsapp = fakeProvider({ status: 'sent' });
    const sms = fakeProvider({ status: 'sent', providerMessageId: 'sms-1' });
    const email = fakeProvider({ status: 'sent' });
    const composite = new CompositeCommunicationProvider(
      whatsapp as unknown as TwilioWhatsAppProvider,
      sms as unknown as TwilioSmsProvider,
      email as unknown as SendGridEmailProvider,
    );

    const params = { channel: 'sms' as const, recipient: '+919876543210', messageBody: 'Hi' };
    const result = await composite.send(params);

    expect(result).toEqual({ status: 'sent', providerMessageId: 'sms-1' });
    expect(sms.send).toHaveBeenCalledWith(params);
    expect(whatsapp.send).not.toHaveBeenCalled();
    expect(email.send).not.toHaveBeenCalled();
  });

  it('routes an email send to the SendGrid provider only', async () => {
    const whatsapp = fakeProvider({ status: 'sent' });
    const sms = fakeProvider({ status: 'sent' });
    const email = fakeProvider({ status: 'sent', providerMessageId: 'email-1' });
    const composite = new CompositeCommunicationProvider(
      whatsapp as unknown as TwilioWhatsAppProvider,
      sms as unknown as TwilioSmsProvider,
      email as unknown as SendGridEmailProvider,
    );

    const params = { channel: 'email' as const, recipient: 'customer@example.com', messageBody: 'Hi' };
    const result = await composite.send(params);

    expect(result).toEqual({ status: 'sent', providerMessageId: 'email-1' });
    expect(email.send).toHaveBeenCalledWith(params);
    expect(whatsapp.send).not.toHaveBeenCalled();
    expect(sms.send).not.toHaveBeenCalled();
  });
});
