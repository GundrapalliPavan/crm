/**
 * Fired exactly once when the API client discovers the current session can no
 * longer be refreshed (see the response interceptor in `lib/api/client.ts`).
 *
 * A plain callback list rather than routing this through React state directly:
 * the interceptor that detects the failure lives outside any component, and
 * `AuthProvider` is the single subscriber that turns this into application
 * auth state (FRONTEND.md section 57 - one clear source of truth).
 */
type Listener = () => void;

const listeners = new Set<Listener>();

export function onSessionExpired(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function emitSessionExpired(): void {
  for (const listener of listeners) {
    listener();
  }
}
