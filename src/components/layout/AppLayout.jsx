import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Megaphone, Bell, X } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';
import { useDeals } from '../../context/DealContext.jsx';
import { getVisibleAlerts } from '../../utils/access.js';
import { safeSessionStorage } from '../../utils/storage.js';
import { RoleSwitcher } from './RoleSwitcher.jsx';
import { NotificationDrawer } from './NotificationDrawer.jsx';
import { FeedbackModal } from './FeedbackModal.jsx';
import { FeedbackLogDrawer } from './FeedbackLogDrawer.jsx';
import { ConfirmResetModal } from './ConfirmResetModal.jsx';

export function AppLayout({ children }) {
  const { alerts, activeRole } = useApp();
  const { deals } = useDeals();

  const shellRef = useRef(null);
  const headerStackRef = useRef(null);

  // Drawer / Modal states
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isFeedbackLogOpen, setIsFeedbackLogOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // Prototype banner: dismissible for session via safeSessionStorage, returns on full reload
  const [isBannerDismissed, setIsBannerDismissed] = useState(() => {
    if (typeof window !== 'undefined') {
      const navEntries = window.performance?.getEntriesByType?.('navigation');
      if (navEntries && navEntries[0]?.type === 'reload') {
        safeSessionStorage.remove('prototype_banner_dismissed');
        return false;
      }
    }
    return safeSessionStorage.get('prototype_banner_dismissed', false);
  });

  const handleDismissBanner = () => {
    setIsBannerDismissed(true);
    safeSessionStorage.set('prototype_banner_dismissed', true);
  };

  // Measure full header stack (prototype banner + top bar) and set --shell-top
  useEffect(() => {
    const headerEl = headerStackRef.current;
    if (!headerEl) return;

    const updateHeight = () => {
      const height = headerEl.getBoundingClientRect().height || headerEl.offsetHeight || 56;
      if (shellRef.current) {
        shellRef.current.style.setProperty('--shell-top', `${height}px`);
      }
      if (typeof document !== 'undefined') {
        document.documentElement.style.setProperty('--shell-top', `${height}px`);
      }
    };

    updateHeight();

    const observer = new ResizeObserver(() => {
      updateHeight();
    });

    observer.observe(headerEl);

    return () => {
      observer.disconnect();
    };
  }, [isBannerDismissed]);

  // Visible alerts filtered and sorted strictly by role access permissions
  const visibleAlerts = getVisibleAlerts(activeRole, alerts, deals);
  const unreadCount = visibleAlerts.filter((a) => !a.isRead).length;

  return (
    <div ref={shellRef} className="min-h-dvh bg-canvas flex justify-center py-0 sm:py-6">
      {/* Mobile-first centered phone frame (390px - 430px base, max-w-md at all viewports) */}
      <div className="w-full max-w-md min-h-dvh sm:min-h-[844px] bg-surface sm:rounded-2xl sm:shadow-xl sm:border sm:border-line flex flex-col overflow-hidden">
        {/* Full Header Stack Ref: dynamically measured by ResizeObserver */}
        <div ref={headerStackRef} className="shrink-0 sticky top-0 z-30 bg-surface">
          {/* Prototype Banner (Slim, monospaced, dismissible for session, returns on reload) */}
          {!isBannerDismissed && (
            <header className="bg-brand text-surface px-4 py-1.5 text-xs flex items-center justify-between font-mono shrink-0 border-b border-line-strong">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-1.5 h-1.5 rounded-full bg-status-warning shrink-0" aria-hidden="true" />
                <span className="tracking-tight line-clamp-1">Prototype · sample data only</span>
              </div>
              <button
                type="button"
                onClick={handleDismissBanner}
                aria-label="Dismiss prototype banner for this session"
                className="w-7 h-7 -mr-1 flex items-center justify-center rounded text-surface/70 hover:text-surface hover:bg-surface/10 cursor-pointer transition-colors shrink-0"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </header>
          )}

          {/* Top Bar (56px sticky, wordmark left, RoleSwitcher pill + Feedback + Notifications right) */}
          <header className="h-14 bg-surface border-b border-line px-3 sm:px-4 flex items-center justify-between shrink-0">
            {/* Wordmark */}
            <Link
              to="/deals"
              aria-label="DealRoom Dashboard"
              className="flex items-center gap-2 text-ink font-bold text-base tracking-tight hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded"
            >
              <div className="w-6 h-6 rounded-md bg-brand text-surface flex items-center justify-center font-mono text-xs font-black shadow-xs">
                D
              </div>
              <span>DealRoom</span>
            </Link>

            {/* Right Action Cluster: Role Switcher Pill + Feedback Button + Notification Bell */}
            <div className="flex items-center gap-1 sm:gap-1.5">
              <RoleSwitcher
                onOpenFeedbackLog={() => setIsFeedbackLogOpen(true)}
                onOpenResetModal={() => setIsResetModalOpen(true)}
              />

              <button
                type="button"
                onClick={() => setIsFeedbackOpen(true)}
                aria-label="Give feedback"
                title="Give feedback"
                className="w-11 h-11 flex items-center justify-center rounded-lg text-ink-muted hover:text-ink hover:bg-surface-raised cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <Megaphone className="w-5 h-5" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => setIsNotificationsOpen(true)}
                aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
                title={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
                className="w-11 h-11 flex items-center justify-center rounded-lg text-ink-muted hover:text-ink hover:bg-surface-raised cursor-pointer transition-colors relative focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <Bell className="w-5 h-5" aria-hidden="true" />
                {unreadCount > 0 && (
                  <span
                    className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-xs font-bold text-surface bg-status-danger rounded-full tabular-nums border-2 border-surface"
                    aria-hidden="true"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            </div>
          </header>
        </div>

        {/* Main Content Area (Scrolls independently while top bar remains pinned) */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Drawers and Modals Mounted at Shell Level */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />
      <FeedbackLogDrawer
        isOpen={isFeedbackLogOpen}
        onClose={() => setIsFeedbackLogOpen(false)}
      />
      <ConfirmResetModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
      />
    </div>
  );
}

export default AppLayout;
