/**
 * Holds the access token in memory only, exactly like
 * apps/web/src/lib/auth/token-store.ts - never a persisted store, so it
 * cannot outlive the process. The refresh token is what survives an app
 * restart, and that lives in `refresh-token-store.ts` (Expo SecureStore),
 * not here.
 */
let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}
