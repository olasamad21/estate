import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: AlertCircle,
};

const STYLES = {
  info: 'bg-brand text-surface border-line-strong',
  success: 'bg-status-success-bg text-status-success border-status-success-line',
  warning: 'bg-status-warning-bg text-status-warning border-status-warning-line',
  danger: 'bg-status-danger-bg text-status-danger border-status-danger-line',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const newToast = { id, message, type };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      {/* Toast Render Viewport */}
      <div
        className="fixed top-3 left-0 right-0 z-50 flex flex-col items-center pointer-events-none px-4 space-y-2"
        role="region"
        aria-label="Notifications"
      >
        {toasts.map((toast) => {
          const Icon = ICONS[toast.type] || ICONS.info;
          const styleClass = STYLES[toast.type] || STYLES.info;

          return (
            <div
              key={toast.id}
              role="status"
              aria-live="polite"
              className={`w-full max-w-sm pointer-events-auto rounded-lg border shadow-lg p-3 flex items-center justify-between gap-3 text-xs font-medium transition-all duration-250 animate-in fade-in slide-in-from-top-2 ${styleClass}`}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span className="truncate">{toast.message}</span>
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                aria-label="Dismiss notification"
                className="w-11 h-11 -mr-2 -my-2 flex items-center justify-center rounded cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

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

export default ToastProvider;
