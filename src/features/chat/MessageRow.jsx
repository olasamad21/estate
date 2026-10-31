import { Info, MessageSquare, MoreHorizontal, SmilePlus, Pin, Clock, Eye } from 'lucide-react';
import { formatTimeNg } from '../../utils/formatters.js';
import { mentionsUser, reactionList } from '../../utils/chat.js';
import { Avatar } from '../../components/common/Avatar.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { VoiceBubble } from './VoiceBubble.jsx';
import { AttachmentCard } from './AttachmentCard.jsx';

function renderFormattedText(text, currentUser) {
  if (!text) return null;
  const parts = text.split(/(@[A-Za-z0-9_-]+)/g);
  return parts.map((part, index) => {
    if (part.startsWith('@')) {
      const mentionTarget = part.slice(1).toLowerCase();
      const isUser = currentUser && (
        mentionTarget === 'all' ||
        mentionTarget === currentUser.name.split(' ')[0].toLowerCase()
      );
      return (
        <span
          key={index}
          className={`font-semibold px-1 py-0.5 rounded text-xs ${
            isUser
              ? 'bg-status-warning-line text-status-warning'
              : 'bg-status-info-bg text-ink'
          }`}
        >
          {part}
        </span>
      );
    }
    return part;
  });
}

export function MessageRow({
  message,
  sender,
  isConsecutive = false,
  currentUser = null,
  channel = null,
  repliesCount = 0,
  totalStaffCount = 10,
  onOpenActions,
  onOpenThread,
  onToggleReaction,
  onOpenSeenBy,
  onOpenFileDetail,
}) {
  // 1. System messages
  if (message.type === 'system' || message.senderId === 'system') {
    return (
      <div className="flex items-center justify-center gap-2 py-2 px-4 text-xs text-ink-muted">
        <Info className="w-3.5 h-3.5 text-ink-muted shrink-0" aria-hidden="true" />
        <span className="italic">{message.text}</span>
        <span className="text-xs font-mono text-ink-muted">· {formatTimeNg(message.createdAt)}</span>
      </div>
    );
  }

  // 2. Standard user messages
  const isMentioned = !message.deletedAt && mentionsUser(message, currentUser);
  const reactions = reactionList(message.reactions, currentUser?.id);
  const canSeeSeenBy = channel?.kind === 'announcement' && (currentUser?.role === 'admin' || currentUser?.role === 'manager');
  const seenCount = Array.isArray(message.seenBy) ? message.seenBy.length : 0;

  const handleRowClick = () => {
    if (!message.deletedAt && onOpenActions) {
      onOpenActions(message);
    }
  };

  return (
    <div
      id={`msg-${message.id}`}
      onClick={handleRowClick}
      className={`group relative flex items-start gap-3 px-3 sm:px-4 py-1.5 transition-colors rounded-lg cursor-pointer ${
        isMentioned
          ? 'bg-status-warning-bg/60 border border-status-warning-line'
          : 'hover:bg-surface-raised/50'
      }`}
    >
      {/* Hover action toolbar for desktop */}
      {!message.deletedAt && (
        <div className="hidden sm:group-hover:flex items-center gap-0.5 bg-surface border border-line rounded-lg shadow-xs absolute right-3 -top-3.5 px-1 py-0.5 z-10">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenActions?.(message);
            }}
            title="React"
            aria-label="React to message"
            className="w-7 h-7 flex items-center justify-center text-ink-muted hover:text-ink hover:bg-surface-raised rounded transition-colors"
          >
            <SmilePlus className="w-3.5 h-3.5" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenThread?.(message);
            }}
            title="Reply in thread"
            aria-label="Reply in thread"
            className="w-7 h-7 flex items-center justify-center text-ink-muted hover:text-ink hover:bg-surface-raised rounded transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenActions?.(message);
            }}
            title="More actions"
            aria-label="More message actions"
            className="w-7 h-7 flex items-center justify-center text-ink-muted hover:text-ink hover:bg-surface-raised rounded transition-colors"
          >
            <MoreHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Avatar or spacing indentation for consecutive messages */}
      <div className="shrink-0 w-8 flex justify-center">
        {!isConsecutive ? (
          <Avatar
            role={sender?.role || 'agent'}
            initials={sender?.initials}
            name={sender?.name || 'Staff'}
            size="sm"
          />
        ) : (
          <span className="text-xs text-ink-muted opacity-0 group-hover:opacity-100 transition-opacity font-mono pt-0.5 tabular-nums">
            {formatTimeNg(message.createdAt).split(' ')[0]}
          </span>
        )}
      </div>

      {/* Message content */}
      <div className="flex-1 min-w-0">
        {!isConsecutive && (
          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
            <span className="text-xs font-bold text-ink">
              {sender?.name || 'Unknown Staff'}
            </span>
            {sender?.role && (
              <Badge role={sender.role} size="sm">
                {sender.role.charAt(0).toUpperCase() + sender.role.slice(1)}
              </Badge>
            )}
            <span className="text-xs text-ink-muted tabular-nums">
              {formatTimeNg(message.createdAt)}
            </span>
            {message.editedAt && (
              <span className="text-xs text-ink-muted font-normal">
                (edited)
              </span>
            )}
            {message.pinned && (
              <span className="inline-flex items-center gap-0.5 text-xs text-brand font-medium">
                <Pin className="w-3 h-3 fill-current" aria-hidden="true" />
                <span>Pinned</span>
              </span>
            )}
          </div>
        )}

        {/* Message body rendering */}
        {message.deletedAt ? (
          <p className="text-xs italic text-ink-muted leading-relaxed">
            This message was deleted
          </p>
        ) : message.type === 'voice' ? (
          <div className="mt-1">
            <VoiceBubble durationSec={message.durationSec || 15} />
          </div>
        ) : message.type === 'file' ? (
          <div className="mt-1">
            <AttachmentCard
              message={message}
              fileName={message.fileName || message.text}
              fileSize={message.fileSize || '1.5 MB'}
              fileKind={message.fileKind || 'document'}
              onOpenFileDetail={onOpenFileDetail}
            />
          </div>
        ) : (
          <div className="text-xs text-ink leading-relaxed break-words max-w-[65ch]">
            {renderFormattedText(message.text, currentUser)}
          </div>
        )}

        {/* Queued status indicator when offline */}
        {message.status === 'queued' && (
          <div className="flex items-center gap-1 text-xs text-status-warning font-medium mt-1">
            <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>Will send when online</span>
          </div>
        )}

        {/* Reaction Chips */}
        {reactions.length > 0 && !message.deletedAt && (
          <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
            {reactions.map((r) => (
              <button
                key={r.emoji}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleReaction?.(message.id, r.emoji);
                }}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                  r.userReacted
                    ? 'bg-brand/10 text-brand border-brand/40 shadow-xs'
                    : 'bg-surface border-line text-ink-muted hover:bg-surface-raised'
                }`}
                title={`Reactions: ${r.count}`}
              >
                <span>{r.emoji}</span>
                <span className="tabular-nums font-mono text-xs">{r.count}</span>
              </button>
            ))}
          </div>
        )}

        {/* Thread replies trigger */}
        {repliesCount > 0 && !message.deletedAt && (
          <div className="mt-1.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenThread?.(message);
              }}
              className="inline-flex items-center gap-1 text-xs font-bold text-brand hover:underline cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{repliesCount} {repliesCount === 1 ? 'reply' : 'replies'}</span>
            </button>
          </div>
        )}

        {/* Announcement read receipt summary */}
        {canSeeSeenBy && !message.deletedAt && (
          <div className="mt-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenSeenBy?.(message);
              }}
              className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-brand font-medium cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Seen by {seenCount} of {totalStaffCount} staff</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MessageRow;
