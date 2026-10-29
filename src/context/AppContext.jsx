import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { safeLocalStorage } from '../utils/storage';
import { INITIAL_ALERTS, SIMULATED_LEAD_TEMPLATE } from '../mock/alerts';

function createLeadAlert() {
  return {
    ...SIMULATED_LEAD_TEMPLATE,
    id: `lead_${Date.now()}`,
    timestamp: new Date().toISOString(),
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

  // 2. Alerts State (persisted in localStorage)
  const [alerts, setAlerts] = useState(() => {
    return safeLocalStorage.get('alerts', INITIAL_ALERTS);
  });

  useEffect(() => {
    safeLocalStorage.set('alerts', alerts);
  }, [alerts]);

  const markAlertAsRead = useCallback((alertId) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, isRead: true } : a))
    );
  }, []);

  // 3. Toast System State
  const [pendingToast, setPendingToast] = useState(null);
  const clearPendingToast = useCallback(() => setPendingToast(null), []);

  // 4. Simulated Lead Trigger
  const simulateLead = useCallback(() => {
    const newAlert = createLeadAlert();
    setAlerts((prev) => [newAlert, ...prev]);
    setPendingToast('New lead inquiry simulated for 512 Aspen Ridge Way.');
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
    setPendingToast('Thank you! Feedback recorded.');
    return newItem;
  }, [activeRole]);

  // 6. Reset Demo
  const resetDemo = useCallback(() => {
    safeLocalStorage.clearDemoStorage();
    setActiveRoleState('agent');
    setAlerts(INITIAL_ALERTS);
    setFeedbackItems([]);
    setPendingToast('Demo reset to initial mock state.');
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
