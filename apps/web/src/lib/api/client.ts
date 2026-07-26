import { REQUEST_ID_HEADER, type RefreshResponse } from '@crm/types';
import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { env } from '@/app/config/env';
import { emitSessionExpired } from '@/lib/auth/auth-events';
import { getAccessToken, setAccessToken } from '@/lib/auth/token-store';
import { normalizeApiError } from './api-error';

/**
 * Shared HTTP client.
 *
 * Every feature calls the API through this instance so that base URL,
 * credentials, authentication and error normalisation stay in one place.
 * Feature modules add their own service functions on top; they must not call
 * `axios` or `fetch` directly (FRONTEND.md sections 32-33, Step 4 section 67).
 */
export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  // Carries the httpOnly refresh-token cookie; the access token below is
  // attached explicitly, never stored in a cookie the browser sends on its own.
  withCredentials: true,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Generates a client-side correlation ID when the browser supports it.
 *
 * The server honours a well-formed inbound ID, which lets a failure reported by
 * a user be traced from the browser through to the API logs.
 */
apiClient.interceptors.request.use((config) => {
  if (!config.headers[REQUEST_ID_HEADER] && typeof crypto?.randomUUID === 'function') {
    config.headers[REQUEST_ID_HEADER] = `req_${crypto.randomUUID()}`;
  }

  const token = getAccessToken();
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

const REFRESH_URL = '/auth/refresh';

/**
 * Coordinates concurrent 401s onto a single refresh call (Step 4 section 69).
 *
 * Without this, five components independently discovering an expired access
 * token would each rotate the refresh token, and four of the five rotations
 * would fail as reuse of an already-consumed token - exactly the theft signal
 * the backend uses to revoke every session (see SessionService server-side).
 * `null` means "no refresh in flight right now".
 */
let inFlightRefresh: Promise<string> | null = null;

function requestIsRetry(config: InternalAxiosRequestConfig & { _retry?: boolean }): boolean {
  return config._retry === true;
}

async function refreshAccessToken(): Promise<string> {
  inFlightRefresh ??= axios
    .post<RefreshResponse>(REFRESH_URL, undefined, {
      baseURL: env.apiBaseUrl,
      withCredentials: true,
    })
    .then((response) => {
      setAccessToken(response.data.accessToken);
      return response.data.accessToken;
    })
    .finally(() => {
      inFlightRefresh = null;
    });

  return inFlightRefresh;
}

/** Rejects with an `ApiError` so callers never handle raw Axios errors. */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    const axiosError = error instanceof AxiosError ? error : undefined;
    const config = axiosError?.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    const isUnauthorized = axiosError?.response?.status === 401;
    const isRefreshCall = config?.url === REFRESH_URL;

    if (isUnauthorized && config && !isRefreshCall && !requestIsRetry(config)) {
      try {
        const token = await refreshAccessToken();
        config._retry = true;
        config.headers.Authorization = `Bearer ${token}`;
        return apiClient.request(config);
      } catch {
        setAccessToken(null);
        emitSessionExpired();
        // Falls through to the normalized rejection below, using the
        // *original* 401 - not the refresh call's own error - since that is
        // what actually explains the failed request to the caller.
      }
    }

    if (isUnauthorized && isRefreshCall) {
      setAccessToken(null);
      emitSessionExpired();
    }

    return Promise.reject(normalizeApiError(error));
  },
);
