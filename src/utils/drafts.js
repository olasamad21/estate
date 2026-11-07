import { useCallback, useSyncExternalStore } from 'react';

const STORAGE_KEY = 'staffchat_pref_drafts';
const MAX_DRAFTS = 40;
const MAX_DRAFT_CHARS = 4000;
const MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;
const DEBOUNCE_MS = 400;

const draftsMap = new Map();
const listeners = new Set();

let loaded = false;
let debounceTimer = null;
let lifecycleListenersAdded = false;

function writeToLocalStorage() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    if (draftsMap.size === 0) {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }
    const serialised = {};
    for (const [key, entry] of draftsMap.entries()) {
      serialised[key] = {
        text: entry.text,
        updatedAt: entry.updatedAt,
      };
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(serialised));
  } catch {
    // Ignore storage quota or private-mode errors
  }
}

export function flushDrafts() {
  if (debounceTimer !== null) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
  if (!loaded) return;
  writeToLocalStorage();
}

function registerLifecycleFlushOnce() {
  if (lifecycleListenersAdded) return;
  if (typeof window === 'undefined') return;
  lifecycleListenersAdded = true;

  window.addEventListener('pagehide', () => {
    flushDrafts();
  });

  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        flushDrafts();
      }
    });
  }
}

registerLifecycleFlushOnce();

function ensureLoaded() {
  if (loaded) return;
  loaded = true;
  registerLifecycleFlushOnce();

  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return;

    const now = Date.now();
    const validEntries = [];

    for (const [scopeKey, value] of Object.entries(parsed)) {
      if (!scopeKey || !value || typeof value !== 'object') continue;
      if (typeof value.text !== 'string') continue;
      const updatedAt = typeof value.updatedAt === 'number' && Number.isFinite(value.updatedAt)
        ? value.updatedAt
        : null;
      if (updatedAt === null || now - updatedAt > MAX_AGE_MS) continue;

      const cappedText = value.text.slice(0, MAX_DRAFT_CHARS);
      if (!cappedText.trim()) continue;

      validEntries.push([scopeKey, { text: cappedText, updatedAt }]);
    }

    validEntries.sort((a, b) => a[1].updatedAt - b[1].updatedAt);
    const recentEntries = validEntries.length > MAX_DRAFTS
      ? validEntries.slice(validEntries.length - MAX_DRAFTS)
      : validEntries;

    for (const [scopeKey, entry] of recentEntries) {
      draftsMap.set(scopeKey, entry);
    }
  } catch {
    // Ignore malformed JSON or storage access errors
  }
}

function scheduleWrite() {
  if (debounceTimer !== null) {
    clearTimeout(debounceTimer);
  }
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    writeToLocalStorage();
  }, DEBOUNCE_MS);
}

function notifyListeners() {
  for (const listener of listeners) {
    try {
      listener();
    } catch {
      // Ignore listener errors
    }
  }
}

export function channelDraftKey(userId, channelId) {
  const uid = userId ?? null;
  const cid = channelId ?? null;
  if (!uid || !cid) return null;
  return `${uid}:channel:${cid}`;
}

export function threadDraftKey(userId, parentId) {
  const uid = userId ?? null;
  const pid = parentId ?? null;
  if (!uid || !pid) return null;
  return `${uid}:thread:${pid}`;
}

export function getDraft(scopeKey) {
  const key = scopeKey ?? null;
  if (!key) return '';
  ensureLoaded();
  return draftsMap.get(key)?.text ?? '';
}

export function hasDraft(scopeKey) {
  const text = getDraft(scopeKey);
  return Boolean(text && text.trim());
}

export function setDraft(scopeKey, text) {
  const key = scopeKey ?? null;
  if (!key) return;
  ensureLoaded();

  const rawText = typeof text === 'string' ? text : '';
  const nextText = rawText.length > MAX_DRAFT_CHARS
    ? rawText.slice(0, MAX_DRAFT_CHARS)
    : rawText;

  if (!nextText.trim()) {
    if (!draftsMap.has(key)) return;
    draftsMap.delete(key);
    scheduleWrite();
    notifyListeners();
    return;
  }

  const prevText = draftsMap.get(key)?.text ?? '';
  if (prevText === nextText) return;

  draftsMap.set(key, {
    text: nextText,
    updatedAt: Date.now(),
  });

  while (draftsMap.size > MAX_DRAFTS) {
    let oldestKey = null;
    let oldestTime = Infinity;
    for (const [entryKey, entryVal] of draftsMap.entries()) {
      if (entryVal.updatedAt < oldestTime) {
        oldestTime = entryVal.updatedAt;
        oldestKey = entryKey;
      }
    }
    if (oldestKey !== null) {
      draftsMap.delete(oldestKey);
    } else {
      break;
    }
  }

  scheduleWrite();
  notifyListeners();
}

export function clearAllDrafts() {
  if (debounceTimer !== null) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
  loaded = true;
  const hadEntries = draftsMap.size > 0;
  draftsMap.clear();
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Ignore storage access errors
  }
  if (hadEntries) {
    notifyListeners();
  }
}

export function subscribeDrafts(listener) {
  ensureLoaded();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useDraft(scopeKey) {
  const normalizedKey = scopeKey ?? null;
  const getSnapshot = useCallback(
    () => (normalizedKey ? getDraft(normalizedKey) : ''),
    [normalizedKey]
  );
  return useSyncExternalStore(subscribeDrafts, getSnapshot, () => '');
}

export function useHasDraft(scopeKey) {
  const normalizedKey = scopeKey ?? null;
  const getSnapshot = useCallback(
    () => (normalizedKey ? hasDraft(normalizedKey) : false),
    [normalizedKey]
  );
  return useSyncExternalStore(subscribeDrafts, getSnapshot, () => false);
}
