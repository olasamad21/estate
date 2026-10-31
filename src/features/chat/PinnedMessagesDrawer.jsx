import { Pin, ArrowRight } from 'lucide-react';
import { Drawer } from '../../components/common/Drawer.jsx';
import { Avatar } from '../../components/common/Avatar.jsx';
import { formatTimeNg } from '../../utils/formatters.js';

export function PinnedMessagesDrawer({
  isOpen,
  onClose,
  pinnedMessages = [],
  staffById = {},
  onJumpToMessage,
}) {
  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Pinned Messages">
      <div className="space-y-3">
        {pinnedMessages.length === 0 ? (
          <div className="text-center py-8 text-xs text-ink-muted">
            No pinned messages in this channel
          </div>
        ) : (
          pinnedMessages.map((msg) => {
            const sender = staffById[msg.senderId];
            return (
              <div
                key={msg.id}
                onClick={() => {
                  onJumpToMessage?.(msg.id);
                  onClose();
                }}
                className="p-3 rounded-xl border border-line bg-surface hover:bg-surface-raised cursor-pointer transition-colors space-y-1.5 group text-left"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar
                      role={sender?.role || 'agent'}
                      initials={sender?.initials}
                      name={sender?.name || 'Staff'}
                      size="xs"
                    />
                    <span className="text-xs font-bold text-ink">
                      {sender?.name || 'Staff'}
                    </span>
                    <span className="text-xs text-ink-muted tabular-nums">
                      {formatTimeNg(msg.createdAt)}
                    </span>
                  </div>
                  <Pin className="w-3.5 h-3.5 text-brand shrink-0" aria-hidden="true" />
                </div>

                <p className="text-xs text-ink line-clamp-2 leading-relaxed">
                  {msg.type === 'voice'
                    ? 'Voice note'
                    : msg.type === 'file'
                    ? `File: ${msg.fileName || msg.text}`
                    : msg.text}
                </p>

                <div className="flex items-center gap-1 text-xs text-brand font-medium pt-1">
                  <span>Jump to message</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </Drawer>
  );
}

export default PinnedMessagesDrawer;
