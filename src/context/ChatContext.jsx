import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { safeLocalStorage, safeSessionStorage } from '../utils/storage.js';
import { normalisePhoneNg, isValidPhoneNg, minutesFromNow } from '../utils/formatters.js';
import { STAFF, ROLE_LABELS } from '../mock/staff.js';
import { CHANNELS } from '../mock/channels.js';
import { SEED_MESSAGES } from '../mock/chatSeed.js';
import { SEED_ACCESS_REQUESTS } from '../mock/accessRequests.js';
import { LAGOS_LEADS_POOL, ABUJA_LEADS_POOL } from '../mock/leads.js';
import { getRandomColleagueReply } from '../mock/replies.js';
import { channelMembersFor, slugify, isStaffActive, requestForPhone } from '../utils/chat.js';
import { COMPANY_CONFIG } from '../config/market.js';
import { useToast } from '../components/common/useToast.js';
import {
  getBackOnlineMessage,
  getMessagePinnedMessage,
  getMessageUnpinnedMessage,
  getChannelMutedMessage,
  getChannelUnmutedMessage,
  getDeactivatedLoginErrorMessage,
  getPendingRequestLoginErrorMessage,
  getDeclinedRequestLoginErrorMessage,
  getUnregisteredPhoneLoginErrorMessage,
  getLeadClaimedMessage,
  getLeadSimulatedMessage,
  getListingStatusUpdatedMessage,
} from '../utils/messages.js';

const CHAT_STATE_VERSION = 'chat-10';

