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
  if (!pathname || pathname === '/' || pathname === '/deals') {
    return 'Deals';
  }
  if (pathname.startsWith('/deals/')) {
    return 'Deal room';
  }
  return 'Page';
}
