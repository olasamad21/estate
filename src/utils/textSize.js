export const TEXT_SIZES = [
  { id: 'standard', label: 'Standard' },
  { id: 'large', label: 'Large' },
  { id: 'xl', label: 'Extra large' },
];

const STORAGE_KEY = 'staffchat_a11y_text_size';

const VALID_IDS = new Set(TEXT_SIZES.map((s) => s.id));

/**
 * Reads the saved text size preference from localStorage.
 * Returns 'standard' if missing, invalid, or localStorage is unavailable.
 */
export function getTextSize() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return 'standard';
    }
    const val = window.localStorage.getItem(STORAGE_KEY);
    if (val && VALID_IDS.has(val)) {
      return val;
    }
    return 'standard';
  } catch {
    return 'standard';
  }
}

/**
 * Saves the text size preference to localStorage.
 */
export function setTextSize(id) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    const targetId = VALID_IDS.has(id) ? id : 'standard';
    if (targetId === 'standard') {
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      window.localStorage.setItem(STORAGE_KEY, targetId);
    }
  } catch {
    // Ignore localStorage write failures (e.g. private browsing quota)
  }
}

/**
 * Applies or removes the data-text-size attribute on document.documentElement.
 * 'standard' removes the attribute; 'large' and 'xl' set it.
 */
export function applyTextSize(id) {
  try {
    if (typeof document === 'undefined' || !document.documentElement) {
      return;
    }
    if (id === 'large' || id === 'xl') {
      document.documentElement.setAttribute('data-text-size', id);
    } else {
      document.documentElement.removeAttribute('data-text-size');
    }
  } catch {
    // Ignore DOM attribute errors
  }
}
