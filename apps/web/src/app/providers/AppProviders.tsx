import { QueryClientProvider } from '@tanstack/react-query';
import { useState, type PropsWithChildren } from 'react';
import { BrowserRouter } from 'react-router';
import { AuthProvider } from '@/lib/auth/AuthContext';
import { AppErrorBoundary } from './AppErrorBoundary';
import { createQueryClient } from './queryClient';

/**
 * Application provider composition.
 *
 * Order matters: the error boundary wraps everything so it can also catch
 * failures thrown while providers render. `AuthProvider` sits between the
 * query provider and the router - it needs `QueryClientProvider` above it
 * (session-expiry handling clears the query cache), and routes below it need
 * to read auth state to decide what to render.
 */
export function AppProviders({ children }: PropsWithChildren) {
  // Created in state so React does not rebuild the cache on every re-render.
  const [queryClient] = useState(createQueryClient);

  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>{children}</BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </AppErrorBoundary>
  );
}
