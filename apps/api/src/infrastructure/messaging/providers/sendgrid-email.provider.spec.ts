import type { AppConfigService } from '../../../config/app-config.service';
import { SendGridEmailProvider } from './sendgrid-email.provider';

jest.mock('@sendgrid/mail', () => ({
  setApiKey: jest.fn(),
  send: jest.fn(),
}));

import sgMail from '@sendgrid/mail';

const mockSetApiKey = sgMail.setApiKey as jest.Mock;
const mockSend = sgMail.send as jest.Mock;

function configWith(overrides: Partial<AppConfigService>): AppConfigService {
  return overrides as AppConfigService;
}

describe('SendGridEmailProvider', () => {
  afterEach(() => {
    mockSetApiKey.mockReset();
    mockSend.mockReset();
  });

  it('reports not configured when any required variable is missing, without calling SendGrid', async () => {
    const provider = new SendGridEmailProvider(configWith({ sendGridApiKey: 'SG.test' }));

    const result = await provider.send({ channel: 'email', recipient: 'customer@example.com', messageBody: 'Hi' });

    expect(result.status).toBe('failed');
    expect(result.failureReason).toContain('SendGrid is not configured');
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('sends via SendGrid and maps the provider message id from the response headers', async () => {
    mockSend.mockResolvedValueOnce([{ headers: { 'x-message-id': 'msg-123' } }]);
    const provider = new SendGridEmailProvider(
      configWith({ sendGridApiKey: 'SG.test', sendGridFromEmail: 'noreply@example.com' }),
    );

    const result = await provider.send({
      channel: 'email',
      recipient: 'customer@example.com',
      subject: 'Your invoice',
      messageBody: 'Please find your invoice attached.',
    });

    expect(result).toEqual({ status: 'sent', providerMessageId: 'msg-123' });
    expect(mockSetApiKey).toHaveBeenCalledWith('SG.test');
    expect(mockSend).toHaveBeenCalledWith({
      to: 'customer@example.com',
      from: 'noreply@example.com',
      subject: 'Your invoice',
      text: 'Please find your invoice attached.',
    });
  });

  it('defaults the subject when none is given', async () => {
    mockSend.mockResolvedValueOnce([{ headers: {} }]);
    const provider = new SendGridEmailProvider(
      configWith({ sendGridApiKey: 'SG.test', sendGridFromEmail: 'noreply@example.com' }),
    );

    await provider.send({ channel: 'email', recipient: 'customer@example.com', messageBody: 'Hi' });

    expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({ subject: '(No subject)' }));
  });

  it('extracts SendGrid\'s nested error message when the vendor rejects the send', async () => {
    mockSend.mockRejectedValueOnce({
      response: { body: { errors: [{ message: 'The from address does not match a verified sender' }] } },
    });
    const provider = new SendGridEmailProvider(
      configWith({ sendGridApiKey: 'SG.test', sendGridFromEmail: 'noreply@example.com' }),
    );

    const result = await provider.send({ channel: 'email', recipient: 'customer@example.com', messageBody: 'Hi' });

    expect(result).toEqual({
      status: 'failed',
      failureReason: 'The from address does not match a verified sender',
    });
  });

  it('falls back to a generic message when the rejected error has no recognizable shape', async () => {
    mockSend.mockRejectedValueOnce(new Error('Network timeout'));
    const provider = new SendGridEmailProvider(
      configWith({ sendGridApiKey: 'SG.test', sendGridFromEmail: 'noreply@example.com' }),
    );

    const result = await provider.send({ channel: 'email', recipient: 'customer@example.com', messageBody: 'Hi' });

    expect(result).toEqual({ status: 'failed', failureReason: 'Network timeout' });
  });
});
