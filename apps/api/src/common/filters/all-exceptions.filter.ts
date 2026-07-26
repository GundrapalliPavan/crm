import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { ApiErrorBody, ApiErrorCode, ApiErrorResponse } from '@crm/types';
import type { Response } from 'express';
import { AppError } from '../errors/app-error';
import { RequestContextService } from '../request-context/request-context.service';

/**
 * Maps framework HTTP status codes onto the project's stable error codes so
 * that exceptions Nest raises itself (unmatched routes, malformed JSON) still
 * satisfy the API.md error contract.
 */
const STATUS_TO_ERROR_CODE: Partial<Record<HttpStatus, ApiErrorCode>> = {
  [HttpStatus.BAD_REQUEST]: 'VALIDATION_ERROR',
  [HttpStatus.UNAUTHORIZED]: 'AUTHENTICATION_REQUIRED',
  [HttpStatus.FORBIDDEN]: 'PERMISSION_DENIED',
  [HttpStatus.NOT_FOUND]: 'RESOURCE_NOT_FOUND',
  [HttpStatus.CONFLICT]: 'DUPLICATE_RESOURCE',
  [HttpStatus.PAYLOAD_TOO_LARGE]: 'PAYLOAD_TOO_LARGE',
  [HttpStatus.UNPROCESSABLE_ENTITY]: 'VALIDATION_ERROR',
  [HttpStatus.TOO_MANY_REQUESTS]: 'RATE_LIMITED',
};

/** Replaces raw middleware wording with messages fit to show a user. */
const STATUS_MESSAGE_OVERRIDES: Partial<Record<HttpStatus, string>> = {
  [HttpStatus.PAYLOAD_TOO_LARGE]: 'The request is too large.',
};

const GENERIC_INTERNAL_MESSAGE = 'An unexpected error occurred. Please try again.';

/**
 * Errors raised by Express middleware (body-parser and anything else built on
 * `http-errors`) carry a status and an `expose` flag but are not
 * `HttpException`s, so Nest does not translate them. Without this they would be
 * reported as 500s - a request body over the size limit would look like a
 * server fault rather than a client one.
 */
interface HttpErrorLike {
  status: number;
  expose: boolean;
  message: string;
}

function isHttpErrorLike(error: unknown): error is HttpErrorLike {
  return (
    error instanceof Error &&
    'status' in error &&
    typeof (error as { status: unknown }).status === 'number' &&
    'expose' in error &&
    typeof (error as { expose: unknown }).expose === 'boolean'
  );
}

/**
 * Single exit point for every error leaving the API.
 *
 * Guarantees that clients only ever see the `{ error: { code, message,
 * fields?, requestId } }` envelope, and that unexpected failures are logged
 * server-side but never described to the caller (API.md sections 22-24).
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly requestContext: RequestContextService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const requestId = this.requestContext.requestId ?? 'unknown';

    const { status, body } = this.toErrorResponse(exception, requestId);

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      // Full detail stays server-side, correlated by request ID.
      this.logger.error(
        { requestId, err: exception },
        'Unhandled exception while processing request',
      );
    }

    response.status(status).json({ error: body } satisfies ApiErrorResponse);
  }

  private toErrorResponse(
    exception: unknown,
    requestId: string,
  ): { status: number; body: ApiErrorBody } {
    if (exception instanceof AppError) {
      return {
        status: exception.status,
        body: {
          code: exception.code,
          message: exception.message,
          ...(exception.fields ? { fields: exception.fields } : {}),
          requestId,
        },
      };
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      return {
        status,
        body: {
          code: STATUS_TO_ERROR_CODE[status as HttpStatus] ?? 'INTERNAL_ERROR',
          message: this.extractHttpExceptionMessage(exception),
          requestId,
        },
      };
    }

    if (isHttpErrorLike(exception) && exception.expose) {
      const status = exception.status as HttpStatus;
      return {
        status,
        body: {
          code: STATUS_TO_ERROR_CODE[status] ?? 'INTERNAL_ERROR',
          message: STATUS_MESSAGE_OVERRIDES[status] ?? exception.message,
          requestId,
        },
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      body: {
        code: 'INTERNAL_ERROR',
        message: GENERIC_INTERNAL_MESSAGE,
        requestId,
      },
    };
  }

  /**
   * Nest packs exception detail into either a string or a `{ message }` object.
   * Array messages come from the default validation pipe, which this project
   * replaces - so they are collapsed rather than exposed field-by-field here.
   */
  private extractHttpExceptionMessage(exception: HttpException): string {
    const response = exception.getResponse();

    if (typeof response === 'string') {
      return response;
    }

    if (typeof response === 'object' && response !== null && 'message' in response) {
      const { message } = response as { message: unknown };

      if (typeof message === 'string') {
        return message;
      }

      if (Array.isArray(message) && message.every((entry) => typeof entry === 'string')) {
        return message.join(' ');
      }
    }

    return exception.message;
  }
}
