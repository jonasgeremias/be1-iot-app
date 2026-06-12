import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

import { logger } from '../logger/logger';
import { StorageKeys, type StorageKey } from './storage.keys';

/**
 * Storage facade. Light prefs go to AsyncStorage; sensitive values (auth token)
 * go to SecureStore as recommended by the spec. Framework-agnostic — no React.
 */
const SECURE_KEYS: StorageKey[] = [StorageKeys.authToken, StorageKeys.refreshToken];

function isSecure(key: StorageKey) {
  return SECURE_KEYS.includes(key);
}

export const storage = {
  async get(key: StorageKey): Promise<string | null> {
    try {
      return isSecure(key) ? await SecureStore.getItemAsync(key) : await AsyncStorage.getItem(key);
    } catch (e) {
      logger.warn('storage', `get failed for ${key}`, e);
      return null;
    }
  },

  async set(key: StorageKey, value: string): Promise<void> {
    try {
      if (isSecure(key)) await SecureStore.setItemAsync(key, value);
      else await AsyncStorage.setItem(key, value);
    } catch (e) {
      logger.warn('storage', `set failed for ${key}`, e);
    }
  },

  async remove(key: StorageKey): Promise<void> {
    try {
      if (isSecure(key)) await SecureStore.deleteItemAsync(key);
      else await AsyncStorage.removeItem(key);
    } catch (e) {
      logger.warn('storage', `remove failed for ${key}`, e);
    }
  },
};
