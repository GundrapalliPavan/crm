/**
 * Client configuration.
 *
 * Only `VITE_`-prefixed variables are exposed by Vite, and every value here is
 * compiled into the browser bundle. Never read a secret through this module -
 * backend credentials and provider keys stay server-side (FRONTEND.md
 * sections 119-120).
 */

function requireEnv(key: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}. Copy apps/web/.env.example to apps/web/.env.`,
    );
  }
  return value;
}

export const env = {
  apiBaseUrl: requireEnv('VITE_API_BASE_URL', import.meta.env.VITE_API_BASE_URL),
  /** Vite's build mode: 'development' | 'test' | 'production'. */
  mode: import.meta.env.MODE,
  isProduction: import.meta.env.PROD,
} as const;
