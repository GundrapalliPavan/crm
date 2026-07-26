import { AsyncLocalStorage } from 'node:async_hooks';
import { Injectable } from '@nestjs/common';

export interface RequestContext {
  requestId: string;
}

/**
 * Ambient per-request state.
 *
 * Uses `AsyncLocalStorage` so that services deep in the call stack can read the
 * correlation ID without threading it through every method signature
 * (Step 2 requirement: request ID available to middleware, handlers and
 * services, and present in logs and error responses).
 */
@Injectable()
export class RequestContextService {
  private readonly storage = new AsyncLocalStorage<RequestContext>();

  run<T>(context: RequestContext, callback: () => T): T {
    return this.storage.run(context, callback);
  }

  /**
   * Returns the current request's ID, or `undefined` outside a request
   * (background jobs, startup, tests calling services directly).
   */
  get requestId(): string | undefined {
    return this.storage.getStore()?.requestId;
  }
}
