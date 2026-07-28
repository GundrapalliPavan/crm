import { Logger } from '@nestjs/common';
import type { EventEmitter2 } from '@nestjs/event-emitter';

const logger = new Logger('DomainEvents');

/**
 * Awaits every listener so no async work outlives the request (a listener
 * still running after the request/test lifecycle ends is how a notification
 * write ends up racing against a torn-down database connection), but a
 * listener failure - e.g. a notification write - never fails the business
 * action that triggered it (CLAUDE.md section 31's spirit applied to
 * internal events, not just external providers).
 */
export async function emitDomainEvent(events: EventEmitter2, eventName: string, payload: unknown): Promise<void> {
  try {
    await events.emitAsync(eventName, payload);
  } catch (error) {
    logger.error(`Listener for "${eventName}" failed`, error instanceof Error ? error.stack : String(error));
  }
}
