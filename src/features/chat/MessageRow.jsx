import { Info } from 'lucide-react';
import { formatTimeNg } from '../../utils/formatters.js';
import { mentionsUser } from '../../utils/chat.js';
import { Avatar } from '../../components/common/Avatar.jsx';
import { Badge } from '../../components/common/Badge.jsx';

function renderFormattedText(text, currentUser) {
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
  const isMentioned = mentionsUser(message, currentUser);

  return (
    <div
      className={`group relative flex items-start gap-3 px-3 sm:px-4 py-1.5 transition-colors rounded-lg ${
        isMentioned
          ? 'bg-status-warning-bg/60 border border-status-warning-line'
          : 'hover:bg-surface-raised/50'
      }`}
    >
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
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
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
          </div>
        )}

        <div className="text-xs text-ink leading-relaxed break-words max-w-[65ch]">
          {renderFormattedText(message.text, currentUser)}
        </div>
      </div>
    </div>
  );
}

export default MessageRow;
