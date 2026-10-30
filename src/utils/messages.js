/**
 * Pure functions returning user-facing toast and feedback notification messages.
 * Centralized to guarantee:
 * 1. Zero raw database/mock identifiers (e.g., deal_*, usr_*, lead_*) leaked to UI.
 * 2. Zero property addresses leaked when access is denied.
 * 3. Consistent, predictable phrasing across the entire application shell.
 */

export function getAccessDeniedMessage(roleOrName) {
  const name = roleOrName || 'User';
  return `${name} doesn't have access to that deal room. Back on Deals.`;
}

export function getSimulatedLeadMessage(agentName, address, switchedToAgent = false) {
  return switchedToAgent
    ? `Switched to ${agentName} (Agent). New lead: ${address}.`
    : `New lead: ${address}`;
}

export function getLeadPhase7Message() {
  return 'Lead handling arrives in Phase 7';
}

export function getAllNotificationsReadMessage() {
  return 'All notifications marked as read';
}

export function getFeedbackSavedMessage() {
  return 'Feedback saved';
}

export function getFeedbackCopiedMessage() {
  return 'Feedback log copied to clipboard';
}

export function getFeedbackCopyFailedMessage() {
  return 'Unable to copy to clipboard';
}

export function getDemoResetMessage() {
  return 'Demo reset';
}
