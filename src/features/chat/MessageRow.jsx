import { Info, MessageSquare, MoreHorizontal, SmilePlus, Pin, Clock, Eye, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useChat } from '../../context/ChatContext.jsx';
import { formatTimeNg, formatNaira } from '../../utils/formatters.js';
import { mentionsUser, reactionList, canUserSeeChannel, channelDisplayName } from '../../utils/chat.js';
import { Avatar } from '../../components/common/Avatar.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { Button } from '../../components/common/Button.jsx';
import { VoiceBubble } from './VoiceBubble.jsx';
import { AttachmentCard } from './AttachmentCard.jsx';
import { PhotoPlaceholder } from './PhotoPlaceholder.jsx';

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
  const navigate = useNavigate();
  const { claimLead, channelsById = {}, staffById = {}, channels = [], staff = [] } = useChat();

  // 1. System messages
  if (message.type === 'system' || (message.senderId === 'system' && message.type !== 'lead')) {
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
            {(sender?.role === 'admin' || sender?.role === 'manager') && (
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
        ) : message.type === 'lead' ? (
          <div className="mt-1 border border-line rounded-xl bg-surface p-3 sm:p-4 max-w-md shadow-2xs space-y-2.5">
            {/* Top line: Lucide UserPlus icon + "New lead" + status Badge */}
            <div className="flex items-center justify-between gap-2 border-b border-line pb-2">
              <div className="flex items-center gap-1.5 text-ink font-bold text-xs uppercase tracking-wider">
                <UserPlus className="w-4 h-4 text-brand shrink-0" aria-hidden="true" />
                <span>New lead</span>
              </div>
              <Badge variant={message.claimedById ? 'success' : 'warning'} size="sm">
                {message.claimedById ? 'Taken' : 'New'}
              </Badge>
            </div>

            {/* Client name + enquiry */}
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-ink">
                {message.clientName}
              </h4>
              <p className="text-xs text-ink-soft leading-relaxed mt-1">
                {message.enquiry}
              </p>
            </div>

            {/* Area & Budget */}
            <div className="flex items-center gap-2 text-xs text-ink-muted pt-1">
              <span className="font-medium text-ink">{message.area}</span>
              <span>·</span>
              <span className="font-semibold text-brand tabular-nums">
                {formatNaira(message.budgetNgn)}
              </span>
            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-line">
              {!message.claimedById ? (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    claimLead?.(message.id);
                  }}
                  className="min-h-[44px] h-11 w-full sm:w-auto px-4 justify-center cursor-pointer"
                >
                  I&apos;ve got this
                </Button>
              ) : (
                <div className="text-xs text-ink-muted">
                  Taken by{' '}
                  <strong className="text-ink font-semibold">
                    {staffById[message.claimedById]?.name || 'Staff'}
                  </strong>{' '}
                  · {formatTimeNg(message.claimedAt || message.createdAt)}
                </div>
              )}
            </div>
          </div>
        ) : message.type === 'listing' ? (
          (() => {
            const listingChannel =
              channelsById[message.listingChannelId] ||
              channels.find((c) => c.id === message.listingChannelId);
            const canSee = canUserSeeChannel(currentUser, listingChannel);
            const statusVariant =
              listingChannel?.status === 'Available'
                ? 'success'
                : listingChannel?.status === 'Under offer'
                ? 'warning'
                : 'neutral';

            return (
              <div className="mt-1 border border-line rounded-xl bg-surface p-3 sm:p-4 max-w-md shadow-2xs space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-16 h-12 sm:w-20 sm:h-14 rounded-lg overflow-hidden shrink-0 border border-line bg-surface-raised shadow-2xs">
                    <PhotoPlaceholder
                      fileName={`${message.listingChannelId}.jpg`}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-xs sm:text-sm font-bold text-ink">
                        {listingChannel
                          ? channelDisplayName(listingChannel, currentUser?.id, staff)
                          : 'Listing Room'}
                      </h4>
                      {listingChannel?.status && (
                        <Badge variant={statusVariant} size="sm">
                          {listingChannel.status}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-ink-muted mt-0.5">
                      <span>{listingChannel?.location}</span>
                      <span>·</span>
                      <span className="font-semibold text-brand tabular-nums">
                        {formatNaira(listingChannel?.price)}
                      </span>
                    </div>
                  </div>
                </div>

                {message.note && (
                  <p className="text-xs text-ink-soft leading-relaxed border-t border-line pt-2">
                    {message.note}
                  </p>
                )}

                {canSee && listingChannel && (
                  <div className="pt-1">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/channels/${listingChannel.id}`);
                      }}
                      className="min-h-[44px] sm:min-h-0 h-10 sm:h-8 px-3 text-xs w-full sm:w-auto justify-center cursor-pointer"
                    >
                      Open listing room
                    </Button>
                  </div>
                )}
              </div>
            );
          })()
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
                disabled={Boolean(channel?.archived)}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!channel?.archived) {
                    onToggleReaction?.(message.id, r.emoji);
                  }
                }}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border transition-all ${
                  channel?.archived ? 'cursor-default opacity-80' : 'cursor-pointer'
                } ${
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