const DEFAULT_USER_NOTIFY_PREFS = {
  mutedChannelIds: [],
  mode: 'all',
  quietStart: '21:00',
  quietEnd: '07:00',
};

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

  // 1. Chat state (messages, staff, channels, accessRequests & lastReadAtByUser persisted in safeSessionStorage as 'chat_state')
  const [chatState, setChatState] = useState(() => {
    const stored = safeSessionStorage.get('chat_state', null);
    if (
      stored &&
      stored.version === CHAT_STATE_VERSION &&
      Array.isArray(stored.messages) &&
      Array.isArray(stored.staff) &&
      Array.isArray(stored.channels) &&
      Array.isArray(stored.accessRequests) &&
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
      lastReadAtByUser: buildInitialReadState(STAFF, CHANNELS),
    };
  });

  const staff = chatState.staff;
  const channels = chatState.channels;
  const messages = chatState.messages;
  const accessRequests = chatState.accessRequests;
  const lastReadAtByUser = chatState.lastReadAtByUser;

  // 2. Current logged-in staff id (persisted in safeLocalStorage as 'session_user')
  const [currentUserId, setCurrentUserId] = useState(() => {
    const saved = safeLocalStorage.get('session_user', null);
    if (!saved) return null;
    const matched = staff.find((s) => s.id === saved);
    if (matched && isStaffActive(matched)) {
      return saved;
    }
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

  const login = useCallback((phone) => {
    const normalised = normalisePhoneNg(phone);
    if (!normalised) {
      return { success: false, error: 'Please enter a valid Nigerian phone number.' };
    }
    const matched = staff.find((s) => normalisePhoneNg(s.phone) === normalised);
    if (matched) {
      if (!isStaffActive(matched)) {
        return { success: false, error: getDeactivatedLoginErrorMessage() };
      }
      setCurrentUserId(matched.id);
      safeLocalStorage.set('session_user', matched.id);
      return { success: true, user: matched };
    }
    const req = requestForPhone(accessRequests, normalised);
    if (req) {
      if (req.status === 'pending') {
        return { success: false, error: getPendingRequestLoginErrorMessage() };
      }
      if (req.status === 'declined') {
        return { success: false, error: getDeclinedRequestLoginErrorMessage() };
      }
    }
    return { success: false, error: getUnregisteredPhoneLoginErrorMessage() };
  }, [staff, accessRequests]);

  const logout = useCallback(() => {
    clearTypingTimer();
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
    if (!text || !text.trim() || !currentUserId) return;
    const nowIso = new Date().toISOString();
    const newMsg = {
      id: `msg-${Date.now()}`,
      channelId,
      senderId: currentUserId,
      type: 'text',
      text: text.trim(),
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
    if (!isOffline && channelId !== 'announcements') {
      const currentChannel = channels.find((c) => c.id === channelId);
      const candidates = currentChannel
        ? channelMembersFor(currentChannel, staff).filter((s) => s.id !== currentUserId && s.online && isStaffActive(s))
        : [];

      if (candidates.length > 0) {
        const responder = candidates[Math.floor(Math.random() * candidates.length)];
        const responderName = responder.name.split(' ')[0];

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
  }, [currentUserId, isOffline, channels, staff, clearTypingTimer]);

  const sendThreadReply = useCallback((channelId, parentId, text) => {
    if (!text || !text.trim() || !currentUserId || !parentId) return;
    const nowIso = new Date().toISOString();
    const newMsg = {
      id: `msg-${Date.now()}`,
      channelId,
      parentId,
      senderId: currentUserId,
      type: 'text',
      text: text.trim(),
      createdAt: nowIso,
      status: isOffline ? 'queued' : 'sent',
    };

    setChatState((prev) => ({
      ...prev,
      messages: [...prev.messages, newMsg],
    }));
  }, [currentUserId, isOffline]);

  const sendVoiceNote = useCallback((channelId, durationSec) => {
    if (!currentUserId || !channelId) return;
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
  }, [currentUserId, isOffline]);

  const sendFile = useCallback((channelId, { fileName, fileSize, fileKind }) => {
    if (!currentUserId || !channelId || !fileName) return null;
    const nowIso = new Date().toISOString();
    const newMsg = {
      id: `msg-${Date.now()}`,
      channelId,
      senderId: currentUserId,
      type: 'file',
      fileName,
      fileSize: fileSize || '1.2 MB',
      fileKind: fileKind || 'document',
      text: fileName,
      createdAt: nowIso,
      status: isOffline ? 'queued' : 'sent',
    };

    setChatState((prev) => ({
      ...prev,
      messages: [...prev.messages, newMsg],
    }));

    return newMsg.id;
  }, [currentUserId, isOffline]);

  const editMessage = useCallback((messageId, newText) => {
    if (!messageId || !newText.trim()) return;
    const nowIso = new Date().toISOString();
    setChatState((prev) => ({
      ...prev,
      messages: prev.messages.map((m) =>
        m.id === messageId
          ? { ...m, text: newText.trim(), editedAt: nowIso }
          : m
      ),
    }));
  }, []);

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
    safeSessionStorage.remove('chat_state');
    const fresh = {
      version: CHAT_STATE_VERSION,
      messages: SEED_MESSAGES,
      staff: STAFF,
      channels: CHANNELS,
      accessRequests: SEED_ACCESS_REQUESTS,
      lastReadAtByUser: buildInitialReadState(STAFF, CHANNELS),
    };
    setChatState(fresh);
    setCurrentUserId(null);
    setIsOffline(false);
    safeLocalStorage.remove('session_user');
  }, [clearTypingTimer]);

  const addStaff = useCallback(({ name, phone, role, office }) => {
    const baseSlug = slugify(name);
    let id = baseSlug || 'staff';
    let counter = 2;
    while (staff.some((s) => s.id === id)) {
      id = `${baseSlug}-${counter}`;
      counter++;
    }

    const words = name.trim().split(/\s+/).filter(Boolean);
    const initials = words.slice(0, 2).map((w) => w[0].toUpperCase()).join('') || 'ST';
    const roleLabel = ROLE_LABELS[role] || role;
    const officeName = office === 'abuja' ? 'Abuja' : 'Lagos';
    const title = `${roleLabel}, ${officeName}`;
    const normalisedPhone = normalisePhoneNg(phone);

    const newPerson = {
      id,
      name: name.trim(),
      role,
      title,
      office,
      officeId: office,
      phone: normalisedPhone,
      initials,
      online: false,
      status: 'active',
      active: true,
    };

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
        lastReadAtByUser: nextReadState,
      };
    });

    return newPerson;
  }, [staff]);

  const updateStaff = useCallback((staffId, { role, office }) => {
    const roleLabel = ROLE_LABELS[role] || role;
    const officeName = office === 'abuja' ? 'Abuja' : 'Lagos';
    const title = `${roleLabel}, ${officeName}`;

    setChatState((prev) => {
      const nextStaff = prev.staff.map((s) => {
        if (s.id !== staffId) return s;
        return {
          ...s,
          role,
          office,
          officeId: office,
          title,
        };
      });

      return {
        ...prev,
        staff: nextStaff,
      };
    });
  }, []);

  const setStaffActive = useCallback((staffId, active) => {
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

  const submitAccessRequest = useCallback(({ name, phone, officeId, requestedRole }) => {
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return { ok: false, field: 'name', message: 'Full name is required (at least 2 characters).' };
    }

    const normalised = normalisePhoneNg(phone);
    if (!normalised || !isValidPhoneNg(phone)) {
      return { ok: false, field: 'phone', message: 'Please enter a valid Nigerian phone number (+234 80X XXX XXXX).' };
    }

    // Phone must not belong to an existing staff member (any status)
    const staffMatch = staff.some((s) => normalisePhoneNg(s.phone) === normalised);
    if (staffMatch) {
      return { ok: false, field: 'phone', message: 'This number already has an account or a pending request.' };
    }

    // Phone must not belong to a pending request
    const existingReq = requestForPhone(accessRequests, normalised);
    if (existingReq) {
      if (existingReq.status === 'pending' || existingReq.status === 'approved') {
        return { ok: false, field: 'phone', message: 'This number already has an account or a pending request.' };
      }
      // If status is 'declined', we will replace that request!
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

  const approveAccessRequest = useCallback((id, { role, officeId } = {}) => {
    const targetReq = accessRequests.find((r) => r.id === id);
    if (!targetReq) return null;
    const chosenRole = role || targetReq.requestedRole;
    const chosenOffice = officeId || targetReq.officeId;

    const newPerson = addStaff({
      name: targetReq.name,
      phone: targetReq.phone,
      role: chosenRole,
      office: chosenOffice,
    });

    const decidedAt = new Date().toISOString();
    setChatState((prev) => {
      const prevReqs = Array.isArray(prev.accessRequests) ? prev.accessRequests : [];
      return {
        ...prev,
        accessRequests: prevReqs.map((r) =>
          r.id === id
            ? { ...r, status: 'approved', decidedAt }
            : r
        ),
      };
    });

    return newPerson;
  }, [accessRequests, addStaff]);

  const declineAccessRequest = useCallback((id) => {
    const decidedAt = new Date().toISOString();
    setChatState((prev) => {
      const prevReqs = Array.isArray(prev.accessRequests) ? prev.accessRequests : [];
      return {
        ...prev,
        accessRequests: prevReqs.map((r) =>
          r.id === id ? { ...r, status: 'declined', decidedAt } : r
        ),
      };
    });
  }, []);

  const createChannel = useCallback(({ name, kind, officeId, description, memberIds }) => {
    const channelSlug = slugify(name);
    const newChannel = {
      id: channelSlug,
      name: channelSlug,
      kind: kind || 'public',
      officeId: officeId ?? null,
      description: description ? description.trim() : '',
      members: kind === 'private'
        ? Array.from(new Set([currentUserId, ...(memberIds || [])]))
        : undefined,
      createdById: currentUserId,
      createdAt: new Date().toISOString(),
      archived: false,
    };

    const creatorName = currentUser?.name || 'Staff';
    const systemMsg = {
      id: `msg-${Date.now()}`,
      channelId: newChannel.id,
      senderId: 'system',
      type: 'system',
      text: `${creatorName} created this channel`,
      createdAt: new Date().toISOString(),
      status: 'sent',
    };

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
      };
    });

    return newChannel;
  }, [currentUserId, currentUser]);

  const setChannelArchived = useCallback((channelId, archived) => {
    setChatState((prev) => {
      const nextChannels = prev.channels.map((ch) => {
        if (ch.id !== channelId) return ch;
        return {
          ...ch,
          archived: Boolean(archived),
        };
      });

      return {
        ...prev,
        channels: nextChannels,
      };
    });
  }, []);

  const claimLead = useCallback((messageId) => {
    if (!messageId || !currentUserId) return;
    const target = messages.find((m) => m.id === messageId);
    if (!target || target.claimedById) return;

    const claimedAt = new Date().toISOString();
    const leadTakerName = currentUser?.name || 'Staff';

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
  }, [currentUserId, currentUser, messages, showToast]);

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
    const isAbuja = currentUser?.office === 'abuja';
    const targetChannelId = isAbuja ? 'abuja-leads' : 'lagos-leads';
    const pool = isAbuja ? ABUJA_LEADS_POOL : LAGOS_LEADS_POOL;
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
  }, [currentUser, currentUserId, showToast]);

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
    setChannelArchived,
    claimLead,
    setListingStatus,
    simulateNewLead,
    accessRequests,
    submitAccessRequest,
    approveAccessRequest,
    declineAccessRequest,
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
    setChannelArchived,
    claimLead,
    setListingStatus,
    simulateNewLead,
    accessRequests,
    submitAccessRequest,
    approveAccessRequest,
    declineAccessRequest,
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
