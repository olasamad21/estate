import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  formatNaira,
  formatNairaShort,
  formatDateNg,
  formatTimeNg,
  formatDayLabelNg,
  formatListTimeNg,
  normalisePhoneNg,
  formatPhoneNg,
  isValidPhoneNg,
  minutesFromNow,
} from '../utils/formatters.js';
import { COMPANY_CONFIG } from '../config/market.js';

describe('formatNaira', () => {
  it('formats whole naira with thousands separators', () => {
    expect(formatNaira(285000000)).toBe('\u20A6285,000,000');
    expect(formatNaira(1500)).toBe('\u20A61,500');
    expect(formatNaira(999)).toBe('\u20A6999');
  });

  it('rounds to whole naira and handles zero and negatives', () => {
    expect(formatNaira(1500.6)).toBe('\u20A61,501');
    expect(formatNaira(0)).toBe('\u20A60');
    expect(formatNaira(-2500)).toBe('-\u20A62,500');
  });

  it('returns an empty string for non-numeric input', () => {
    expect(formatNaira(undefined)).toBe('');
    expect(formatNaira(null)).toBe('');
    expect(formatNaira(NaN)).toBe('');
    expect(formatNaira('abc')).toBe('');
  });
});

describe('formatNairaShort', () => {
  it('uses m and bn suffixes with one trimmed decimal', () => {
    expect(formatNairaShort(285000000)).toBe('\u20A6285m');
    expect(formatNairaShort(85000000)).toBe('\u20A685m');
    expect(formatNairaShort(2500000)).toBe('\u20A62.5m');
    expect(formatNairaShort(1234567)).toBe('\u20A61.2m');
    expect(formatNairaShort(1500000000)).toBe('\u20A61.5bn');
    expect(formatNairaShort(1000000000)).toBe('\u20A61bn');
  });

  it('falls back to full formatting below one million', () => {
    expect(formatNairaShort(750000)).toBe('\u20A6750,000');
    expect(formatNairaShort(999999)).toBe('\u20A6999,999');
  });
});

describe('dates and times', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date(2026, 5, 15, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('formatDateNg returns DD/MM/YYYY', () => {
    expect(formatDateNg(new Date(2026, 0, 5, 9, 7).toISOString())).toBe('05/01/2026');
    expect(formatDateNg(new Date(2026, 11, 31, 23, 59).toISOString())).toBe('31/12/2026');
  });

  it('formatTimeNg returns 12-hour time', () => {
    expect(formatTimeNg(new Date(2026, 0, 5, 15, 30).toISOString())).toBe('3:30 PM');
    expect(formatTimeNg(new Date(2026, 0, 5, 0, 5).toISOString())).toBe('12:05 AM');
    expect(formatTimeNg(new Date(2026, 0, 5, 12, 0).toISOString())).toBe('12:00 PM');
    expect(formatTimeNg(new Date(2026, 0, 5, 9, 7).toISOString())).toBe('9:07 AM');
    expect(formatTimeNg(new Date(2026, 0, 5, 23, 59).toISOString())).toBe('11:59 PM');
  });

  it('formatDayLabelNg returns Today, Yesterday or DD/MM/YYYY', () => {
    expect(formatDayLabelNg(new Date(2026, 5, 15, 9, 0).toISOString())).toBe('Today');
    expect(formatDayLabelNg(new Date(2026, 5, 14, 23, 0).toISOString())).toBe('Yesterday');
    expect(formatDayLabelNg(new Date(2026, 5, 10, 9, 0).toISOString())).toBe('10/06/2026');
    expect(formatDayLabelNg(new Date(2026, 5, 16, 9, 0).toISOString())).toBe('16/06/2026');
  });

  it('formatListTimeNg returns the time today, Yesterday, or the date', () => {
    expect(formatListTimeNg(new Date(2026, 5, 15, 15, 30).toISOString())).toBe('3:30 PM');
    expect(formatListTimeNg(new Date(2026, 5, 14, 23, 0).toISOString())).toBe('Yesterday');
    expect(formatListTimeNg(new Date(2026, 5, 10, 9, 0).toISOString())).toBe('10/06/2026');
  });

  it('date and time formatters return an empty string for missing or invalid input', () => {
    for (const input of ['', null, 'garbage']) {
      expect(formatDateNg(input)).toBe('');
      expect(formatTimeNg(input)).toBe('');
      expect(formatDayLabelNg(input)).toBe('');
      expect(formatListTimeNg(input)).toBe('');
    }
  });
});

