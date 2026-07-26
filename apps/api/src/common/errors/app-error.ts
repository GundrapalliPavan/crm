import { HttpStatus } from '@nestjs/common';
import type { ApiErrorCode, ApiFieldErrors } from '@crm/types';

/**
 * Base class for errors that carry an intentional, client-safe API contract.
 *
 * Anything thrown that is *not* an `AppError` is treated as unexpected by the
 * global exception filter: it is logged in full and reported to the client as a
 * generic 500 so internals never leak (API.md section 24).
 */
export abstract class AppError extends Error {
  abstract readonly code: ApiErrorCode;
  abstract readonly status: HttpStatus;

  /** Field-level messages, set only by validation failures. */
  readonly fields?: ApiFieldErrors;

  protected constructor(message: string, fields?: ApiFieldErrors) {
    super(message);
    this.name = new.target.name;
    this.fields = fields;
    Error.captureStackTrace?.(this, new.target);
  }
}

/** Request failed input validation. Carries per-field messages for forms. */
export class ValidationError extends AppError {
  readonly code = 'VALIDATION_ERROR' as const;
  readonly status = HttpStatus.UNPROCESSABLE_ENTITY;

  constructor(fields: ApiFieldErrors, message = 'The request contains invalid data.') {
    super(message, fields);
  }
}

/** No valid authenticated identity on a request that requires one. */
export class AuthenticationError extends AppError {
  readonly code = 'AUTHENTICATION_REQUIRED' as const;
  readonly status = HttpStatus.UNAUTHORIZED;

  constructor(message = 'Authentication is required.') {
    super(message);
  }
}

/**
 * Login rejected. Deliberately used for *both* an unknown email and a wrong
 * password - a generic message either way, so the response never reveals
 * which one it was (Step 4 section 12, API.md section 141's enumeration
 * principle applied to login).
 */
export class InvalidCredentialsError extends AppError {
  readonly code = 'INVALID_CREDENTIALS' as const;
  readonly status = HttpStatus.UNAUTHORIZED;

  constructor(message = 'The email or password you entered is incorrect.') {
    super(message);
  }
}

/** Credentials were correct, but the account cannot currently sign in. */
export class AccountInactiveError extends AppError {
  readonly code = 'ACCOUNT_INACTIVE' as const;
  readonly status = HttpStatus.UNAUTHORIZED;

  constructor(message = 'Your account is not active. Contact your administrator.') {
    super(message);
  }
}

/**
 * A previously valid session is no longer usable - expired, logged out, or
 * revoked because its refresh token was reused. Distinct from
 * `AuthenticationError`, which is "no credential was presented at all".
 */
export class SessionExpiredError extends AppError {
  readonly code = 'SESSION_EXPIRED' as const;
  readonly status = HttpStatus.UNAUTHORIZED;

  constructor(message = 'Your session has expired. Please sign in again.') {
    super(message);
  }
}

/** Authenticated, but lacking the permission or data scope for this operation. */
export class AuthorizationError extends AppError {
  readonly code = 'PERMISSION_DENIED' as const;
  readonly status = HttpStatus.FORBIDDEN;

  constructor(message = 'You do not have permission to perform this action.') {
    super(message);
  }
}

/**
 * Resource does not exist, or is not visible to the caller.
 *
 * Deliberately does not distinguish the two: returning 404 for inaccessible
 * records prevents resource enumeration (API.md section 141).
 */
export class NotFoundError extends AppError {
  readonly code = 'RESOURCE_NOT_FOUND' as const;
  readonly status = HttpStatus.NOT_FOUND;

  constructor(message = 'The requested resource was not found.') {
    super(message);
  }
}

/** Duplicate or concurrent-modification conflict. */
export class ConflictError extends AppError {
  readonly code = 'DUPLICATE_RESOURCE' as const;
  readonly status = HttpStatus.CONFLICT;

  constructor(message = 'The resource already exists.') {
    super(message);
  }
}

/**
 * A domain rule rejected an otherwise well-formed request.
 *
 * The `code` is supplied per rule so clients can react contextually, e.g.
 * `INVALID_STATE_TRANSITION` (BACKEND.md section 133).
 */
export class BusinessRuleError extends AppError {
  readonly code: ApiErrorCode;
  readonly status = HttpStatus.CONFLICT;

  constructor(code: ApiErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}
