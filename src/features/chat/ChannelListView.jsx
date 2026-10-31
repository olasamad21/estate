import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Search, Hash, Building2, MessageSquare } from 'lucide-react';
import { useChat } from '../../context/ChatContext.jsx';
import { visibleChannelsFor, channelDisplayName, groupChannels } from '../../utils/chat.js';
import { ChannelRow } from './ChannelRow.jsx';

const FILTER_TABS = [
  { id: 'all', label: 'All' },
  { id: 'channels', label: 'Channels', icon: Hash },
  { id: 'listings', label: 'Listings', icon: Building2 },
  { id: 'direct', label: 'Direct', icon: MessageSquare },
];

export function ChannelListView() {
  const { channels, messages, lastReadAtByUser, currentUser, currentUserId, staff } = useChat();
  const navigate = useNavigate();
  const { id: activeChannelId } = useParams();

  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Filter channels strictly by current user's visibility
  const userVisibleChannels = useMemo(() => {
    return visibleChannelsFor(currentUser, channels);
  }, [currentUser, channels]);

  // 2. Filter by search query
  const searchedChannels = useMemo(() => {
    if (!searchQuery.trim()) return userVisibleChannels;
    const q = searchQuery.toLowerCase().trim();
    return userVisibleChannels.filter((ch) => {
      const name = channelDisplayName(ch, currentUserId, staff).toLowerCase();
      const desc = (ch.description || '').toLowerCase();
      const loc = (ch.location || '').toLowerCase();
      return name.includes(q) || desc.includes(q) || loc.includes(q);
    });
  }, [userVisibleChannels, searchQuery, currentUserId, staff]);

  // 3. Filter by active category tab
  const filteredChannels = useMemo(() => {
    if (activeFilter === 'channels') {
      return searchedChannels.filter(
        (ch) => ch.kind === 'public' || ch.kind === 'announcement' || ch.kind === 'private'
      );
    }
    if (activeFilter === 'listings') {
      return searchedChannels.filter((ch) => ch.kind === 'listing');
    }
    if (activeFilter === 'direct') {
      return searchedChannels.filter((ch) => ch.kind === 'dm' || ch.kind === 'group');
    }
    return searchedChannels;
  }, [searchedChannels, activeFilter]);

  // 4. Group channels into sections when on 'all' tab with no search query
  const grouped = useMemo(() => {
    return groupChannels(searchedChannels);
  }, [searchedChannels]);

  const userReadMap = lastReadAtByUser?.[currentUserId] || {};

  const handleSelectChannel = (channelId) => {
    navigate(`/channels/${channelId}`);
  };

  const isGroupedView = activeFilter === 'all' && !searchQuery.trim();

  return (
    <div className="h-full flex flex-col bg-surface select-none">
      {/* Search Input */}
      <div className="p-3 border-b border-line shrink-0">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ink-muted">
            <Search className="w-4 h-4" aria-hidden="true" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search channels & listings..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-surface-raised border border-line rounded-lg text-ink placeholder:text-ink-muted focus:border-brand focus:outline-none"
          />
        </div>
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
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="space-y-1">
            {filteredChannels.length === 0 ? (
              <div className="text-center py-8 px-4 text-xs text-ink-muted">
                No matching channels found
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
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ChannelListView;
