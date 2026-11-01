/**
 * Pure utility functions for staff messaging, channel visibility, and unread computation.
 */
import { normalisePhoneNg } from './formatters.js';

/**
 * Checks if a staff user is active (not deactivated).
 */
export function isStaffActive(user) {
  if (!user) return false;
  return user.active !== false && user.status !== 'deactivated';
}

/**
 * Pure helpers for role-based permissions and office choices.
 */
export function canUseAdmin(user) {
  return Boolean(user && user.role === 'admin' && isStaffActive(user));
}

export function canCreateChannels(user) {
  return Boolean(
    user && (user.role === 'admin' || user.role === 'manager') && isStaffActive(user)
  );
}

export function canArchiveChannels(user) {
  return Boolean(user && user.role === 'admin' && isStaffActive(user));
}

export function slugify(text = '') {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function isChannelNameValid(name = '') {
  if (typeof name !== 'string') return false;
  const trimmed = name.trim();
  if (trimmed.length < 2 || trimmed.length > 50) return false;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(trimmed);
}

export function officeChoicesFor(user) {
  if (!user || !isStaffActive(user)) return [];
  if (user.role === 'admin') {
    return [
      { id: null, label: 'Company-wide' },
      { id: 'lagos', label: 'Lagos office' },
      { id: 'abuja', label: 'Abuja office' },
    ];
  }
  if (user.role === 'manager') {
    const userOffice = user.officeId || user.office || 'lagos';
    const label = userOffice === 'abuja' ? 'Abuja office' : 'Lagos office';
    return [{ id: userOffice, label }];
  }
  return [];
}

/**
 * Exactly ONE function that decides whether a person can see a channel.
 * Rule:
 * - Deactivated staff cannot see any channel.
 * - open kinds (public, announcement, listing) with officeId null: every active staff member;
 * - open kinds with an officeId: admin, or staff whose officeId equals the channel's officeId;
 * - private: members, and the admin;
 * - dm and group: members only (nobody else, not even the admin).
 */
export function canUserSeeChannel(user, channel) {
  if (!user || !channel) return false;
  if (!isStaffActive(user)) return false;

  const isAdmin = user.role === 'admin';
  const kind = channel.kind || 'public';
  const userOffice = user.officeId || user.office || null;
  const channelOffice = channel.officeId || null;

  // dm and group: members only (nobody else, not even the admin)
  if (kind === 'dm' || kind === 'group') {
    return Array.isArray(channel.members) && channel.members.includes(user.id);
  }

  // private: members, and the admin
  if (kind === 'private') {
    return isAdmin || (Array.isArray(channel.members) && channel.members.includes(user.id));
  }

  // open kinds: public, announcement, listing
  if (kind === 'public' || kind === 'announcement' || kind === 'listing') {
    // with officeId null: every active staff member
    if (!channelOffice) {
      return true;
    }
    // with an officeId: admin, or staff whose officeId equals the channel's officeId
    return isAdmin || userOffice === channelOffice;
  }

  return false;
}

/**
 * Returns the list of channels visible to the given staff user using the one visibility rule.
 */
export function visibleChannelsFor(user, channels = []) {
  if (!user || !Array.isArray(channels)) return [];
  return channels.filter((ch) => canUserSeeChannel(user, ch));
}

/**
 * Returns the member staff objects for a channel following the member rule:
 * - open channel with an officeId: active staff of that office plus the admin;
 * - open channel with officeId null: all active staff;
 * - private, dm and group: the memberIds.
 * Skips deactivated staff.
 */
export function channelMembersFor(channel, staffList = []) {
  if (!channel || !Array.isArray(staffList)) return [];
  const kind = channel.kind || 'public';
  const channelOffice = channel.officeId || null;

  if (kind === 'private' || kind === 'dm' || kind === 'group') {
    const memberIds = Array.isArray(channel.members) ? channel.members : [];
    return staffList.filter((s) => memberIds.includes(s.id) && isStaffActive(s));
  }

  // Open kinds (public, announcement, listing)
  if (!channelOffice) {
    return staffList.filter((s) => isStaffActive(s));
  }

  return staffList.filter((s) => {
    if (!isStaffActive(s)) return false;
    const sOffice = s.officeId || s.office || null;
    return s.role === 'admin' || sOffice === channelOffice;
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

  if (channel.kind === 'listing' && channel.title) {
    return channel.title;
  }

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
    archived: [],
  };

  channels.forEach((ch) => {
    if (!ch) return;
    if (ch.archived) {
      result.archived.push(ch);
      return;
    }
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

/**
 * Determines whether a user can edit a message.
 * Rules:
 * - Must be user's own message
 * - Must be a text message
 * - Must not already be deleted
 * - Must be within 15 minutes of creation
 */
export function canEdit(message, user) {
  if (!message || !user || message.deletedAt) return false;
  if (message.senderId !== user.id || message.type !== 'text') return false;
  const createdAtMs = new Date(message.createdAt).getTime();
  const diffMinutes = (Date.now() - createdAtMs) / (60 * 1000);
  return diffMinutes <= 15;
}

/**
 * Determines whether a user can delete a message.
 * Rules:
 * - Must not already be deleted
 * - Admin can delete any message anytime
 * - Author can delete their own message within 15 minutes
 */
export function canDelete(message, user) {
  if (!message || !user || message.deletedAt) return false;
  if (user.role === 'admin') return true;
  if (message.senderId !== user.id) return false;
  const createdAtMs = new Date(message.createdAt).getTime();
  const diffMinutes = (Date.now() - createdAtMs) / (60 * 1000);
  return diffMinutes <= 15;
}

/**
 * Determines whether a user can pin or unpin a message.
 * Rules:
 * - Message must not be deleted
 * - Admin, Manager, or author can pin/unpin
 */
export function canPin(message, user) {
  if (!message || !user || message.deletedAt) return false;
  return user.role === 'admin' || user.role === 'manager' || message.senderId === user.id;
}

/**
 * Returns replies to a parent message.
 */
export function threadReplies(messages = [], parentId) {
  if (!Array.isArray(messages) || !parentId) return [];
  return messages.filter((m) => m.parentId === parentId);
}

/**
 * Converts reactions object { [emoji]: [staffIds] } into a structured array.
 */
export function reactionList(reactions = {}, currentUserId = null) {
  if (!reactions || typeof reactions !== 'object') return [];
  return Object.entries(reactions)
    .filter(([, staffIds]) => Array.isArray(staffIds) && staffIds.length > 0)
    .map(([emoji, staffIds]) => ({
      emoji,
      count: staffIds.length,
      staffIds,
      userReacted: currentUserId ? staffIds.includes(currentUserId) : false,
    }));
}

const LISTING_TITLES = {
  'maitama-duplex': 'Maitama Duplex',
  'lekki-terraces': 'Lekki Terraces',
  'wuse-office-block': 'Wuse Office Block',
  'vi-penthouse': 'Victoria Island Penthouse',
};

/**
 * Returns a concise single-line preview string for any message type.
 */
export function messagePreview(message, staff) {
  if (!message) return '';

  if (message.deletedAt || message.type === 'deleted') {
    return 'This message was deleted';
  }

  if (message.type === 'system') {
    return message.text || '';
  }

  if (message.type === 'lead') {
    if (message.claimedById) {
      let claimerName = '';
      if (staff) {
        if (Array.isArray(staff)) {
          const s = staff.find((member) => member.id === message.claimedById);
          if (s?.name) claimerName = s.name;
        } else if (typeof staff === 'object') {
          const s = staff[message.claimedById];
          if (s?.name) claimerName = s.name;
        }
      }
      const firstName = claimerName ? claimerName.split(' ')[0] : (message.claimedById || 'Agent');
      return `Lead taken by ${firstName}: ${message.clientName || 'Client'}`;
    }
    return `New lead: ${message.clientName || 'Client'}, ${message.area || 'Area'}`;
  }

  if (message.type === 'listing') {
    const title =
      message.title ||
      LISTING_TITLES[message.listingChannelId] ||
      (message.listingChannel ? message.listingChannel.title : '') ||
      'Listing';
    return `Listing: ${title}`;
  }

  if (message.fileKind === 'photo' || (message.type === 'file' && message.fileKind === 'photo')) {
    return 'Photo';
  }

  if (message.type === 'file') {
    return message.fileName || 'File';
  }

  if (message.type === 'voice') {
    const totalSec = typeof message.durationSec === 'number' ? message.durationSec : 15;
    const mins = Math.floor(totalSec / 60);
    const secs = String(Math.floor(totalSec % 60)).padStart(2, '0');
    return `Voice note, ${mins}:${secs}`;
  }

  return (message.text || '').replace(/[\r\n]+/g, ' ').trim();
}

/**
 * Returns only pending access requests from a requests list.
 */
export function pendingRequests(requests = []) {
  if (!Array.isArray(requests)) return [];
  return requests.filter((r) => r && r.status === 'pending');
}

/**
 * Finds an access request matching the given normalised phone number.
 */
export function requestForPhone(requests = [], phone = '') {
  if (!Array.isArray(requests)) return null;
  const normalised = normalisePhoneNg(phone);
  if (!normalised) return null;
  return requests.find((r) => r && normalisePhoneNg(r.phone) === normalised) ?? null;
}
