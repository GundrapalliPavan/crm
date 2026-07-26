import { AxiosError, AxiosHeaders } from 'axios';
import { describe, expect, it } from 'vitest';
import { ApiError, normalizeApiError } from './api-error';

function axiosErrorWithResponse(status: number, data: unknown): AxiosError {
  const error = new AxiosError('Request failed');
  error.response = {
    status,
    statusText: '',
    data,
    headers: {},
    config: { headers: new AxiosHeaders() },
  };
  return error;
}

describe('normalizeApiError', () => {
  it('maps the documented error envelope onto ApiError', () => {
    const error = normalizeApiError(
      axiosErrorWithResponse(422, {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'The request contains invalid data.',
          fields: { phone: ['Enter a valid phone number.'] },
          requestId: 'req_abc',
        },
      }),
    );

    expect(error).toBeInstanceOf(ApiError);
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.status).toBe(422);
    expect(error.requestId).toBe('req_abc');
    expect(error.isValidationError).toBe(true);
    expect(error.fieldErrors('phone')).toEqual(['Enter a valid phone number.']);
  });

  it('returns an empty list for a field the server did not report', () => {
    const error = normalizeApiError(
      axiosErrorWithResponse(422, {
        error: { code: 'VALIDATION_ERROR', message: 'Invalid.', fields: {}, requestId: 'req_1' },
      }),
    );

    expect(error.fieldErrors('email')).toEqual([]);
  });

  it('falls back to a safe message when the body is not the API envelope', () => {
    // A proxy or gateway can return HTML that never reached the application.
    const error = normalizeApiError(axiosErrorWithResponse(502, '<html>Bad Gateway</html>'));

    expect(error.code).toBe('INTERNAL_ERROR');
    expect(error.status).toBe(502);
    expect(error.message).not.toContain('html');
  });

  it('reports a connection failure when no response arrived', () => {
    const error = normalizeApiError(new AxiosError('Network Error'));

    expect(error.code).toBe('INTERNAL_ERROR');
    expect(error.status).toBe(0);
    expect(error.message).toMatch(/connection/i);
  });

  it('passes an already-normalised error through unchanged', () => {
    const original = new ApiError({ code: 'PERMISSION_DENIED', message: 'Nope.', status: 403 });

    expect(normalizeApiError(original)).toBe(original);
  });

  it('normalises a non-Axios throwable', () => {
    const error = normalizeApiError(new Error('boom'));

    expect(error.code).toBe('INTERNAL_ERROR');
    expect(error.message).not.toBe('boom');
  });
});
