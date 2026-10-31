import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { safeLocalStorage, safeSessionStorage } from '../utils/storage.js';
import { normalisePhoneNg, minutesFromNow } from '../utils/formatters.js';
import { STAFF, STAFF_BY_ID } from '../mock/staff.js';
import { CHANNELS } from '../mock/channels.js';
import { SEED_MESSAGES } from '../mock/chatSeed.js';

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
  // 1. Current logged-in staff id (persisted in safeLocalStorage as 'session_user')
  const [currentUserId, setCurrentUserId] = useState(() => {
    return safeLocalStorage.get('session_user', 'adaeze');
  });

  // 2. Chat state (messages & lastReadAtByUser persisted in safeSessionStorage as 'chat_state')
  const [chatState, setChatState] = useState(() => {
    const stored = safeSessionStorage.get('chat_state', null);
    if (stored && Array.isArray(stored.messages) && stored.lastReadAtByUser) {
      return stored;
    }
    return {
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
    setCurrentUserId(null);
    safeLocalStorage.remove('session_user');
  }, []);

  const switchUser = useCallback((id) => {
    if (STAFF_BY_ID[id]) {
      setCurrentUserId(id);
      safeLocalStorage.set('session_user', id);
    }
  }, []);

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
    };

    setChatState((prev) => {
      const userReadMap = prev.lastReadAtByUser[currentUserId] || {};
      return {
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
  }, [currentUserId]);

  const resetDemo = useCallback(() => {
    safeSessionStorage.remove('chat_state');
    const fresh = {
      messages: SEED_MESSAGES,
      lastReadAtByUser: buildInitialReadState(),
    };
    setChatState(fresh);
    setCurrentUserId('adaeze');
    safeLocalStorage.set('session_user', 'adaeze');
  }, []);

  const value = useMemo(() => ({
    currentUserId,
    currentUser,
    staff: STAFF,
    staffById: STAFF_BY_ID,
    channels: CHANNELS,
    messages,
    lastReadAtByUser,
    login,
    logout,
    switchUser,
    sendMessage,
    markChannelRead,
    resetDemo,
  }), [
    currentUserId,
    currentUser,
    messages,
    lastReadAtByUser,
    login,
    logout,
    switchUser,
    sendMessage,
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
