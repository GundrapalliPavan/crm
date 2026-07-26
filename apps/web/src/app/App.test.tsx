import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { authService } from '@/lib/auth/auth-service';
import { App } from './App';
import { AppErrorBoundary } from './providers/AppErrorBoundary';

vi.mock('@/lib/auth/auth-service', () => ({
  authService: {
    login: vi.fn(),
    refresh: vi.fn(),
    fetchCurrentUser: vi.fn(),
    logout: vi.fn(),
  },
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders through the full provider stack, landing on the login screen when signed out', async () => {
    // `/` requires authentication (Step 4 section 63); with no session cookie
    // the silent refresh on mount fails and the router redirects to /login -
    // asynchronous, so this must await rather than assert synchronously.
    vi.mocked(authService.refresh).mockRejectedValue(new Error('no session cookie'));

    render(<App />);

    expect(
      await screen.findByRole('heading', { name: /electrical distribution crm/i }),
    ).toBeVisible();
  });
});

describe('AppErrorBoundary', () => {
  it('shows a recovery message instead of a blank screen when a child throws', () => {
    // React logs the caught error; silence it so the suite output stays readable.
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    function Exploding(): never {
      throw new Error('render failure');
    }

    render(
      <AppErrorBoundary>
        <Exploding />
      </AppErrorBoundary>,
    );

    expect(screen.getByRole('heading', { name: /something went wrong/i })).toBeVisible();
    expect(screen.getByRole('button', { name: /reload page/i })).toBeVisible();

    consoleError.mockRestore();
  });

  it('does not render the technical error message to the user', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    function Exploding(): never {
      throw new Error('SECRET_INTERNAL_DETAIL');
    }

    render(
      <AppErrorBoundary>
        <Exploding />
      </AppErrorBoundary>,
    );

    expect(screen.queryByText(/SECRET_INTERNAL_DETAIL/)).not.toBeInTheDocument();

    consoleError.mockRestore();
  });
});
