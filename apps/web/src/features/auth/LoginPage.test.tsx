import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/lib/api/api-error';
import type { AuthContextValue } from '@/lib/auth/auth-context';
import { useAuth } from '@/lib/auth/useAuth';
import { LoginPage } from './LoginPage';

vi.mock('@/lib/auth/useAuth');
const mockedUseAuth = vi.mocked(useAuth);

function authValue(overrides: Partial<AuthContextValue>): AuthContextValue {
  return {
    status: 'unauthenticated',
    user: null,
    login: vi.fn(),
    logout: vi.fn(),
    can: vi.fn().mockReturnValue(false),
    ...overrides,
  };
}

function renderLoginPage() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<div>Home Page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

function fillAndSubmit(email: string, password: string) {
  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: email } });
  fireEvent.change(screen.getByLabelText(/password/i), { target: { value: password } });
  fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
}

describe('LoginPage', () => {
  let login: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    login = vi.fn();
    mockedUseAuth.mockReturnValue(authValue({ login }));
  });

  it('shows validation errors instead of submitting when the form is empty', async () => {
    renderLoginPage();

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText('Enter your email address.')).toBeVisible();
    expect(screen.getByText('Enter your password.')).toBeVisible();
    expect(login).not.toHaveBeenCalled();
  });

  it('logs in with the entered credentials and reaches the protected home route', async () => {
    login.mockResolvedValue(undefined);
    renderLoginPage();

    fillAndSubmit('ada@example.com', 'Str0ngPassphrase!');

    await waitFor(() =>
      expect(login).toHaveBeenCalledWith({ email: 'ada@example.com', password: 'Str0ngPassphrase!' }),
    );
    expect(await screen.findByText('Home Page')).toBeVisible();
  });

  it('shows the backend message when credentials are rejected', async () => {
    login.mockRejectedValue(
      new ApiError({
        code: 'INVALID_CREDENTIALS',
        message: 'The email or password you entered is incorrect.',
        status: 401,
      }),
    );
    renderLoginPage();

    fillAndSubmit('ada@example.com', 'wrong-password');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'The email or password you entered is incorrect.',
    );
  });

  it('maps field-level validation errors from the API onto the form fields', async () => {
    login.mockRejectedValue(
      new ApiError({
        code: 'VALIDATION_ERROR',
        message: 'The request contains invalid data.',
        status: 422,
        fields: { email: ['Enter a valid email address.'] },
      }),
    );
    renderLoginPage();

    fillAndSubmit('not-an-email', 'Str0ngPassphrase!');

    expect(await screen.findByText('Enter a valid email address.')).toBeVisible();
  });

  it('disables the submit button while the request is in flight', async () => {
    let resolveLogin: () => void = () => {};
    login.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveLogin = resolve;
      }),
    );
    renderLoginPage();

    fillAndSubmit('ada@example.com', 'Str0ngPassphrase!');

    const button = await screen.findByRole('button', { name: /signing in/i });
    expect(button).toBeDisabled();

    resolveLogin();
    await screen.findByText('Home Page');
  });

  it('redirects immediately to the home route when already authenticated', () => {
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
        login,
      }),
    );

    renderLoginPage();

    expect(screen.getByText('Home Page')).toBeVisible();
  });
});
