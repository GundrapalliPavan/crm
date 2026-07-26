/**
 * Shared API contract types.
 *
 * These describe the wire format defined in API.md and are consumed by both the
 * NestJS API (when producing responses) and the web client (when parsing them).
 * Keep this file client-independent - no browser or Node-specific types.
 */

/**
 * Stable, machine-readable error codes (API.md section 23).
 *
 * Clients may branch on these. Human-readable messages must never be used for
 * control flow because they are subject to copy changes and localisation.
 */
export const API_ERROR_CODES = [
  'VALIDATION_ERROR',
  'AUTHENTICATION_REQUIRED',
  'INVALID_CREDENTIALS',
  'ACCOUNT_INACTIVE',
  'SESSION_EXPIRED',
  'PERMISSION_DENIED',
  'RESOURCE_NOT_FOUND',
  'DUPLICATE_RESOURCE',
  'INVALID_STATE_TRANSITION',
  'RESOURCE_MODIFIED',
  'PAYLOAD_TOO_LARGE',
  'RATE_LIMITED',
  'INTERNAL_ERROR',
] as const;

export type ApiErrorCode = (typeof API_ERROR_CODES)[number];

/**
 * Field-level validation messages, keyed by the request field path.
 *
 * Example: `{ "phone": ["Enter a valid phone number."] }`
 */
export type ApiFieldErrors = Record<string, string[]>;

export interface ApiErrorBody {
  /** Stable machine-readable code. Branch on this, not on `message`. */
  code: ApiErrorCode;
  /** Human-readable message, safe to display to end users. */
  message: string;
  /** Present for validation failures so clients can map errors onto form fields. */
  fields?: ApiFieldErrors;
  /** Correlation ID for support and log lookup. */
  requestId: string;
}

/** Error envelope returned by every failing API request. */
export interface ApiErrorResponse {
  error: ApiErrorBody;
}

/** Success envelope for a single resource (API.md section 20). */
export interface ApiSuccessResponse<TData> {
  data: TData;
}

/** Pagination metadata for collection responses (API.md section 21). */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

/** Success envelope for a paginated collection (API.md section 21). */
export interface ApiCollectionResponse<TItem> {
  data: TItem[];
  meta: PaginationMeta;
}

/** Pagination defaults and limits (API.md section 27). */
export const PAGINATION_DEFAULTS = {
  page: 1,
  pageSize: 25,
  maxPageSize: 100,
} as const;

/** Header carrying the request correlation ID (API.md section 25). */
export const REQUEST_ID_HEADER = 'x-request-id';
