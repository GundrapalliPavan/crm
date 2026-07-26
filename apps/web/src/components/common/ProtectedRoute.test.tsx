import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import type { AuthContextValue } from '@/lib/auth/auth-context';
import { useAuth } from '@/lib/auth/useAuth';
import { ProtectedRoute } from './ProtectedRoute';

vi.mock('@/lib/auth/useAuth');
const mockedUseAuth = vi.mocked(useAuth);

function authValue(overrides: Partial<AuthContextValue>): AuthContextValue {
  return {
    status: 'loading',
    user: null,
    login: vi.fn(),
    logout: vi.fn(),
    can: vi.fn().mockReturnValue(false),
    ...overrides,
  };
}

function renderProtectedRoute() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/login" element={<div>Login Screen</div>} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <div>Protected Content</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ProtectedRoute', () => {
  it('renders nothing while auth status is still resolving', () => {
    mockedUseAuth.mockReturnValue(authValue({ status: 'loading' }));

    renderProtectedRoute();

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(screen.queryByText('Login Screen')).not.toBeInTheDocument();
  });

  it('redirects to /login when unauthenticated', () => {
    mockedUseAuth.mockReturnValue(authValue({ status: 'unauthenticated' }));

    renderProtectedRoute();

    expect(screen.getByText('Login Screen')).toBeVisible();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders the protected content when authenticated', () => {
    mockedUseAuth.mockReturnValue(
      authValue({
        status: 'authenticated',
        user: {
          id: 'user-1',
          firstName: 'Ada',
          lastName: 'Lovelace',
          email: 'ada@example.com',
          status: 'active',
          roles: [],
          permissions: [],
        },
      }),
    );

    renderProtectedRoute();

    expect(screen.getByText('Protected Content')).toBeVisible();
  });
});
