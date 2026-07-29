import { randomUUID } from 'node:crypto';
import { REQUEST_ID_HEADER } from '@crm/types';
import type { NextFunction, Request, Response } from 'express';
import { RequestContextService } from './request-context.service';

/** Bounds an inbound header so a client cannot push unbounded data into logs. */
const MAX_INBOUND_REQUEST_ID_LENGTH = 128;
const SAFE_REQUEST_ID = /^[A-Za-z0-9._-]+$/;

/**
 * An inbound `X-Request-ID` is honoured so a trace can span clients and
 * services, but only after validation - the value reaches logs and error
 * responses, so it must not carry control characters or unbounded length.
 */
function resolveRequestId(inbound: string | undefined): string {
  if (inbound && inbound.length <= MAX_INBOUND_REQUEST_ID_LENGTH && SAFE_REQUEST_ID.test(inbound)) {
    return inbound;
  }

  return `req_${randomUUID()}`;
}

/**
 * Builds the correlation-ID middleware as a plain Express handler.
 *
 * Deliberately not a Nest `NestMiddleware`: module middleware is registered
 * after the body parsers, which would leave body-parser failures (oversized or
 * malformed payloads) without a request ID in their logs and error responses.
 * Registering this first in the Express stack covers those cases too.
 */
export function createRequestContextMiddleware(requestContext: RequestContextService) {
  return function requestContextMiddleware(req: Request, res: Response, next: NextFunction): void {
    const requestId = resolveRequestId(req.header(REQUEST_ID_HEADER));

    // Written back onto the request so downstream consumers that only see the
    // raw request - notably the HTTP logger - report the same canonical ID as
    // the response header and error payloads.
    req.headers[REQUEST_ID_HEADER] = requestId;
    res.setHeader(REQUEST_ID_HEADER, requestId);

    requestContext.run(
      { requestId, ipAddress: req.ip, userAgent: req.header('user-agent') },
      () => next(),
    );
  };
}
