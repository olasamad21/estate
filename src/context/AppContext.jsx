import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { safeLocalStorage } from '../utils/storage.js';

function createFeedbackItem(role, { category, text, route }) {
  return {
    id: `fb_${Date.now()}`,
    timestamp: new Date().toISOString(),
    role: role || 'staff',
    category,
    text,
    route,
  };
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // 1. Toast System Bridge State
  const [pendingToast, setPendingToast] = useState(null);
  const clearPendingToast = useCallback(() => setPendingToast(null), []);

  // 2. Feedback Items (persisted in safeLocalStorage)
  const [feedbackItems, setFeedbackItems] = useState(() => {
    return safeLocalStorage.get('feedback_items', []);
  });

  useEffect(() => {
    safeLocalStorage.set('feedback_items', feedbackItems);
  }, [feedbackItems]);

  const addFeedbackItem = useCallback(({ category, text, route, role = 'agent' }) => {
    const newItem = createFeedbackItem(role, { category, text, route });
    setFeedbackItems((prev) => [newItem, ...prev]);
    return newItem;
  }, []);

  // 3. Reset Demo App State
  const resetDemo = useCallback(() => {
    safeLocalStorage.clearDemoStorage();
    setFeedbackItems([]);
  }, []);

  const value = useMemo(() => ({
    feedbackItems,
    addFeedbackItem,
    pendingToast,
    setPendingToast,
    clearPendingToast,
    resetDemo,
  }), [
    feedbackItems,
    addFeedbackItem,
    pendingToast,
    clearPendingToast,
    resetDemo,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export default AppContext;
