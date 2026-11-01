/**
 * Pure functions returning user-facing toast and feedback notification messages.
 * Centralized to guarantee:
 * 1. Zero raw database/mock identifiers leaked to UI.
 * 2. Consistent, predictable phrasing across the entire application shell.
 */

export function getAccessDeniedMessage(roleOrName) {
  const name = roleOrName || 'User';
  return `${name} doesn't have access to that channel.`;
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

export function getMessagePinnedMessage() {
  return 'Message pinned to channel';
}

export function getMessageUnpinnedMessage() {
  return 'Message unpinned';
}

export function getMessageDeletedMessage() {
  return 'Message deleted';
}

export function getMessageCopiedMessage() {
  return 'Message copied to clipboard';
}

export function getBackOnlineMessage(count = 0) {
  return count > 0
    ? `Back online. ${count} queued message${count === 1 ? '' : 's'} sent.`
    : 'Back online';
}

export function getFileDownloadStartedMessage(fileName = '') {
  return fileName ? `Downloading ${fileName}...` : 'Download started';
}

export function getNoDirectMessageToast(name = '') {
  return name ? `No direct message with ${name} yet` : 'No direct message with user yet';
}

export function getChannelMutedMessage(channelName = '') {
  return `Muted #${channelName}`;
}

export function getChannelUnmutedMessage(channelName = '') {
  return `Unmuted #${channelName}`;
}

export function getStaffAddedMessage(name = 'Staff member') {
  return `${name} added to workspace`;
}

export function getStaffUpdatedMessage(name = 'Staff member') {
  return `${name}'s role and office updated`;
}

export function getStaffDeactivatedMessage(name = 'Staff member') {
  return `${name} deactivated`;
}

export function getStaffReactivatedMessage(name = 'Staff member') {
  return `${name} reactivated`;
}

export function getChannelCreatedMessage(name = 'channel') {
  return `#${name} created`;
}

export function getChannelArchivedMessage(name = 'channel') {
  return `#${name} archived`;
}

export function getChannelUnarchivedMessage(name = 'channel') {
  return `#${name} unarchived`;
}

export function getAdminAccessDeniedMessage() {
  return 'Only administrators can access the admin workspace.';
}

export function getDeactivatedLoginErrorMessage() {
  return 'This account has been deactivated. Please contact your admin.';
}

export function getPendingRequestLoginErrorMessage() {
  return 'Your request is waiting for approval.';
}

export function getDeclinedRequestLoginErrorMessage() {
  return 'Your request was not approved. Please contact your admin.';
}

export function getUnregisteredPhoneLoginErrorMessage() {
  return 'This number is not registered. Request access below.';
}

export function getAccessRequestApprovedMessage(name = '') {
  return name ? `${name} approved and added to workspace` : 'Access request approved';
}

export function getAccessRequestDeclinedMessage(name = '') {
  return name ? `${name}'s request declined` : 'Access request declined';
}

export function getLeadClaimedMessage(clientName = '') {
  return clientName ? `Lead for ${clientName} claimed` : 'Lead claimed';
}

export function getLeadSimulatedMessage(area = '') {
  return area ? `New lead generated in ${area}` : 'New lead generated';
}

export function getListingStatusUpdatedMessage(status = '') {
  return status ? `Listing status updated to ${status}` : 'Listing status updated';
}

export function getLoggedOutMessage() {
  return 'You have been logged out';
}

export function getSwitchedPersonaMessage(name = '') {
  return name ? `Switched to ${name}` : 'Switched persona';
}
