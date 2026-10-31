import { MARKET_CONFIG } from '../config/market.js';

/**
 * Returns an ISO timestamp for N days from current time (positive for future, negative for past)
 */
export function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
}

/**
 * Returns an ISO timestamp for N hours from current time (positive for future, negative for past)
 */
export function hoursFromNow(n) {
  const d = new Date();
  d.setTime(d.getTime() + n * 3600 * 1000);
  return d.toISOString();
}

/**
 * Computes remaining calendar days until target ISO date
 */
export function daysUntil(iso) {
  if (!iso) return 0;
  const target = new Date(iso);
  const now = new Date();
  const targetMidnight = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffMs = targetMidnight.getTime() - nowMidnight.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Dynamically computes escrow timeline progress from start ISO and total days
 */
export function escrowProgress(startIso, totalDays = 30) {
  if (!startIso) return { currentDay: 0, totalDays, label: `Day 0/${totalDays}` };
  const start = new Date(startIso);
  const now = new Date();
  const startMidnight = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const elapsedDays = Math.max(0, Math.floor((nowMidnight.getTime() - startMidnight.getTime()) / (1000 * 60 * 60 * 24)));
  const currentDay = Math.min(elapsedDays + 1, totalDays);
  return {
    currentDay,
    totalDays,
    label: `Day ${currentDay}/${totalDays}`,
  };
}

/**
 * Formats an ISO string to a localized date string
 */
export function formatDate(iso, options = {}) {
  if (!iso) return '';
  const date = new Date(iso);
  const defaultOptions = {
    month: 'short',
    day: 'numeric',
    ...options,
  };
  return new Intl.DateTimeFormat(MARKET_CONFIG.locale || 'en-US', defaultOptions).format(date);
}

/**
 * Formats a numeric value into currency using the configured market locale and currency.
 * Always formats via IntlNumberFormat, including 0 on invalid input.
 */
export function formatCurrency(amount) {
  const numericValue = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  return new Intl.NumberFormat(MARKET_CONFIG.locale || 'en-US', {
    style: 'currency',
    currency: MARKET_CONFIG.currency || 'USD',
    maximumFractionDigits: 0,
  }).format(numericValue);
}

/**
 * Formats an ISO timestamp to human-readable relative time
 */
export function formatRelativeTime(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(iso, { month: 'short', day: 'numeric' });
}

/**
 * Computes dynamic stage label based on deal state and relative dates
 */
export function getStageLabel(deal) {
  if (!deal) return '';
  if (deal.stage === 'in_escrow') {
    const progress = escrowProgress(deal.contractStartDate, deal.escrowTotalDays || 30);
    return `Under contract, ${progress.label}`;
  }
  if (deal.stage === 'active_offer') {
    if (!deal.offerExpiresAt) return 'Offer pending';
    const remaining = daysUntil(deal.offerExpiresAt);
    if (remaining <= 0) return 'Offer pending, responds today';
    if (remaining === 1) return 'Offer pending, responds in 1 day';
    return `Offer pending, responds in ${remaining} days`;
  }
  if (deal.stage === 'closed') {
    const closedDateStr = formatDate(deal.contractClosingDate || deal.contractStartDate);
    return `Closed ${closedDateStr}`;
  }
  return 'Active';
}

/**
 * Maps application route paths to human-friendly page labels
 */
export function getFriendlyPageLabel(pathname) {
  if (!pathname || pathname === '/' || pathname === '/channels') {
    return 'Channels';
  }
  if (pathname.startsWith('/channels/')) {
    return 'Chat';
  }
  if (pathname === '/login') {
    return 'Login';
  }
  return 'Page';
}

// Staff app (Nigeria) formatters
const NAIRA = '\u20A6';

function addThousandsSeparators(intStr) {
  return intStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function minutesFromNow(n) {
  const d = new Date();
  d.setTime(d.getTime() + n * 60 * 1000);
  return d.toISOString();
}

export function formatNaira(amount) {
  if (typeof amount !== 'number' || !Number.isFinite(amount)) return '';
  const rounded = Math.round(amount);
  const isNegative = rounded < 0;
  const absStr = Math.abs(rounded).toString();
  const formatted = addThousandsSeparators(absStr);
  return isNegative ? `-${NAIRA}${formatted}` : `${NAIRA}${formatted}`;
}

export function formatNairaShort(amount) {
  if (typeof amount !== 'number' || !Number.isFinite(amount)) return '';
  if (amount >= 1e9) {
    const val = (amount / 1e9).toFixed(1).replace(/\.0$/, '');
    return `${NAIRA}${val}bn`;
  }
  if (amount >= 1e6) {
    const val = (amount / 1e6).toFixed(1).replace(/\.0$/, '');
    return `${NAIRA}${val}m`;
  }
  return formatNaira(amount);
}

export function formatDateNg(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  if (isNaN(date.getTime())) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function formatTimeNg(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  if (isNaN(date.getTime())) return '';
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return `${hours}:${minutes} ${period}`;
}

export function formatDayLabelNg(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  if (isNaN(date.getTime())) return '';
  const diff = daysUntil(iso);
  if (diff === 0) return 'Today';
  if (diff === -1) return 'Yesterday';
  return formatDateNg(iso);
}

export function formatListTimeNg(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  if (isNaN(date.getTime())) return '';
  const diff = daysUntil(iso);
  if (diff === 0) return formatTimeNg(iso);
  if (diff === -1) return 'Yesterday';
  return formatDateNg(iso);
}

export function normalisePhoneNg(input) {
  if (typeof input !== 'string') return null;
  const digits = input.replace(/\D/g, '');
  if (digits.length === 13 && digits.startsWith('234')) {
    return `+234${digits.slice(3)}`;
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return `+234${digits.slice(1)}`;
  }
  if (digits.length === 10) {
    return `+234${digits}`;
  }
  return null;
}

export function formatPhoneNg(input) {
  if (input === null || input === undefined) return '';
  const normalised = normalisePhoneNg(input);
  if (!normalised) return input;
  const national = normalised.slice(4);
  return `+234 ${national.slice(0, 3)} ${national.slice(3, 6)} ${national.slice(6)}`;
}

export function isValidPhoneNg(input) {
  return normalisePhoneNg(input) !== null;
}
