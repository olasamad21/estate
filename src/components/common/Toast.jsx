import { useState, useCallback, useRef } from 'react';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { ToastContext } from './ToastContext.js';

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
  const recentMessagesRef = useRef(new Map());

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    if (!message) return null;
    const now = Date.now();

    // Ignore duplicate messages within 2 seconds
    const lastTimestamp = recentMessagesRef.current.get(message);
    if (lastTimestamp && now - lastTimestamp < 2000) {
      return null;
    }
    recentMessagesRef.current.set(message, now);

    const id = `toast_${now}_${Math.random().toString(36).substr(2, 5)}`;
    const newToast = { id, message, type };

    setToasts((prev) => {
      // Show at most 3 at once (drop oldest if exceeding 3)
      const next = [...prev, newToast];
      return next.length > 3 ? next.slice(next.length - 3) : next;
    });

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
      {/* Toast Render Viewport - positioned under dynamic header stack */}
      <div
        className="fixed left-0 right-0 z-50 flex flex-col items-center pointer-events-none px-4 space-y-2"
        style={{ top: 'calc(var(--shell-top, 56px) + 8px)' }}
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
              className={`w-full max-w-md pointer-events-auto rounded-lg border shadow-lg p-3 flex items-center justify-between gap-3 text-xs font-medium animate-toast-mount ${styleClass}`}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span className="break-words leading-relaxed">{toast.message}</span>
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

export default ToastProvider;
