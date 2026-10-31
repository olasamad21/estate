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
