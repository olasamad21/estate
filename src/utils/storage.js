/**
 * Safe storage wrapper with try/catch error handling, serialization,
 * and storage version invalidation.
 */

export const STORAGE_VERSION = 'v2.0.0';
const STORAGE_PREFIX = 'staffchat_proto_';
const VERSION_KEY = `${STORAGE_PREFIX}storage_version`;
const LEGACY_PREFIXES = ['dealroom_proto_'];

// Storage version check: if version mismatch occurs, clear stale demo storage on boot
(function initStorageVersion() {
  try {
    if (typeof window === 'undefined') return;

    // Remove legacy prefixed keys from both storages
    for (const prefix of LEGACY_PREFIXES) {
      const localLegacyKeys = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const fullKey = window.localStorage.key(i);
        if (fullKey && fullKey.startsWith(prefix)) {
          localLegacyKeys.push(fullKey);
        }
      }
      localLegacyKeys.forEach((key) => window.localStorage.removeItem(key));

      const sessionLegacyKeys = [];
      for (let i = 0; i < window.sessionStorage.length; i++) {
        const fullKey = window.sessionStorage.key(i);
        if (fullKey && fullKey.startsWith(prefix)) {
          sessionLegacyKeys.push(fullKey);
        }
      }
      sessionLegacyKeys.forEach((key) => window.sessionStorage.removeItem(key));
    }

    const currentVersion = window.localStorage.getItem(VERSION_KEY);
    if (currentVersion !== STORAGE_VERSION) {
      // Clear localStorage demo keys
      const keysToRemove = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const fullKey = window.localStorage.key(i);
        if (fullKey && fullKey.startsWith(STORAGE_PREFIX)) {
          keysToRemove.push(fullKey);
        }
      }
      keysToRemove.forEach((key) => window.localStorage.removeItem(key));
      window.localStorage.setItem(VERSION_KEY, STORAGE_VERSION);

      // Clear sessionStorage demo keys
      const sessionKeysToRemove = [];
      for (let i = 0; i < window.sessionStorage.length; i++) {
        const fullKey = window.sessionStorage.key(i);
        if (fullKey && fullKey.startsWith(STORAGE_PREFIX)) {
          sessionKeysToRemove.push(fullKey);
        }
      }
      sessionKeysToRemove.forEach((key) => window.sessionStorage.removeItem(key));
    }
  } catch (err) {
    console.warn('[storage] Error initializing storage version:', err);
  }
})();

export const safeLocalStorage = {
  get(key, defaultValue = null) {
    try {
      if (typeof window === 'undefined') return defaultValue;
      const raw = window.localStorage.getItem(STORAGE_PREFIX + key);
      if (raw === null) return defaultValue;
      return JSON.parse(raw);
    } catch (err) {
      console.warn(`[storage] Error reading key "${key}" from localStorage:`, err);
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      if (typeof window === 'undefined') return false;
      window.localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
      return true;
    } catch (err) {
      console.warn(`[storage] Error saving key "${key}" to localStorage:`, err);
      return false;
    }
  },

  remove(key) {
    try {
      if (typeof window === 'undefined') return;
      window.localStorage.removeItem(STORAGE_PREFIX + key);
    } catch (err) {
      console.warn(`[storage] Error removing key "${key}" from localStorage:`, err);
    }
  },

  clearDemoStorage() {
    try {
      if (typeof window === 'undefined') return;
      const keysToRemove = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const fullKey = window.localStorage.key(i);
        if (fullKey && fullKey.startsWith(STORAGE_PREFIX)) {
          keysToRemove.push(fullKey);
        }
      }
      keysToRemove.forEach((key) => window.localStorage.removeItem(key));
      window.localStorage.setItem(VERSION_KEY, STORAGE_VERSION);
    } catch (err) {
      console.warn('[storage] Error clearing demo localStorage:', err);
    }

    try {
      if (typeof window !== 'undefined') {
        const sessionKeysToRemove = [];
        for (let i = 0; i < window.sessionStorage.length; i++) {
          const fullKey = window.sessionStorage.key(i);
          if (fullKey && fullKey.startsWith(STORAGE_PREFIX)) {
            sessionKeysToRemove.push(fullKey);
          }
        }
        sessionKeysToRemove.forEach((key) => window.sessionStorage.removeItem(key));
      }
    } catch (err) {
      console.warn('[storage] Error clearing demo sessionStorage:', err);
    }
  },
};

export const safeSessionStorage = {
  get(key, defaultValue = null) {
    try {
      if (typeof window === 'undefined') return defaultValue;
      const raw = window.sessionStorage.getItem(STORAGE_PREFIX + key);
      if (raw === null) return defaultValue;
      return JSON.parse(raw);
    } catch (err) {
      console.warn(`[storage] Error reading key "${key}" from sessionStorage:`, err);
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      if (typeof window === 'undefined') return false;
      window.sessionStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
      return true;
    } catch (err) {
      console.warn(`[storage] Error saving key "${key}" to sessionStorage:`, err);
      return false;
    }
  },

  remove(key) {
    try {
      if (typeof window === 'undefined') return;
      window.sessionStorage.removeItem(STORAGE_PREFIX + key);
    } catch (err) {
      console.warn(`[storage] Error removing key "${key}" from sessionStorage:`, err);
    }
  },

  clear() {
    try {
      if (typeof window === 'undefined') return;
      const keysToRemove = [];
      for (let i = 0; i < window.sessionStorage.length; i++) {
        const fullKey = window.sessionStorage.key(i);
        if (fullKey && fullKey.startsWith(STORAGE_PREFIX)) {
          keysToRemove.push(fullKey);
        }
      }
      keysToRemove.forEach((key) => window.sessionStorage.removeItem(key));
    } catch (err) {
      console.warn('[storage] Error clearing sessionStorage:', err);
    }
  },
};
