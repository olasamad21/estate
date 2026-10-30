import { getRoleSafeDeal } from './access.js';
import { getStageLabel, daysUntil, escrowProgress, formatRelativeTime } from './formatters.js';
import { PERMISSIONS, PARTICIPANTS } from '../mock/roles.js';
import { LISTINGS } from '../mock/listings.js';

export const DEAL_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'offers', label: 'Offers' },
  { id: 'escrow', label: 'Under contract' },
  { id: 'closed', label: 'Closed' },
];

/**
 * Pure filter function for deals collection
 */
export function filterDeals(deals = [], filter = 'all') {
  if (!Array.isArray(deals)) return [];
  switch (filter) {
    case 'offers':
      return deals.filter((d) => d.stage === 'active_offer');
    case 'escrow':
      return deals.filter((d) => d.stage === 'in_escrow');
    case 'closed':
      return deals.filter((d) => d.stage === 'closed');
    case 'all':
    default:
      return [...deals];
  }
}

/**
 * Computes deal count per filter category
 */
export function countByFilter(deals = []) {
  if (!Array.isArray(deals)) return { all: 0, offers: 0, escrow: 0, closed: 0 };
  return {
    all: deals.length,
    offers: deals.filter((d) => d.stage === 'active_offer').length,
    escrow: deals.filter((d) => d.stage === 'in_escrow').length,
    closed: deals.filter((d) => d.stage === 'closed').length,
  };
}

/**
 * Calculates deal urgency state based on stage and critical timeline milestones
 */
export function getDealUrgency(deal) {
  if (!deal) return 'normal';
  if (deal.stage === 'closed') return 'closed';

  if (deal.stage === 'active_offer') {
    if (deal.offerExpiresAt) {
      const daysLeft = daysUntil(deal.offerExpiresAt);
      if (daysLeft <= 1) return 'urgent';
    }
    return 'normal';
  }

  if (deal.stage === 'in_escrow') {
    if (deal.contractClosingDate) {
      const daysToClose = daysUntil(deal.contractClosingDate);
      if (daysToClose <= 7) return 'soon';
    }
    return 'normal';
  }

  return 'normal';
}

/**
 * Sorts deals by business urgency:
 * 1. active_offer (soonest offerExpiresAt; missing expiry last)
 * 2. in_escrow (soonest contractClosingDate)
 * 3. closed (most recent first)
 * Ties broken by deal id.
 */
export function sortDealsByUrgency(deals = []) {
  if (!Array.isArray(deals)) return [];

  const stageRank = {
    active_offer: 1,
    in_escrow: 2,
    closed: 3,
  };

  return [...deals].sort((a, b) => {
    const rankA = stageRank[a.stage] || 99;
    const rankB = stageRank[b.stage] || 99;

    if (rankA !== rankB) {
      return rankA - rankB;
    }

    if (a.stage === 'active_offer') {
      const timeA = a.offerExpiresAt ? new Date(a.offerExpiresAt).getTime() : Infinity;
      const timeB = b.offerExpiresAt ? new Date(b.offerExpiresAt).getTime() : Infinity;
      if (timeA !== timeB) return timeA - timeB;
    }

    if (a.stage === 'in_escrow') {
      const timeA = a.contractClosingDate ? new Date(a.contractClosingDate).getTime() : Infinity;
      const timeB = b.contractClosingDate ? new Date(b.contractClosingDate).getTime() : Infinity;
      if (timeA !== timeB) return timeA - timeB;
    }

    if (a.stage === 'closed') {
      const timeA = a.contractClosingDate
        ? new Date(a.contractClosingDate).getTime()
        : a.contractStartDate
          ? new Date(a.contractStartDate).getTime()
          : 0;
      const timeB = b.contractClosingDate
        ? new Date(b.contractClosingDate).getTime()
        : b.contractStartDate
          ? new Date(b.contractStartDate).getTime()
          : 0;
      if (timeA !== timeB) return timeB - timeA;
    }

    return (a.id || '').localeCompare(b.id || '');
  });
}

/**
 * Retrieves the latest message for a deal from messages collection
 */
export function getLastMessage(messages, dealId) {
  if (!messages || !dealId) return null;
  let dealMsgs = [];
  if (Array.isArray(messages)) {
    dealMsgs = messages.filter((m) => m.dealId === dealId);
  } else if (typeof messages === 'object' && Array.isArray(messages[dealId])) {
    dealMsgs = messages[dealId];
  }
  if (!dealMsgs.length) return null;

  return [...dealMsgs].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )[0];
}