describe('phone numbers', () => {
  it('normalisePhoneNg accepts local and international Nigerian formats', () => {
    expect(normalisePhoneNg('08030000101')).toBe('+2348030000101');
    expect(normalisePhoneNg('+234 803 000 0101')).toBe('+2348030000101');
    expect(normalisePhoneNg('2348030000101')).toBe('+2348030000101');
    expect(normalisePhoneNg('8030000101')).toBe('+2348030000101');
    expect(normalisePhoneNg('0803 000 0101')).toBe('+2348030000101');
  });

  it('normalisePhoneNg returns null for invalid and non-Nigerian numbers', () => {
    expect(normalisePhoneNg('12345')).toBeNull();
    expect(normalisePhoneNg('')).toBeNull();
    expect(normalisePhoneNg(null)).toBeNull();
    expect(normalisePhoneNg(undefined)).toBeNull();
    expect(normalisePhoneNg('+14155550123')).toBeNull();
    expect(normalisePhoneNg('234803000010')).toBeNull();
  });

  it('formatPhoneNg groups digits as +234 XXX XXX XXXX and leaves invalid input unchanged', () => {
    expect(formatPhoneNg('08030000101')).toBe('+234 803 000 0101');
    expect(formatPhoneNg('abc')).toBe('abc');
  });

  it('isValidPhoneNg mirrors normalisePhoneNg', () => {
    expect(isValidPhoneNg('08030000101')).toBe(true);
    expect(isValidPhoneNg('12345')).toBe(false);
    expect(isValidPhoneNg(null)).toBe(false);
  });
});

describe('minutesFromNow', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date(2026, 5, 15, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns ISO timestamps relative to the pinned clock', () => {
    expect(minutesFromNow(-30)).toBe(new Date(2026, 5, 15, 11, 30, 0).toISOString());
    expect(minutesFromNow(90)).toBe(new Date(2026, 5, 15, 13, 30, 0).toISOString());
    expect(minutesFromNow(0)).toBe(new Date(2026, 5, 15, 12, 0, 0).toISOString());
  });
});

describe('company config', () => {
  it('exposes naira, +234, and the company offices', () => {
    expect(COMPANY_CONFIG.currency).toBe('NGN');
    expect(COMPANY_CONFIG.currencySymbol).toBe('\u20A6');
    expect(COMPANY_CONFIG.locale).toBe('en-NG');
    expect(COMPANY_CONFIG.phoneCountryCode).toBe('+234');
    expect(COMPANY_CONFIG.timeZone).toBe('Africa/Lagos');
    expect(COMPANY_CONFIG.offices.map((o) => o.id)).toEqual(['hq', 'lugbe', 'port-harcourt']);
    expect(COMPANY_CONFIG.offices.map((o) => o.name)).toEqual(['Head Quarters', 'Lugbe', 'Port Harcourt']);
    const hq = COMPANY_CONFIG.offices.find((o) => o.id === 'hq');
    const lugbe = COMPANY_CONFIG.offices.find((o) => o.id === 'lugbe');
    const ph = COMPANY_CONFIG.offices.find((o) => o.id === 'port-harcourt');
    expect(hq.consentLabel).toBe("Minister's Consent");
    expect(lugbe.consentLabel).toBe("Minister's Consent");
    expect(ph.consentLabel).toBe("Governor's Consent");
  });
});
