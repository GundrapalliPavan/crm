import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useState, type PropsWithChildren } from 'react';
import type { AuthenticatedUser } from '@crm/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider } from './AuthContext';
import { authService } from './auth-service';
import { emitSessionExpired } from './auth-events';
import { useAuth } from './useAuth';

vi.mock('./auth-service', () => ({
  authService: {
    login: vi.fn(),
    refresh: vi.fn(),
    fetchCurrentUser: vi.fn(),
    logout: vi.fn(),
  },
}));

const mockedAuthService = vi.mocked(authService);

const sampleUser: AuthenticatedUser = {
  id: 'user-1',
  firstName: 'Ada',
  lastName: 'Lovelace',
  username: null,
  email: 'ada@example.com',
  status: 'active',
  roles: [{ id: 'role-1', name: 'Administrator' }],
  permissions: ['user.read', 'user.create'],
};

function Wrapper({ children }: PropsWithChildren) {
  const [client] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={client}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}

function renderAuth() {
  return renderHook(() => useAuth(), { wrapper: Wrapper });
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts in the loading state before the silent refresh resolves', () => {
    mockedAuthService.refresh.mockReturnValue(new Promise(() => {}));

    const { result } = renderAuth();

    expect(result.current.status).toBe('loading');
    expect(result.current.user).toBeNull();
  });

  it('resolves to unauthenticated when the silent refresh fails', async () => {
    mockedAuthService.refresh.mockRejectedValue(new Error('no session cookie'));

    const { result } = renderAuth();

    await waitFor(() => expect(result.current.status).toBe('unauthenticated'));
    expect(result.current.user).toBeNull();
  });

  it('resolves to authenticated with the current user when the cookie is still valid', async () => {
    mockedAuthService.refresh.mockResolvedValue(undefined);
    mockedAuthService.fetchCurrentUser.mockResolvedValue(sampleUser);

    const { result } = renderAuth();

    await waitFor(() => expect(result.current.status).toBe('authenticated'));
    expect(result.current.user).toEqual(sampleUser);
  });

  it('login() transitions to authenticated with the returned user', async () => {
    mockedAuthService.refresh.mockRejectedValue(new Error('no session cookie'));
    mockedAuthService.login.mockResolvedValue(sampleUser);

    const { result } = renderAuth();
    await waitFor(() => expect(result.current.status).toBe('unauthenticated'));

    await act(async () => {
      await result.current.login({ email: 'ada@example.com', password: 'Str0ngPassphrase!' });
    });

    expect(result.current.status).toBe('authenticated');
    expect(result.current.user).toEqual(sampleUser);
  });

  it('logout() always clears client state, even when the network call fails', async () => {
    mockedAuthService.refresh.mockResolvedValue(undefined);
    mockedAuthService.fetchCurrentUser.mockResolvedValue(sampleUser);
    mockedAuthService.logout.mockRejectedValue(new Error('network error'));

    const { result } = renderAuth();
    await waitFor(() => expect(result.current.status).toBe('authenticated'));

    await act(async () => {
      await result.current.logout().catch(() => {
        // The user asked to leave; client state must clear regardless of
        // whether the server confirmed it (Step 4 section 66).
      });
    });

    expect(result.current.status).toBe('unauthenticated');
    expect(result.current.user).toBeNull();
  });

  it('reverts to unauthenticated when the API client reports the session has expired', async () => {
    mockedAuthService.refresh.mockResolvedValue(undefined);
    mockedAuthService.fetchCurrentUser.mockResolvedValue(sampleUser);

    const { result } = renderAuth();
    await waitFor(() => expect(result.current.status).toBe('authenticated'));

    act(() => {
      emitSessionExpired();
    });

    expect(result.current.status).toBe('unauthenticated');
    expect(result.current.user).toBeNull();
  });

  it("can() reflects the current user's resolved permission list", async () => {
    mockedAuthService.refresh.mockResolvedValue(undefined);
    mockedAuthService.fetchCurrentUser.mockResolvedValue(sampleUser);

    const { result } = renderAuth();
    await waitFor(() => expect(result.current.status).toBe('authenticated'));

    expect(result.current.can('user.read')).toBe(true);
    expect(result.current.can('invoice.issue')).toBe(false);
  });

  it('can() is always false before a user has resolved', async () => {
    mockedAuthService.refresh.mockRejectedValue(new Error('no session cookie'));

    const { result } = renderAuth();
    await waitFor(() => expect(result.current.status).toBe('unauthenticated'));

    expect(result.current.can('user.read')).toBe(false);
  });
});

describe('useAuth', () => {
  it('throws when used outside an AuthProvider', () => {
    expect(() => renderHook(() => useAuth())).toThrow(
      'useAuth must be used within an AuthProvider',
    );
  });
});