const PRICE_LABELS = {
  active_offer: 'Offer',
  in_escrow: 'Contract price',
  closed: 'Sold for',
};

/**
 * Prepares a role-safe deal card view model
 */
export function getDealCardModel(
  role,
  deal,
  { lastMessage = null, participants = PARTICIPANTS, listings = LISTINGS } = {}
) {
  const safeDeal = getRoleSafeDeal(role, deal);
  if (!safeDeal) return null;

  const permissions = PERMISSIONS[role] || {};
  const listing = listings.find((l) => l.id === safeDeal.listingId);
  const address = listing?.address || safeDeal.address || 'Deal Room';
  const stageLabel = getStageLabel(safeDeal);
  const urgency = getDealUrgency(safeDeal);
  const priceLabel = PRICE_LABELS[safeDeal.stage] || 'Offer';

  // Map participant objects
  const dealParticipants = (safeDeal.participantIds || []).map((pId) => {
    const p = participants[pId];
    if (p) {
      return {
        id: p.id,
        name: p.name,
        initials: p.initials || (p.name ? p.name.split(' ').map((n) => n[0]).join('').slice(0, 2) : '??'),
        role: p.role || 'agent',
      };
    }
    return {
      id: pId,
      name: pId,
      initials: '??',
      role: 'agent',
    };
  });

  // Escrow progress (in_escrow only)
  let progressModel = null;
  if (safeDeal.stage === 'in_escrow') {
    const rawProgress = escrowProgress(safeDeal.contractStartDate, safeDeal.escrowTotalDays);
    progressModel = {
      day: rawProgress.currentDay,
      total: rawProgress.totalDays,
      percent: Math.round((rawProgress.currentDay / rawProgress.totalDays) * 100),
    };
  }

  // Active role's unread message count (never expose unreadCountByRole)
  const unreadCount = safeDeal.unreadCountByRole?.[role] ?? 0;

  // Next deadline (when contingency is present and deal is NOT closed)
  let nextDeadline = null;
  if (safeDeal.stage !== 'closed' && safeDeal.contingency && safeDeal.contingency.dueDate) {
    const daysLeft = daysUntil(safeDeal.contingency.dueDate);
    const overdueDays = Math.abs(daysLeft);
    const label =
      daysLeft < 0
        ? overdueDays === 1
          ? 'overdue by 1 day'
          : `overdue by ${overdueDays} days`
        : daysLeft === 0
          ? 'due today'
          : daysLeft === 1
            ? 'due tomorrow'
            : `due in ${daysLeft} days`;

    const urgent = daysLeft < 0 || safeDeal.contingency.status === 'urgent';

    nextDeadline = {
      title: safeDeal.contingency.title,
      label,
      urgent,
    };
  }

  // Last message formatted
  let formattedMessage = null;
  if (lastMessage) {
    let senderFirstName = 'User';
    if (lastMessage.senderId === 'system') {
      senderFirstName = 'System';
    } else if (participants[lastMessage.senderId]?.name) {
      senderFirstName = participants[lastMessage.senderId].name.split(' ')[0];
    }

    formattedMessage = {
      senderFirstName,
      preview: lastMessage.content || '',
      relativeTime: formatRelativeTime(lastMessage.timestamp),
    };
  }

  const model = {
    id: safeDeal.id,
    address,
    stage: safeDeal.stage,
    stageLabel,
    urgency,
    participants: dealParticipants,
    escrowProgress: progressModel,
    unreadCount,
    nextDeadline,
    priceLabel,
    lastMessage: formattedMessage,
  };

  // Commission (only when allowed and present on safeDeal)
  if (safeDeal.commissionAmount !== undefined) {
    model.commission = {
      amount: safeDeal.commissionAmount,
      rate: safeDeal.commissionRate,
    };
  }

  // Offer amount (only when canViewOfferAmounts and field exists)
  if (
    permissions.canViewOfferAmounts &&
    (safeDeal.acceptedOfferPrice || safeDeal.pendingOfferPrice)
  ) {
    model.offerAmount = safeDeal.acceptedOfferPrice || safeDeal.pendingOfferPrice;
  }

  return model;
}
