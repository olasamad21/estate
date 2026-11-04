import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Hash, Lock, Megaphone, Building2, Users, Pin, FolderOpen, Info, Plus } from 'lucide-react';
import { useChat } from '../../context/ChatContext.jsx';
import { COMPANY_CONFIG } from '../../config/market.js';
import {
  channelDisplayName,
  canUserSeeChannel,
  channelMembersFor,
  threadReplies,
  initialsOf,
  canPost,
  siteOfProperty,
  propertiesOfSite,
  siteSummary,
  unreadCount,
  canAddProperty,
} from '../../utils/chat.js';
import { formatDayLabelNg, formatNaira } from '../../utils/formatters.js';
import { useToast } from '../../components/common/useToast.js';
import { getAccessDeniedMessage } from '../../utils/messages.js';
import { MessageRow } from './MessageRow.jsx';
import { MessageComposer } from './MessageComposer.jsx';
import { MessageActionDrawer } from './MessageActionDrawer.jsx';
import { ThreadDrawer } from './ThreadDrawer.jsx';
import { SeenByDrawer } from './SeenByDrawer.jsx';
import { PinnedMessagesDrawer } from './PinnedMessagesDrawer.jsx';
import { AttachmentDrawer } from './AttachmentDrawer.jsx';
import { AttachmentPreviewDrawer } from './AttachmentPreviewDrawer.jsx';
import { PostLeadDrawer } from './PostLeadDrawer.jsx';
import { ShareListingDrawer } from './ShareListingDrawer.jsx';
import { ChannelFilesDrawer } from './ChannelFilesDrawer.jsx';
import { FileDetailDrawer } from './FileDetailDrawer.jsx';
import { ChannelInfoDrawer } from './ChannelInfoDrawer.jsx';
import { AddPropertyDrawer } from './AddPropertyDrawer.jsx';
import { Avatar } from '../../components/common/Avatar.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { ListingPhoto } from './ListingPhoto.jsx';
import { ListingCard } from './ListingCard.jsx';
import { setPreviewUrl } from '../../utils/previewUrls.js';

