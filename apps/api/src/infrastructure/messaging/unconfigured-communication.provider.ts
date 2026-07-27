import { Injectable, Logger } from '@nestjs/common';
import type {
  CommunicationProvider,
  CommunicationSendParams,
  CommunicationSendResult,
} from './communication-provider.interface';

/**
 * The only provider wired up today. No real WhatsApp/Email/SMS integration
 * exists yet (no chosen vendor, no credentials) - CLAUDE.md section 31
 * ("never treat a successful request as proof delivery succeeded") means the
 * honest behavior is to record the attempt and mark it `failed` with a clear
 * reason, not to fake `sent`/`delivered`, and not to leave it `queued`
 * forever with nothing that will ever progress it. Swap this binding for a
 * real provider in communications.module.ts once one is chosen.
 */
@Injectable()
export class UnconfiguredCommunicationProvider implements CommunicationProvider {
  private readonly logger = new Logger(UnconfiguredCommunicationProvider.name);

  async send(params: CommunicationSendParams): Promise<CommunicationSendResult> {
    this.logger.warn(
      `No ${params.channel} provider is configured - recording as failed instead of sending to ${params.recipient}.`,
    );
    return {
      status: 'failed',
      failureReason: `No ${params.channel} provider is configured for this environment.`,
    };
  }
}
