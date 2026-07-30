import Constants from 'expo-constants';

/**
 * Client configuration (MOBILE_ARCHITECTURE.md section 12 - API base URL per
 * environment via Expo config, never hardcoded in a component or service).
 *
 * `app.json`'s `expo.extra.apiUrl` is the dev default; a later EAS build
 * profile can override it per environment without touching this file.
 */
function requireExtra(key: string, value: unknown): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`Missing required Expo config value: extra.${key} (see apps/mobile/app.json).`);
  }
  return value;
}

const extra = Constants.expoConfig?.extra ?? {};

export const env = {
  apiBaseUrl: requireExtra('apiUrl', extra.apiUrl),
} as const;
