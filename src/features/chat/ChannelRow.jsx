import { Hash, Lock, Megaphone, Building2, Users, BellOff } from 'lucide-react';
import { channelDisplayName, lastMessage, unreadCount, mentionsUser, messagePreview } from '../../utils/chat.js';
import { formatListTimeNg } from '../../utils/formatters.js';
import { Avatar } from '../../components/common/Avatar.jsx';

export function ChannelRow({
  channel,
  isActive = false,
  onClick,
  messages = [],
  lastReadAt = null,
  currentUser = null,
  staffList = [],
  isMuted = false,
  notifyMode = 'all',
}) {
  const currentUserId = currentUser?.id || null;
  const displayName = channelDisplayName(channel, currentUserId, staffList);
  const unread = unreadCount(channel.id, messages, lastReadAt, currentUserId);
  const latestMsg = lastMessage(channel.id, messages);

  const previewText = (() => {
    if (!latestMsg) {
      return 'No messages yet';
    }
    const preview = messagePreview(latestMsg, staffList);
    if (latestMsg.type === 'system' || latestMsg.senderId === 'system') {
      return preview;
    }
    const sender = Array.isArray(staffList)
      ? staffList.find((s) => s.id === latestMsg.senderId)
      : staffList?.[latestMsg.senderId];
    const firstName = sender?.name ? sender.name.split(' ')[0] : '';
    return firstName ? `${firstName}: ${preview}` : preview;
  })();

  // Check if any unread message mentions the current user
  const hasMention = unread > 0 && messages.some((m) => {
    if (m.channelId !== channel.id) return false;
    if (m.senderId === currentUserId) return false;
    if (lastReadAt && m.createdAt <= lastReadAt) return false;
    return mentionsUser(m, currentUser);
  });

  // Render prefix icon
  const renderIcon = () => {
    if (channel.kind === 'announcement') {
      return <Megaphone className="w-4 h-4 text-brand shrink-0" aria-hidden="true" />;
    }
    if (channel.kind === 'private') {
      return <Lock className="w-4 h-4 text-ink-muted shrink-0" aria-hidden="true" />;
    }
    if (channel.kind === 'listing') {
      return <Building2 className="w-4 h-4 text-brand shrink-0" aria-hidden="true" />;
    }
    if (channel.kind === 'group') {
      return <Users className="w-4 h-4 text-ink-muted shrink-0" aria-hidden="true" />;
    }
    if (channel.kind === 'dm') {
      const otherId = channel.members?.find((id) => id !== currentUserId) || channel.members?.[0];
      const otherStaff = Array.isArray(staffList)
        ? staffList.find((s) => s.id === otherId)
        : null;
      return (
        <Avatar
          role={otherStaff?.role || 'agent'}
          initials={otherStaff?.initials}
          name={otherStaff?.name || displayName}
          isOnline={otherStaff?.online || false}
          size="xs"
        />
      );
    }
    return <Hash className="w-4 h-4 text-ink-muted shrink-0" aria-hidden="true" />;
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-colors cursor-pointer border ${
        isActive
          ? 'bg-surface-raised border-line-strong text-ink shadow-xs'
          : 'bg-surface border-transparent hover:bg-surface-raised/70 text-ink-soft hover:text-ink'
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0 pr-2">
        {renderIcon()}
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span
              className={`text-xs ${
                isActive ? 'font-bold text-ink' : unread > 0 ? 'font-bold text-ink' : 'font-medium text-ink'
              } overflow-hidden text-ellipsis whitespace-nowrap`}
            >
              {channel.kind === 'public' || channel.kind === 'private' || channel.kind === 'announcement'
                ? `#${displayName}`
                : displayName}
            </span>
            {isMuted && (
              <BellOff className="w-3.5 h-3.5 text-ink-muted shrink-0" aria-label="Channel muted" />
            )}
            {channel.kind === 'listing' && channel.status && (
              <span className="text-xs px-1.5 py-0.2 rounded bg-surface-raised text-ink-muted border border-line shrink-0">
                {channel.status}
              </span>
            )}
          </div>
          <p className="text-xs text-ink-muted overflow-hidden text-ellipsis whitespace-nowrap">
            {previewText}
          </p>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1 shrink-0">
        {latestMsg && (
          <span className="text-xs text-ink-muted tabular-nums">
            {formatListTimeNg(latestMsg.createdAt)}
          </span>
        )}
        {unread > 0 && (
          isMuted ? (
            <span
              className="min-w-5 h-5 px-1.5 inline-flex items-center justify-center rounded-full text-xs font-bold tabular-nums shadow-xs bg-surface-raised text-ink-muted border border-line"
              title={`${unread} unread messages (muted)`}
            >
              {unread}
            </span>
          ) : notifyMode === 'mentions' ? (
            hasMention ? (
              <span
                className="min-w-5 h-5 px-1.5 inline-flex items-center justify-center rounded-full text-xs font-bold tabular-nums shadow-xs bg-status-danger text-surface"
                title={`${unread} unread mentions`}
              >
                {unread}
              </span>
            ) : (
              <span
                className="w-2 h-2 rounded-full bg-line-strong shrink-0 my-1.5"
                title={`${unread} unread messages`}
                aria-label="Unread messages"
              />
            )
          ) : (
            <span
              className={`min-w-5 h-5 px-1.5 inline-flex items-center justify-center rounded-full text-xs font-bold tabular-nums shadow-xs ${
                hasMention
                  ? 'bg-status-danger text-surface'
                  : 'bg-brand text-surface'
              }`}
              title={`${unread} unread messages`}
            >
              {unread}
            </span>
          )
        )}
      </div>
    </button>
  );
}

export default ChannelRow;
