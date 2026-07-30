import { QueryClient } from '@tanstack/react-query';
import { ApiError } from './api-error';

/** Client errors are the caller's fault; retrying them only wastes a round trip - same rule as apps/web/src/app/providers/queryClient.ts. */
function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
    return false;
  }
  return failureCount < 1;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetry,
      staleTime: 30_000,
    },
    mutations: {
      retry: false,
    },
  },
});
