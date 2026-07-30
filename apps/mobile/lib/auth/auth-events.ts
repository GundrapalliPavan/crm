/**
 * Fired once when the API client discovers the current session can no longer
 * be refreshed - identical pattern to apps/web/src/lib/auth/auth-events.ts.
 * `AuthProvider` is the single subscriber that turns this into app state.
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
