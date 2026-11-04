import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  Hash,
  Building2,
  Lock,
  Megaphone,
  Users,
  FileText,
  Image,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Drawer } from '../../components/common/Drawer.jsx';
import { Avatar } from '../../components/common/Avatar.jsx';
import { useChat } from '../../context/ChatContext.jsx';
import { ROLE_LABELS } from '../../mock/staff.js';
import {
  visibleChannelsFor,
  channelDisplayName,
  isStaffActive,
  initialsOf,
  officeLabelOf,
  callNameOf,
  canInitiateDm,
} from '../../utils/chat.js';
import { formatListTimeNg } from '../../utils/formatters.js';
import { useToast } from '../../components/common/useToast.js';
import { getDirectMessageRestrictedMessage } from '../../utils/messages.js';

function HighlightMatch({ text = '', query = '' }) {
  if (!text || !query) return <span>{text}</span>;
  const q = query.trim();
  if (q.length < 2) return <span>{text}</span>;

  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));

  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === q.toLowerCase() ? (
          <span key={i} className="font-semibold text-ink bg-status-warning-bg px-0.5 rounded">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </span>
  );
}

function getOfficeName(officeId) {
  if (!officeId) return null;
  return officeLabelOf(officeId);
}

export function GlobalSearchDrawer({
  isOpen,
  onClose,
  channels = [],
  messages = [],
  staff = [],
  staffById = {},
  currentUser = null,
}) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { openOrCreateDm } = useChat();
  const inputRef = useRef(null);

  const [query, setQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState({
    channels: false,
    people: false,
    messages: false,
    files: false,
  });

  const currentUserId = currentUser?.id || null;

  // Autofocus input on open
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Channels user can see
  const visibleChannels = useMemo(() => {
    return visibleChannelsFor(currentUser, channels);
  }, [currentUser, channels]);

  const visibleChannelIds = useMemo(() => {
    return new Set(visibleChannels.map((c) => c.id));
  }, [visibleChannels]);

  const channelMap = useMemo(() => {
    const map = {};
    visibleChannels.forEach((c) => {
      map[c.id] = c;
    });
    return map;
  }, [visibleChannels]);

  // Results computation
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) {
      return { channels: [], people: [], messages: [], files: [], hasQuery: false };
    }

    // 1. Channels
    const matchedChannels = visibleChannels.filter((ch) => {
      const name = channelDisplayName(ch, currentUserId, staff).toLowerCase();
      const title = (ch.title || '').toLowerCase();
      const desc = (ch.description || '').toLowerCase();
      const loc = (ch.location || ch.site?.location || ch.listing?.area || '').toLowerCase();
      return name.includes(q) || title.includes(q) || desc.includes(q) || loc.includes(q);
    });

    // 2. People (skip deactivated staff)
    const matchedPeople = staff.filter((s) => {
      if (!isStaffActive(s)) return false;
      const name = (s.name || '').toLowerCase();
      const role = (ROLE_LABELS[s.role] || s.role || '').toLowerCase();
      const title = (s.title || '').toLowerCase();
      const office = (s.office || '').toLowerCase();
      return name.includes(q) || role.includes(q) || title.includes(q) || office.includes(q);
    });

    // 3. Messages (ignore archived channels)
    const matchedMessages = messages.filter((m) => {
      if (!visibleChannelIds.has(m.channelId)) return false;
      const ch = channelMap[m.channelId];
      if (!ch || ch.archived) return false;
      if (m.deletedAt) return false;
      if (m.type === 'text') {
        return (m.text || '').toLowerCase().includes(q);
      }
      if (m.type === 'file' && m.caption) {
        return m.caption.toLowerCase().includes(q);
      }
      return false;
    });

    // 4. Files (ignore archived channels)
    const matchedFiles = messages.filter((m) => {
      if (!visibleChannelIds.has(m.channelId)) return false;
      const ch = channelMap[m.channelId];
      if (!ch || ch.archived) return false;
      if (m.deletedAt) return false;
      if (m.type !== 'file') return false;
      return (m.fileName || '').toLowerCase().includes(q);
    });

    return {
      channels: matchedChannels,
      people: matchedPeople,
      messages: matchedMessages,
      files: matchedFiles,
      hasQuery: true,
    };
  }, [query, visibleChannels, visibleChannelIds, channelMap, staff, messages, currentUserId]);

  const totalResultsCount =
    results.channels.length +
    results.people.length +
    results.messages.length +
    results.files.length;

  const toggleGroup = (groupKey) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };

  const handleClose = () => {
    setQuery('');
    setExpandedGroups({
      channels: false,
      people: false,
      messages: false,
      files: false,
    });
    onClose();
  };

  const handleSelectChannel = (chId) => {
    handleClose();
    navigate(`/channels/${chId}`);
  };

  const handleSelectPerson = (person) => {
    if (!person || person.id === currentUserId) return;

    // Check if DM channel exists with this person
    const dmChannel = visibleChannels.find(
      (c) => c.kind === 'dm' && Array.isArray(c.members) && c.members.includes(person.id)
    );

    if (dmChannel) {
      handleClose();
      navigate(`/channels/${dmChannel.id}`);
      return;
    }

    // Check hierarchy permissions before initiating a new DM
    if (!canInitiateDm(currentUser, person)) {
      showToast(getDirectMessageRestrictedMessage());
      return;
    }

    const dmId = openOrCreateDm(person.id);
    if (dmId) {
      handleClose();
      navigate(`/channels/${dmId}`);
    }
  };

  const handleSelectMessageOrFile = (item) => {
    handleClose();
    navigate(`/channels/${item.channelId}#msg-${item.id}`);
    setTimeout(() => {
      const el = document.getElementById(`msg-${item.id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('bg-brand/10');
        setTimeout(() => el.classList.remove('bg-brand/10'), 1500);
      }
    }, 150);
  };

  const renderChannelIcon = (ch) => {
    if (ch.kind === 'announcement') return <Megaphone className="w-4 h-4 text-brand shrink-0" aria-hidden="true" />;
    if (ch.kind === 'private') return <Lock className="w-4 h-4 text-ink-muted shrink-0" aria-hidden="true" />;
    if (ch.kind === 'site' || ch.kind === 'listing') return <Building2 className="w-4 h-4 text-brand shrink-0" aria-hidden="true" />;
    if (ch.kind === 'group') return <Users className="w-4 h-4 text-ink-muted shrink-0" aria-hidden="true" />;
    return <Hash className="w-4 h-4 text-ink-muted shrink-0" aria-hidden="true" />;
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={handleClose}
      title="Search Workspace"
      panelClassName="h-full max-h-[92dvh] lg:max-h-[80dvh] lg:max-w-xl lg:rounded-2xl lg:border"
    >
      <div className="space-y-4">
        {/* Search input field */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ink-muted">
            <Search className="w-4 h-4" aria-hidden="true" />
          </div>
          <input
            ref={inputRef}
            name="global_search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search channels, people, messages, files..."
            className="w-full pl-9 pr-9 py-2.5 text-xs bg-surface-raised border border-line rounded-xl text-ink placeholder:text-ink-muted focus:border-brand focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search input"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-ink-muted hover:text-ink cursor-pointer"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Results area */}
        {!results.hasQuery ? (
          <div className="text-center py-10 text-xs text-ink-muted">
            Type at least 2 characters to search
          </div>
        ) : totalResultsCount === 0 ? (
          <div className="text-center py-10 text-xs text-ink-muted">
            No results for &ldquo;{query}&rdquo;
          </div>
        ) : (
          <div className="space-y-5">
            {/* 1. Channels Group */}
            {results.channels.length > 0 && (
              <div className="space-y-1.5">
                <div className="px-1 text-xs font-bold text-ink-muted uppercase tracking-wider flex items-center justify-between">
                  <span>Channels ({results.channels.length})</span>
                </div>
                <div className="space-y-1">
                  {(expandedGroups.channels ? results.channels : results.channels.slice(0, 5)).map((ch) => (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => handleSelectChannel(ch.id)}
                      className="w-full flex items-center gap-2.5 p-2.5 rounded-lg border border-line bg-surface hover:bg-surface-raised transition-colors cursor-pointer text-left"
                    >
                      {renderChannelIcon(ch)}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-ink break-words">
                            <HighlightMatch
                              text={channelDisplayName(ch, currentUserId, staff)}
                              query={query}
                            />
                          </span>
                          {ch.officeId && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-surface-raised text-ink-muted border border-line font-medium shrink-0">
                              {getOfficeName(ch.officeId)}
                            </span>
                          )}
                          {ch.archived && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-surface-raised text-ink-muted border border-line font-medium shrink-0">
                              Archived
                            </span>
                          )}
                        </div>
                        {ch.description && (
                          <div className="text-xs text-ink-muted break-words mt-0.5">
                            <HighlightMatch text={ch.description} query={query} />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                {results.channels.length > 5 && (
                  <button
                    type="button"
                    onClick={() => toggleGroup('channels')}
                    className="text-xs font-semibold text-brand hover:underline p-1 flex items-center gap-1 cursor-pointer"
                  >
                    <span>{expandedGroups.channels ? 'Show less' : `Show more (${results.channels.length - 5} more)`}</span>
                    {expandedGroups.channels ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            )}

            {/* 2. People Group */}
            {results.people.length > 0 && (
              <div className="space-y-1.5">
                <div className="px-1 text-xs font-bold text-ink-muted uppercase tracking-wider flex items-center justify-between">
                  <span>People ({results.people.length})</span>
                </div>
                <div className="space-y-1">
                  {(expandedGroups.people ? results.people : results.people.slice(0, 5)).map((person) => {
                    const personOffice = officeLabelOf(person.officeId || person.office);
                    const personSubtitle = person.title ? `${person.title} · ${personOffice}` : personOffice;
                    return (
                      <button
                        key={person.id}
                        type="button"
                        onClick={() => handleSelectPerson(person)}
                        className="w-full flex items-center justify-between p-2.5 rounded-lg border border-line bg-surface hover:bg-surface-raised transition-colors cursor-pointer text-left gap-2"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <Avatar
                            role={person.role}
                            initials={initialsOf(person.name)}
                            name={person.name}
                            isOnline={person.isOnline ?? person.online}
                            size="xs"
                          />
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-ink break-words">
                              <HighlightMatch text={person.name} query={query} />
                            </div>
                            <div className="text-xs text-ink-muted break-words">
                              <HighlightMatch
                                text={personSubtitle}
                                query={query}
                              />
                            </div>
                          </div>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-surface-raised border border-line text-ink-muted font-medium shrink-0">
                          {ROLE_LABELS[person.role] || person.role}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {results.people.length > 5 && (
                  <button
                    type="button"
                    onClick={() => toggleGroup('people')}
                    className="text-xs font-semibold text-brand hover:underline p-1 flex items-center gap-1 cursor-pointer"
                  >
                    <span>{expandedGroups.people ? 'Show less' : `Show more (${results.people.length - 5} more)`}</span>
                    {expandedGroups.people ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            )}

            {/* 3. Messages Group */}
            {results.messages.length > 0 && (
              <div className="space-y-1.5">
                <div className="px-1 text-xs font-bold text-ink-muted uppercase tracking-wider flex items-center justify-between">
                  <span>Messages ({results.messages.length})</span>
                </div>
                <div className="space-y-1">
                  {(expandedGroups.messages ? results.messages : results.messages.slice(0, 5)).map((msg) => {
                    const ch = channelMap[msg.channelId];
                    const chName = ch ? channelDisplayName(ch, currentUserId, staff) : 'channel';
                    const sender = staffById[msg.senderId];
                    const firstName = sender ? callNameOf(sender) : 'Staff';

                    return (
                      <button
                        key={msg.id}
                        type="button"
                        onClick={() => handleSelectMessageOrFile(msg)}
                        className="w-full p-2.5 rounded-lg border border-line bg-surface hover:bg-surface-raised transition-colors cursor-pointer text-left space-y-1"
                      >
                        <div className="flex items-center justify-between gap-2 text-xs text-ink-muted">
                          <span className="font-semibold text-brand">
                            {ch?.kind === 'listing' ? chName : `#${chName}`}
                            {ch?.officeId && ` · ${getOfficeName(ch.officeId)}`}
                          </span>
                          <span className="tabular-nums">
                            {firstName} · {formatListTimeNg(msg.createdAt)}
                          </span>
                        </div>
                        <div className="text-xs text-ink leading-relaxed break-words">
                          <HighlightMatch
                            text={msg.type === 'file' ? (msg.caption || msg.text) : msg.text}
                            query={query}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
                {results.messages.length > 5 && (
                  <button
                    type="button"
                    onClick={() => toggleGroup('messages')}
                    className="text-xs font-semibold text-brand hover:underline p-1 flex items-center gap-1 cursor-pointer"
                  >
                    <span>{expandedGroups.messages ? 'Show less' : `Show more (${results.messages.length - 5} more)`}</span>
                    {expandedGroups.messages ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            )}

            {/* 4. Files Group */}
            {results.files.length > 0 && (
              <div className="space-y-1.5">
                <div className="px-1 text-xs font-bold text-ink-muted uppercase tracking-wider flex items-center justify-between">
                  <span>Files ({results.files.length})</span>
                </div>
                <div className="space-y-1">
                  {(expandedGroups.files ? results.files : results.files.slice(0, 5)).map((file) => {
                    const ch = channelMap[file.channelId];
                    const chName = ch ? channelDisplayName(ch, currentUserId, staff) : 'channel';
                    const sender = staffById[file.senderId];
                    const firstName = sender ? callNameOf(sender) : 'Staff';
                    const isPhoto = file.fileKind === 'photo';

                    return (
                      <button
                        key={file.id}
                        type="button"
                        onClick={() => handleSelectMessageOrFile(file)}
                        className="w-full flex items-center justify-between p-2.5 rounded-lg border border-line bg-surface hover:bg-surface-raised transition-colors cursor-pointer text-left gap-2.5"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <div className="w-8 h-8 rounded-lg bg-surface-raised border border-line flex items-center justify-center text-brand shrink-0">
                            {isPhoto ? (
                              <Image className="w-4 h-4 text-brand" aria-hidden="true" />
                            ) : (
                              <FileText className="w-4 h-4 text-brand" aria-hidden="true" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-ink break-words">
                              <HighlightMatch text={file.fileName} query={query} />
                            </div>
                            <div className="text-xs text-ink-muted">
                              {ch?.kind === 'listing' ? chName : `#${chName}`}
                              {ch?.officeId && ` · ${getOfficeName(ch.officeId)}`} · {firstName} · {formatListTimeNg(file.createdAt)}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-ink-muted tabular-nums shrink-0 font-medium">
                          {file.fileSize || 'File'}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {results.files.length > 5 && (
                  <button
                    type="button"
                    onClick={() => toggleGroup('files')}
                    className="text-xs font-semibold text-brand hover:underline p-1 flex items-center gap-1 cursor-pointer"
                  >
                    <span>{expandedGroups.files ? 'Show less' : `Show more (${results.files.length - 5} more)`}</span>
                    {expandedGroups.files ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Drawer>
  );
}

export default GlobalSearchDrawer;
