import { useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Hash, Lock, Megaphone, Building2, Users } from 'lucide-react';
import { useChat } from '../../context/ChatContext.jsx';
import { channelDisplayName, visibleChannelsFor } from '../../utils/chat.js';
import { formatNaira, formatDayLabelNg } from '../../utils/formatters.js';
import { MessageRow } from './MessageRow.jsx';
import { MessageComposer } from './MessageComposer.jsx';
import { Avatar } from '../../components/common/Avatar.jsx';
import { Button } from '../../components/common/Button.jsx';

export function ChatAreaView({ defaultChannelId = 'general' }) {
  const { id: routeChannelId } = useParams();
  const channelId = routeChannelId || defaultChannelId;
  const navigate = useNavigate();

  const {
    channels,
    messages,
    currentUser,
    currentUserId,
    staff,
    staffById,
    sendMessage,
    markChannelRead,
  } = useChat();

  const scrollRef = useRef(null);

  // 1. Resolve channel
  const channel = useMemo(() => {
    return channels.find((c) => c.id === channelId) || null;
  }, [channels, channelId]);

  // 2. Check visibility
  const isVisible = useMemo(() => {
    if (!channel || !currentUser) return false;
    const userChannels = visibleChannelsFor(currentUser, channels);
    return userChannels.some((c) => c.id === channel.id);
  }, [channel, currentUser, channels]);

  // 3. Filter messages for this channel
  const channelMessages = useMemo(() => {
    if (!channel) return [];
    return messages.filter((m) => m.channelId === channel.id);
  }, [messages, channel]);

  // 4. Group messages by day
  const groupedByDay = useMemo(() => {
    const groups = [];
    let currentDay = null;
    let currentBatch = [];

    channelMessages.forEach((msg) => {
      const dayLabel = formatDayLabelNg(msg.createdAt);
      if (dayLabel !== currentDay) {
        if (currentBatch.length > 0) {
          groups.push({ day: currentDay, messages: currentBatch });
        }
        currentDay = dayLabel;
        currentBatch = [msg];
      } else {
        currentBatch.push(msg);
      }
    });

    if (currentBatch.length > 0) {
      groups.push({ day: currentDay, messages: currentBatch });
    }

    return groups;
  }, [channelMessages]);

  // Mark channel as read on entry and when new messages arrive
  useEffect(() => {
    if (channel && isVisible) {
      markChannelRead(channel.id);
    }
  }, [channel, isVisible, channelMessages.length, markChannelRead]);

  // Scroll to bottom on load and new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [channelId, channelMessages.length]);

  if (!channel || !isVisible) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-4 bg-surface">
        <div className="w-12 h-12 rounded-full bg-surface-raised border border-line flex items-center justify-center text-ink-muted">
          <Lock className="w-6 h-6" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-bold text-ink">Channel not accessible</h2>
          <p className="text-xs text-ink-muted max-w-sm">
            You do not have permission to view this channel, or it does not exist.
          </p>
        </div>
        <Button variant="secondary" onClick={() => navigate('/channels')}>
          Back to Channels
        </Button>
      </div>
    );
  }

  const displayName = channelDisplayName(channel, currentUserId, staff);

  const renderChannelIcon = () => {
    if (channel.kind === 'announcement') {
      return <Megaphone className="w-5 h-5 text-brand shrink-0" aria-hidden="true" />;
    }
    if (channel.kind === 'private') {
      return <Lock className="w-5 h-5 text-ink-muted shrink-0" aria-hidden="true" />;
    }
    if (channel.kind === 'listing') {
      return <Building2 className="w-5 h-5 text-brand shrink-0" aria-hidden="true" />;
    }
    if (channel.kind === 'group') {
      return <Users className="w-5 h-5 text-ink-muted shrink-0" aria-hidden="true" />;
    }
    if (channel.kind === 'dm') {
      const otherId = channel.members?.find((id) => id !== currentUserId) || channel.members?.[0];
      const other = staffById[otherId];
      return (
        <Avatar
          role={other?.role || 'agent'}
          initials={other?.initials}
          name={other?.name || displayName}
          isOnline={other?.online || false}
          size="sm"
        />
      );
    }
    return <Hash className="w-5 h-5 text-ink-muted shrink-0" aria-hidden="true" />;
  };

  return (
    <div className="h-full flex flex-col bg-surface overflow-hidden">
      {/* Channel Header (56px) */}
      <div className="h-14 px-3 sm:px-4 border-b border-line flex items-center justify-between shrink-0 bg-surface">
        <div className="flex items-center gap-2 min-w-0">
          {/* Back button on smaller screens */}
          <button
            type="button"
            onClick={() => navigate('/channels')}
            aria-label="Back to channels"
            className="lg:hidden p-1.5 -ml-1 text-ink-muted hover:text-ink rounded-lg hover:bg-surface-raised cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" aria-hidden="true" />
          </button>

          {renderChannelIcon()}

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-ink overflow-hidden text-ellipsis whitespace-nowrap">
                {channel.kind === 'public' || channel.kind === 'private' || channel.kind === 'announcement'
                  ? `#${displayName}`
                  : displayName}
              </h2>
              {channel.kind === 'listing' && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-surface-raised text-ink-muted border border-line font-medium shrink-0">
                  {channel.status}
                </span>
              )}
            </div>
            <p className="text-xs text-ink-muted overflow-hidden text-ellipsis whitespace-nowrap">
              {channel.kind === 'listing'
                ? `${channel.location} · ${formatNaira(channel.price)} · ${channel.description}`
                : channel.description || (channel.kind === 'dm' ? 'Direct conversation' : '')}
            </p>
          </div>
        </div>
      </div>

      {/* Message Timeline */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-4">
        {groupedByDay.map((group, groupIdx) => (
          <div key={group.day || groupIdx} className="space-y-1">
            {/* Day Divider */}
            <div className="relative flex items-center justify-center my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-line" />
              </div>
              <span className="relative px-3 py-0.5 rounded-full bg-surface-raised border border-line text-xs font-semibold text-ink-muted shadow-2xs">
                {group.day}
              </span>
            </div>

            {/* Messages in Day */}
            {group.messages.map((msg, idx) => {
              const prevMsg = idx > 0 ? group.messages[idx - 1] : null;
              const isSameSender = prevMsg && prevMsg.senderId === msg.senderId && prevMsg.type !== 'system' && msg.type !== 'system';
              const timeDiff = prevMsg ? Math.abs(new Date(msg.createdAt).getTime() - new Date(prevMsg.createdAt).getTime()) : Infinity;
              const isConsecutive = isSameSender && timeDiff < 5 * 60 * 1000;

              return (
                <MessageRow
                  key={msg.id}
                  message={msg}
                  sender={staffById[msg.senderId] || null}
                  isConsecutive={isConsecutive}
                  currentUser={currentUser}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Message Composer */}
      <MessageComposer
        channel={channel}
        currentUser={currentUser}
        onSendMessage={(text) => sendMessage(channel.id, text)}
      />
    </div>
  );
}

export default ChatAreaView;
