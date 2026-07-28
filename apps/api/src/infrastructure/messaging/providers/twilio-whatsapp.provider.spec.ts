import type { AppConfigService } from '../../../config/app-config.service';
import { TwilioWhatsAppProvider } from './twilio-whatsapp.provider';

jest.mock('twilio', () => {
  const mockMessagesCreate = jest.fn();
  return Object.assign(jest.fn(() => ({ messages: { create: mockMessagesCreate } })), { mockMessagesCreate });
});

import twilioFactory from 'twilio';

const mockMessagesCreate = (twilioFactory as unknown as { mockMessagesCreate: jest.Mock }).mockMessagesCreate;

function configWith(overrides: Partial<AppConfigService>): AppConfigService {
  return overrides as AppConfigService;
}

describe('TwilioWhatsAppProvider', () => {
  afterEach(() => {
    mockMessagesCreate.mockReset();
  });

  it('reports not configured when any required variable is missing, without calling Twilio', async () => {
    const provider = new TwilioWhatsAppProvider(configWith({}));

    const result = await provider.send({ channel: 'whatsapp', recipient: '+919876543210', messageBody: 'Hi' });

    expect(result.status).toBe('failed');
    expect(result.failureReason).toContain('Twilio WhatsApp is not configured');
    expect(mockMessagesCreate).not.toHaveBeenCalled();
  });

  it('sends via Twilio, prefixing the recipient with the whatsapp: scheme', async () => {
    mockMessagesCreate.mockResolvedValueOnce({ sid: 'SM123' });
    const provider = new TwilioWhatsAppProvider(
      configWith({
        twilioAccountSid: 'AC_test',
        twilioAuthToken: 'test_token',
        twilioWhatsAppFrom: 'whatsapp:+15005550006',
      }),
    );

    const result = await provider.send({ channel: 'whatsapp', recipient: '+919876543210', messageBody: 'Hello' });

    expect(result).toEqual({ status: 'sent', providerMessageId: 'SM123' });
    expect(mockMessagesCreate).toHaveBeenCalledWith({
      from: 'whatsapp:+15005550006',
      to: 'whatsapp:+919876543210',
      body: 'Hello',
    });
  });

  it('honestly reports failure when Twilio rejects the send, rather than throwing', async () => {
    mockMessagesCreate.mockRejectedValueOnce(new Error('Invalid phone number'));
    const provider = new TwilioWhatsAppProvider(
      configWith({
        twilioAccountSid: 'AC_test',
        twilioAuthToken: 'test_token',
        twilioWhatsAppFrom: 'whatsapp:+15005550006',
      }),
    );

    const result = await provider.send({ channel: 'whatsapp', recipient: 'not-a-number', messageBody: 'Hi' });

    expect(result).toEqual({ status: 'failed', failureReason: 'Invalid phone number' });
  });
});
