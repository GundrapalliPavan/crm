import type { ApiErrorCode, ApiErrorResponse, ApiFieldErrors } from '@crm/types';
import { AxiosError } from 'axios';

const FALLBACK_MESSAGE = 'Something went wrong. Please try again.';
const NETWORK_MESSAGE = 'Unable to reach the server. Check your connection and try again.';

/**
 * The single error type every screen in the app handles - mirrors
 * apps/web/src/lib/api/api-error.ts exactly, since the wire contract
 * (`{ error: { code, message, fields?, requestId } }`) is the same API.
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

  get isValidationError(): boolean {
    return this.code === 'VALIDATION_ERROR';
  }

  fieldErrors(field: string): string[] {
    return this.fields?.[field] ?? [];
  }
}

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
      return new ApiError({ code: 'INTERNAL_ERROR', message: NETWORK_MESSAGE, status: 0 });
    }

    return new ApiError({ code: 'INTERNAL_ERROR', message: FALLBACK_MESSAGE, status: response.status });
  }

  return new ApiError({ code: 'INTERNAL_ERROR', message: FALLBACK_MESSAGE, status: 0 });
}
