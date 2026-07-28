import type { AppConfigService } from '../../../config/app-config.service';
import { TwilioSmsProvider } from './twilio-sms.provider';

jest.mock('twilio', () => {
  const mockMessagesCreate = jest.fn();
  return Object.assign(jest.fn(() => ({ messages: { create: mockMessagesCreate } })), { mockMessagesCreate });
});

import twilioFactory from 'twilio';

const mockMessagesCreate = (twilioFactory as unknown as { mockMessagesCreate: jest.Mock }).mockMessagesCreate;

function configWith(overrides: Partial<AppConfigService>): AppConfigService {
  return overrides as AppConfigService;
}

describe('TwilioSmsProvider', () => {
  afterEach(() => {
    mockMessagesCreate.mockReset();
  });

  it('reports not configured when any required variable is missing, without calling Twilio', async () => {
    const provider = new TwilioSmsProvider(configWith({ twilioAccountSid: 'AC_test', twilioAuthToken: 'token' }));

    const result = await provider.send({ channel: 'sms', recipient: '+919876543210', messageBody: 'Hi' });

    expect(result.status).toBe('failed');
    expect(result.failureReason).toContain('Twilio SMS is not configured');
    expect(mockMessagesCreate).not.toHaveBeenCalled();
  });

  it('sends via Twilio without a whatsapp: prefix on the recipient', async () => {
    mockMessagesCreate.mockResolvedValueOnce({ sid: 'SM456' });
    const provider = new TwilioSmsProvider(
      configWith({ twilioAccountSid: 'AC_test', twilioAuthToken: 'test_token', twilioSmsFrom: '+15005550006' }),
    );

    const result = await provider.send({ channel: 'sms', recipient: '+919876543210', messageBody: 'Hello' });

    expect(result).toEqual({ status: 'sent', providerMessageId: 'SM456' });
    expect(mockMessagesCreate).toHaveBeenCalledWith({
      from: '+15005550006',
      to: '+919876543210',
      body: 'Hello',
    });
  });

  it('honestly reports failure when Twilio rejects the send, rather than throwing', async () => {
    mockMessagesCreate.mockRejectedValueOnce(new Error('Message body is required'));
    const provider = new TwilioSmsProvider(
      configWith({ twilioAccountSid: 'AC_test', twilioAuthToken: 'test_token', twilioSmsFrom: '+15005550006' }),
    );

    const result = await provider.send({ channel: 'sms', recipient: '+919876543210', messageBody: '' });

    expect(result).toEqual({ status: 'failed', failureReason: 'Message body is required' });
  });
});
