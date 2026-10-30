import { useEffect } from 'react';
import { useToast } from './useToast.js';

/**
 * Bridge component to connect AppContext pendingToast to ToastProvider
 */
export function AppToastBridge({ pendingToast, clearPendingToast }) {
  const { showToast } = useToast();

  useEffect(() => {
    if (pendingToast) {
      showToast(pendingToast);
      clearPendingToast();
    }
  }, [pendingToast, showToast, clearPendingToast]);

  return null;
}

export default AppToastBridge;
