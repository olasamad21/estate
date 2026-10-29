import { PERMISSIONS, ROLE_DETAILS } from '../mock/roles.js';

/**
 * Returns the active participant ID corresponding to a given role
 */
export function getParticipantIdForRole(role) {
  return ROLE_DETAILS[role]?.participantId || null;
}

/**
 * Sanitizes a deal object based on role visibility rules.
 * Strips private agent notes and commission details for unauthorized roles.
 */
export function getRoleSafeDeal(role, deal) {
  if (!deal) return null;
  const safeDeal = { ...deal };
  const permissions = PERMISSIONS[role] || {};

  if (!permissions.canViewPrivateNotes) {
    delete safeDeal.privateAgentNotes;
  }

  if (!permissions.canViewCommission) {
    delete safeDeal.commissionRate;
    delete safeDeal.commissionAmount;
  }

  return safeDeal;
}

/**
 * Filters the list of deals visible to the given role
 * Agent sees all deals; buyers, sellers, and lenders only see deals where they are participants.
 */
export function getVisibleDeals(role, deals = []) {
  const permissions = PERMISSIONS[role] || {};
  if (permissions.canSeeAllDealRooms) {
    return deals.map((d) => getRoleSafeDeal(role, d));
  }

  const participantId = getParticipantIdForRole(role);
  if (!participantId) return [];

  return deals
    .filter((d) => Array.isArray(d.participantIds) && d.participantIds.includes(participantId))
    .map((d) => getRoleSafeDeal(role, d));
}

/**
 * Checks whether a given role has permission to access a specific deal room
 */
export function canAccessDeal(role, dealId, deals = []) {
  if (!dealId || !Array.isArray(deals)) return false;
  const deal = deals.find((d) => d.id === dealId);
  if (!deal) return false;

  const permissions = PERMISSIONS[role] || {};
  if (permissions.canSeeAllDealRooms) return true;

  const participantId = getParticipantIdForRole(role);
  return Boolean(participantId && Array.isArray(deal.participantIds) && deal.participantIds.includes(participantId));
}
