import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, ChevronRight, Megaphone, AtSign } from 'lucide-react';
import { useChat } from '../../context/ChatContext.jsx';
import { visibleChannelsFor, mentionsUser } from '../../utils/chat.js';
import { formatTimeNg } from '../../utils/formatters.js';
import { Drawer } from '../common/Drawer.jsx';
import { useToast } from '../common/useToast.js';
import { getAllNotificationsReadMessage } from '../../utils/messages.js';

export function NotificationDrawer({ isOpen, onClose }) {
  const {
    channels,
    messages,
    currentUser,
    currentUserId,
    lastReadAtByUser,
    markChannelRead,
    staffById,
  } = useChat();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const userReadMap = lastReadAtByUser?.[currentUserId] || {};
  const visible = visibleChannelsFor(currentUser, channels);
  const visibleChannelIds = new Set(visible.map((c) => c.id));

  // Compute notifications: mentions and announcements
  const notifications = [];

  messages.forEach((msg) => {
    if (!visibleChannelIds.has(msg.channelId)) return;
    if (msg.senderId === currentUserId || msg.senderId === 'system') return;

    const isMention = mentionsUser(msg, currentUser);
    const isAnnouncement = msg.channelId === 'announcements';
    const isUnread = !userReadMap[msg.channelId] || msg.createdAt > userReadMap[msg.channelId];

    if (isMention || isAnnouncement) {
      notifications.push({
        id: msg.id,
        channelId: msg.channelId,
        sender: staffById[msg.senderId],
        text: msg.text,
        createdAt: msg.createdAt,
        type: isMention ? 'mention' : 'announcement',
        isUnread,
      });
    }
  });

  // Sort newest first
  notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const unreadCount = notifications.filter((n) => n.isUnread).length;

  const handleNotificationTap = (notif) => {
    markChannelRead(notif.channelId);
    onClose();
    navigate(`/channels/${notif.channelId}`);
  };

  const handleMarkAllRead = () => {
    visible.forEach((ch) => markChannelRead(ch.id));
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
                <strong className="text-ink font-semibold tabular-nums">{unreadCount}</strong> unread alerts for you
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
        {notifications.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-2.5">
            <div className="w-12 h-12 rounded-full bg-surface-raised border border-line flex items-center justify-center mx-auto text-ink-muted">
              <Bell className="w-6 h-6" aria-hidden="true" />
            </div>
            <p className="text-sm font-semibold text-ink">No notifications</p>
            <p className="text-xs text-ink-muted max-w-xs mx-auto leading-relaxed">
              You are all caught up. Announcements and team @mentions will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5" role="feed" aria-label="Notifications list">
            {notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => handleNotificationTap(item)}
                role="article"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleNotificationTap(item);
                  }
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer relative text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                  item.isUnread
                    ? 'bg-surface-raised border-line-strong hover:border-brand shadow-xs'
                    : 'bg-surface border-line hover:bg-surface-raised'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {item.type === 'mention' ? (
                      <div className="w-7 h-7 rounded-lg bg-status-warning-bg border border-status-warning-line flex items-center justify-center text-status-warning">
                        <AtSign className="w-4 h-4" aria-hidden="true" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-lg bg-surface-raised border border-line flex items-center justify-center text-brand">
                        <Megaphone className="w-4 h-4" aria-hidden="true" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-bold text-ink">
                        {item.type === 'mention' ? `${item.sender?.name || 'Colleague'} mentioned you` : 'Company Announcement'}
                      </span>
                      <span className="text-xs text-ink-muted tabular-nums shrink-0">
                        {formatTimeNg(item.createdAt)}
                      </span>
                    </div>

                    <p className="text-xs text-ink-soft leading-relaxed break-words">
                      {item.text}
                    </p>

                    <div className="mt-2 flex items-center gap-1 text-xs text-ink-muted group-hover:text-brand font-medium">
                      <span>Open #{item.channelId}</span>
                      <ChevronRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Drawer>
  );
}

export default NotificationDrawer;