function SitePropertiesTab({ site, channels, messages, currentUser, userReadMap, onSelectProperty }) {
  const [isAddPropertyOpen, setIsAddPropertyOpen] = useState(false);

  const properties = useMemo(() => {
    return propertiesOfSite(site.id, channels, currentUser);
  }, [site.id, channels, currentUser]);

  const summary = useMemo(() => {
    return siteSummary(site.id, channels);
  }, [site.id, channels]);

  const canAdd = canAddProperty(currentUser, site);

  const summaryText = useMemo(() => {
    if (summary.total === 0) return 'No properties yet.';
    const parts = [];
    const propWord = summary.total === 1 ? 'property' : 'properties';
    parts.push(`${summary.total} ${propWord}`);
    if (summary.available > 0) parts.push(`${summary.available} available`);
    if (summary.underOffer > 0) parts.push(`${summary.underOffer} under offer`);
    if (summary.sold > 0) parts.push(`${summary.sold} sold`);
    return parts.join(' · ');
  }, [summary]);

  return (
    <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
      {/* Site Header Summary Bar with Building2 icon badge and Add Property Button */}
      <div className="p-3 sm:p-4 bg-surface-raised border-b border-line flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 pr-2">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl border border-line shrink-0 bg-surface flex items-center justify-center text-brand shadow-2xs">
            <Building2 className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="text-xs sm:text-sm font-bold text-ink break-words line-clamp-1">
              {site.title || site.name}
            </div>
            <p className="text-xs font-medium text-ink-muted mt-0.5 line-clamp-1">
              {summaryText}
            </p>
          </div>
        </div>

        {canAdd && (
          <button
            type="button"
            onClick={() => setIsAddPropertyOpen(true)}
            aria-label="Add property"
            title="Add property"
            className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl bg-brand text-surface hover:bg-brand/90 font-semibold text-xs flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors shadow-2xs"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Add property</span>
          </button>
        )}
      </div>

      {properties.length === 0 ? (
        <div className="py-16 px-4 text-center space-y-3">
          <p className="text-xs text-ink-muted">No properties yet.</p>
          {canAdd && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setIsAddPropertyOpen(true)}
              className="min-h-[44px] cursor-pointer inline-flex items-center"
            >
              <Plus className="w-4 h-4 mr-1.5" aria-hidden="true" />
              <span>Add property</span>
            </Button>
          )}
        </div>
      ) : (
        <div className="divide-y divide-line">
          {properties.map((prop) => {
            const rawStatus = prop.listing?.status || prop.status || 'Available';
            const statusVariant =
              rawStatus === 'Available'
                ? 'success'
                : rawStatus === 'Under offer'
                ? 'warning'
                : 'neutral';
            const typeSize = [prop.listing?.type, prop.listing?.size].filter(Boolean).join(' · ');
            const propPrice = prop.listing?.priceNgn || prop.price;
            const unread = unreadCount(prop.id, messages, userReadMap?.[prop.id], currentUser?.id);

            return (
              <button
                key={prop.id}
                type="button"
                onClick={() => onSelectProperty(prop.id)}
                className="w-full p-3 sm:p-4 flex items-center justify-between gap-3 text-left hover:bg-surface-raised/70 transition-colors cursor-pointer group min-h-[56px]"
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className="w-12 h-12 rounded-lg overflow-hidden border border-line shrink-0 bg-surface-raised shadow-2xs">
                    <ListingPhoto channel={prop} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-semibold text-ink break-words line-clamp-1 group-hover:text-brand transition-colors">
                      {prop.title}
                    </div>
                    {typeSize && (
                      <p className="text-xs text-ink-muted line-clamp-1">
                        {typeSize}
                      </p>
                    )}
                    <div className="text-xs font-bold text-brand tabular-nums mt-0.5">
                      {formatNaira(propPrice)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={statusVariant} size="sm">
                    {rawStatus}
                  </Badge>
                  {unread > 0 && (
                    <span className="min-w-5 h-5 px-1.5 inline-flex items-center justify-center rounded-full text-xs font-bold tabular-nums shadow-xs bg-brand text-surface">
                      {unread}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {canAdd && isAddPropertyOpen && (
        <AddPropertyDrawer
          key={`add-prop-${site.id}`}
          isOpen={isAddPropertyOpen}
          onClose={() => setIsAddPropertyOpen(false)}
          site={site}
        />
      )}
    </div>
  );
}

export function ChatAreaView({ defaultChannelId = 'general' }) {
  const { id: routeChannelId } = useParams();
  const channelId = routeChannelId || defaultChannelId;
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

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
    notifyPrefs,
    toggleMuteChannel,
    setListingStatus,
    lastReadAtByUser,
  } = useChat();

  const userReadMap = useMemo(() => {
    return (currentUserId && lastReadAtByUser?.[currentUserId]) || {};
  }, [lastReadAtByUser, currentUserId]);

  const [activeSiteTab, setActiveSiteTab] = useState('properties');

  const [selectedActionMessage, setSelectedActionMessage] = useState(null);
  const [selectedThreadMessage, setSelectedThreadMessage] = useState(null);
  const [selectedAnnouncementMessage, setSelectedAnnouncementMessage] = useState(null);
  const [isPinnedDrawerOpen, setIsPinnedDrawerOpen] = useState(false);
  const [isAttachmentDrawerOpen, setIsAttachmentDrawerOpen] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState(null);
  const pendingAttachmentRef = useRef(null);

  useEffect(() => {
    pendingAttachmentRef.current = pendingAttachment;
  }, [pendingAttachment]);

  const [isPostLeadOpen, setIsPostLeadOpen] = useState(false);
  const [isShareListingOpen, setIsShareListingOpen] = useState(false);
  const [isFilesDrawerOpen, setIsFilesDrawerOpen] = useState(false);
  const [selectedFileForPreview, setSelectedFileForPreview] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [isInfoDrawerOpen, setIsInfoDrawerOpen] = useState(false);

  const scrollRef = useRef(null);

  // 1. Resolve channel
  const channel = useMemo(() => {
    return channels.find((c) => c.id === channelId) || null;
  }, [channels, channelId]);

  // 2. Check visibility
  const isVisible = useMemo(() => {
    return canUserSeeChannel(currentUser, channel);
  }, [channel, currentUser]);

  const parentSite = useMemo(() => {
    return channel && channel.kind === 'listing' ? siteOfProperty(channel, channels) : null;
  }, [channel, channels]);

  // Demo safety: redirect to /channels if active user cannot view this channel
  useEffect(() => {
    if (channel && currentUser && !canUserSeeChannel(currentUser, channel)) {
      showToast(getAccessDeniedMessage(currentUser.name));
      navigate('/channels', { replace: true });
    }
  }, [channel, currentUser, navigate, showToast]);

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

  // Channel members for mention autocomplete following the single member rule
  const channelMembers = useMemo(() => {
    if (!channel) return [];
    return channelMembersFor(channel, staff);
  }, [channel, staff]);

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
    if (!location.hash && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [channelId, timelineMessages.length, location.hash]);

  const handleJumpToMessage = useCallback((msgId) => {
    if (!msgId) return;
    const targetMsg = messages.find((m) => m.id === msgId);
    if (targetMsg && targetMsg.parentId) {
      const parent = messages.find((m) => m.id === targetMsg.parentId);
      if (parent) {
        setSelectedThreadMessage(parent);
      }
      setTimeout(() => {
        const el = document.getElementById(`msg-${msgId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('bg-brand/10');
          setTimeout(() => {
            el.classList.remove('bg-brand/10');
          }, 1500);
        }
      }, 200);
      return;
    }

    const el = document.getElementById(`msg-${msgId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('bg-brand/10');
      setTimeout(() => {
        el.classList.remove('bg-brand/10');
      }, 1500);
    }
  }, [messages]);

  // Clean up uncommitted preview object URL on unmount
  useEffect(() => {
    return () => {
      if (pendingAttachmentRef.current?.objectUrl) {
        try {
          URL.revokeObjectURL(pendingAttachmentRef.current.objectUrl);
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const handleSelectAttachment = useCallback((attachment) => {
    if (pendingAttachmentRef.current?.objectUrl && pendingAttachmentRef.current.objectUrl !== attachment?.objectUrl) {
      try {
        URL.revokeObjectURL(pendingAttachmentRef.current.objectUrl);
      } catch {
        // ignore
      }
    }
    setPendingAttachment({
      ...attachment,
      key: `att-${Date.now()}`,
    });
  }, []);

  const handleCancelAttachmentPreview = useCallback(() => {
    if (pendingAttachmentRef.current?.objectUrl) {
      try {
        URL.revokeObjectURL(pendingAttachmentRef.current.objectUrl);
      } catch {
        // ignore
      }
    }
    setPendingAttachment(null);
  }, []);

  const handleSendAttachment = useCallback(({ caption }) => {
    if (!pendingAttachmentRef.current || !channel) return;
    const currentAtt = pendingAttachmentRef.current;
    const msgId = sendFile(channel.id, {
      fileName: currentAtt.fileName,
      fileSize: currentAtt.fileSize,
      fileKind: currentAtt.fileKind,
      caption,
    });

    if (msgId && currentAtt.objectUrl) {
      setPreviewUrl(msgId, currentAtt.objectUrl);
    }

    setPendingAttachment(null);
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 50);
  }, [channel, sendFile]);

  // Jump to message if URL hash is present (e.g. #msg-xyz from search or external link)
  useEffect(() => {
    if (location.hash && location.hash.startsWith('#msg-')) {
      const msgId = location.hash.replace('#msg-', '');
      const timer = setTimeout(() => {
        handleJumpToMessage(msgId);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [location.hash, channelId, timelineMessages.length, handleJumpToMessage]);

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
  const isMuted = Boolean(notifyPrefs?.mutedChannelIds?.includes(channel.id));

  const officeObj = channel.officeId
    ? COMPANY_CONFIG.offices.find((o) => o.id === channel.officeId)
    : null;
  const officeLabel = officeObj?.label || (officeObj ? officeObj.name : 'All offices');

  const channelLocation = channel.listing?.area || channel.location || parentSite?.site?.location || '';

  const headerCaption = (() => {
    if (!channel) return '';
    if (channel.kind === 'site') {
      const loc = channel.site?.location || 'Location';
      return `${loc} · ${officeLabel}`;
    }
    if (channel.kind === 'listing') {
      const siteTitle = parentSite?.title || parentSite?.name || 'Site';
      return channelLocation ? `${siteTitle} · ${channelLocation}` : siteTitle;
    }
    if (channel.kind === 'dm') {
      const otherId = channel.members?.find((id) => id !== currentUserId) || channel.members?.[0];
      const other = staffById[otherId];
      return other?.title || 'Direct conversation';
    }
    if (channel.kind === 'group') {
      return `${channelMembers.length} members`;
    }
    return `${channelMembers.length} members${channel.officeId ? ` · ${officeLabel}` : ' · All offices'}`;
  })();

  const renderChannelIcon = () => {
    if (channel.kind === 'announcement') {
      return <Megaphone className="w-5 h-5 text-brand shrink-0" aria-hidden="true" />;
    }
    if (channel.kind === 'private') {
      return <Lock className="w-5 h-5 text-ink-muted shrink-0" aria-hidden="true" />;
    }
    if (channel.kind === 'site' || channel.kind === 'listing') {
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
          initials={initialsOf(other?.name)}
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
      {/* Channel Header (min 56px compact row, flex-none) */}
      <div className="min-h-14 py-1.5 px-2 sm:px-4 border-b border-line flex items-center justify-between flex-none bg-surface">
        <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
          {/* Back button on smaller screens (44px target) */}
          <button
            type="button"
            onClick={() => {
              if (channel.kind === 'listing' && (channel.listing?.siteId || channel.siteId)) {
                navigate(`/channels/${channel.listing?.siteId || channel.siteId}`);
              } else {
                navigate('/channels');
              }
            }}
            aria-label={
              channel.kind === 'listing' && (channel.listing?.siteId || channel.siteId)
                ? 'Back to site'
                : 'Back to channels'
            }
            className="lg:hidden w-11 h-11 flex items-center justify-center -ml-1 text-ink-muted hover:text-ink rounded-lg hover:bg-surface-raised cursor-pointer shrink-0"
          >
            <ChevronLeft className="w-5 h-5" aria-hidden="true" />
          </button>

          {renderChannelIcon()}

          <div
            onClick={() => setIsInfoDrawerOpen(true)}
            className="min-w-0 cursor-pointer flex-1 py-1"
          >
            <h2 className="text-sm font-semibold text-ink line-clamp-1 leading-snug break-words">
              {channel.kind === 'public' || channel.kind === 'private' || channel.kind === 'announcement'
                ? `#${displayName}`
                : displayName}
            </h2>
            {channel.kind === 'listing' && parentSite ? (
              <p className="text-xs text-ink-muted line-clamp-1 leading-normal">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/channels/${parentSite.id}`);
                  }}
                  className="text-brand-ink hover:underline cursor-pointer font-medium"
                >
                  {parentSite.title || parentSite.name}
                </button>
                {channelLocation ? ` · ${channelLocation}` : ''}
              </p>
            ) : (
              <p className="text-xs text-ink-muted line-clamp-1 leading-normal">
                {headerCaption}
              </p>
            )}
          </div>
        </div>

        {/* Header Actions: Files button (44px) + Info button (44px) */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setIsFilesDrawerOpen(true)}
            aria-label="Files"
            title="Files"
            className="w-11 h-11 flex items-center justify-center text-ink-muted hover:text-ink rounded-lg hover:bg-surface-raised transition-colors cursor-pointer shrink-0"
          >
            <FolderOpen className="w-5 h-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setIsInfoDrawerOpen(true)}
            aria-label="Channel info"
            title="Channel info"
            className="w-11 h-11 flex items-center justify-center text-ink-muted hover:text-ink rounded-lg hover:bg-surface-raised transition-colors cursor-pointer shrink-0"
          >
            <Info className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Two-tab control under header for Site channels (44px tabs, default Properties, resets with site id) */}
      {channel.kind === 'site' && (
        <div key={channel.id} className="flex items-center border-b border-line bg-surface flex-none px-2 sm:px-4">
          <button
            type="button"
            onClick={() => setActiveSiteTab('properties')}
            className={`min-h-[44px] px-4 text-xs font-semibold border-b-2 -mb-px transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeSiteTab === 'properties'
                ? 'border-brand text-brand'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            <span>Properties</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSiteTab('chat')}
            className={`min-h-[44px] px-4 text-xs font-semibold border-b-2 -mb-px transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeSiteTab === 'chat'
                ? 'border-brand text-brand'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            <span>Site chat</span>
          </button>
        </div>
      )}

      {/* Main Channel Body: Properties Tab vs Chat View */}
      {channel.kind === 'site' && activeSiteTab === 'properties' ? (
        <SitePropertiesTab
          site={channel}
          channels={channels}
          messages={messages}
          currentUser={currentUser}
          userReadMap={userReadMap}
          onSelectProperty={(propId) => navigate(`/channels/${propId}`)}
        />
      ) : (
        <>
          {/* Listing Card directly under header for listing channels (flex-none) */}
          {channel.kind === 'listing' && (
            <div className="flex-none">
              <ListingCard
                channel={channel}
                currentUser={currentUser}
                onSetListingStatus={setListingStatus}
              />
            </div>
          )}

          {/* Pinned Messages Banner (flex-none, 40px tall) */}
          {pinnedMessages.length > 0 && (
            <div
              onClick={() => {
                if (pinnedMessages.length === 1) {
                  handleJumpToMessage(pinnedMessages[0].id);
                } else {
                  setIsPinnedDrawerOpen(true);
                }
              }}
              className="min-h-10 py-1.5 px-3 sm:px-4 bg-surface-raised border-b border-line flex items-center justify-between text-xs cursor-pointer hover:bg-surface-raised/80 transition-colors flex-none select-none"
            >
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <Pin className="w-3.5 h-3.5 text-brand shrink-0" aria-hidden="true" />
                {pinnedMessages.length === 1 ? (
                  <div className="min-w-0 flex items-center gap-1.5 line-clamp-1">
                    <span className="font-bold text-ink shrink-0">
                      {staffById[pinnedMessages[0].senderId]?.name || 'Staff'}:
                    </span>
                    <span className="text-ink-muted line-clamp-1">
                      {pinnedMessages[0].type === 'voice'
                        ? 'Voice note'
                        : pinnedMessages[0].type === 'file'
                        ? `File: ${pinnedMessages[0].fileName || 'Attachment'}`
                        : pinnedMessages[0].text}
                    </span>
                  </div>
                ) : (
                  <span className="font-semibold text-ink line-clamp-1">
                    {pinnedMessages.length} pinned messages
                  </span>
                )}
              </div>

              <span className="text-xs text-brand-ink font-semibold shrink-0">
                {pinnedMessages.length === 1 ? 'Jump' : 'View all'}
              </span>
            </div>
          )}

          {/* Message Timeline (flex-1, min-h-0, overflow-y-auto, overscroll-contain) */}
          <div
            ref={scrollRef}
            className="flex-1 min-h-0 overflow-y-auto p-2 sm:p-4 space-y-4 overscroll-contain"
            style={{ overscrollBehavior: 'contain' }}
          >
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
                      onOpenFileDetail={(fileMsg) => setSelectedFileForPreview(fileMsg)}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Typing Indicator */}
          {typingStatus && typingStatus.channelId === channel.id && (
            <div className="px-4 py-1 text-xs text-ink-muted flex items-center gap-1.5 bg-surface flex-none">
              <span className="font-semibold text-ink">{typingStatus.staffName}</span>
              <span>is typing...</span>
            </div>
          )}

          {/* Message Composer or Archived Notice */}
          {channel?.archived ? (
            <div className="p-4 border-t border-line bg-surface-raised text-center text-xs text-ink-muted font-medium flex-none">
              This channel is archived
            </div>
          ) : (
            <div className="flex-none">
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
            </div>
          )}
        </>
      )}

      {/* Action Drawers */}
      <MessageActionDrawer
        isOpen={Boolean(selectedActionMessage)}
        onClose={() => setSelectedActionMessage(null)}
        message={selectedActionMessage}
        currentUser={currentUser}
        isArchived={Boolean(channel?.archived)}
        onReact={(emoji) => {
          if (selectedActionMessage && !channel?.archived) {
            toggleReaction(selectedActionMessage.id, emoji);
          }
        }}
        onReplyInThread={(msg) => {
          setSelectedThreadMessage(msg);
        }}
        onTogglePin={(msgId) => {
          if (!channel?.archived) {
            togglePin(msgId);
          }
        }}
        onStartEdit={(msg) => {
          if (!channel?.archived) {
            setEditingMessage(msg);
          }
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
        isArchived={Boolean(channel?.archived)}
        allowedToPost={canPost(currentUser, channel)}
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
        channel={channel}
        onOpenPostLead={() => setIsPostLeadOpen(true)}
        onOpenShareListing={() => setIsShareListingOpen(true)}
        onSelectAttachment={handleSelectAttachment}
        onAttachFile={(fileData) => {
          return sendFile(channel.id, fileData);
        }}
      />

      <AttachmentPreviewDrawer
        key={pendingAttachment?.key || 'preview'}
        isOpen={Boolean(pendingAttachment)}
        onClose={handleCancelAttachmentPreview}
        attachment={pendingAttachment}
        onSend={handleSendAttachment}
      />

      <PostLeadDrawer
        isOpen={isPostLeadOpen}
        onClose={() => setIsPostLeadOpen(false)}
        channel={channel}
      />

      <ShareListingDrawer
        isOpen={isShareListingOpen}
        onClose={() => setIsShareListingOpen(false)}
        channel={channel}
      />

      <ChannelFilesDrawer
        isOpen={isFilesDrawerOpen}
        onClose={() => setIsFilesDrawerOpen(false)}
        channel={channel}
        messages={channelMessages}
        staffById={staffById}
        onShowInChat={handleJumpToMessage}
      />

      <FileDetailDrawer
        isOpen={Boolean(selectedFileForPreview)}
        onClose={() => setSelectedFileForPreview(null)}
        fileItem={selectedFileForPreview}
        staffById={staffById}
        showInChat={false}
      />

      <ChannelInfoDrawer
        isOpen={isInfoDrawerOpen}
        onClose={() => setIsInfoDrawerOpen(false)}
        channel={channel}
        currentUser={currentUser}
        currentUserId={currentUserId}
        staff={staff}
        staffById={staffById}
        isMuted={isMuted}
        onToggleMute={() => toggleMuteChannel(channel.id, displayName)}
        displayName={displayName}
      />
    </div>
  );
}

export default ChatAreaView;
