import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';
import { useDeals } from '../../context/DealContext.jsx';
import { canAccessDeal, getVisibleAlerts } from '../../utils/access.js';
import { formatRelativeTime } from '../../utils/formatters.js';
import { Drawer } from '../common/Drawer.jsx';
import { Badge } from '../common/Badge.jsx';
import { useToast } from '../common/useToast.js';
import { getLeadPhase7Message, getAllNotificationsReadMessage } from '../../utils/messages.js';

export function NotificationDrawer({ isOpen, onClose }) {
  const { alerts, activeRole, markAlertAsRead, markAllAlertsAsRead } = useApp();
  const { deals } = useDeals();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Role-filtered alerts (sorted newest first via pure getVisibleAlerts)
  const sortedAlerts = getVisibleAlerts(activeRole, alerts, deals);
  const unreadCount = sortedAlerts.filter((a) => !a.isRead).length;

  const handleAlertTap = (alert) => {
    if (alert.type === 'new_lead') {
      markAlertAsRead(alert.id);
      showToast(getLeadPhase7Message(), 'info');
      return;
    }

    if (alert.dealId && canAccessDeal(activeRole, alert.dealId, deals)) {
      markAlertAsRead(alert.id);
      onClose();
      navigate(`/deals/${alert.dealId}`);
    }
  };

  const handleMarkAllRead = () => {
    markAllAlertsAsRead();
    showToast(getAllNotificationsReadMessage(), 'info');
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Notifications">
      <div className="space-y-4">
        {/* Drawer Header Controls */}
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="text-xs text-ink-muted">
            {unreadCount > 0 ? (
              <span>
                <strong className="text-ink font-semibold tabular-nums">{unreadCount}</strong> unread for your role
              </span>
            ) : (
              <span>All notifications caught up</span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="inline-flex flex-row items-center gap-1.5 whitespace-nowrap min-h-[44px] px-3 py-2 text-xs font-medium text-ink hover:text-brand hover:bg-surface-raised rounded-lg transition-colors cursor-pointer shrink-0"
            >
              <CheckCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Mark all read</span>
            </button>
          )}
        </div>

        {/* Notifications List */}
        {sortedAlerts.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-2.5">
            <div className="w-12 h-12 rounded-full bg-surface-raised border border-line flex items-center justify-center mx-auto text-ink-muted">
              <Bell className="w-6 h-6" aria-hidden="true" />
            </div>
            <p className="text-sm font-semibold text-ink">No notifications</p>
            <p className="text-xs text-ink-muted max-w-xs mx-auto leading-relaxed">
              You&apos;re all caught up. Transaction updates, showings, and signature milestones will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5" role="feed" aria-label="Notifications list">
            {sortedAlerts.map((alert) => {
              const isHigh = alert.priority === 'high';
              const alertTime = alert.createdAt || alert.timestamp;

              return (
                <div
                  key={alert.id}
                  onClick={() => handleAlertTap(alert)}
                  role="article"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleAlertTap(alert);
                    }
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer relative text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                    alert.isRead
                      ? 'bg-surface border-line hover:bg-surface-raised'
                      : 'bg-surface-raised border-line-strong hover:border-brand shadow-xs'
                  }`}
                >
                  {/* Top metadata line */}
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      {!alert.isRead && (
                        <span
                          className="w-2 h-2 rounded-full bg-status-danger shrink-0"
                          aria-label="Unread"
                        />
                      )}
                      <Badge variant={isHigh ? 'danger' : 'neutral'} size="sm">
                        {isHigh ? 'Urgent' : 'Update'}
                      </Badge>
                      <span className="text-xs font-mono text-ink-muted tabular-nums">
                        {formatRelativeTime(alertTime)}
                      </span>
                    </div>

                    {!alert.isRead && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAlertAsRead(alert.id);
                        }}
                        aria-label="Mark notification as read"
                        className="inline-flex items-center min-h-[44px] -my-2.5 px-2 text-xs font-medium text-ink-muted hover:text-ink hover:underline rounded cursor-pointer"
                      >
                        Mark read
                      </button>
                    )}
                  </div>

                  {/* Notification Content */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-ink group-hover:text-brand transition-colors">
                        {alert.title}
                      </h3>
                      <p className="text-xs text-ink-soft leading-relaxed break-words">
                        {alert.description}
                      </p>
                    </div>
                    {alert.dealId && (
                      <ChevronRight
                        className="w-4 h-4 text-ink-muted shrink-0 mt-1 group-hover:translate-x-0.5 transition-transform"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Drawer>
  );
}

export default NotificationDrawer;
