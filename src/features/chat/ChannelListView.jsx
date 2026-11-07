import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Search, Hash, Building2, MessageSquare, Plus, Archive, ChevronDown, ChevronUp } from 'lucide-react';
import { useChat } from '../../context/ChatContext.jsx';
import {
  visibleChannelsFor,
  groupChannels,
  unreadCount,
  siteActivity,
  canCreateChannels,
  canUseAdmin,
} from '../../utils/chat.js';
import { ChannelRow } from './ChannelRow.jsx';
import { GlobalSearchDrawer } from './GlobalSearchDrawer.jsx';
import { CreateChannelDrawer } from './CreateChannelDrawer.jsx';
import { NewDirectMessageDrawer } from './NewDirectMessageDrawer.jsx';

const FILTER_TABS = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'channels', label: 'Channels', icon: Hash },
  { id: 'sites', label: 'Sites', icon: Building2 },
  { id: 'direct', label: 'Direct', icon: MessageSquare },
];

export function ChannelListView({ defaultChannelId = null }) {
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
  const { id: routeChannelId } = useParams();
  const activeChannelId = routeChannelId ?? defaultChannelId ?? null;

  const [activeFilter, setActiveFilter] = useState('all');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false);
  const [isNewDmOpen, setIsNewDmOpen] = useState(false);
  const [isArchivedOpen, setIsArchivedOpen] = useState(false);

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

  // 2. Filter by active category tab (All, Unread, Channels, Sites, Direct)
  const filteredChannels = useMemo(() => {
    // Archived channels never appear in normal list tabs
    const activeChannels = userVisibleChannels.filter((ch) => !ch.archived);
    if (activeFilter === 'unread') {
      return activeChannels.filter((ch) => {
        if (ch.kind === 'listing') return false; // properties are not listed individually
        if (ch.kind === 'site') {
          const act = siteActivity(ch, channels, messages, currentUser, userReadMap, notifyPrefs);
          return act.unreadCount > 0;
        }
        const count = unreadCount(ch.id, messages, userReadMap[ch.id], currentUserId);
        return count > 0;
      });
    }
    if (activeFilter === 'channels') {
      return activeChannels.filter(
        (ch) => ch.kind === 'public' || ch.kind === 'announcement' || ch.kind === 'private'
      );
    }
    if (activeFilter === 'sites') {
      return activeChannels.filter((ch) => ch.kind === 'site');
    }
    if (activeFilter === 'direct') {
      return activeChannels.filter((ch) => ch.kind === 'dm' || ch.kind === 'group');
    }
    // Individual properties are not listed in normal channel lists
    return activeChannels.filter((ch) => ch.kind !== 'listing');
  }, [userVisibleChannels, activeFilter, channels, messages, userReadMap, currentUserId, currentUser, notifyPrefs]);

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
      {/* Search Trigger Button & New Channel Button (Admin and Manager only) */}
      <div className="p-3 border-b border-line shrink-0 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsSearchOpen(true)}
          aria-label="Search workspace (Ctrl+K)"
          className="flex-1 min-w-0 flex items-center justify-between pl-3 pr-3 py-1.5 text-xs bg-surface-raised border border-line rounded-lg text-ink-muted hover:border-brand hover:text-ink transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Search className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Search channels & sites...</span>
          </div>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-xs font-mono bg-surface border border-line rounded text-ink-muted">
            ⌘K
          </kbd>
        </button>

        {canCreateChannels(currentUser) && (
          <button
            type="button"
            onClick={() => setIsCreateChannelOpen(true)}
            aria-label="New channel"
            title="New channel"
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-raised border border-line text-ink hover:bg-surface hover:border-brand transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
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
                    channels={channels}
                    lastReadAt={userReadMap[channel.id]}
                    userReadMap={userReadMap}
                    currentUser={currentUser}
                    staffList={staff}
                    isMuted={isChannelMuted(channel.id)}
                    notifyMode={notifyPrefs?.mode || 'all'}
                    notifyPrefs={notifyPrefs}
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
                    channels={channels}
                    lastReadAt={userReadMap[channel.id]}
                    userReadMap={userReadMap}
                    currentUser={currentUser}
                    staffList={staff}
                    isMuted={isChannelMuted(channel.id)}
                    notifyMode={notifyPrefs?.mode || 'all'}
                    notifyPrefs={notifyPrefs}
                  />
                ))}
              </div>
            )}

            {/* Sites Section */}
            {grouped.sites.length > 0 && (
              <div className="space-y-1">
                <div className="px-2 py-1 text-xs font-bold text-ink-muted uppercase tracking-wider">
                  Sites
                </div>
                {grouped.sites.map((channel) => (
                  <ChannelRow
                    key={channel.id}
                    channel={channel}
                    isActive={channel.id === activeChannelId}
                    onClick={() => handleSelectChannel(channel.id)}
                    messages={messages}
                    channels={channels}
                    lastReadAt={userReadMap[channel.id]}
                    userReadMap={userReadMap}
                    currentUser={currentUser}
                    staffList={staff}
                    isMuted={isChannelMuted(channel.id)}
                    notifyMode={notifyPrefs?.mode || 'all'}
                    notifyPrefs={notifyPrefs}
                  />
                ))}
              </div>
            )}

            {/* Direct Messages & Groups */}
            <div className="space-y-1">
              <div className="flex items-center justify-between px-2 py-0.5">
                <span className="text-xs font-bold text-ink-muted uppercase tracking-wider">
                  Direct Messages
                </span>
                <button
                  type="button"
                  onClick={() => setIsNewDmOpen(true)}
                  aria-label="New direct message"
                  title="New direct message"
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-ink-muted hover:text-ink hover:bg-surface-raised cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
              {grouped.directMessages.length > 0 ? (
                grouped.directMessages.map((channel) => (
                  <ChannelRow
                    key={channel.id}
                    channel={channel}
                    isActive={channel.id === activeChannelId}
                    onClick={() => handleSelectChannel(channel.id)}
                    messages={messages}
                    channels={channels}
                    lastReadAt={userReadMap[channel.id]}
                    userReadMap={userReadMap}
                    currentUser={currentUser}
                    staffList={staff}
                    isMuted={isChannelMuted(channel.id)}
                    notifyMode={notifyPrefs?.mode || 'all'}
                    notifyPrefs={notifyPrefs}
                  />
                ))
              ) : (
                <div className="px-3 py-2 text-xs text-ink-muted">
                  No direct messages yet
                </div>
              )}
            </div>

            {/* Archived Channels (Admin only, collapsed by default) */}
            {canUseAdmin(currentUser) && grouped.archived.length > 0 && (
              <div className="space-y-1 pt-2 border-t border-line/60">
                <button
                  type="button"
                  onClick={() => setIsArchivedOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between px-2 py-1 text-xs font-bold text-ink-muted uppercase tracking-wider hover:text-ink cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <Archive className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Archived ({grouped.archived.length})</span>
                  </div>
                  {isArchivedOpen ? (
                    <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
                  )}
                </button>
                {isArchivedOpen &&
                  grouped.archived.map((channel) => (
                    <ChannelRow
                      key={channel.id}
                      channel={channel}
                      isActive={channel.id === activeChannelId}
                      onClick={() => handleSelectChannel(channel.id)}
                      messages={messages}
                      channels={channels}
                      lastReadAt={userReadMap[channel.id]}
                      userReadMap={userReadMap}
                      currentUser={currentUser}
                      staffList={staff}
                      isMuted={isChannelMuted(channel.id)}
                      notifyMode={notifyPrefs?.mode || 'all'}
                      notifyPrefs={notifyPrefs}
                    />
                  ))}
              </div>
            )}
          </>
        ) : (
          <div className="space-y-1">
            {activeFilter === 'direct' && (
              <div className="pb-2">
                <button
                  type="button"
                  onClick={() => setIsNewDmOpen(true)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl bg-surface-raised border border-line text-ink hover:border-brand hover:text-brand transition-colors cursor-pointer min-h-[44px]"
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                  <span>New direct message</span>
                </button>
              </div>
            )}
            {filteredChannels.length === 0 ? (
              <div className="text-center py-8 px-4 text-xs text-ink-muted">
                {activeFilter === 'unread'
                  ? 'No unread messages'
                  : activeFilter === 'direct'
                  ? 'No direct messages yet'
                  : 'No matching channels found'}
              </div>
            ) : (
              filteredChannels.map((channel) => (
                <ChannelRow
                  key={channel.id}
                  channel={channel}
                  isActive={channel.id === activeChannelId}
                  onClick={() => handleSelectChannel(channel.id)}
                  messages={messages}
                  channels={channels}
                  lastReadAt={userReadMap[channel.id]}
                  userReadMap={userReadMap}
                  currentUser={currentUser}
                  staffList={staff}
                  isMuted={isChannelMuted(channel.id)}
                  notifyMode={notifyPrefs?.mode || 'all'}
                  notifyPrefs={notifyPrefs}
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

      {/* Create Channel Drawer (Admin & Manager) */}
      {canCreateChannels(currentUser) && (
        <CreateChannelDrawer
          key={currentUser?.id}
          isOpen={isCreateChannelOpen}
          onClose={() => setIsCreateChannelOpen(false)}
        />
      )}

      {/* New Direct Message Drawer */}
      <NewDirectMessageDrawer
        key={currentUser?.id}
        isOpen={isNewDmOpen}
        onClose={() => setIsNewDmOpen(false)}
      />
    </div>
  );
}

export default ChannelListView;
