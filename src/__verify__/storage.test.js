import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

class FakeStorage {
  constructor() {
    this._map = new Map();
  }

  getItem(key) {
    const val = this._map.get(String(key));
    return val !== undefined ? val : null;
  }

  setItem(key, value) {
    this._map.set(String(key), String(value));
  }

  removeItem(key) {
    this._map.delete(String(key));
  }

  key(index) {
    const keys = Array.from(this._map.keys());
    return keys[index] !== undefined ? keys[index] : null;
  }

  get length() {
    return this._map.size;
  }
}

describe('Storage wrapper (storage.js)', () => {
  let localFake;
  let sessionFake;

  beforeEach(() => {
    vi.resetModules();
    localFake = new FakeStorage();
    sessionFake = new FakeStorage();
    vi.stubGlobal('window', {
      localStorage: localFake,
      sessionStorage: sessionFake,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('removes stale prefixed keys and writes the new version when the stored version differs', async () => {
    localFake.setItem('staffchat_proto_storage_version', 'v1.0.0');
    localFake.setItem('staffchat_proto_active_role', '"agent"');
    localFake.setItem('other_app_key', 'keep');
    sessionFake.setItem('staffchat_proto_alerts', '[]');

    await import('../utils/storage.js');

    expect(localFake.getItem('staffchat_proto_storage_version')).toBe('v2.0.0');
    expect(localFake.getItem('staffchat_proto_active_role')).toBeNull();
    expect(sessionFake.getItem('staffchat_proto_alerts')).toBeNull();
    expect(localFake.getItem('other_app_key')).toBe('keep');
  });

  it('removes legacy dealroom_proto_ keys from both storages on load', async () => {
    localFake.setItem('dealroom_proto_active_role', '"agent"');
    localFake.setItem('dealroom_proto_storage_version', 'v1.3.0');
    localFake.setItem('other_app_key', 'keep');
    sessionFake.setItem('dealroom_proto_alerts', '[]');
    sessionFake.setItem('other_app_key', 'keep');

    await import('../utils/storage.js');

    expect(localFake.getItem('dealroom_proto_active_role')).toBeNull();
    expect(localFake.getItem('dealroom_proto_storage_version')).toBeNull();
    expect(sessionFake.getItem('dealroom_proto_alerts')).toBeNull();
    expect(localFake.getItem('other_app_key')).toBe('keep');
    expect(sessionFake.getItem('other_app_key')).toBe('keep');
  });

  it('leaves a matching stored version and existing prefixed keys untouched', async () => {
    localFake.setItem('staffchat_proto_storage_version', 'v2.0.0');
    localFake.setItem('staffchat_proto_active_role', '"agent"');

    await import('../utils/storage.js');

    expect(localFake.getItem('staffchat_proto_active_role')).toBe('"agent"');
  });

  it('safeSessionStorage.clear removes only prefixed keys', async () => {
    const { safeSessionStorage } = await import('../utils/storage.js');
    safeSessionStorage.set('a', 1);
    safeSessionStorage.set('b', { x: 2 });
    sessionFake.setItem('other_app_key', 'keep');

    expect(sessionFake.getItem('staffchat_proto_a')).toBe('1');
    expect(sessionFake.getItem('staffchat_proto_b')).toBe('{"x":2}');
    expect(sessionFake.length).toBe(3);

    safeSessionStorage.clear();

    expect(sessionFake.getItem('staffchat_proto_a')).toBeNull();
    expect(sessionFake.getItem('staffchat_proto_b')).toBeNull();
    expect(sessionFake.getItem('other_app_key')).toBe('keep');
    expect(sessionFake.length).toBe(1);
  });

  it('safeLocalStorage round-trips JSON values and returns the default for missing or malformed values', async () => {
    const { safeLocalStorage } = await import('../utils/storage.js');
    safeLocalStorage.set('k', { a: [1, 2] });
    expect(safeLocalStorage.get('k')).toEqual({ a: [1, 2] });
    expect(safeLocalStorage.get('missing', 'dflt')).toBe('dflt');
    expect(safeLocalStorage.get('missing')).toBeNull();
    localFake.setItem('staffchat_proto_bad', '{not json');
    expect(safeLocalStorage.get('bad', 'fallback')).toBe('fallback');
    safeLocalStorage.remove('k');
    expect(safeLocalStorage.get('k')).toBeNull();
  });

  it('clearDemoStorage removes prefixed keys from both storages, keeps others, and restores the version key', async () => {
    const { safeLocalStorage } = await import('../utils/storage.js');
    localFake.setItem('staffchat_proto_key1', 'val1');
    localFake.setItem('other_app_key', 'keep');
    sessionFake.setItem('staffchat_proto_key2', 'val2');
    sessionFake.setItem('other_app_key', 'keep');

    safeLocalStorage.clearDemoStorage();

    expect(localFake.getItem('staffchat_proto_key1')).toBeNull();
    expect(sessionFake.getItem('staffchat_proto_key2')).toBeNull();
    expect(localFake.getItem('other_app_key')).toBe('keep');
    expect(sessionFake.getItem('other_app_key')).toBe('keep');
    expect(localFake.getItem('staffchat_proto_storage_version')).toBe('v2.0.0');
  });

  it('returns defaults and does not throw when window is undefined', async () => {
    vi.unstubAllGlobals();
    const { safeLocalStorage, safeSessionStorage } = await import('../utils/storage.js');
    expect(safeLocalStorage.get('x', 'd')).toBe('d');
    expect(safeLocalStorage.set('x', 1)).toBe(false);
    expect(safeSessionStorage.set('x', 1)).toBe(false);
    expect(() => safeLocalStorage.remove('x')).not.toThrow();
    expect(() => safeSessionStorage.remove('x')).not.toThrow();
  });
});
