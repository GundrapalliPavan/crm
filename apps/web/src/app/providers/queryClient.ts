import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '@/lib/api/api-error';

/** Client errors are the caller's fault; retrying them only wastes a round trip. */
function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
    return false;
  }
  return failureCount < 1;
}

/**
 * Server-state defaults.
 *
 * Kept conservative: no polling, no aggressive retries, and mutations are never
 * retried automatically. Re-sending a payment or a goods receipt because of a
 * transient network error would create duplicate business records - those
 * operations become safely retryable only once idempotency keys exist
 * (FRONTEND.md section 163, Step 2 query-configuration rule).
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: shouldRetry,
        staleTime: 30_000,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}
