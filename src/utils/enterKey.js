export const ENTER_KEY_OPTIONS = [
  { id: 'auto', label: 'Automatic' },
  { id: 'send', label: 'Enter sends' },
  { id: 'newline', label: 'Enter adds a new line' },
];

const STORAGE_KEY = 'staffchat_pref_enter_key';

const VALID_IDS = new Set(ENTER_KEY_OPTIONS.map((opt) => opt.id));

export function getEnterKeyPref() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return 'auto';
    }
    const val = window.localStorage.getItem(STORAGE_KEY) ?? null;
    if (val && VALID_IDS.has(val)) {
      return val;
    }
    return 'auto';
  } catch {
    return 'auto';
  }
}

export function setEnterKeyPref(id) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    const targetId = VALID_IDS.has(id) ? id : 'auto';
    window.localStorage.setItem(STORAGE_KEY, targetId);
  } catch {
    // Ignore localStorage write failures (e.g. private browsing quota)
  }
}

export function shouldEnterSend(pref) {
  if (pref === 'send') return true;
  if (pref === 'newline') return false;
  try {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false;
    }
    return Boolean(window.matchMedia('(any-pointer: fine)').matches);
  } catch {
    return false;
  }
}
