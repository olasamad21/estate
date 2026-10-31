/**
 * Pure utility functions for staff messaging, channel visibility, and unread computation.
 */

/**
 * Returns the list of channels visible to the given staff user.
 * Visibility rules:
 * - Open kinds ('public', 'announcement', 'listing') are visible to all staff.
 * - 'private' channels are visible to their members AND to any admin.
 * - 'dm' and 'group' channels are visible to their members ONLY (admin cannot view other people's DMs).
 */
export function visibleChannelsFor(user, channels = []) {
  if (!user || !Array.isArray(channels)) return [];

  return channels.filter((ch) => {
    if (!ch) return false;
    const kind = ch.kind || 'public';

    if (kind === 'public' || kind === 'announcement' || kind === 'listing') {
      return true;
    }

    if (kind === 'private') {
      if (user.role === 'admin') return true;
      return Array.isArray(ch.members) && ch.members.includes(user.id);
    }

    if (kind === 'dm' || kind === 'group') {
      return Array.isArray(ch.members) && ch.members.includes(user.id);
    }

    return false;
  });
}

/**
 * Determines whether a user can post a message to a channel.
 * - 'announcement': Only admin and managers can post.
 * - 'private': Members and admin can post.
 * - 'dm', 'group': Only members can post.
 * - 'public', 'listing': All staff can post.
 */
export function canPost(user, channel) {
  if (!user || !channel) return false;
  const kind = channel.kind || 'public';

  if (kind === 'announcement') {
    return user.role === 'admin' || user.role === 'manager';
  }

  if (kind === 'private') {
    if (user.role === 'admin') return true;
    return Array.isArray(channel.members) && channel.members.includes(user.id);
  }

  if (kind === 'dm' || kind === 'group') {
    return Array.isArray(channel.members) && channel.members.includes(user.id);
  }

  return true;
}

/**
 * Resolves the user-facing display name of a channel for a specific viewer.
 * Direct messages show the OTHER person's name.
 */
export function channelDisplayName(channel, viewerId, staffList = []) {
  if (!channel) return '';

  if (channel.kind === 'dm' && Array.isArray(channel.members)) {
    const otherId = channel.members.find((id) => id !== viewerId) || channel.members[0];
    const staffMap = Array.isArray(staffList)
      ? Object.fromEntries(staffList.map((s) => [s.id, s]))
      : staffList;
    const otherStaff = staffMap[otherId];
    return otherStaff ? otherStaff.name : (channel.name || 'Direct Message');
  }

  return channel.name || channel.id || '';
}

/**
 * Groups channels by logical categories for sidebar rendering.
 */
export function groupChannels(channels = []) {
  const result = {
    channels: [],
    private: [],
    listings: [],
    directMessages: [],
  };

  channels.forEach((ch) => {
    if (ch.kind === 'public' || ch.kind === 'announcement') {
      result.channels.push(ch);
    } else if (ch.kind === 'private') {
      result.private.push(ch);
    } else if (ch.kind === 'listing') {
      result.listings.push(ch);
    } else if (ch.kind === 'dm' || ch.kind === 'group') {
      result.directMessages.push(ch);
    }
  });

  return result;
}

/**
 * Computes the number of unread messages for a user in a given channel.
 * Sender's own messages and system messages do not count as unread.
 */
export function unreadCount(channelId, messages = [], lastReadAt = null, currentUserId = null) {
  if (!channelId || !Array.isArray(messages)) return 0;
  const threshold = lastReadAt || new Date(0).toISOString();

  return messages.filter((m) => {
    if (m.channelId !== channelId) return false;
    if (currentUserId && m.senderId === currentUserId) return false;
    if (m.type === 'system' || m.senderId === 'system') return false;
    return m.createdAt > threshold;
  }).length;
}

/**
 * Returns the most recent message in a channel, or null.
 */
export function lastMessage(channelId, messages = []) {
  if (!channelId || !Array.isArray(messages)) return null;
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].channelId === channelId) {
      return messages[i];
    }
  }
  return null;
}

/**
 * Determines if a message mentions a specific user.
 * Checks for @Firstname (e.g. @Chidi, @Adaeze) or @all.
 */
export function mentionsUser(message, user) {
  if (!message || !message.text || !user || !user.name) return false;
  const firstName = user.name.split(' ')[0];
  const regex = new RegExp(`@(?:${firstName}|all)\\b`, 'i');
  return regex.test(message.text);
}
