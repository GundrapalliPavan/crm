export interface PushSendParams {
  expoPushToken: string;
  title: string;
  body?: string;
  data?: Record<string, unknown>;
}

export interface PushSendResult {
  status: 'sent' | 'failed';
  failureReason?: string;
}

/**
 * CLAUDE.md sections 25-27: business code never talks to a specific push
 * vendor directly - mirrors `CommunicationProvider`
 * (infrastructure/messaging/communication-provider.interface.ts) exactly.
 * Injected as `PUSH_PROVIDER` (see push.module.ts).
 */
export interface PushProvider {
  send(params: PushSendParams): Promise<PushSendResult>;
}

export const PUSH_PROVIDER = Symbol('PUSH_PROVIDER');
