import { REQUEST_ID_HEADER, type RefreshResponse } from '@crm/types';
import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { emitSessionExpired } from '@/lib/auth/auth-events';
import {
  clearStoredRefreshToken,
  getStoredRefreshToken,
  setStoredRefreshToken,
} from '@/lib/auth/refresh-token-store';
import { getAccessToken, setAccessToken } from '@/lib/auth/token-store';
import { normalizeApiError } from './api-error';
import { env } from './env';

/** Set on every request - see the backend's `CLIENT_TYPE_HEADER`/`MOBILE_CLIENT_TYPE`, which switches the refresh token to body delivery instead of a cookie the app can't use (MOBILE_ARCHITECTURE.md section 3.2). */
const CLIENT_TYPE_HEADER = 'X-Client-Type';
const MOBILE_CLIENT_TYPE = 'mobile';

/**
 * Shared HTTP client - the mobile equivalent of apps/web/src/lib/api/client.ts.
 * Every screen calls the API through this instance; feature code must not
 * call axios/fetch directly.
 */
export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json', [CLIENT_TYPE_HEADER]: MOBILE_CLIENT_TYPE },
});

apiClient.interceptors.request.use((config) => {
  if (!config.headers[REQUEST_ID_HEADER] && typeof globalThis.crypto?.randomUUID === 'function') {
    config.headers[REQUEST_ID_HEADER] = `req_${globalThis.crypto.randomUUID()}`;
  }

  const token = getAccessToken();
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

const REFRESH_URL = '/auth/refresh';

/** Coordinates concurrent 401s onto a single refresh call - see the identical rationale in apps/web/src/lib/api/client.ts. */
let inFlightRefresh: Promise<string> | null = null;

function requestIsRetry(config: InternalAxiosRequestConfig & { _retry?: boolean }): boolean {
  return config._retry === true;
}

async function refreshAccessToken(): Promise<string> {
  inFlightRefresh ??= (async () => {
    const storedRefreshToken = await getStoredRefreshToken();
    if (!storedRefreshToken) {
      throw new Error('No refresh token in secure storage.');
    }

    const { data } = await axios.post<RefreshResponse>(REFRESH_URL, { refreshToken: storedRefreshToken }, {
      baseURL: env.apiBaseUrl,
      headers: { [CLIENT_TYPE_HEADER]: MOBILE_CLIENT_TYPE },
    });

    setAccessToken(data.accessToken);
    if (data.refreshToken) {
      await setStoredRefreshToken(data.refreshToken);
    }
    return data.accessToken;
  })().finally(() => {
    inFlightRefresh = null;
  });

  return inFlightRefresh;
}

/** Rejects with an `ApiError` so screens never handle a raw Axios error. */
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
        await clearStoredRefreshToken();
        emitSessionExpired();
      }
    }

    if (isUnauthorized && isRefreshCall) {
      setAccessToken(null);
      await clearStoredRefreshToken();
      emitSessionExpired();
    }

    return Promise.reject(normalizeApiError(error));
  },
);
