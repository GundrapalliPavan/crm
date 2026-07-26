/**
 * Holds the access token in memory only - never `localStorage` or
 * `sessionStorage` (FRONTEND.md section 121-122, Step 4 section 53).
 *
 * A page reload always clears this, by design: the httpOnly refresh cookie
 * is what survives a reload, and `AuthProvider` uses it to silently obtain a
 * fresh access token on startup (see `bootstrap()` in AuthContext.tsx).
 *
 * Plain module state, not React state: the axios interceptors in `client.ts`
 * need to read and write the token synchronously, outside any component.
 */
let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}
