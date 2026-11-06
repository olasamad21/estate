import { useState, useRef, useEffect } from 'react';
import { Send, Lock } from 'lucide-react';
import { Drawer } from '../../components/common/Drawer.jsx';
import { Avatar } from '../../components/common/Avatar.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { formatTimeNg } from '../../utils/formatters.js';
import { threadReplies, initialsOf } from '../../utils/chat.js';
import { ROLE_LABELS } from '../../mock/staff.js';
import { Button } from '../../components/common/Button.jsx';
import { AttachmentCard } from './AttachmentCard.jsx';

export function ThreadDrawer({
  isOpen,
  onClose,
  parentMessage,
  allMessages = [],
  staffById = {},
  isArchived = false,
  allowedToPost = true,
  onSendReply,
}) {
  const [replyText, setReplyText] = useState('');
  const scrollRef = useRef(null);

  const parentSender = parentMessage ? staffById[parentMessage.senderId] : null;
  const replies = parentMessage ? threadReplies(allMessages, parentMessage.id) : [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [replies.length, isOpen]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!replyText.trim() || !parentMessage) return;
    onSendReply(parentMessage.channelId, parentMessage.id, replyText);
    setReplyText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!parentMessage) return null;

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Thread">
      <div className="flex flex-col h-[70dvh] -mx-4 -mb-4">
        {/* Parent message header block */}
        <div className="px-4 py-3 bg-surface-raised border-b border-line shrink-0">
          <div className="flex items-start gap-2.5">
            <Avatar
              role={parentSender?.role || 'agent'}
              initials={initialsOf(parentSender?.name)}
              name={parentSender?.name || 'Staff'}
              size="sm"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                <span className="text-xs font-bold text-ink">
                  {parentSender?.name || 'Staff'}
                </span>
                {(parentSender?.role === 'admin' || parentSender?.role === 'manager') && (
                  <Badge role={parentSender.role} size="sm">
                    {ROLE_LABELS[parentSender.role] || parentSender.role}
                  </Badge>
                )}
                <span className="text-xs text-ink-muted tabular-nums">
                  {formatTimeNg(parentMessage.createdAt)}
                </span>
              </div>
              {(parentMessage.type === 'file' || parentMessage.type === 'video') ? (
                <div className="mt-1">
                  <AttachmentCard
                    message={parentMessage}
                    fileName={parentMessage.fileName || parentMessage.text}
                    fileSize={parentMessage.fileSize || '1.5 MB'}
                    fileKind={parentMessage.fileKind || (parentMessage.type === 'video' ? 'video' : 'document')}
                    durationSec={parentMessage.durationSec}
                  />
                  {parentMessage.caption && (
                    <div className="text-sm text-ink leading-relaxed break-words mt-1.5">
                      {parentMessage.caption}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-ink leading-relaxed break-words">
                  {parentMessage.text}
                </p>
              )}
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-line text-xs font-semibold text-ink-muted">
            {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
          </div>
        </div>

        {/* Replies list */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {replies.length === 0 ? (
            <div className="text-center py-8 text-xs text-ink-muted">
              No replies yet. Start the thread conversation below.
            </div>
          ) : (
            replies.map((reply) => {
              const replySender = staffById[reply.senderId];
              return (
                <div key={reply.id} className="flex items-start gap-2.5">
                  <Avatar
                    role={replySender?.role || 'agent'}
                    initials={initialsOf(replySender?.name)}
                    name={replySender?.name || 'Staff'}
                    size="xs"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-xs font-bold text-ink">
                        {replySender?.name || 'Staff'}
                      </span>
                      {(replySender?.role === 'admin' || replySender?.role === 'manager') && (
                        <Badge role={replySender.role} size="sm">
                          {ROLE_LABELS[replySender.role] || replySender.role}
                        </Badge>
                      )}
                      <span className="text-xs text-ink-muted tabular-nums">
                        {formatTimeNg(reply.createdAt)}
                      </span>
                    </div>
                    {(reply.type === 'file' || reply.type === 'video') ? (
                      <div className="mt-1">
                        <AttachmentCard
                          message={reply}
                          fileName={reply.fileName || reply.text}
                          fileSize={reply.fileSize || '1.5 MB'}
                          fileKind={reply.fileKind || (reply.type === 'video' ? 'video' : 'document')}
                          durationSec={reply.durationSec}
                        />
                        {reply.caption && (
                          <div className="text-sm text-ink leading-relaxed break-words mt-1.5">
                            {reply.caption}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-ink leading-relaxed break-words">
                        {reply.text}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Thread reply composer or archived notice */}
        {isArchived ? (
          <div className="p-3 bg-surface-raised border-t border-line text-center text-xs text-ink-muted font-medium shrink-0">
            This channel is archived
          </div>
        ) : !allowedToPost ? (
          <div className="p-3 border-t border-line bg-surface-raised flex items-center justify-center gap-2 text-xs text-ink-muted shrink-0">
            <Lock className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Only admins can send messages.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-3 bg-surface border-t border-line shrink-0">
            <div className="flex items-center gap-2 bg-surface-raised border border-line rounded-xl px-3 py-1.5 focus-within:border-brand">
              <input
                type="text"
                name="thread_reply"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Reply in thread..."
                className="flex-1 bg-transparent text-xs text-ink placeholder:text-ink-muted focus:outline-none"
              />
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={!replyText.trim()}
                className="w-7 h-7 p-0 rounded-lg flex items-center justify-center shrink-0 cursor-pointer"
                aria-label="Send thread reply"
              >
                <Send className="w-3.5 h-3.5" aria-hidden="true" />
              </Button>
            </div>
          </form>
        )}
      </div>
    </Drawer>
  );
}

export default ThreadDrawer;
