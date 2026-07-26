import type { PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from '@/lib/auth/useAuth';

/**
 * Gates a route on authentication (Step 4 section 63).
 *
 * Renders nothing while auth state is still resolving (section 56 - protected
 * content must never render before that resolves), redirects to `/login` with
 * the attempted location preserved so a successful login can return the user
 * there (section 64), and otherwise renders the protected content.
 */
export function ProtectedRoute({ children }: PropsWithChildren) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return null;
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
