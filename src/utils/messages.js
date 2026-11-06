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

export function getAccessRequestApprovedMessage() {
  return 'Approved. An activation email is ready to send.';
}

export function getBrowserCannotSetPasswordMessage() {
  return 'This browser cannot set a password in the demo';
}

export function getAccountActivatedMessage() {
  return 'Account activated. Welcome.';
}

export function getPasswordUpdatedSignInMessage() {
  return 'Password updated. Sign in with your new password.';
}

export function getPasswordUpdatedMessage() {
  return 'Password updated.';
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
  return status ? `Property status updated to ${status}` : 'Property status updated';
}

export function getListingRoomCreatedMessage(title = '') {
  return title ? `Property created for ${title}` : 'Property created';
}

export function getListingDetailsUpdatedMessage() {
  return 'Property details updated';
}

export function getLoggedOutMessage() {
  return 'You have been logged out';
}

export function getTextSizeChangedMessage(label = 'Standard') {
  return `Text size set to ${label}`;
}

export function getEnterKeyChangedMessage(label = 'Automatic') {
  return `Enter key set to ${label}`;
}

export function getSwitchedPersonaMessage(name = '') {
  return name ? `Switched to ${name}` : 'Switched persona';
}

export function getLeadPostedMessage() {
  return 'Lead posted';
}

export function getListingSharedMessage() {
  return 'Property shared';
}

export function getListingSharedInChannelMessage(channelName = '') {
  const clean = String(channelName || '').replace(/^#/, '').trim();
  return clean ? `Property shared in #${clean}` : 'Property shared in channel';
}

export function getChannelAdminAddedMessage(name = 'Member') {
  return `${name} is now a channel admin`;
}

export function getChannelAdminRemovedMessage(name = 'Member') {
  return `${name} removed as channel admin`;
}

export function getChannelSendPolicyChangedMessage(policy = 'everyone') {
  return policy === 'admins'
    ? 'Only admins can send messages'
    : 'Everyone can now send messages';
}

export function getCannotRemoveOnlyAdminMessage() {
  return 'A channel must have at least one admin.';
}

export function getDirectMessageRestrictedMessage() {
  return 'Direct messages with executive management are restricted. Please ask your manager, or post in a channel your team shares.';
}

export function getSiteCreatedMessage(title = '') {
  return title ? `${title} created` : 'Site created';
}

export function getSiteUpdatedMessage(title = '') {
  return title ? `${title} updated` : 'Site updated';
}

export function getPropertyCreatedMessage(title = '') {
  return title ? `${title} added` : 'Property added';
}

export function getPropertyUpdatedMessage(title = '') {
  return title ? `${title} updated` : 'Property updated';
}

export function getLinkCopiedMessage() {
  return 'Link copied to clipboard';
}

export function getActivationLinkCopiedMessage() {
  return 'Activation link copied to clipboard';
}

export function getActivationLinkSentMessage(name = '') {
  return name ? `Activation link sent to ${name}` : 'Activation link sent';
}

export function getPasswordResetLinkSentMessage(name = '') {
  return name ? `Password reset link sent to ${name}` : 'Password reset link sent';
}

export function getStaffImportedMessage(count = 0) {
  return count === 1 ? '1 staff account created' : `${count} staff accounts created`;
}

export function getAndroidAppDemoDownloadMessage() {
  return 'Demo only. The real download link is added at handover.';
}


