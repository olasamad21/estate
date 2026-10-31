import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Search, Hash, Building2, MessageSquare } from 'lucide-react';
import { useChat } from '../../context/ChatContext.jsx';
import { visibleChannelsFor, groupChannels, unreadCount } from '../../utils/chat.js';
import { ChannelRow } from './ChannelRow.jsx';
import { GlobalSearchDrawer } from './GlobalSearchDrawer.jsx';

const FILTER_TABS = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'channels', label: 'Channels', icon: Hash },
  { id: 'listings', label: 'Listings', icon: Building2 },
  { id: 'direct', label: 'Direct', icon: MessageSquare },
];

export function ChannelListView() {
  const {
    channels,
    messages,
    lastReadAtByUser,
    currentUser,
    currentUserId,
    staff,
    staffById,
    notifyPrefs,
  } = useChat();
  const navigate = useNavigate();
  const { id: activeChannelId } = useParams();

  const [activeFilter, setActiveFilter] = useState('all');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Keyboard shortcut Ctrl/Cmd+K to open search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 1. Filter channels strictly by current user's visibility
  const userVisibleChannels = useMemo(() => {
    return visibleChannelsFor(currentUser, channels);
  }, [currentUser, channels]);

  const userReadMap = useMemo(() => {
    return (currentUserId && lastReadAtByUser?.[currentUserId]) || {};
  }, [lastReadAtByUser, currentUserId]);

  // 2. Filter by active category tab (All, Unread, Channels, Listings, Direct)
  const filteredChannels = useMemo(() => {
    if (activeFilter === 'unread') {
      return userVisibleChannels.filter((ch) => {
        const count = unreadCount(ch.id, messages, userReadMap[ch.id], currentUserId);
        return count > 0;
      });
    }
    if (activeFilter === 'channels') {
      return userVisibleChannels.filter(
        (ch) => ch.kind === 'public' || ch.kind === 'announcement' || ch.kind === 'private'
      );
    }
    if (activeFilter === 'listings') {
      return userVisibleChannels.filter((ch) => ch.kind === 'listing');
    }
    if (activeFilter === 'direct') {
      return userVisibleChannels.filter((ch) => ch.kind === 'dm' || ch.kind === 'group');
    }
    return userVisibleChannels;
  }, [userVisibleChannels, activeFilter, messages, userReadMap, currentUserId]);

  // 3. Group channels into sections when on 'all' tab
  const grouped = useMemo(() => {
    return groupChannels(userVisibleChannels);
  }, [userVisibleChannels]);

  const handleSelectChannel = (channelId) => {
    navigate(`/channels/${channelId}`);
  };

  const isGroupedView = activeFilter === 'all';

  const isChannelMuted = (channelId) => {
    return Array.isArray(notifyPrefs?.mutedChannelIds) && notifyPrefs.mutedChannelIds.includes(channelId);
  };

  return (
    <div className="h-full flex flex-col bg-surface select-none">
      {/* Search Trigger Button */}
      <div className="p-3 border-b border-line shrink-0">
        <button
          type="button"
          onClick={() => setIsSearchOpen(true)}
          aria-label="Search workspace (Ctrl+K)"
          className="w-full flex items-center justify-between pl-3 pr-3 py-1.5 text-xs bg-surface-raised border border-line rounded-lg text-ink-muted hover:border-brand hover:text-ink transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Search channels & listings...</span>
          </div>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-2xs font-mono bg-surface border border-line rounded text-ink-muted">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Filter Chips */}
      <div className="px-3 py-2 border-b border-line flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
        {FILTER_TABS.map((tab) => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border ${
                isActive
                  ? 'bg-brand text-surface border-brand'
                  : 'bg-surface text-ink-soft border-line hover:bg-surface-raised'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Channel Rows List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        {isGroupedView ? (
          <>
            {/* Standard Channels */}
            {grouped.channels.length > 0 && (
              <div className="space-y-1">
                <div className="px-2 py-1 text-xs font-bold text-ink-muted uppercase tracking-wider">
                  Channels
                </div>
                {grouped.channels.map((channel) => (
                  <ChannelRow
                    key={channel.id}
                    channel={channel}
                    isActive={channel.id === activeChannelId}
                    onClick={() => handleSelectChannel(channel.id)}
                    messages={messages}
                    lastReadAt={userReadMap[channel.id]}
                    currentUser={currentUser}
                    staffList={staff}
                    isMuted={isChannelMuted(channel.id)}
                    notifyMode={notifyPrefs?.mode || 'all'}
                  />
                ))}
              </div>
            )}

            {/* Private Channels (if visible to user) */}
            {grouped.private.length > 0 && (
              <div className="space-y-1">
                <div className="px-2 py-1 text-xs font-bold text-ink-muted uppercase tracking-wider">
                  Private Channels
                </div>
                {grouped.private.map((channel) => (
                  <ChannelRow
                    key={channel.id}
                    channel={channel}
                    isActive={channel.id === activeChannelId}
                    onClick={() => handleSelectChannel(channel.id)}
                    messages={messages}
                    lastReadAt={userReadMap[channel.id]}
                    currentUser={currentUser}
                    staffList={staff}
                    isMuted={isChannelMuted(channel.id)}
                    notifyMode={notifyPrefs?.mode || 'all'}
                  />
                ))}
              </div>
            )}

            {/* Listing Channels */}
            {grouped.listings.length > 0 && (
              <div className="space-y-1">
                <div className="px-2 py-1 text-xs font-bold text-ink-muted uppercase tracking-wider">
                  Listing Rooms
                </div>
                {grouped.listings.map((channel) => (
                  <ChannelRow
                    key={channel.id}
                    channel={channel}
                    isActive={channel.id === activeChannelId}
                    onClick={() => handleSelectChannel(channel.id)}
                    messages={messages}
                    lastReadAt={userReadMap[channel.id]}
                    currentUser={currentUser}
                    staffList={staff}
                    isMuted={isChannelMuted(channel.id)}
                    notifyMode={notifyPrefs?.mode || 'all'}
                  />
                ))}
              </div>
            )}

            {/* Direct Messages & Groups */}
            {grouped.directMessages.length > 0 && (
              <div className="space-y-1">
                <div className="px-2 py-1 text-xs font-bold text-ink-muted uppercase tracking-wider">
                  Direct Messages
                </div>
                {grouped.directMessages.map((channel) => (
                  <ChannelRow
                    key={channel.id}
                    channel={channel}
                    isActive={channel.id === activeChannelId}
                    onClick={() => handleSelectChannel(channel.id)}
                    messages={messages}
                    lastReadAt={userReadMap[channel.id]}
                    currentUser={currentUser}
                    staffList={staff}
                    isMuted={isChannelMuted(channel.id)}
                    notifyMode={notifyPrefs?.mode || 'all'}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="space-y-1">
            {filteredChannels.length === 0 ? (
              <div className="text-center py-8 px-4 text-xs text-ink-muted">
                {activeFilter === 'unread' ? 'No unread messages' : 'No matching channels found'}
              </div>
            ) : (
              filteredChannels.map((channel) => (
                <ChannelRow
                  key={channel.id}
                  channel={channel}
                  isActive={channel.id === activeChannelId}
                  onClick={() => handleSelectChannel(channel.id)}
                  messages={messages}
                  lastReadAt={userReadMap[channel.id]}
                  currentUser={currentUser}
                  staffList={staff}
                  isMuted={isChannelMuted(channel.id)}
                  notifyMode={notifyPrefs?.mode || 'all'}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* Global Search Drawer */}
      <GlobalSearchDrawer
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        channels={channels}
        messages={messages}
        staff={staff}
        staffById={staffById}
        currentUser={currentUser}
      />
    </div>
  );
}

export default ChannelListView;
