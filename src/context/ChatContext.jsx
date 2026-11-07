import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { safeLocalStorage, safeSessionStorage } from '../utils/storage.js';
import { normalisePhoneNg, isValidPhoneNg, minutesFromNow } from '../utils/formatters.js';
import { STAFF, ROLE_LABELS } from '../mock/staff.js';
import { CHANNELS } from '../mock/channels.js';
import { SEED_MESSAGES } from '../mock/chatSeed.js';
import { SEED_ACCESS_REQUESTS, SEED_ACTIVATION_LINKS } from '../mock/accessRequests.js';
import { SEED_ACTIVITY_LOG } from '../mock/activityLog.js';
import { LEADS_BY_OFFICE } from '../mock/leads.js';
import { getRandomColleagueReply } from '../mock/replies.js';
import { channelMembersFor, slugify, isStaffActive, linkState, requestForPhone, generateUniqueListingSlug, generateUniqueSiteSlug, canManageListing, canPostLead, canShareListing, shareableListings, callNameOf, canPost, canEdit, canClaimLead, canManageChannel, getDmSlug, canCreateSite, canAddProperty, normaliseMessageText } from '../utils/chat.js';
import { clearAllDrafts } from '../utils/drafts.js';
import { hashPassword, passwordRules, isPasswordValid, checkPassword } from '../utils/password.js';
import { COMPANY_CONFIG } from '../config/market.js';
import { useToast } from '../components/common/useToast.js';
import { formatNaira } from '../utils/formatters.js';
import {
  getBackOnlineMessage,
  getMessagePinnedMessage,
  getMessageUnpinnedMessage,
  getChannelMutedMessage,
  getChannelUnmutedMessage,
  getBrowserCannotSetPasswordMessage,
  getAccountActivatedMessage,
  getPasswordUpdatedSignInMessage,
  getPasswordUpdatedMessage,
  getLeadClaimedMessage,
  getLeadSimulatedMessage,
  getListingStatusUpdatedMessage,
  getListingDetailsUpdatedMessage,
  getLeadPostedMessage,
  getListingSharedMessage,
  getListingSharedInChannelMessage,
  getChannelAdminAddedMessage,
  getChannelAdminRemovedMessage,
  getChannelSendPolicyChangedMessage,
  getSiteCreatedMessage,
  getSiteUpdatedMessage,
  getPropertyCreatedMessage,
} from '../utils/messages.js';

const CHAT_STATE_VERSION = 'chat-21';

const DEFAULT_USER_NOTIFY_PREFS = {
  mutedChannelIds: [],
  mode: 'all',
  quietStart: '21:00',
  quietEnd: '07:00',
};

function prependActivity(log = [], entry) {
  if (!entry) return log;
  return [entry, ...log].slice(0, 200);
}

function createActivityEntry({ type, actorId, subject, detail }) {
  return {
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    at: new Date().toISOString(),
    actorId: actorId || 'ruth',
    type,
    subject: subject || 'Action',
    detail: detail || '',
  };
}

