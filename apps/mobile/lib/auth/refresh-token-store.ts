import * as SecureStore from 'expo-secure-store';

/**
 * The mobile equivalent of the web app's httpOnly refresh cookie
 * (MOBILE_ARCHITECTURE.md section 5) - the one credential that survives an
 * app restart. Expo SecureStore is backed by Keychain on iOS and Keystore-
 * backed EncryptedSharedPreferences on Android, never plain AsyncStorage.
 */
const REFRESH_TOKEN_KEY = 'crm_refresh_token';

export function getStoredRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export function setStoredRefreshToken(token: string): Promise<void> {
  return SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
}

export function clearStoredRefreshToken(): Promise<void> {
  return SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}
