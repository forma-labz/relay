import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const webPrefix = 'relay.secure.';

/**
 * Supabase-compatible storage. Native credentials live in Keychain/Keystore;
 * web falls back to sessionStorage so sessions are not persisted across browser
 * restarts on shared machines.
 */
export const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return typeof sessionStorage === 'undefined'
        ? null
        : sessionStorage.getItem(`${webPrefix}${key}`);
    }
    return SecureStore.getItemAsync(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(`${webPrefix}${key}`, value);
      }
      return;
    }
    await SecureStore.setItemAsync(key, value, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  },
  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem(`${webPrefix}${key}`);
      }
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};
