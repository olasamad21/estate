import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { safeLocalStorage } from '../utils/storage';
import { INITIAL_ALERTS, SIMULATED_LEAD_TEMPLATE } from '../mock/alerts';

function createLeadAlert() {
  const now = new Date().toISOString();
  return {
    ...SIMULATED_LEAD_TEMPLATE,
    id: `lead_${Date.now()}`,
    createdAt: now,
    timestamp: now,
    isRead: false,
  };
}

function createFeedbackItem(activeRole, { category, text, route }) {
  return {
    id: `fb_${Date.now()}`,
    timestamp: new Date().toISOString(),
    role: activeRole,
    category,
    text,
    route,
  };
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // 1. Role State (persisted in localStorage)
  const [activeRole, setActiveRoleState] = useState(() => {
    return safeLocalStorage.get('active_role', 'agent');
  });

  const setActiveRole = useCallback((role) => {
    setActiveRoleState(role);
    safeLocalStorage.set('active_role', role);
  }, []);

  // 2. Alerts State (persisted in localStorage, auto-seeded to INITIAL_ALERTS if outdated)
  const [alerts, setAlerts] = useState(() => {
    const stored = safeLocalStorage.get('alerts', null);
    if (stored && Array.isArray(stored) && stored.length >= INITIAL_ALERTS.length) {
      return stored;
    }
    return INITIAL_ALERTS;
  });

  useEffect(() => {
    safeLocalStorage.set('alerts', alerts);
  }, [alerts]);

  const markAlertAsRead = useCallback((alertId) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, isRead: true } : a))
    );
  }, []);

  const markAllAlertsAsRead = useCallback(() => {
    setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
  }, []);

  // 3. Toast System State
  const [pendingToast, setPendingToast] = useState(null);
  const clearPendingToast = useCallback(() => setPendingToast(null), []);

  // 4. Simulated Lead Trigger (state only; toast emitted by triggering action)
  const simulateLead = useCallback(() => {
    const newAlert = createLeadAlert();
    setAlerts((prev) => [newAlert, ...prev]);
    return newAlert;
  }, []);

  // 5. Feedback Items (persisted in localStorage)
  const [feedbackItems, setFeedbackItems] = useState(() => {
    return safeLocalStorage.get('feedback_items', []);
  });

  useEffect(() => {
    safeLocalStorage.set('feedback_items', feedbackItems);
  }, [feedbackItems]);

  const addFeedbackItem = useCallback(({ category, text, route }) => {
    const newItem = createFeedbackItem(activeRole, { category, text, route });
    setFeedbackItems((prev) => [newItem, ...prev]);
    return newItem;
  }, [activeRole]);

  // 6. Reset Demo
  const resetDemo = useCallback(() => {
    safeLocalStorage.clearDemoStorage();
    setActiveRoleState('agent');
    setAlerts(INITIAL_ALERTS);
    setFeedbackItems([]);
  }, []);

  // Unread alerts count visible to current active role
  const unreadAlertCount = alerts.filter(
    (a) => !a.isRead && (!a.targetRoles || a.targetRoles.includes(activeRole))
  ).length;

  const value = {
    activeRole,
    setActiveRole,
    alerts,
    unreadAlertCount,
    markAlertAsRead,
    markAllAlertsAsRead,
    simulateLead,
    feedbackItems,
    addFeedbackItem,
    pendingToast,
    setPendingToast,
    clearPendingToast,
    resetDemo,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
