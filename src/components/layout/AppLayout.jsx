import { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageSquarePlus, Bell, X, WifiOff, Settings } from 'lucide-react';
import { useChat } from '../../context/ChatContext.jsx';
import { COMPANY_CONFIG } from '../../config/market.js';
import { visibleChannelsFor, mentionsUser, canUseAdmin } from '../../utils/chat.js';
import { safeSessionStorage } from '../../utils/storage.js';
import { RoleSwitcher } from './RoleSwitcher.jsx';
import { AccountMenu } from './AccountMenu.jsx';
import { NotificationDrawer } from './NotificationDrawer.jsx';
import { FeedbackModal } from './FeedbackModal.jsx';
import { FeedbackLogDrawer } from './FeedbackLogDrawer.jsx';
import { ConfirmResetModal } from './ConfirmResetModal.jsx';

export function AppLayout({ children }) {
  const { channels, messages, currentUser, currentUserId, lastReadAtByUser, isOffline, notifyPrefs } = useChat();
  const location = useLocation();
  const isAdminRoute = location.pathname === '/admin';
  const isChannelChatRoute = Boolean(
    location.pathname.startsWith('/channels/') && location.pathname !== '/channels'
  );

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

  const officeSubtitle = useMemo(() => {
    if (currentUser?.role === 'admin') {
      return 'All offices';
    }
    const userOfficeId = currentUser?.officeId || currentUser?.office;
    const officeObj = COMPANY_CONFIG.offices.find((o) => o.id === userOfficeId);
    return `${officeObj ? officeObj.name : 'Office'} office`;
  }, [currentUser]);

  // Unread notification count for bell: counts only unread mentions in channels that are not muted
  const unreadCount = useMemo(() => {
    if (!currentUser) return 0;
    const userReadMap = lastReadAtByUser?.[currentUserId] || {};
    const visible = visibleChannelsFor(currentUser, channels);
    const mutedSet = new Set(notifyPrefs?.mutedChannelIds || []);
    const visibleUnmutedChannelIds = new Set(
      visible.filter((c) => !c.archived && !mutedSet.has(c.id)).map((c) => c.id)
    );

    return messages.filter((m) => {
      if (!visibleUnmutedChannelIds.has(m.channelId)) return false;
      if (m.senderId === currentUserId || m.senderId === 'system') return false;
      const isMention = mentionsUser(m, currentUser);
      const isUnread = !userReadMap[m.channelId] || m.createdAt > userReadMap[m.channelId];
      return isMention && isUnread;
    }).length;
  }, [currentUser, currentUserId, lastReadAtByUser, channels, messages, notifyPrefs]);

  return (
    <div className="h-dvh max-h-dvh w-full bg-canvas flex flex-col overflow-hidden">
      {/* Prototype Banner (Slim, monospaced, dismissible for session, returns on reload) */}
      {!isBannerDismissed && (
        <header
          className={`bg-brand text-surface px-4 py-1 text-xs items-center justify-between font-mono shrink-0 border-b border-line-strong ${
            isChannelChatRoute ? 'hidden lg:flex' : 'flex'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-1.5 h-1.5 rounded-full bg-status-warning shrink-0" aria-hidden="true" />
            <span className="tracking-tight">Prototype · sample data only</span>
          </div>
          <button
            type="button"
            onClick={handleDismissBanner}
            aria-label="Dismiss prototype banner for this session"
            className="w-6 h-6 -mr-1 flex items-center justify-center rounded text-surface/70 hover:text-surface hover:bg-surface/10 cursor-pointer transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </header>
      )}

      {/* Top Bar (56px sticky, wordmark left, RoleSwitcher pill + Feedback + Notifications right) */}
      <header
        className={`h-14 bg-surface border-b border-line px-2.5 sm:px-4 items-center justify-between shrink-0 z-20 relative ${
          isChannelChatRoute ? 'hidden lg:flex' : 'flex'
        }`}
      >
        {/* Wordmark */}
        <Link
          to="/channels"
          aria-label="Crestview Properties Workspace"
          className="flex items-center gap-2 text-ink font-bold text-base tracking-tight hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded shrink min-w-0 pr-1"
        >
          <div className="w-7 h-7 rounded-lg bg-brand text-surface flex items-center justify-center font-mono text-xs font-black shadow-xs shrink-0">
            CP
          </div>
          <div className="flex flex-col min-w-0">
            <span className="leading-tight text-xs sm:text-sm font-bold text-ink break-words line-clamp-2 sm:line-clamp-none sm:whitespace-nowrap">
              {COMPANY_CONFIG.name}
            </span>
            <span className="hidden sm:inline text-xs text-ink-muted font-normal mt-0.5">
              {officeSubtitle}
            </span>
          </div>
        </Link>

        {/* Right Action Cluster: Demo tools -> Feedback -> Admin (admins only) -> Notifications bell -> Account avatar */}
        <div className="flex items-center gap-1 shrink-0">
          <RoleSwitcher
            onOpenFeedbackLog={() => setIsFeedbackLogOpen(true)}
            onOpenResetModal={() => setIsResetModalOpen(true)}
          />

          <button
            type="button"
            onClick={() => setIsFeedbackOpen(true)}
            aria-label="Give feedback"
            title="Give feedback"
            className="w-11 h-11 flex items-center justify-center rounded-lg text-ink-muted hover:text-ink hover:bg-surface-raised cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand shrink-0"
          >
            <MessageSquarePlus className="w-5 h-5" aria-hidden="true" />
          </button>

          {canUseAdmin(currentUser) && (
            <Link
              to="/admin"
              aria-label="Admin settings"
              title="Admin settings"
              aria-current={isAdminRoute ? 'page' : undefined}
              className={`w-11 h-11 flex items-center justify-center rounded-lg cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand shrink-0 ${
                isAdminRoute
                  ? 'bg-surface-raised text-brand'
                  : 'text-ink-muted hover:text-ink hover:bg-surface-raised'
              }`}
            >
              <Settings className="w-5 h-5" aria-hidden="true" />
            </Link>
          )}

          <button
            type="button"
            onClick={() => setIsNotificationsOpen(true)}
            aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
            title={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
            className="w-11 h-11 flex items-center justify-center rounded-lg text-ink-muted hover:text-ink hover:bg-surface-raised cursor-pointer transition-colors relative focus:outline-none focus-visible:ring-2 focus-visible:ring-brand shrink-0"
          >
            <Bell className="w-5 h-5" aria-hidden="true" />
            {unreadCount > 0 && (
              <span
                className="absolute top-2 right-2 w-2 h-2 rounded-full bg-status-danger ring-2 ring-surface"
                aria-hidden="true"
              />
            )}
          </button>

          <AccountMenu />
        </div>
      </header>

      {/* Offline simulation alert banner */}
      {isOffline && (
        <div className="bg-status-warning-bg border-b border-status-warning-line text-status-warning px-4 py-1.5 text-xs flex items-center justify-center gap-2 font-medium shrink-0 z-10">
          <WifiOff className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>You are offline. Messages will send when you are back online.</span>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {children}
      </div>

      {/* Drawers and Modals */}
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
