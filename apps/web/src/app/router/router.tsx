import { Route, Routes } from 'react-router';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { AuthenticatedHomePage } from '@/features/auth/AuthenticatedHomePage';
import { LoginPage } from '@/features/auth/LoginPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

/**
 * Route table.
 *
 * Business routes (/leads, /quotations, /invoices, ...) are added with their
 * modules. `/` is a minimal authenticated placeholder (Step 4 section 65) -
 * the production application shell and navigation do not exist yet.
 */
export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AuthenticatedHomePage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
