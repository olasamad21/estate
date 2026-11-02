/**
 * Pure utility functions for staff messaging, channel visibility, and unread computation.
 */
import { normalisePhoneNg } from './formatters.js';
import { COMPANY_CONFIG } from '../config/market.js';

/**
 * Computes initials from a person's name (first letters of the first two words, upper case).
 */
export function initialsOf(name = '') {
  if (!name || typeof name !== 'string') return 'ST';
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'ST';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

/**
 * Resolves the call name of a person (callName, or the first word of the name).
 */
export function callNameOf(person) {
  if (!person) return '';
  if (typeof person === 'string') {
    return person.trim().split(/\s+/)[0] || person;
  }
  if (person.callName) {
    return person.callName;
  }
  if (person.name) {
    return person.name.trim().split(/\s+/)[0] || '';
  }
  return person.id || '';
}

/**
 * Returns the human-readable office label from an office id.
 */
export function officeLabelOf(officeId) {
  if (!officeId) return 'Company-wide';
  const found = (COMPANY_CONFIG.offices || []).find((o) => o.id === officeId);
  return found ? found.label : officeId;
}

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

export function generateUniqueListingSlug(title = '', existingChannels = []) {
  const baseSlug = slugify(title) || 'listing';
  const existingSlugs = new Set(
    (existingChannels || []).map((c) => (c.name || c.id || '').toLowerCase())
  );
  if (!existingSlugs.has(baseSlug)) {
    return baseSlug;
  }
  let counter = 2;
  while (existingSlugs.has(`${baseSlug}-${counter}`)) {
    counter++;
  }
  return `${baseSlug}-${counter}`;
}

export function canManageListing(user, channel) {
  if (!user || !channel || !isStaffActive(user)) return false;
  if (user.role === 'admin') return true;
  if (user.role === 'manager') {
    if (user.seesAllOffices) return true;
    const userOffice = user.officeId || user.office || null;
    const channelOffice = channel.officeId || null;
    return userOffice === channelOffice || !channelOffice;
  }
  return false;
}

export function officeChoicesFor(user) {
  if (!user || !isStaffActive(user)) return [];
  const officeOptions = (COMPANY_CONFIG.offices || []).map((o) => ({
    id: o.id,
    label: o.label,
  }));
  if (user.role === 'admin') {
    return [
      { id: null, label: 'Company-wide' },
      ...officeOptions,
    ];
  }
  if (user.role === 'manager') {
    if (user.seesAllOffices) {
      return officeOptions;
    }
    const userOffice = user.officeId || user.office || null;
    const match = officeOptions.find((o) => o.id === userOffice);
    return match ? [match] : [];
  }
  return [];
}

/**
 * Exactly ONE function that decides whether a person can see a channel.
 * Rule:
 * - Deactivated staff cannot see any channel.
 * - open kinds (public, announcement, listing) with officeId null: every active staff member;
 * - open kinds with an officeId: admin, seesAllOffices, or staff whose officeId equals the channel's officeId;
 * - private: members, and the admin;
 * - dm and group: members only (nobody else, not even the admin).
 */
export function canUserSeeChannel(user, channel) {
  if (!user || !channel) return false;
  if (!isStaffActive(user)) return false;

  const isAdmin = user.role === 'admin';
  const seesAll = Boolean(user.seesAllOffices);
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
    // with an officeId: admin, seesAllOffices, or staff whose officeId equals the channel's officeId
    return isAdmin || seesAll || userOffice === channelOffice;
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
 * - open channel with an officeId: active staff of that office plus admin and seesAllOffices;
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
    return s.role === 'admin' || Boolean(s.seesAllOffices) || sOffice === channelOffice;
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
 * Determines whether a channel is a leads channel.
 * True for a non-archived public channel whose name is exactly 'leads' or ends with '-leads'.
 */
export function isLeadsChannel(channel) {
  if (!channel || channel.archived) return false;
  const kind = channel.kind || 'public';
  if (kind !== 'public') return false;
  const name = (channel.name || '').toLowerCase();
  return name === 'leads' || name.endsWith('-leads');
}

/**
 * Determines whether a user can post a lead card to a channel.
 * True when the user is an admin or manager, canPost(user, channel) is true, and isLeadsChannel(channel).
 */
export function canPostLead(user, channel) {
  if (!user || !channel || !isStaffActive(user)) return false;
  const isPermitted = user.role === 'admin' || user.role === 'manager';
  return isPermitted && canPost(user, channel) && isLeadsChannel(channel);
}

/**
 * Determines whether a user can share a listing card into a channel.
 * True when the user is an admin or manager, canPost(user, channel) is true, and the channel is not archived.
 */
export function canShareListing(user, channel) {
  if (!user || !channel || !isStaffActive(user) || channel.archived) return false;
  const isPermitted = user.role === 'admin' || user.role === 'manager';
  return isPermitted && canPost(user, channel);
}

/**
 * Returns listing rooms the user can see (using the single visibility function),
 * not archived, in channel-list order.
 */
export function shareableListings(user, channels = []) {
  if (!user || !Array.isArray(channels)) return [];
  return channels.filter(
    (ch) => ch && ch.kind === 'listing' && !ch.archived && canUserSeeChannel(user, ch)
  );
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
 * Checks for @CallName (e.g. @Ruth, @Fortune) or @all.
 */
export function mentionsUser(message, user) {
  if (!message || !message.text || !user) return false;
  const callName = callNameOf(user);
  if (!callName) return false;
  const regex = new RegExp(`@(?:${callName}|all)\\b`, 'i');
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
  'wuse-office-block': 'Wuse Office Block',
  'lugbe-terraces': 'Lugbe Terraces',
  'airport-road-estate': 'Airport Road Estate',
  'gra-apartments': 'GRA Phase 2 Apartments',
  'trans-amadi-suites': 'Trans-Amadi Office Suites',
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
      let claimer = null;
      if (staff) {
        if (Array.isArray(staff)) {
          claimer = staff.find((member) => member.id === message.claimedById) ?? null;
        } else if (typeof staff === 'object') {
          claimer = staff[message.claimedById] ?? null;
        }
      }
      const callName = claimer ? callNameOf(claimer) : (message.claimedById || 'Agent');
      return `Lead taken by ${callName}: ${message.clientName || 'Client'}`;
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
