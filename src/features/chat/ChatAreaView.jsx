import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Hash, Lock, Megaphone, Building2, Users, Pin } from 'lucide-react';
import { useChat } from '../../context/ChatContext.jsx';
import { channelDisplayName, visibleChannelsFor, threadReplies } from '../../utils/chat.js';
import { formatNaira, formatDayLabelNg } from '../../utils/formatters.js';
import { MessageRow } from './MessageRow.jsx';
import { MessageComposer } from './MessageComposer.jsx';
import { MessageActionDrawer } from './MessageActionDrawer.jsx';
import { ThreadDrawer } from './ThreadDrawer.jsx';
import { SeenByDrawer } from './SeenByDrawer.jsx';
import { PinnedMessagesDrawer } from './PinnedMessagesDrawer.jsx';
import { AttachmentDrawer } from './AttachmentDrawer.jsx';
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
    typingStatus,
    clearTypingTimer,
    sendMessage,
    sendThreadReply,
    sendVoiceNote,
    sendFile,
    editMessage,
    deleteMessage,
    togglePin,
    toggleReaction,
    markChannelRead,
  } = useChat();

  const [selectedActionMessage, setSelectedActionMessage] = useState(null);
  const [selectedThreadMessage, setSelectedThreadMessage] = useState(null);
  const [selectedAnnouncementMessage, setSelectedAnnouncementMessage] = useState(null);
  const [isPinnedDrawerOpen, setIsPinnedDrawerOpen] = useState(false);
  const [isAttachmentDrawerOpen, setIsAttachmentDrawerOpen] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);

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

  // Timeline shows top-level messages only
  const timelineMessages = useMemo(() => {
    return channelMessages.filter((m) => !m.parentId);
  }, [channelMessages]);

  // Pinned messages in this channel
  const pinnedMessages = useMemo(() => {
    return channelMessages.filter((m) => m.pinned && !m.deletedAt);
  }, [channelMessages]);

  // Channel members for mention autocomplete
  const channelMembers = useMemo(() => {
    if (channel?.members && channel.members.length > 0) {
      return channel.members.map((id) => staffById[id]).filter(Boolean);
    }
    return staff;
  }, [channel, staff, staffById]);

  // Keep selected thread message updated from latest state
  const currentThreadParentMessage = useMemo(() => {
    if (!selectedThreadMessage) return null;
    return messages.find((m) => m.id === selectedThreadMessage.id) || selectedThreadMessage;
  }, [messages, selectedThreadMessage]);

  // Keep selected announcement message updated from latest state
  const currentAnnouncementMessage = useMemo(() => {
    if (!selectedAnnouncementMessage) return null;
    return messages.find((m) => m.id === selectedAnnouncementMessage.id) || selectedAnnouncementMessage;
  }, [messages, selectedAnnouncementMessage]);

  // 4. Group timeline messages by day
  const groupedByDay = useMemo(() => {
    const groups = [];
    let currentDay = null;
    let currentBatch = [];

    timelineMessages.forEach((msg) => {
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
  }, [timelineMessages]);

  // Mark channel as read on entry and when new messages arrive
  useEffect(() => {
    if (channel && isVisible) {
      markChannelRead(channel.id);
    }
  }, [channel, isVisible, channelMessages.length, markChannelRead]);

  // Clear typing indicator on channel change or unmount
  useEffect(() => {
    return () => {
      clearTypingTimer();
    };
  }, [channelId, clearTypingTimer]);

  // Scroll to bottom on channel change and new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [channelId, timelineMessages.length]);

  const handleJumpToMessage = (msgId) => {
    const el = document.getElementById(`msg-${msgId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('bg-brand/10');
      setTimeout(() => {
        el.classList.remove('bg-brand/10');
      }, 1500);
    }
  };

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

      {/* Pinned Messages Banner */}
      {pinnedMessages.length > 0 && (
        <div
          onClick={() => {
            if (pinnedMessages.length === 1) {
              handleJumpToMessage(pinnedMessages[0].id);
            } else {
              setIsPinnedDrawerOpen(true);
            }
          }}
          className="px-3 sm:px-4 py-1.5 bg-surface-raised border-b border-line flex items-center justify-between text-xs cursor-pointer hover:bg-surface-raised/80 transition-colors shrink-0 select-none"
        >
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <Pin className="w-3.5 h-3.5 text-brand shrink-0" aria-hidden="true" />
            {pinnedMessages.length === 1 ? (
              <div className="min-w-0 flex items-center gap-1.5 overflow-hidden text-ellipsis whitespace-nowrap">
                <span className="font-bold text-ink shrink-0">
                  {staffById[pinnedMessages[0].senderId]?.name || 'Staff'}:
                </span>
                <span className="text-ink-muted overflow-hidden text-ellipsis whitespace-nowrap">
                  {pinnedMessages[0].type === 'voice'
                    ? 'Voice note'
                    : pinnedMessages[0].type === 'file'
                    ? `File: ${pinnedMessages[0].fileName || 'Attachment'}`
                    : pinnedMessages[0].text}
                </span>
              </div>
            ) : (
              <span className="font-semibold text-ink">
                {pinnedMessages.length} pinned messages
              </span>
            )}
          </div>

          <span className="text-xs text-brand font-medium shrink-0">
            {pinnedMessages.length === 1 ? 'Jump' : 'View all'}
          </span>
        </div>
      )}

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
                  channel={channel}
                  repliesCount={threadReplies(messages, msg.id).length}
                  totalStaffCount={staff.length}
                  onOpenActions={() => setSelectedActionMessage(msg)}
                  onOpenThread={() => setSelectedThreadMessage(msg)}
                  onToggleReaction={(emoji) => toggleReaction(msg.id, emoji)}
                  onOpenSeenBy={() => setSelectedAnnouncementMessage(msg)}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Typing Indicator */}
      {typingStatus && typingStatus.channelId === channel.id && (
        <div className="px-4 py-1 text-xs text-ink-muted flex items-center gap-1.5 bg-surface shrink-0">
          <span className="font-semibold text-ink">{typingStatus.staffName}</span>
          <span>is typing...</span>
        </div>
      )}

      {/* Message Composer */}
      <MessageComposer
        key={editingMessage ? editingMessage.id : 'composer'}
        channel={channel}
        currentUser={currentUser}
        channelMembers={channelMembers}
        editingMessage={editingMessage}
        onSendMessage={(text) => sendMessage(channel.id, text)}
        onSendVoiceNote={(duration) => sendVoiceNote(channel.id, duration)}
        onOpenAttachDrawer={() => setIsAttachmentDrawerOpen(true)}
        onSaveEdit={(msgId, newText) => editMessage(msgId, newText)}
        onCancelEdit={() => setEditingMessage(null)}
      />

      {/* Action Drawers */}
      <MessageActionDrawer
        isOpen={Boolean(selectedActionMessage)}
        onClose={() => setSelectedActionMessage(null)}
        message={selectedActionMessage}
        currentUser={currentUser}
        onReact={(emoji) => {
          if (selectedActionMessage) {
            toggleReaction(selectedActionMessage.id, emoji);
          }
        }}
        onReplyInThread={(msg) => {
          setSelectedThreadMessage(msg);
        }}
        onTogglePin={(msgId) => {
          togglePin(msgId);
        }}
        onStartEdit={(msg) => {
          setEditingMessage(msg);
        }}
        onDeleteMessage={(msgId) => {
          deleteMessage(msgId);
        }}
      />

      <ThreadDrawer
        isOpen={Boolean(currentThreadParentMessage)}
        onClose={() => setSelectedThreadMessage(null)}
        parentMessage={currentThreadParentMessage}
        allMessages={messages}
        currentUser={currentUser}
        staffById={staffById}
        onSendReply={(chId, parentId, text) => {
          sendThreadReply(chId, parentId, text);
        }}
      />

      <SeenByDrawer
        isOpen={Boolean(currentAnnouncementMessage)}
        onClose={() => setSelectedAnnouncementMessage(null)}
        message={currentAnnouncementMessage}
        staffList={staff}
      />

      <PinnedMessagesDrawer
        isOpen={isPinnedDrawerOpen}
        onClose={() => setIsPinnedDrawerOpen(false)}
        pinnedMessages={pinnedMessages}
        staffById={staffById}
        onJumpToMessage={handleJumpToMessage}
      />

      <AttachmentDrawer
        isOpen={isAttachmentDrawerOpen}
        onClose={() => setIsAttachmentDrawerOpen(false)}
        onAttachFile={(fileData) => {
          sendFile(channel.id, fileData);
        }}
      />
    </div>
  );
}

export default ChatAreaView;
