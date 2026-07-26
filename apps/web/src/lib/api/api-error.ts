import type { ApiErrorCode, ApiErrorResponse, ApiFieldErrors } from '@crm/types';
import { AxiosError } from 'axios';

const FALLBACK_MESSAGE = 'Something went wrong. Please try again.';
const NETWORK_MESSAGE = 'Unable to reach the server. Check your connection and try again.';

/**
 * The single error type every feature in the application handles.
 *
 * Components and hooks never see raw `AxiosError`s: normalising here means UI
 * code can branch on a stable `code` and map `fields` onto form inputs without
 * knowing anything about the HTTP client (FRONTEND.md sections 37, 40).
 */
export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;
  readonly fields?: ApiFieldErrors;
  readonly requestId?: string;

  constructor(params: {
    code: ApiErrorCode;
    message: string;
    status: number;
    fields?: ApiFieldErrors;
    requestId?: string;
  }) {
    super(params.message);
    this.name = 'ApiError';
    this.code = params.code;
    this.status = params.status;
    this.fields = params.fields;
    this.requestId = params.requestId;
  }

  /** True when the failure is a field-level validation rejection. */
  get isValidationError(): boolean {
    return this.code === 'VALIDATION_ERROR';
  }

  /** Messages for a single form field, if the server reported any. */
  fieldErrors(field: string): string[] {
    return this.fields?.[field] ?? [];
  }
}

/** Type guard for the API's documented error envelope. */
function isApiErrorResponse(payload: unknown): payload is ApiErrorResponse {
  if (typeof payload !== 'object' || payload === null || !('error' in payload)) {
    return false;
  }

  const { error } = payload as { error: unknown };

  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    typeof (error as { code: unknown }).code === 'string' &&
    typeof (error as { message: unknown }).message === 'string'
  );
}

/**
 * Converts anything thrown by the HTTP client into an `ApiError`.
 *
 * Falls back to a generic message when the server response is absent or does
 * not follow the contract, so a proxy error page or gateway timeout never
 * surfaces raw HTML to the user.
 */
export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof AxiosError) {
    const { response } = error;

    if (response && isApiErrorResponse(response.data)) {
      const body = response.data.error;
      return new ApiError({
        code: body.code,
        message: body.message,
        status: response.status,
        fields: body.fields,
        requestId: body.requestId,
      });
    }

    if (!response) {
      return new ApiError({
        code: 'INTERNAL_ERROR',
        message: NETWORK_MESSAGE,
        status: 0,
      });
    }

    return new ApiError({
      code: 'INTERNAL_ERROR',
      message: FALLBACK_MESSAGE,
      status: response.status,
    });
  }

  return new ApiError({
    code: 'INTERNAL_ERROR',
    message: FALLBACK_MESSAGE,
    status: 0,
  });
}
