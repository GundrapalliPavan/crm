import type { CommunicationChannel } from '@crm/types';

export interface CommunicationSendParams {
  channel: CommunicationChannel;
  recipient: string;
  subject?: string;
  messageBody: string;
}

export interface CommunicationSendResult {
  status: 'sent' | 'failed';
  providerMessageId?: string;
  failureReason?: string;
}

/**
 * CLAUDE.md sections 25-27: business modules never talk to a specific
 * WhatsApp/Email/SMS vendor directly - they go through this abstraction, so
 * swapping or adding a provider later never touches CommunicationsService.
 * Injected as `COMMUNICATION_PROVIDER` (see communications.module.ts).
 */
export interface CommunicationProvider {
  send(params: CommunicationSendParams): Promise<CommunicationSendResult>;
}

export const COMMUNICATION_PROVIDER = Symbol('COMMUNICATION_PROVIDER');