function buildInitialReadState(staffList = STAFF, channelList = CHANNELS) {
  const seedThreshold = minutesFromNow(-300);
  const state = {};
  staffList.forEach((member) => {
    state[member.id] = {};
    channelList.forEach((ch) => {
      state[member.id][ch.id] = seedThreshold;
    });
  });
  return state;
}

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const { showToast } = useToast();

  // 1. Chat state (messages, staff, channels, accessRequests, activationLinks, resetLinks, activityLog & lastReadAtByUser persisted in safeSessionStorage as 'chat_state')
  const [chatState, setChatState] = useState(() => {
    const stored = safeSessionStorage.get('chat_state', null);
    if (
      stored &&
      stored.version === CHAT_STATE_VERSION &&
      Array.isArray(stored.messages) &&
      Array.isArray(stored.staff) &&
      Array.isArray(stored.channels) &&
      Array.isArray(stored.accessRequests) &&
      Array.isArray(stored.activationLinks) &&
      Array.isArray(stored.resetLinks) &&
      Array.isArray(stored.activityLog) &&
      stored.lastReadAtByUser
    ) {
      return stored;
    }
    return {
      version: CHAT_STATE_VERSION,
      messages: SEED_MESSAGES,
      staff: STAFF,
      channels: CHANNELS,
      accessRequests: SEED_ACCESS_REQUESTS,
      activationLinks: SEED_ACTIVATION_LINKS,
      resetLinks: [],
      activityLog: SEED_ACTIVITY_LOG,
      lastReadAtByUser: buildInitialReadState(STAFF, CHANNELS),
    };
  });

  const staff = chatState.staff;
  const channels = chatState.channels;
  const messages = chatState.messages;
  const accessRequests = chatState.accessRequests;
  const activationLinks = useMemo(() => chatState.activationLinks || [], [chatState.activationLinks]);
  const resetLinks = useMemo(() => chatState.resetLinks || [], [chatState.resetLinks]);
  const activityLog = useMemo(() => chatState.activityLog || [], [chatState.activityLog]);
  const lastReadAtByUser = chatState.lastReadAtByUser;

  // Session-only login attempt counters for lockout calculation (never in localStorage)
  const loginAttemptsRef = useRef({});

  // 2. Current logged-in staff id (persisted in safeLocalStorage as 'session_user')
  const [currentUserId, setCurrentUserId] = useState(() => {
    const saved = safeLocalStorage.get('session_user', null);
    if (!saved) return null;
    const matched = staff.find((s) => s.id === saved);
    if (matched && isStaffActive(matched)) {
      return saved;
    }
    safeLocalStorage.remove('session_user');
    return null;
  });

  // 3. Offline simulation mode
  const [isOffline, setIsOffline] = useState(false);

  // 4. Typing indicator status: null or { channelId, staffName }
  const [typingStatus, setTypingStatus] = useState(null);
  const replyTimerRef = useRef(null);

  const staffById = useMemo(() => {
    return Object.fromEntries(staff.map((s) => [s.id, s]));
  }, [staff]);

  const channelsById = useMemo(() => {
    return Object.fromEntries(channels.map((c) => [c.id, c]));
  }, [channels]);

  // Persist chat state whenever it changes
  useEffect(() => {
    safeSessionStorage.set('chat_state', chatState);
  }, [chatState]);

  // 5. Notification preferences (stored per-user under 'notify_prefs' in safeLocalStorage)
  const [notifyPrefsByUserId, setNotifyPrefsByUserId] = useState(() => {
    return safeLocalStorage.get('notify_prefs', {});
  });

  useEffect(() => {
    safeLocalStorage.set('notify_prefs', notifyPrefsByUserId);
  }, [notifyPrefsByUserId]);

  const notifyPrefs = useMemo(() => {
    if (!currentUserId) return DEFAULT_USER_NOTIFY_PREFS;
    const userPrefs = notifyPrefsByUserId[currentUserId];
    return {
      mutedChannelIds: Array.isArray(userPrefs?.mutedChannelIds) ? userPrefs.mutedChannelIds : [],
      mode: userPrefs?.mode === 'mentions' ? 'mentions' : 'all',
      quietStart: userPrefs?.quietStart || '21:00',
      quietEnd: userPrefs?.quietEnd || '07:00',
    };
  }, [notifyPrefsByUserId, currentUserId]);

  const updateNotifyPrefs = useCallback((partial) => {
    if (!currentUserId) return;
    setNotifyPrefsByUserId((prev) => {
      const current = prev[currentUserId] || DEFAULT_USER_NOTIFY_PREFS;
      return {
        ...prev,
        [currentUserId]: {
          ...current,
          ...partial,
        },
      };
    });
  }, [currentUserId]);

  const toggleMuteChannel = useCallback((channelId, channelDisplayName) => {
    if (!currentUserId || !channelId) return;
    const isMuted = notifyPrefs.mutedChannelIds.includes(channelId);
    const updated = isMuted
      ? notifyPrefs.mutedChannelIds.filter((id) => id !== channelId)
      : [...notifyPrefs.mutedChannelIds, channelId];
    updateNotifyPrefs({ mutedChannelIds: updated });
    const name = channelDisplayName || channelId;
    if (isMuted) {
      showToast(getChannelUnmutedMessage(name));
    } else {
      showToast(getChannelMutedMessage(name));
    }
  }, [currentUserId, notifyPrefs.mutedChannelIds, updateNotifyPrefs, showToast]);

  const currentUser = useMemo(() => {
    return currentUserId ? staffById[currentUserId] || null : null;
  }, [currentUserId, staffById]);

  const clearTypingTimer = useCallback(() => {
    if (replyTimerRef.current) {
      clearTimeout(replyTimerRef.current);
      replyTimerRef.current = null;
    }
    setTypingStatus(null);
  }, []);

  const signIn = useCallback(async (phone, password) => {
    const normalised = normalisePhoneNg(phone);
    const now = Date.now();
    const attempts = loginAttemptsRef.current[normalised || phone] || { count: 0, lastAttemptAt: 0 };

    // Check lockout computed from stored timestamp
    if (attempts.count >= 5 && now - attempts.lastAttemptAt < 60000) {
      const retryInSeconds = Math.max(1, Math.ceil((60000 - (now - attempts.lastAttemptAt)) / 1000));
      return { ok: false, reason: 'locked', retryInSeconds };
    }

    if (!normalised || typeof password !== 'string' || !password) {
      const isLockExpired = attempts.count >= 5 && now - attempts.lastAttemptAt >= 60000;
      const nextCount = isLockExpired ? 1 : attempts.count + 1;
      loginAttemptsRef.current[normalised || phone] = { count: nextCount, lastAttemptAt: now };
      if (nextCount >= 5) {
        return { ok: false, reason: 'locked', retryInSeconds: 60 };
      }
      return { ok: false, reason: 'invalid' };
    }

    const matched = staff.find((s) => normalisePhoneNg(s.phone) === normalised);
    const isPasswordValidMatch = matched && isStaffActive(matched)
      ? await checkPassword(matched, password)
      : false;

    if (isPasswordValidMatch && matched && isStaffActive(matched)) {
      delete loginAttemptsRef.current[normalised];
      clearTypingTimer();
      setCurrentUserId(matched.id);
      safeLocalStorage.set('session_user', matched.id);
      return { ok: true, user: matched };
    }

    // Failure: all invalid numbers, invited, deactivated, pending, declined follow this exact path
    const isLockExpired = attempts.count >= 5 && now - attempts.lastAttemptAt >= 60000;
    const nextCount = isLockExpired ? 1 : attempts.count + 1;
    loginAttemptsRef.current[normalised] = { count: nextCount, lastAttemptAt: now };
    if (nextCount >= 5) {
      return { ok: false, reason: 'locked', retryInSeconds: 60 };
    }
    return { ok: false, reason: 'invalid' };
  }, [staff, clearTypingTimer]);

  const activateAccount = useCallback(async (token, phone, password) => {
    const link = (chatState.activationLinks || []).find((l) => l.token === token);
    const linkStatus = linkState(link);
    if (!link || linkStatus !== 'valid') {
      return { ok: false, reason: linkStatus || 'unknown' };
    }

    const targetPerson = staff.find((s) => s.id === link.staffId);
    if (!targetPerson) {
      return { ok: false, reason: 'unknown' };
    }

    const normalisedPhone = normalisePhoneNg(phone);
    const personPhone = normalisePhoneNg(targetPerson.phone);
    if (!normalisedPhone || normalisedPhone !== personPhone) {
      const nextWrongs = (link.wrongConfirmations ?? 0) + 1;
      setChatState((prev) => ({
        ...prev,
        activationLinks: (prev.activationLinks || []).map((l) =>
          l.token === token ? { ...l, wrongConfirmations: nextWrongs } : l
        ),
      }));
      if (nextWrongs >= 3) {
        return { ok: false, reason: 'locked' };
      }
      return { ok: false, reason: 'phone' };
    }

    const rules = passwordRules(password, phone);
    if (!isPasswordValid(rules)) {
      return { ok: false, reason: 'password_invalid', rules };
    }

    const hash = await hashPassword(targetPerson.id, password);
    if (!hash) {
      showToast(getBrowserCannotSetPasswordMessage());
      return { ok: false, reason: 'crypto_unavailable' };
    }

    const nowIso = new Date().toISOString();
    setChatState((prev) => ({
      ...prev,
      staff: prev.staff.map((s) =>
        s.id === targetPerson.id
          ? { ...s, status: 'active', active: true, passwordHash: hash }
          : s
      ),
      activationLinks: (prev.activationLinks || []).map((l) =>
        l.token === token ? { ...l, usedAt: nowIso } : l
      ),
    }));

    clearTypingTimer();
    setCurrentUserId(targetPerson.id);
    safeLocalStorage.set('session_user', targetPerson.id);
    showToast(getAccountActivatedMessage());
    return { ok: true, user: targetPerson };
  }, [chatState.activationLinks, staff, showToast, clearTypingTimer]);

  const requestPasswordReset = useCallback((phone) => {
    const normalised = normalisePhoneNg(phone);
    if (!normalised) {
      return { ok: true, demoToken: null };
    }

    const matched = staff.find((s) => normalisePhoneNg(s.phone) === normalised && isStaffActive(s));
    if (matched) {
      const token = (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : `reset-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

      const newLink = {
        token,
        staffId: matched.id,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        usedAt: null,
      };

      setChatState((prev) => ({
        ...prev,
        resetLinks: [...(prev.resetLinks || []), newLink],
      }));

      return { ok: true, demoToken: token };
    }

    return { ok: true, demoToken: null };
  }, [staff]);

  const resetPassword = useCallback(async (token, password) => {
    const link = (chatState.resetLinks || []).find((l) => l.token === token);
    const linkStatus = linkState(link);
    if (!link || linkStatus !== 'valid') {
      return { ok: false, reason: linkStatus || 'unknown' };
    }

    const targetPerson = staff.find((s) => s.id === link.staffId);
    if (!targetPerson) {
      return { ok: false, reason: 'unknown' };
    }

    const rules = passwordRules(password, targetPerson.phone);
    if (!isPasswordValid(rules)) {
      return { ok: false, reason: 'password_invalid', rules };
    }

    const hash = await hashPassword(targetPerson.id, password);
    if (!hash) {
      showToast(getBrowserCannotSetPasswordMessage());
      return { ok: false, reason: 'crypto_unavailable' };
    }

    const nowIso = new Date().toISOString();
    setChatState((prev) => ({
      ...prev,
      staff: prev.staff.map((s) =>
        s.id === targetPerson.id ? { ...s, passwordHash: hash } : s
      ),
      resetLinks: (prev.resetLinks || []).map((l) =>
        l.token === token ? { ...l, usedAt: nowIso } : l
      ),
    }));

    showToast(getPasswordUpdatedSignInMessage());
    return { ok: true };
  }, [chatState.resetLinks, staff, showToast]);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    if (!currentUser) {
      return { ok: false, reason: 'unauthenticated' };
    }

    const isCurrentValid = await checkPassword(currentUser, currentPassword);
    if (!isCurrentValid) {
      return { ok: false, reason: 'current_incorrect' };
    }

    const rules = passwordRules(newPassword, currentUser.phone);
    if (!isPasswordValid(rules)) {
      return { ok: false, reason: 'password_invalid', rules };
    }

    const hash = await hashPassword(currentUser.id, newPassword);
    if (!hash) {
      showToast(getBrowserCannotSetPasswordMessage());
      return { ok: false, reason: 'crypto_unavailable' };
    }

    setChatState((prev) => ({
      ...prev,
      staff: prev.staff.map((s) =>
        s.id === currentUser.id ? { ...s, passwordHash: hash } : s
      ),
    }));

    showToast(getPasswordUpdatedMessage());
    return { ok: true };
  }, [currentUser, showToast]);

  // Backward compatibility alias
  const login = signIn;

  const logout = useCallback(() => {
    clearTypingTimer();
    clearAllDrafts();
    setCurrentUserId(null);
    safeLocalStorage.remove('session_user');
  }, [clearTypingTimer]);

  const switchUser = useCallback((id) => {
    const target = staffById[id];
    if (target && isStaffActive(target)) {
      clearTypingTimer();
      setCurrentUserId(id);
      safeLocalStorage.set('session_user', id);
    }
  }, [clearTypingTimer, staffById]);

  const setOffline = useCallback((offline) => {
    setIsOffline(offline);
    if (!offline) {
      // Flush queued messages to sent
      let flushCount = 0;
      setChatState((prev) => {
        const updated = prev.messages.map((m) => {
          if (m.status === 'queued') {
            flushCount++;
            return { ...m, status: 'sent' };
          }
          return m;
        });
        return { ...prev, messages: updated };
      });
      showToast(getBackOnlineMessage(flushCount), 'success');
    }
  }, [showToast]);

  const sendMessage = useCallback((channelId, text) => {
    const cleanText = normaliseMessageText(text);
    if (!cleanText || !currentUserId || !currentUser || !isStaffActive(currentUser)) {
      return false;
    }
    const currentChannel = channels.find((c) => c.id === channelId) ?? null;
    if (!currentChannel || currentChannel.archived || !canPost(currentUser, currentChannel)) {
      return false;
    }

    const nowIso = new Date().toISOString();
    const newMsg = {
      id: `msg-${Date.now()}`,
      channelId,
      senderId: currentUserId,
      type: 'text',
      text: cleanText,
      createdAt: nowIso,
      status: isOffline ? 'queued' : 'sent',
    };

    setChatState((prev) => {
      const userReadMap = prev.lastReadAtByUser[currentUserId] || {};
      return {
        ...prev,
        messages: [...prev.messages, newMsg],
        lastReadAtByUser: {
          ...prev.lastReadAtByUser,
          [currentUserId]: {
            ...userReadMap,
            [channelId]: nowIso,
          },
        },
      };
    });

    // Scripted colleague reply if online and not in announcements
    if (!isOffline && channelId !== 'announcements' && canPost(currentUser, currentChannel)) {
      const candidates = channelMembersFor(currentChannel, staff).filter(
        (s) => s.id !== currentUserId && s.online && isStaffActive(s) && canPost(s, currentChannel)
      );

      if (candidates.length > 0) {
        const responder = candidates[Math.floor(Math.random() * candidates.length)];
        const responderName = callNameOf(responder);

        clearTypingTimer();
        setTypingStatus({ channelId, staffName: responderName });

        const delay = 2500 + Math.floor(Math.random() * 1500);
        replyTimerRef.current = setTimeout(() => {
          setTypingStatus(null);
          const replyMsg = {
            id: `msg-${Date.now()}`,
            channelId,
            senderId: responder.id,
            type: 'text',
            text: getRandomColleagueReply(),
            createdAt: new Date().toISOString(),
            status: 'sent',
          };
          setChatState((prev) => ({
            ...prev,
            messages: [...prev.messages, replyMsg],
          }));
        }, delay);
      }
    }

    return true;
  }, [currentUserId, currentUser, isOffline, channels, staff, clearTypingTimer]);

  const sendThreadReply = useCallback((channelId, parentId, text) => {
    const cleanText = normaliseMessageText(text);
    if (!cleanText || !currentUserId || !currentUser || !isStaffActive(currentUser) || !parentId) {
      return false;
    }
    const currentChannel = channels.find((c) => c.id === channelId) ?? null;
    if (!currentChannel || currentChannel.archived || !canPost(currentUser, currentChannel)) {
      return false;
    }
    const parentMsg = messages.find((m) => m.id === parentId) ?? null;
    if (!parentMsg || parentMsg.deletedAt || parentMsg.channelId !== channelId) {
      return false;
    }

    const nowIso = new Date().toISOString();
    const newMsg = {
      id: `msg-${Date.now()}`,
      channelId,
      parentId,
      senderId: currentUserId,
      type: 'text',
      text: cleanText,
      createdAt: nowIso,
      status: isOffline ? 'queued' : 'sent',
    };

    setChatState((prev) => ({
      ...prev,
      messages: [...prev.messages, newMsg],
    }));

    return true;
  }, [currentUserId, currentUser, isOffline, channels, messages]);

  const sendVoiceNote = useCallback((channelId, durationSec) => {
    if (!currentUserId || !channelId) return;
    const currentChannel = channels.find((c) => c.id === channelId);
    if (!currentChannel || !canPost(currentUser, currentChannel)) return;

    const nowIso = new Date().toISOString();
    const newMsg = {
      id: `msg-${Date.now()}`,
      channelId,
      senderId: currentUserId,
      type: 'voice',
      durationSec: durationSec || 5,
      text: '',
      createdAt: nowIso,
      status: isOffline ? 'queued' : 'sent',
    };

    setChatState((prev) => ({
      ...prev,
      messages: [...prev.messages, newMsg],
    }));
  }, [currentUserId, currentUser, isOffline, channels]);

  const sendFile = useCallback((channelId, { type, fileName, fileSize, fileKind, durationSec, isSample, caption, width, height }) => {
    if (!currentUserId || !channelId || !fileName) return null;
    const currentChannel = channels.find((c) => c.id === channelId);
    if (!currentChannel || !canPost(currentUser, currentChannel)) return null;

    const normalisedCaption = normaliseMessageText(caption);
    const trimmedCaption = normalisedCaption || undefined;
    const nowIso = new Date().toISOString();
    const msgType = type || (fileKind === 'video' ? 'video' : 'file');
    const newMsg = {
      id: `msg-${Date.now()}`,
      channelId,
      senderId: currentUserId,
      type: msgType,
      fileName,
      fileSize: fileSize || '1.2 MB',
      fileKind: fileKind || (msgType === 'video' ? 'video' : 'document'),
      text: fileName,
      caption: trimmedCaption,
      durationSec: durationSec ?? null,
      width: typeof width === 'number' && Number.isFinite(width) ? width : null,
      height: typeof height === 'number' && Number.isFinite(height) ? height : null,
      isSample: Boolean(isSample),
      createdAt: nowIso,
      status: isOffline ? 'queued' : 'sent',
    };

    setChatState((prev) => ({
      ...prev,
      messages: [...prev.messages, newMsg],
    }));

    return newMsg.id;
  }, [currentUserId, currentUser, isOffline, channels]);

  const editMessage = useCallback((messageId, newText) => {
    const cleanText = normaliseMessageText(newText);
    if (!messageId || !cleanText || !currentUser || !isStaffActive(currentUser)) {
      return false;
    }
    const targetMsg = messages.find((m) => m.id === messageId) ?? null;
    if (!targetMsg || !canEdit(targetMsg, currentUser)) {
      return false;
    }
    const targetChannel = channels.find((c) => c.id === targetMsg.channelId) ?? null;
    if (!targetChannel || targetChannel.archived || !canPost(currentUser, targetChannel)) {
      return false;
    }
    const nowIso = new Date().toISOString();
    setChatState((prev) => ({
      ...prev,
      messages: prev.messages.map((m) =>
        m.id === messageId
          ? { ...m, text: cleanText, editedAt: nowIso }
          : m
      ),
    }));
    return true;
  }, [currentUser, messages, channels]);

  const deleteMessage = useCallback((messageId) => {
    if (!messageId) return;
    const nowIso = new Date().toISOString();
    setChatState((prev) => ({
      ...prev,
      messages: prev.messages.map((m) =>
        m.id === messageId
          ? { ...m, deletedAt: nowIso, text: 'This message was deleted' }
          : m
      ),
    }));
  }, []);

  const togglePin = useCallback((messageId) => {
    if (!messageId) return;
    let nextPinned = false;
    setChatState((prev) => ({
      ...prev,
      messages: prev.messages.map((m) => {
        if (m.id === messageId) {
          nextPinned = !m.pinned;
          return { ...m, pinned: nextPinned };
        }
        return m;
      }),
    }));
    if (nextPinned) {
      showToast(getMessagePinnedMessage(), 'info');
    } else {
      showToast(getMessageUnpinnedMessage(), 'info');
    }
    return nextPinned;
  }, [showToast]);

  const toggleReaction = useCallback((messageId, emoji) => {
    if (!currentUserId || !messageId || !emoji) return;
    setChatState((prev) => {
      const updatedMessages = prev.messages.map((m) => {
        if (m.id !== messageId) return m;
        const currentReactions = { ...(m.reactions || {}) };
        const staffList = currentReactions[emoji] || [];

        if (staffList.includes(currentUserId)) {
          const nextList = staffList.filter((id) => id !== currentUserId);
          if (nextList.length === 0) {
            delete currentReactions[emoji];
          } else {
            currentReactions[emoji] = nextList;
          }
        } else {
          currentReactions[emoji] = [...staffList, currentUserId];
        }

        return {
          ...m,
          reactions: currentReactions,
        };
      });

      return {
        ...prev,
        messages: updatedMessages,
      };
    });
  }, [currentUserId]);

  const markChannelRead = useCallback((channelId) => {
    if (!currentUserId || !channelId) return;
    const nowIso = new Date().toISOString();
    setChatState((prev) => {
      const userReadMap = prev.lastReadAtByUser[currentUserId] || {};
      if (userReadMap[channelId] && userReadMap[channelId] >= nowIso) {
        return prev;
      }
      return {
        ...prev,
        lastReadAtByUser: {
          ...prev.lastReadAtByUser,
          [currentUserId]: {
            ...userReadMap,
            [channelId]: nowIso,
          },
        },
      };
    });

    // If channel is announcements, mark announcements seen by current user
    if (channelId === 'announcements') {
      setChatState((prev) => ({
        ...prev,
        messages: prev.messages.map((m) => {
          if (m.channelId === 'announcements') {
            const seen = Array.isArray(m.seenBy) ? m.seenBy : [];
            if (!seen.includes(currentUserId)) {
              return { ...m, seenBy: [...seen, currentUserId] };
            }
          }
          return m;
        }),
      }));
    }
  }, [currentUserId]);

  const resetDemo = useCallback(() => {
    clearTypingTimer();
    clearAllDrafts();
    loginAttemptsRef.current = {};
    safeSessionStorage.remove('chat_state');
    const fresh = {
      version: CHAT_STATE_VERSION,
      messages: SEED_MESSAGES,
      staff: STAFF,
      channels: CHANNELS,
      accessRequests: SEED_ACCESS_REQUESTS,
      activationLinks: SEED_ACTIVATION_LINKS,
      resetLinks: [],
      activityLog: SEED_ACTIVITY_LOG,
      lastReadAtByUser: buildInitialReadState(STAFF, CHANNELS),
    };
    setChatState(fresh);
    setCurrentUserId(null);
    setIsOffline(false);
    safeLocalStorage.remove('session_user');
  }, [clearTypingTimer]);

  const logActivity = useCallback(({ type, actorId, subject, detail }) => {
    const entry = createActivityEntry({
      type,
      actorId: actorId || currentUserId || 'ruth',
      subject,
      detail,
    });
    setChatState((prev) => ({
      ...prev,
      activityLog: prependActivity(prev.activityLog, entry),
    }));
    return entry;
  }, [currentUserId]);

  const addStaff = useCallback(({ name, callName, phone, role, office, officeId, department, title, email, seesAllOffices, canMessageExecutives }) => {
    const effectiveOfficeId = officeId || office || 'hq';
    const effectiveCallName = (callName || name.trim().split(/\s+/)[0] || 'staff').trim();
    const baseSlug = slugify(effectiveCallName) || slugify(name);
    let id = baseSlug || 'staff';
    let counter = 2;
    while (staff.some((s) => s.id === id)) {
      id = `${baseSlug}-${counter}`;
      counter++;
    }

    const roleLabel = ROLE_LABELS[role] || role;
    const officeObj = (COMPANY_CONFIG.offices || []).find((o) => o.id === effectiveOfficeId);
    const officeName = officeObj ? officeObj.name : 'Head Quarters';
    const jobTitle = title || `${roleLabel}, ${officeName}`;
    const normalisedPhone = normalisePhoneNg(phone);
    const dept = department || (role === 'admin' ? 'Executive' : (role === 'agent' ? 'Sales' : 'Operations'));

    const newPerson = {
      id,
      name: name.trim(),
      callName: effectiveCallName,
      role,
      title: jobTitle,
      department: dept,
      officeId: effectiveOfficeId,
      office: effectiveOfficeId,
      phone: normalisedPhone,
      email: email ? email.trim() : null,
      passwordHash: null,
      seesAllOffices: role === 'admin' ? Boolean(seesAllOffices) : false,
      canMessageExecutives: (role === 'admin' || role === 'manager') ? false : Boolean(canMessageExecutives),
      isOnline: false,
      online: false,
      status: 'invited',
      active: false,
    };

    const token = (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : `act-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    const newLink = {
      token,
      staffId: newPerson.id,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      usedAt: null,
      wrongConfirmations: 0,
    };

    newPerson.link = newLink;

    const entry = createActivityEntry({
      type: 'staff_added',
      actorId: currentUserId || 'ruth',
      subject: newPerson.name,
      detail: `${roleLabel}, ${officeName}`,
    });

    setChatState((prev) => {
      const nextStaff = [...prev.staff, newPerson];
      const nextReadState = { ...prev.lastReadAtByUser };
      const seedThreshold = minutesFromNow(-300);
      nextReadState[newPerson.id] = {};
      prev.channels.forEach((ch) => {
        nextReadState[newPerson.id][ch.id] = seedThreshold;
      });

      return {
        ...prev,
        staff: nextStaff,
        activationLinks: [...(prev.activationLinks || []), newLink],
        lastReadAtByUser: nextReadState,
        activityLog: prependActivity(prev.activityLog, entry),
      };
    });

    return newPerson;
  }, [staff, currentUserId]);

  const updateStaff = useCallback((staffId, { role, office, officeId, department, title, email, seesAllOffices, callName, canMessageExecutives }) => {
    const targetStaff = staff.find((s) => s.id === staffId);
    let entry = null;

    if (targetStaff) {
      const effectiveOfficeId = officeId || office || targetStaff.officeId;
      const targetRole = role || targetStaff.role;
      const roleLabel = ROLE_LABELS[targetRole] || targetRole;
      const officeObj = (COMPANY_CONFIG.offices || []).find((o) => o.id === effectiveOfficeId);
      const officeName = officeObj ? officeObj.name : 'Head Quarters';

      if (role && role !== targetStaff.role) {
        entry = createActivityEntry({
          type: 'role_or_office_changed',
          actorId: currentUserId || 'ruth',
          subject: targetStaff.name,
          detail: `Role changed to ${roleLabel}`,
        });
      } else if (effectiveOfficeId && effectiveOfficeId !== targetStaff.officeId) {
        entry = createActivityEntry({
          type: 'role_or_office_changed',
          actorId: currentUserId || 'ruth',
          subject: targetStaff.name,
          detail: `Office updated to ${officeName}`,
        });
      } else if (department && department !== targetStaff.department) {
        entry = createActivityEntry({
          type: 'department_changed',
          actorId: currentUserId || 'ruth',
          subject: targetStaff.name,
          detail: `Department changed to ${department}`,
        });
      }
    }

    setChatState((prev) => {
      const nextStaff = prev.staff.map((s) => {
        if (s.id !== staffId) return s;
        const effectiveOfficeId = officeId || office || s.officeId;
        const targetRole = role || s.role;
        const roleLabel = ROLE_LABELS[targetRole] || targetRole;
        const officeObj = (COMPANY_CONFIG.offices || []).find((o) => o.id === effectiveOfficeId);
        const officeName = officeObj ? officeObj.name : 'Head Quarters';
        const jobTitle = title || `${roleLabel}, ${officeName}`;

        return {
          ...s,
          ...(callName ? { callName: callName.trim() } : {}),
          ...(email !== undefined ? { email: email ? email.trim() : null } : {}),
          role: targetRole,
          office: effectiveOfficeId,
          officeId: effectiveOfficeId,
          department: department || s.department,
          title: jobTitle,
          seesAllOffices: targetRole === 'admin' ? Boolean(seesAllOffices ?? s.seesAllOffices) : false,
          canMessageExecutives: (targetRole === 'admin' || targetRole === 'manager')
            ? false
            : (canMessageExecutives !== undefined ? Boolean(canMessageExecutives) : Boolean(s.canMessageExecutives)),
        };
      });

      return {
        ...prev,
        staff: nextStaff,
        ...(entry ? { activityLog: prependActivity(prev.activityLog, entry) } : {}),
      };
    });
  }, [staff, currentUserId]);

  const setStaffActive = useCallback((staffId, active) => {
    const target = staff.find((s) => s.id === staffId);
    const entry = createActivityEntry({
      type: active ? 'reactivated' : 'deactivated',
      actorId: currentUserId || 'ruth',
      subject: target?.name || 'Staff member',
      detail: active ? 'Account reactivated' : 'Account deactivated',
    });

    setChatState((prev) => {
      const nextStaff = prev.staff.map((s) => {
        if (s.id !== staffId) return s;
        return {
          ...s,
          active: Boolean(active),
          status: active ? 'active' : 'deactivated',
        };
      });

      return {
        ...prev,
        staff: nextStaff,
        activityLog: prependActivity(prev.activityLog, entry),
      };
    });

    // If current user is being deactivated, switch to the first active admin
    if (!active && staffId === currentUserId) {
      const firstActiveAdmin = staff.find(
        (s) => s.id !== staffId && s.role === 'admin' && isStaffActive(s)
      );
      if (firstActiveAdmin) {
        setCurrentUserId(firstActiveAdmin.id);
        safeLocalStorage.set('session_user', firstActiveAdmin.id);
      }
    }
  }, [currentUserId, staff]);

  const submitAccessRequest = useCallback(({ name, phone, email, officeId, requestedRole }) => {
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return { ok: false, field: 'name', message: 'Full name is required (at least 2 characters).' };
    }

    const trimmedEmail = typeof email === 'string' ? email.trim() : '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || trimmedEmail.length > 80 || !emailRegex.test(trimmedEmail)) {
      return { ok: false, field: 'email', message: 'Please enter a valid email address (maximum 80 characters).' };
    }

    const normalised = normalisePhoneNg(phone);
    if (!normalised || !isValidPhoneNg(phone)) {
      return { ok: false, field: 'phone', message: 'Please enter a valid Nigerian phone number (+234 80X XXX XXXX).' };
    }

    // Silent skip if phone belongs to an existing staff member (any status) or pending/approved request
    const staffMatch = staff.some((s) => normalisePhoneNg(s.phone) === normalised);
    const existingReq = requestForPhone(accessRequests, normalised);
    if (staffMatch || (existingReq && (existingReq.status === 'pending' || existingReq.status === 'approved'))) {
      return { ok: true, silentSkip: true };
    }

    const allowedRoles = ['agent', 'support', 'intern'];
    if (!allowedRoles.includes(requestedRole)) {
      return { ok: false, field: 'requestedRole', message: 'Role must be Agent, Support staff, or Intern.' };
    }

    const allowedOfficeIds = (COMPANY_CONFIG?.offices || []).map((o) => o.id);
    if (!allowedOfficeIds.includes(officeId)) {
      return { ok: false, field: 'officeId', message: 'Please select a valid office.' };
    }

    const baseSlug = slugify(name);
    let id = baseSlug || 'applicant';
    let counter = 2;
    const otherReqs = accessRequests.filter((r) => !existingReq || r.id !== existingReq.id);
    while (otherReqs.some((r) => r.id === id)) {
      id = `${baseSlug}-${counter}`;
      counter++;
    }

    const newRequest = {
      id,
      name: name.trim(),
      email: trimmedEmail,
      phone: normalised,
      officeId,
      requestedRole,
      status: 'pending',
      createdAt: new Date().toISOString(),
      decidedAt: null,
    };

    setChatState((prev) => {
      const prevReqs = Array.isArray(prev.accessRequests) ? prev.accessRequests : [];
      let nextReqs;
      if (existingReq && existingReq.status === 'declined') {
        nextReqs = prevReqs.map((r) => (r.id === existingReq.id ? newRequest : r));
      } else {
        nextReqs = [newRequest, ...prevReqs];
      }
      return {
        ...prev,
        accessRequests: nextReqs,
      };
    });

    return { ok: true };
  }, [staff, accessRequests]);

  const sendActivationLink = useCallback((staffId) => {
    const target = staff.find((s) => s.id === staffId);
    if (!target) return null;

    const token = (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : `act-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    const nowIso = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

    const newLink = {
      token,
      staffId: target.id,
      createdAt: nowIso,
      expiresAt,
      usedAt: null,
      wrongConfirmations: 0,
    };

    const entry = createActivityEntry({
      type: 'activation_link_sent',
      actorId: currentUserId || 'ruth',
      subject: target.name,
      detail: 'Sent new activation link',
    });

    setChatState((prev) => {
      const nextLinks = (prev.activationLinks || []).map((l) => {
        if (l.staffId === target.id && !l.usedAt) {
          return { ...l, expiresAt: nowIso };
        }
        return l;
      });

      return {
        ...prev,
        activationLinks: [...nextLinks, newLink],
        activityLog: prependActivity(prev.activityLog, entry),
      };
    });

    return { ok: true, link: newLink, person: target };
  }, [staff, currentUserId]);

  const sendPasswordResetLink = useCallback((staffId) => {
    const target = staff.find((s) => s.id === staffId);
    if (!target) return null;

    const token = (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : `reset-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    const nowIso = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    const newLink = {
      token,
      staffId: target.id,
      createdAt: nowIso,
      expiresAt,
      usedAt: null,
    };

    const entry = createActivityEntry({
      type: 'password_reset_link_sent',
      actorId: currentUserId || 'ruth',
      subject: target.name,
      detail: 'Sent password reset link',
    });

    setChatState((prev) => {
      const nextLinks = (prev.resetLinks || []).map((l) => {
        if (l.staffId === target.id && !l.usedAt) {
          return { ...l, expiresAt: nowIso };
        }
        return l;
      });

      return {
        ...prev,
        resetLinks: [...nextLinks, newLink],
        activityLog: prependActivity(prev.activityLog, entry),
      };
    });

    return { ok: true, link: newLink, person: target };
  }, [staff, currentUserId]);

  const importStaff = useCallback((rows) => {
    if (!Array.isArray(rows) || rows.length === 0) return 0;

    const nowIso = new Date().toISOString();
    const newStaffList = [];
    const newLinksList = [];
    const currentStaffSlugs = new Set(staff.map((s) => s.id));

    rows.forEach((row) => {
      const effectiveCallName = (row.callName || row.name.trim().split(/\s+/)[0] || 'staff').trim();
      const baseSlug = slugify(effectiveCallName) || slugify(row.name);
      let id = baseSlug || 'staff';
      let counter = 2;
      while (currentStaffSlugs.has(id)) {
        id = `${baseSlug}-${counter}`;
        counter++;
      }
      currentStaffSlugs.add(id);

      const token = (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : `act-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

      const newPerson = {
        id,
        name: row.name.trim(),
        callName: effectiveCallName,
        role: row.role || 'agent',
        title: row.title || `${ROLE_LABELS[row.role || 'agent']}, ${row.officeName || 'Head Quarters'}`,
        department: row.department || 'Sales',
        officeId: row.officeId || 'hq',
        office: row.officeId || 'hq',
        phone: normalisePhoneNg(row.phone),
        email: row.email ? row.email.trim() : null,
        passwordHash: null,
        seesAllOffices: row.role === 'admin',
        canMessageExecutives: false,
        isOnline: false,
        online: false,
        status: 'invited',
        active: false,
      };

      const link = {
        token,
        staffId: newPerson.id,
        createdAt: nowIso,
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        usedAt: null,
        wrongConfirmations: 0,
      };

      newPerson.link = link;
      newStaffList.push(newPerson);
      newLinksList.push(link);
    });

    const entry = createActivityEntry({
      type: 'staff_imported',
      actorId: currentUserId || 'ruth',
      subject: `${newStaffList.length} accounts`,
      detail: 'Imported staff members',
    });

    setChatState((prev) => {
      const nextReadState = { ...prev.lastReadAtByUser };
      const seedThreshold = minutesFromNow(-300);
      newStaffList.forEach((person) => {
        nextReadState[person.id] = {};
        prev.channels.forEach((ch) => {
          nextReadState[person.id][ch.id] = seedThreshold;
        });
      });

      return {
        ...prev,
        staff: [...prev.staff, ...newStaffList],
        activationLinks: [...(prev.activationLinks || []), ...newLinksList],
        lastReadAtByUser: nextReadState,
        activityLog: prependActivity(prev.activityLog, entry),
      };
    });

    return newStaffList.length;
  }, [staff, currentUserId]);

  const approveAccessRequest = useCallback((id, { role, officeId, department, callName, title, canMessageExecutives } = {}) => {
    const targetReq = accessRequests.find((r) => r.id === id);
    if (!targetReq) return null;
    const chosenRole = role || targetReq.requestedRole;
    const chosenOffice = officeId || targetReq.officeId;

    const newPerson = addStaff({
      name: targetReq.name,
      callName: callName || (targetReq.name.trim().split(/\s+/)[0] || ''),
      phone: targetReq.phone,
      email: targetReq.email || null,
      role: chosenRole,
      office: chosenOffice,
      officeId: chosenOffice,
      department,
      title,
      canMessageExecutives: Boolean(canMessageExecutives),
    });

    const decidedAt = new Date().toISOString();
    const entry = createActivityEntry({
      type: 'request_approved',
      actorId: currentUserId || 'ruth',
      subject: targetReq.name,
      detail: `Approved request for ${ROLE_LABELS[chosenRole] || chosenRole}`,
    });

    setChatState((prev) => {
      const prevReqs = Array.isArray(prev.accessRequests) ? prev.accessRequests : [];
      return {
        ...prev,
        accessRequests: prevReqs.map((r) =>
          r.id === id
            ? { ...r, status: 'approved', decidedAt }
            : r
        ),
        activityLog: prependActivity(prev.activityLog, entry),
      };
    });

    return newPerson;
  }, [accessRequests, addStaff, currentUserId]);

  const declineAccessRequest = useCallback((id) => {
    const targetReq = accessRequests.find((r) => r.id === id);
    const decidedAt = new Date().toISOString();
    const entry = createActivityEntry({
      type: 'request_declined',
      actorId: currentUserId || 'ruth',
      subject: targetReq?.name || 'Applicant',
      detail: 'Declined access request',
    });

    setChatState((prev) => {
      const prevReqs = Array.isArray(prev.accessRequests) ? prev.accessRequests : [];
      return {
        ...prev,
        accessRequests: prevReqs.map((r) =>
          r.id === id ? { ...r, status: 'declined', decidedAt } : r
        ),
        activityLog: prependActivity(prev.activityLog, entry),
      };
    });
  }, [accessRequests, currentUserId]);

  const createChannel = useCallback(({ name, kind, officeId, description, memberIds, title, area, priceNgn, status, sendPolicy }) => {
    const isListing = kind === 'listing';
    const creatorCallName = callNameOf(currentUser) || 'Staff';

    let newChannel;

    if (isListing) {
      const channelSlug = generateUniqueListingSlug(title || name, chatState.channels);
      const formattedPrice = formatNaira(priceNgn);
      const generatedDesc = `${area || ''} · ${formattedPrice}`.slice(0, 100);

      newChannel = {
        id: channelSlug,
        name: channelSlug,
        title: title ? title.trim() : (name || 'Property'),
        kind: 'listing',
        officeId: officeId || (currentUser?.officeId || 'hq'),
        location: area || '',
        area: area || '',
        price: Number(priceNgn) || 0,
        priceNgn: Number(priceNgn) || 0,
        status: status || 'Available',
        description: generatedDesc,
        members: [],
        createdById: currentUserId,
        adminIds: [currentUserId],
        sendPolicy: sendPolicy || 'everyone',
        createdAt: new Date().toISOString(),
        archived: false,
        listing: {
          officeId: officeId || (currentUser?.officeId || 'hq'),
          area: area || '',
          priceNgn: Number(priceNgn) || 0,
          status: status || 'Available',
        },
      };
    } else {
      const channelSlug = slugify(name);
      newChannel = {
        id: channelSlug,
        name: channelSlug,
        kind: kind || 'public',
        officeId: officeId ?? null,
        description: description ? description.trim() : '',
        members: kind === 'private'
          ? Array.from(new Set([currentUserId, ...(memberIds || [])]))
          : undefined,
        createdById: currentUserId,
        adminIds: [currentUserId],
        sendPolicy: sendPolicy || 'everyone',
        createdAt: new Date().toISOString(),
        archived: false,
      };
    }

    const systemMsg = {
      id: `msg-${Date.now()}`,
      channelId: newChannel.id,
      senderId: 'system',
      type: 'system',
      text: isListing
        ? `${creatorCallName} created this property room`
        : `${creatorCallName} created this channel`,
      createdAt: new Date().toISOString(),
      status: 'sent',
    };

    const entry = createActivityEntry({
      type: 'channel_created',
      actorId: currentUserId || 'ruth',
      subject: isListing ? (title || name) : `#${newChannel.name}`,
      detail: isListing ? 'Property room created' : `${newChannel.kind} channel created`,
    });

    setChatState((prev) => {
      const nextChannels = [...prev.channels, newChannel];
      const nextMessages = [...prev.messages, systemMsg];
      const nextReadState = { ...prev.lastReadAtByUser };
      const seedThreshold = minutesFromNow(-60);

      prev.staff.forEach((member) => {
        if (!nextReadState[member.id]) {
          nextReadState[member.id] = {};
        }
        nextReadState[member.id][newChannel.id] = seedThreshold;
      });

      return {
        ...prev,
        channels: nextChannels,
        messages: nextMessages,
        lastReadAtByUser: nextReadState,
        activityLog: prependActivity(prev.activityLog, entry),
      };
    });

    return newChannel;
  }, [currentUserId, currentUser, chatState.channels]);

  const openOrCreateDm = useCallback((targetUserId) => {
    if (!currentUserId || !targetUserId || currentUserId === targetUserId) return null;

    // 1. Check if a DM with these two members already exists
    const existing = chatState.channels.find((c) => {
      if (c.kind !== 'dm') return false;
      const members = Array.isArray(c.members) ? c.members : (c.memberIds || []);
      return members.includes(currentUserId) && members.includes(targetUserId);
    });

    if (existing) {
      return existing.id;
    }

    // 2. Otherwise create a new DM channel
    const dmSlug = getDmSlug(currentUserId, targetUserId);
    const newDm = {
      id: dmSlug,
      name: dmSlug,
      kind: 'dm',
      description: '',
      officeId: null,
      postPolicy: 'all',
      members: [currentUserId, targetUserId],
      memberIds: [currentUserId, targetUserId],
      createdById: currentUserId,
      adminIds: [currentUserId],
      sendPolicy: 'everyone',
      archived: false,
      createdAt: new Date().toISOString(),
    };

    setChatState((prev) => {
      if (prev.channels.some((c) => c.id === dmSlug)) {
        return prev;
      }
      return {
        ...prev,
        channels: [...prev.channels, newDm],
      };
    });

    return dmSlug;
  }, [currentUserId, chatState.channels]);

  const createSite = useCallback(({ title, officeId, location, description }) => {
    if (!currentUser || !isStaffActive(currentUser)) {
      return { ok: false, message: 'You must be logged in to create a site.' };
    }
    if (!canCreateSite(currentUser, officeId)) {
      return { ok: false, message: 'You do not have permission to create a site in this office.' };
    }
    const cleanTitle = (title || '').trim();
    if (!cleanTitle || cleanTitle.length < 3 || cleanTitle.length > 40) {
      return { ok: false, field: 'title', message: 'Site name must be 3 to 40 characters.' };
    }
    if (!officeId) {
      return { ok: false, field: 'officeId', message: 'Office is required.' };
    }
    const cleanLocation = (location || '').trim();
    if (!cleanLocation || cleanLocation.length > 30) {
      return { ok: false, field: 'location', message: 'Location is required (up to 30 characters).' };
    }
    const cleanDesc = (description || '').trim().slice(0, 100);

    const channelSlug = generateUniqueSiteSlug(cleanTitle, chatState.channels);
    const creatorCallName = callNameOf(currentUser) || 'Staff';
    const now = new Date().toISOString();

    const newSite = {
      id: channelSlug,
      name: channelSlug,
      title: cleanTitle,
      kind: 'site',
      officeId,
      location: cleanLocation,
      description: cleanDesc,
      members: undefined,
      createdById: currentUserId,
      adminIds: [currentUserId],
      sendPolicy: 'everyone',
      createdAt: now,
      archived: false,
      site: {
        officeId,
        location: cleanLocation,
      },
    };

    const systemMsg = {
      id: `msg-${Date.now()}`,
      channelId: newSite.id,
      senderId: 'system',
      type: 'system',
      text: `${creatorCallName} created this site`,
      createdAt: now,
      status: 'sent',
    };

    const entry = createActivityEntry({
      type: 'site_created',
      actorId: currentUserId || 'ruth',
      subject: cleanTitle,
      detail: 'Site created',
    });

    setChatState((prev) => ({
      ...prev,
      channels: [...prev.channels, newSite],
      messages: [...prev.messages, systemMsg],
      activityLog: prependActivity(prev.activityLog, entry),
    }));

    showToast(getSiteCreatedMessage(cleanTitle));
    return { ok: true, id: newSite.id };
  }, [currentUser, currentUserId, chatState.channels, showToast]);

  const updateSite = useCallback((siteId, { title, location, description }) => {
    if (!siteId) return { ok: false, message: 'Site ID is required.' };
    const targetSite = chatState.channels.find((c) => c.id === siteId && c.kind === 'site');
    if (!targetSite) {
      return { ok: false, message: 'Site not found.' };
    }
    if (!canAddProperty(currentUser, targetSite)) {
      return { ok: false, message: 'You do not have permission to edit this site.' };
    }

    const cleanTitle = title !== undefined ? title.trim() : targetSite.title;
    if (cleanTitle.length < 3 || cleanTitle.length > 40) {
      return { ok: false, field: 'title', message: 'Site name must be 3 to 40 characters.' };
    }

    const cleanLocation = location !== undefined ? location.trim() : (targetSite.site?.location || targetSite.location);
    if (!cleanLocation || cleanLocation.length > 30) {
      return { ok: false, field: 'location', message: 'Location is required (up to 30 characters).' };
    }

    const cleanDesc = description !== undefined ? description.trim().slice(0, 100) : (targetSite.description || '');

    const locationChanged = cleanLocation !== (targetSite.site?.location || targetSite.location);
    const now = new Date().toISOString();

    const sysMessages = [
      {
        id: `msg-sys-${Date.now()}-0`,
        channelId: siteId,
        senderId: 'system',
        type: 'system',
        text: 'Site details updated',
        createdAt: now,
        status: 'sent',
      },
    ];

    if (locationChanged) {
      sysMessages.push({
        id: `msg-sys-${Date.now()}-1`,
        channelId: siteId,
        senderId: 'system',
        type: 'system',
        text: `Location changed to ${cleanLocation}`,
        createdAt: now,
        status: 'sent',
      });
    }

    setChatState((prev) => {
      const updatedChannels = prev.channels.map((ch) => {
        if (ch.id === siteId) {
          return {
            ...ch,
            title: cleanTitle,
            location: cleanLocation,
            description: cleanDesc,
            site: {
              ...(ch.site || {}),
              location: cleanLocation,
            },
          };
        }
        if (locationChanged && ch.kind === 'listing' && ch.listing?.siteId === siteId) {
          const propPrice = ch.listing?.priceNgn || ch.price;
          const updatedDesc = `${cleanLocation} · ${formatNaira(propPrice)}`.slice(0, 100);
          return {
            ...ch,
            location: cleanLocation,
            area: cleanLocation,
            description: updatedDesc,
            listing: {
              ...(ch.listing || {}),
              area: cleanLocation,
            },
          };
        }
        return ch;
      });

      return {
        ...prev,
        channels: updatedChannels,
        messages: [...prev.messages, ...sysMessages],
      };
    });

    showToast(getSiteUpdatedMessage(cleanTitle));
    return { ok: true, id: siteId };
  }, [currentUser, chatState.channels, showToast]);

  const createProperty = useCallback((siteId, { title, type, size, priceNgn, status }) => {
    if (!siteId) return { ok: false, message: 'Site ID is required.' };
    const siteChannel = chatState.channels.find((c) => c.id === siteId && c.kind === 'site');
    if (!siteChannel) {
      return { ok: false, message: 'Site not found.' };
    }
    if (!canAddProperty(currentUser, siteChannel)) {
      return { ok: false, message: 'You do not have permission to add properties to this site.' };
    }

    const cleanTitle = (title || '').trim();
    if (!cleanTitle || cleanTitle.length < 2 || cleanTitle.length > 40) {
      return { ok: false, field: 'title', message: 'Property name must be 2 to 40 characters.' };
    }

    const numericPrice = Number(priceNgn) || 0;
    if (numericPrice <= 0 || numericPrice > 100000000000) {
      return { ok: false, field: 'price', message: 'Price must be greater than zero and at most ₦100,000,000,000.' };
    }

    const cleanType = (type || '').trim();
    const cleanSize = (size || '').trim().slice(0, 20);
    const cleanStatus = status || 'Available';
    const siteOfficeId = siteChannel.officeId || siteChannel.site?.officeId || 'hq';
    const siteLocation = siteChannel.site?.location || siteChannel.location || '';
    const formattedPrice = formatNaira(numericPrice);
    const desc = `${siteChannel.title} · ${formattedPrice}`.slice(0, 100);

    const channelSlug = generateUniqueListingSlug(cleanTitle, chatState.channels);
    const creatorCallName = callNameOf(currentUser) || 'Staff';
    const now = new Date().toISOString();

    const newProperty = {
      id: channelSlug,
      name: channelSlug,
      title: cleanTitle,
      kind: 'listing',
      officeId: siteOfficeId,
      location: siteLocation,
      area: siteLocation,
      price: numericPrice,
      priceNgn: numericPrice,
      status: cleanStatus,
      description: desc,
      members: [],
      createdById: currentUserId,
      adminIds: [currentUserId],
      sendPolicy: 'everyone',
      createdAt: now,
      archived: Boolean(siteChannel.archived),
      listing: {
        siteId,
        officeId: siteOfficeId,
        area: siteLocation,
        priceNgn: numericPrice,
        status: cleanStatus,
        type: cleanType,
        size: cleanSize,
      },
    };

    const propSysMsg = {
      id: `msg-${Date.now()}-prop`,
      channelId: newProperty.id,
      senderId: 'system',
      type: 'system',
      text: `${creatorCallName} added this property`,
      createdAt: now,
      status: 'sent',
    };

    const siteSysMsg = {
      id: `msg-${Date.now()}-site`,
      channelId: siteId,
      senderId: 'system',
      type: 'system',
      text: `Property added: ${cleanTitle}`,
      createdAt: now,
      status: 'sent',
    };

    const entry = createActivityEntry({
      type: 'property_created',
      actorId: currentUserId || 'ruth',
      subject: cleanTitle,
      detail: `Property added to ${siteChannel.title || 'site'}`,
    });

    setChatState((prev) => ({
      ...prev,
      channels: [...prev.channels, newProperty],
      messages: [...prev.messages, propSysMsg, siteSysMsg],
      activityLog: prependActivity(prev.activityLog, entry),
    }));

    showToast(getPropertyCreatedMessage(cleanTitle));
    return { ok: true, id: newProperty.id };
  }, [currentUser, currentUserId, chatState.channels, showToast]);

  const updateListingDetails = useCallback((channelId, { title, area, priceNgn, status, type, size }) => {
    if (!channelId) return { ok: false, message: 'Channel id required' };

    let success = false;
    setChatState((prev) => {
      const target = prev.channels.find((c) => c.id === channelId);
      if (!target || target.kind !== 'listing') return prev;

      if (!canManageListing(currentUser, target)) {
        return prev;
      }
      success = true;

      const priceChanged = priceNgn !== undefined && Number(priceNgn) !== Number(target.price);
      const statusChanged = status !== undefined && status !== target.status;
      const detailsChanged =
        (title !== undefined && title.trim() !== target.title) ||
        (area !== undefined && area.trim() !== (target.area || target.location)) ||
        (type !== undefined && type !== target.listing?.type) ||
        (size !== undefined && size.trim() !== (target.listing?.size || ''));

      const newTitle = title !== undefined ? title.trim() : target.title;
      const newArea = area !== undefined ? area.trim() : (target.area || target.location);
      const newPrice = priceNgn !== undefined ? Number(priceNgn) : target.price;
      const newStatus = status !== undefined ? status : target.status;
      const newType = type !== undefined ? type : (target.listing?.type || '');
      const newSize = size !== undefined ? size.trim() : (target.listing?.size || '');
      const newDesc = `${newArea} · ${formatNaira(newPrice)}`.slice(0, 100);

      const sysMessages = [];
      const now = new Date().toISOString();
      let offset = 0;

      if (priceChanged) {
        sysMessages.push({
          id: `msg-sys-${Date.now()}-${offset++}`,
          channelId,
          senderId: 'system',
          type: 'system',
          text: `Price updated to ${formatNaira(newPrice)}`,
          createdAt: now,
          status: 'sent',
        });
      }

      if (statusChanged) {
        sysMessages.push({
          id: `msg-sys-${Date.now()}-${offset++}`,
          channelId,
          senderId: 'system',
          type: 'system',
          text: `Status changed to ${newStatus}`,
          createdAt: now,
          status: 'sent',
        });
      }

      if (detailsChanged) {
        sysMessages.push({
          id: `msg-sys-${Date.now()}-${offset}`,
          channelId,
          senderId: 'system',
          type: 'system',
          text: 'Details updated',
          createdAt: now,
          status: 'sent',
        });
      }

      const updatedChannels = prev.channels.map((ch) => {
        if (ch.id === channelId) {
          return {
            ...ch,
            title: newTitle,
            area: newArea,
            location: newArea,
            price: newPrice,
            priceNgn: newPrice,
            status: newStatus,
            description: newDesc,
            listing: {
              ...(ch.listing || {}),
              area: newArea,
              priceNgn: newPrice,
              status: newStatus,
              type: newType,
              size: newSize,
            },
          };
        }
        return ch;
      });

      return {
        ...prev,
        channels: updatedChannels,
        messages: sysMessages.length > 0 ? [...prev.messages, ...sysMessages] : prev.messages,
      };
    });

    if (success) {
      showToast(getListingDetailsUpdatedMessage());
      return { ok: true, id: channelId };
    }
    return { ok: false, message: 'Permission denied.' };
  }, [currentUser, showToast]);

  const setChannelArchived = useCallback((channelId, archived) => {
    setChatState((prev) => {
      const targetChannel = prev.channels.find((ch) => ch.id === channelId);
      const isSite = targetChannel?.kind === 'site';
      const entry = createActivityEntry({
        type: archived ? 'channel_archived' : 'channel_unarchived',
        actorId: currentUserId || 'ruth',
        subject: targetChannel?.kind === 'listing' || targetChannel?.kind === 'site'
          ? (targetChannel?.title || targetChannel?.name || 'Property')
          : `#${targetChannel?.name || 'channel'}`,
        detail: archived ? 'Channel archived' : 'Channel unarchived',
      });

      const nextChannels = prev.channels.map((ch) => {
        if (ch.id === channelId) {
          return {
            ...ch,
            archived: Boolean(archived),
          };
        }
        if (isSite && ch.kind === 'listing' && (ch.listing?.siteId === channelId || ch.siteId === channelId)) {
          return {
            ...ch,
            archived: Boolean(archived),
          };
        }
        return ch;
      });

      return {
        ...prev,
        channels: nextChannels,
        activityLog: prependActivity(prev.activityLog, entry),
      };
    });
  }, [currentUserId]);

  const setChannelAdmin = useCallback((channelId, staffId, makeAdmin) => {
    if (!channelId || !staffId || !currentUser) return 'Invalid request.';
    const channel = channels.find((c) => c.id === channelId);
    if (!channel) return 'Channel not found.';

    if (!canManageChannel(currentUser, channel)) {
      return 'You do not have permission to manage this channel.';
    }

    const targetStaff = staff.find((s) => s.id === staffId);
    if (!targetStaff) return 'Staff member not found.';

    // Company admins' rights are implicit and not editable
    if (targetStaff.role === 'admin') {
      return 'Company admins are already admins of every channel.';
    }

    // Target must be an active member (using channelMembersFor)
    const members = channelMembersFor(channel, staff);
    const isMember = members.some((m) => m.id === staffId && isStaffActive(m));
    if (!isMember) {
      return 'Target must be an active member of the channel.';
    }

    const currentAdminIds = Array.isArray(channel.adminIds)
      ? channel.adminIds
      : (channel.createdById ? [channel.createdById] : []);

    // A person cannot remove their own channel-admin status when they are the only entry in adminIds
    if (!makeAdmin && currentAdminIds.includes(staffId)) {
      if (currentAdminIds.length === 1 && currentAdminIds[0] === staffId) {
        return 'A channel must have at least one admin.';
      }
    }

    const nextAdminIds = makeAdmin
      ? Array.from(new Set([...currentAdminIds, staffId]))
      : currentAdminIds.filter((id) => id !== staffId);

    const actorCallName = callNameOf(currentUser) || 'Staff';
    const targetCallName = callNameOf(targetStaff) || 'Staff';

    const systemText = makeAdmin
      ? `${actorCallName} made ${targetCallName} a channel admin`
      : `${actorCallName} removed ${targetCallName} as channel admin`;

    const systemMsg = {
      id: `msg-sys-${Date.now()}`,
      channelId,
      senderId: 'system',
      type: 'system',
      text: systemText,
      createdAt: new Date().toISOString(),
      status: 'sent',
    };

    const entry = createActivityEntry({
      type: 'channel_admin_changed',
      actorId: currentUserId || 'ruth',
      subject: channel.kind === 'listing' || channel.kind === 'site' ? (channel.title || channel.name) : `#${channel.name}`,
      detail: `${targetCallName} ${makeAdmin ? 'promoted to' : 'removed from'} channel admin`,
    });

    setChatState((prev) => {
      const nextChannels = prev.channels.map((ch) =>
        ch.id === channelId ? { ...ch, adminIds: nextAdminIds } : ch
      );
      return {
        ...prev,
        channels: nextChannels,
        messages: [...prev.messages, systemMsg],
        activityLog: prependActivity(prev.activityLog, entry),
      };
    });

    if (makeAdmin) {
      showToast(getChannelAdminAddedMessage(targetCallName));
    } else {
      showToast(getChannelAdminRemovedMessage(targetCallName));
    }

    return null;
  }, [currentUser, currentUserId, channels, staff, showToast]);

  const setChannelSendPolicy = useCallback((channelId, policy) => {
    if (!channelId || !currentUser) return;
    if (policy !== 'everyone' && policy !== 'admins') return;

    const channel = channels.find((c) => c.id === channelId);
    if (!channel) return;

    if (!canManageChannel(currentUser, channel)) {
      return;
    }

    if (channel.sendPolicy === policy) return;

    const actorCallName = callNameOf(currentUser) || 'Staff';
    const systemText = policy === 'admins'
      ? `${actorCallName} changed who can send messages to only admins`
      : `${actorCallName} changed who can send messages to everyone`;

    const systemMsg = {
      id: `msg-sys-${Date.now()}`,
      channelId,
      senderId: 'system',
      type: 'system',
      text: systemText,
      createdAt: new Date().toISOString(),
      status: 'sent',
    };

    const entry = createActivityEntry({
      type: 'send_policy_changed',
      actorId: currentUserId || 'ruth',
      subject: channel.kind === 'listing' || channel.kind === 'site' ? (channel.title || channel.name) : `#${channel.name}`,
      detail: `Posting policy set to ${policy}`,
    });

    setChatState((prev) => {
      const nextChannels = prev.channels.map((ch) =>
        ch.id === channelId ? { ...ch, sendPolicy: policy } : ch
      );
      return {
        ...prev,
        channels: nextChannels,
        messages: [...prev.messages, systemMsg],
        activityLog: prependActivity(prev.activityLog, entry),
      };
    });

    showToast(getChannelSendPolicyChangedMessage(policy));
  }, [currentUser, currentUserId, channels, showToast]);

  const claimLead = useCallback((messageId) => {
    if (!messageId || !currentUserId) return;
    const target = messages.find((m) => m.id === messageId);
    if (!target || target.claimedById) return;

    const targetChannel = channels.find((c) => c.id === target.channelId);
    if (!canClaimLead(currentUser, targetChannel)) return;

    const claimedAt = new Date().toISOString();
    const leadTakerName = callNameOf(currentUser) || 'Staff';

    const systemMessage = {
      id: `msg-sys-${Date.now()}`,
      channelId: target.channelId,
      senderId: 'system',
      type: 'system',
      text: `${leadTakerName} took this lead`,
      createdAt: new Date().toISOString(),
      status: 'sent',
    };

    setChatState((prev) => {
      const updatedMessages = prev.messages.map((m) => {
        if (m.id === messageId) {
          return {
            ...m,
            claimedById: currentUserId,
            claimedAt,
          };
        }
        return m;
      });
      return {
        ...prev,
        messages: [...updatedMessages, systemMessage],
      };
    });

    showToast(getLeadClaimedMessage(target.clientName));
  }, [currentUserId, currentUser, messages, channels, showToast]);

  const setListingStatus = useCallback((channelId, status) => {
    if (!channelId || !status) return;

    const systemMessage = {
      id: `msg-sys-${Date.now()}`,
      channelId,
      senderId: 'system',
      type: 'system',
      text: `Status changed to ${status}`,
      createdAt: new Date().toISOString(),
      status: 'sent',
    };

    setChatState((prev) => {
      const updatedChannels = prev.channels.map((ch) => {
        if (ch.id === channelId) {
          return {
            ...ch,
            status,
          };
        }
        return ch;
      });
      return {
        ...prev,
        channels: updatedChannels,
        messages: [...prev.messages, systemMessage],
      };
    });

    showToast(getListingStatusUpdatedMessage(status));
  }, [showToast]);

  const simulateNewLead = useCallback(() => {
    const officeId = currentUser?.seesAllOffices ? 'hq' : (currentUser?.officeId || 'hq');
    const matchingLeads = channels.find((c) => c.name === `${officeId}-leads` || c.name === 'leads');
    const targetChannelId = matchingLeads ? matchingLeads.id : 'sales';
    const pool = LEADS_BY_OFFICE[officeId] || LEADS_BY_OFFICE.hq;
    const sample = pool[Math.floor(Math.random() * pool.length)];
    const leadTime = new Date().toISOString();

    const newLeadMessage = {
      id: `msg-lead-${Date.now()}`,
      channelId: targetChannelId,
      senderId: currentUserId || 'system',
      type: 'lead',
      clientName: sample.clientName,
      enquiry: sample.enquiry,
      area: sample.area,
      budgetNgn: sample.budgetNgn,
      claimedById: null,
      claimedAt: null,
      createdAt: leadTime,
      status: 'sent',
    };

    setChatState((prev) => {
      const currentReadState = prev.lastReadAtByUser || {};
      const userReadMap = { ...(currentReadState[currentUserId] || {}) };
      userReadMap[targetChannelId] = leadTime;

      return {
        ...prev,
        messages: [...prev.messages, newLeadMessage],
        lastReadAtByUser: {
          ...currentReadState,
          [currentUserId]: userReadMap,
        },
      };
    });

    showToast(getLeadSimulatedMessage(sample.area));
  }, [channels, currentUser, currentUserId, showToast]);

  const postLead = useCallback(
    (channelId, { clientName, enquiry, area, budgetNgn }) => {
      if (!channelId || !currentUserId) return null;
      const channel = channels.find((c) => c.id === channelId);
      if (!channel || !canPostLead(currentUser, channel)) return null;

      const nowIso = new Date().toISOString();
      const newLeadMessage = {
        id: `msg-lead-${Date.now()}`,
        channelId,
        senderId: currentUserId,
        type: 'lead',
        clientName: (clientName || '').trim(),
        enquiry: normaliseMessageText(enquiry),
        area: (area || '').trim(),
        budgetNgn: Number(budgetNgn) || 0,
        claimedById: null,
        claimedAt: null,
        createdAt: nowIso,
        status: isOffline ? 'queued' : 'sent',
      };

      setChatState((prev) => {
        const currentReadState = prev.lastReadAtByUser || {};
        const userReadMap = { ...(currentReadState[currentUserId] || {}) };
        userReadMap[channelId] = nowIso;

        return {
          ...prev,
          messages: [...prev.messages, newLeadMessage],
          lastReadAtByUser: {
            ...currentReadState,
            [currentUserId]: userReadMap,
          },
        };
      });

      showToast(getLeadPostedMessage());
      return newLeadMessage;
    },
    [channels, currentUser, currentUserId, isOffline, showToast]
  );

  const shareListing = useCallback(
    (channelId, listingChannelId, note = '', targetChannelDisplayName = '') => {
      if (!channelId || !listingChannelId || !currentUserId) return null;
      const targetChannel = channels.find((c) => c.id === channelId);
      if (!targetChannel || !canShareListing(currentUser, targetChannel)) return null;

      const allowed = shareableListings(currentUser, channels);
      if (!allowed.some((l) => l.id === listingChannelId)) return null;

      const nowIso = new Date().toISOString();
      const newListingMessage = {
        id: `msg-listing-${Date.now()}`,
        channelId,
        senderId: currentUserId,
        type: 'listing',
        listingChannelId,
        note: normaliseMessageText(note),
        createdAt: nowIso,
        status: isOffline ? 'queued' : 'sent',
      };

      setChatState((prev) => {
        const currentReadState = prev.lastReadAtByUser || {};
        const userReadMap = { ...(currentReadState[currentUserId] || {}) };
        userReadMap[channelId] = nowIso;

        return {
          ...prev,
          messages: [...prev.messages, newListingMessage],
          lastReadAtByUser: {
            ...currentReadState,
            [currentUserId]: userReadMap,
          },
        };
      });

      if (targetChannelDisplayName) {
        showToast(getListingSharedInChannelMessage(targetChannelDisplayName));
      } else {
        showToast(getListingSharedMessage());
      }
      return newListingMessage;
    },
    [channels, currentUser, currentUserId, isOffline, showToast]
  );

  const activeStaff = useMemo(() => {
    return staff.filter((s) => isStaffActive(s));
  }, [staff]);

  const value = useMemo(() => ({
    currentUserId,
    currentUser,
    staff,
    staffById,
    activeStaff,
    channels,
    channelsById,
    messages,
    lastReadAtByUser,
    isOffline,
    setOffline,
    typingStatus,
    clearTypingTimer,
    login,
    signIn,
    activateAccount,
    requestPasswordReset,
    resetPassword,
    changePassword,
    activationLinks,
    resetLinks,
    logout,
    switchUser,
    sendMessage,
    sendThreadReply,
    sendVoiceNote,
    sendFile,
    editMessage,
    deleteMessage,
    togglePin,
    toggleReaction,
    markChannelRead,
    resetDemo,
    notifyPrefs,
    updateNotifyPrefs,
    toggleMuteChannel,
    addStaff,
    updateStaff,
    setStaffActive,
    createChannel,
    createSite,
    updateSite,
    createProperty,
    openOrCreateDm,
    setChannelArchived,
    setChannelAdmin,
    setChannelSendPolicy,
    claimLead,
    setListingStatus,
    updateListingDetails,
    simulateNewLead,
    postLead,
    shareListing,
    accessRequests,
    submitAccessRequest,
    approveAccessRequest,
    declineAccessRequest,
    activityLog,
    logActivity,
    sendActivationLink,
    sendPasswordResetLink,
    importStaff,
  }), [
    currentUserId,
    currentUser,
    staff,
    staffById,
    activeStaff,
    channels,
    channelsById,
    messages,
    lastReadAtByUser,
    isOffline,
    setOffline,
    typingStatus,
    clearTypingTimer,
    login,
    signIn,
    activateAccount,
    requestPasswordReset,
    resetPassword,
    changePassword,
    activationLinks,
    resetLinks,
    logout,
    switchUser,
    sendMessage,
    sendThreadReply,
    sendVoiceNote,
    sendFile,
    editMessage,
    deleteMessage,
    togglePin,
    toggleReaction,
    markChannelRead,
    resetDemo,
    notifyPrefs,
    updateNotifyPrefs,
    toggleMuteChannel,
    addStaff,
    updateStaff,
    setStaffActive,
    createChannel,
    createSite,
    updateSite,
    createProperty,
    openOrCreateDm,
    setChannelArchived,
    setChannelAdmin,
    setChannelSendPolicy,
    claimLead,
    setListingStatus,
    updateListingDetails,
    simulateNewLead,
    postLead,
    shareListing,
    accessRequests,
    submitAccessRequest,
    approveAccessRequest,
    declineAccessRequest,
    activityLog,
    logActivity,
    sendActivationLink,
    sendPasswordResetLink,
    importStaff,
  ]);

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
