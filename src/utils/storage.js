/**
 * Safe storage wrapper with try/catch error handling and serialization
 */

const STORAGE_PREFIX = 'dealroom_proto_';

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
      sessionStorage.removeItem(`${STORAGE_PREFIX}lead_simulated_auto_fired`);
    } catch (err) {
      console.warn('[storage] Error clearing demo storage:', err);
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
};
