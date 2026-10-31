import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { safeLocalStorage, safeSessionStorage } from '../utils/storage.js';
import { normalisePhoneNg, minutesFromNow } from '../utils/formatters.js';
import { STAFF, STAFF_BY_ID } from '../mock/staff.js';
import { CHANNELS } from '../mock/channels.js';
import { SEED_MESSAGES } from '../mock/chatSeed.js';
import { getRandomColleagueReply } from '../mock/replies.js';
import { useToast } from '../components/common/useToast.js';
import {
  getBackOnlineMessage,
  getMessagePinnedMessage,
  getMessageUnpinnedMessage,
} from '../utils/messages.js';

const CHAT_STATE_VERSION = 'chat-2';

function buildInitialReadState() {
  const seedThreshold = minutesFromNow(-300);
  const state = {};
  STAFF.forEach((member) => {
    state[member.id] = {};
    CHANNELS.forEach((ch) => {
      state[member.id][ch.id] = seedThreshold;
    });
  });
  return state;
}

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const { showToast } = useToast();

  // 1. Current logged-in staff id (persisted in safeLocalStorage as 'session_user')
  const [currentUserId, setCurrentUserId] = useState(() => {
    return safeLocalStorage.get('session_user', 'adaeze');
  });

  // 2. Offline simulation mode
  const [isOffline, setIsOffline] = useState(false);

  // 3. Typing indicator status: null or { channelId, staffName }
  const [typingStatus, setTypingStatus] = useState(null);
  const replyTimerRef = useRef(null);

  // 4. Chat state (messages & lastReadAtByUser persisted in safeSessionStorage as 'chat_state')
  const [chatState, setChatState] = useState(() => {
    const stored = safeSessionStorage.get('chat_state', null);
    if (
      stored &&
      stored.version === CHAT_STATE_VERSION &&
      Array.isArray(stored.messages) &&
      stored.lastReadAtByUser
    ) {
      return stored;
    }
    return {
      version: CHAT_STATE_VERSION,
      messages: SEED_MESSAGES,
      lastReadAtByUser: buildInitialReadState(),
    };
  });

  const messages = chatState.messages;
  const lastReadAtByUser = chatState.lastReadAtByUser;

  // Persist chat state whenever it changes
  useEffect(() => {
    safeSessionStorage.set('chat_state', chatState);
  }, [chatState]);

  const currentUser = useMemo(() => {
    return currentUserId ? STAFF_BY_ID[currentUserId] || null : null;
  }, [currentUserId]);

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
    const matched = STAFF.find((s) => normalisePhoneNg(s.phone) === normalised);
    if (!matched) {
      return { success: false, error: "This number hasn't been added by your admin." };
    }
    setCurrentUserId(matched.id);
    safeLocalStorage.set('session_user', matched.id);
    return { success: true, user: matched };
  }, []);

  const logout = useCallback(() => {
    clearTypingTimer();
    setCurrentUserId(null);
    safeLocalStorage.remove('session_user');
  }, [clearTypingTimer]);

  const switchUser = useCallback((id) => {
    if (STAFF_BY_ID[id]) {
      clearTypingTimer();
      setCurrentUserId(id);
      safeLocalStorage.set('session_user', id);
    }
  }, [clearTypingTimer]);

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
      const currentChannel = CHANNELS.find((c) => c.id === channelId);
      let candidates = [];

      if (currentChannel && Array.isArray(currentChannel.members)) {
        candidates = currentChannel.members
          .filter((id) => id !== currentUserId)
          .map((id) => STAFF_BY_ID[id])
          .filter((s) => s && s.online);
      }

      if (candidates.length === 0) {
        candidates = STAFF.filter((s) => s.id !== currentUserId && s.online);
      }

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
  }, [currentUserId, isOffline, clearTypingTimer]);

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
    if (!currentUserId || !channelId || !fileName) return;
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
      lastReadAtByUser: buildInitialReadState(),
    };
    setChatState(fresh);
    setCurrentUserId('adaeze');
    setIsOffline(false);
    safeLocalStorage.set('session_user', 'adaeze');
  }, [clearTypingTimer]);

  const value = useMemo(() => ({
    currentUserId,
    currentUser,
    staff: STAFF,
    staffById: STAFF_BY_ID,
    channels: CHANNELS,
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
  }), [
    currentUserId,
    currentUser,
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
