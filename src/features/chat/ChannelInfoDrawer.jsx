import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, BellOff, MoreHorizontal, Building2 } from 'lucide-react';
import { Drawer } from '../../components/common/Drawer.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Avatar } from '../../components/common/Avatar.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { ROLE_LABELS } from '../../mock/staff.js';
import { formatPhoneNg } from '../../utils/formatters.js';
import {
  channelMembersFor,
  initialsOf,
  officeLabelOf,
  canManageChannel,
  siteOfProperty,
  canAddProperty,
} from '../../utils/chat.js';
import { useChat } from '../../context/ChatContext.jsx';
import { EditSiteDrawer } from './EditSiteDrawer.jsx';

export function ChannelInfoDrawer({
  isOpen,
  onClose,
  channel,
  currentUser: propCurrentUser,
  currentUserId,
  staff,
  staffById,
  isMuted,
  onToggleMute,
  displayName,
}) {
  const navigate = useNavigate();
  const { currentUser: chatCurrentUser, channels, setChannelAdmin, setChannelSendPolicy } = useChat();
  const currentUser = propCurrentUser || chatCurrentUser;

  const [selectedMemberForAdmin, setSelectedMemberForAdmin] = useState(null);
  const [isEditSiteOpen, setIsEditSiteOpen] = useState(false);

  const members = useMemo(() => {
    if (!channel) return [];
    return channelMembersFor(channel, staff);
  }, [channel, staff]);

  const otherPerson = useMemo(() => {
    if (!channel || channel.kind !== 'dm') return null;
    const otherId = channel.members?.find((id) => id !== currentUserId) || channel.members?.[0];
    return staffById[otherId] || null;
  }, [channel, currentUserId, staffById]);

  const parentSite = useMemo(() => {
    return channel?.kind === 'listing' ? siteOfProperty(channel, channels) : null;
  }, [channel, channels]);

  if (!channel) return null;

  const isDm = channel.kind === 'dm';
  const isAnnouncement = channel.kind === 'announcement';
  const isSiteOrProperty = channel.kind === 'listing' || channel.kind === 'site';
  const officeLine = officeLabelOf(channel.officeId);
  const canManage = !isDm && !isAnnouncement && canManageChannel(currentUser, channel);

  return (
    <>
      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        title={isDm || isSiteOrProperty ? displayName : `#${channel.name}`}
      >
        <div className="space-y-5">
          {/* Channel / DM Header Summary */}
          <div className="p-3.5 rounded-xl bg-surface-raised border border-line space-y-3">
            <div className="flex items-start gap-3">
              {channel.kind === 'site' && (
                <div className="w-10 h-10 rounded-xl border border-line shrink-0 bg-surface flex items-center justify-center text-brand shadow-2xs">
                  <Building2 className="w-5 h-5" aria-hidden="true" />
                </div>
              )}
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-ink">
                    {isDm || isSiteOrProperty ? displayName : `#${channel.name}`}
                  </h3>
                  {!isDm && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-surface text-ink-muted border border-line font-medium">
                      {officeLine}
                    </span>
                  )}
                  {channel.kind === 'site' && channel.site?.location && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-surface text-ink-muted border border-line font-medium">
                      {channel.site.location}
                    </span>
                  )}
                </div>
                {channel.description && (
                  <p className="text-xs text-ink-muted leading-relaxed break-words">
                    {channel.description}
                  </p>
                )}
              </div>
            </div>

            {/* Site Edit Details Button */}
            {channel.kind === 'site' && canAddProperty(currentUser, channel) && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setIsEditSiteOpen(true)}
                  className="w-full min-h-[44px] px-4 rounded-xl border border-line bg-surface text-ink font-semibold text-xs flex items-center justify-center hover:bg-surface-raised cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                  Edit details
                </button>
              </div>
            )}
          </div>

          {/* Property Channel: Parent Site Link Row */}
          {channel.kind === 'listing' && parentSite && (
            <div className="p-3.5 rounded-xl bg-surface-raised border border-line flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs font-semibold text-ink">Site</div>
                <div className="text-xs text-ink-muted">
                  {parentSite.site?.location ? `${parentSite.site.location} · ` : ''}{officeLine}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate(`/channels/${parentSite.id}`);
                }}
                className="text-xs font-semibold text-brand-ink hover:underline cursor-pointer px-2 py-1 flex items-center gap-1 min-h-[44px]"
              >
                <span>{parentSite.title || parentSite.name}</span>
                <span aria-hidden="true">&rarr;</span>
              </button>
            </div>
          )}

          {/* Mute Notifications Switch Row */}
          <div className="p-3.5 rounded-xl bg-surface-raised border border-line flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              {isMuted ? (
                <BellOff className="w-5 h-5 text-ink-muted shrink-0" aria-hidden="true" />
              ) : (
                <Bell className="w-5 h-5 text-ink-muted shrink-0" aria-hidden="true" />
              )}
              <div className="min-w-0">
                <div className="text-xs font-semibold text-ink">Mute notifications</div>
                <div className="text-xs text-ink-muted">
                  {isMuted ? 'Notifications are muted' : 'Notifications are active'}
                </div>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isMuted}
              aria-label={isMuted ? 'Unmute notifications' : 'Mute notifications'}
              onClick={onToggleMute}
              className="h-11 w-12 flex items-center justify-end shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-lg"
            >
              <span
                className={`w-11 h-6 rounded-full transition-colors relative inline-block ${
                  isMuted ? 'bg-brand' : 'bg-line-strong'
                }`}
              >
                <span
                  className={`block w-5 h-5 rounded-full bg-surface shadow-xs transition-transform absolute top-0.5 left-0.5 ${
                    isMuted ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </span>
            </button>
          </div>

          {/* Who can send messages (Public, Private, Listing, Group) */}
          {!isDm && !isAnnouncement && (
            canManage ? (
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-ink-muted uppercase tracking-wider px-1">
                  Who can send messages
                </div>
                <div className="p-3.5 rounded-xl bg-surface-raised border border-line flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-ink">Only admins can send messages</div>
                    <div className="text-xs text-ink-muted">Everyone else can still read, react and download.</div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={channel.sendPolicy === 'admins'}
                    aria-label="Only admins can send messages"
                    onClick={() =>
                      setChannelSendPolicy?.(
                        channel.id,
                        channel.sendPolicy === 'admins' ? 'everyone' : 'admins'
                      )
                    }
                    className="h-11 w-12 flex items-center justify-end shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-lg"
                  >
                    <span
                      className={`w-11 h-6 rounded-full transition-colors relative inline-block ${
                        channel.sendPolicy === 'admins' ? 'bg-brand' : 'bg-line-strong'
                      }`}
                    >
                      <span
                        className={`block w-5 h-5 rounded-full bg-surface shadow-xs transition-transform absolute top-0.5 left-0.5 ${
                          channel.sendPolicy === 'admins' ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </span>
                  </button>
                </div>
              </div>
            ) : channel.sendPolicy === 'admins' ? (
              <div className="px-1 text-xs text-ink-muted">
                Only admins can send messages
              </div>
            ) : null
          )}

          {/* DM: Other Person's Profile */}
          {isDm && otherPerson && (
            <div className="space-y-3">
              <div className="text-xs font-bold text-ink-muted uppercase tracking-wider px-1">
                Colleague Profile
              </div>
              <div className="p-4 rounded-xl bg-surface border border-line space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar
                    role={otherPerson.role}
                    initials={initialsOf(otherPerson.name)}
                    name={otherPerson.name}
                    isOnline={otherPerson.isOnline ?? otherPerson.online}
                    size="md"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-ink break-words">{otherPerson.name}</div>
                    <div className="text-xs text-ink-muted">{otherPerson.title}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-line">
                  <Badge role={otherPerson.role}>
                    {ROLE_LABELS[otherPerson.role] || otherPerson.role}
                  </Badge>
                  <span className="text-xs text-ink-muted">
                    {officeLabelOf(otherPerson.officeId || otherPerson.office)}
                  </span>
                  <span className="text-xs text-ink-muted font-mono tabular-nums">
                    {formatPhoneNg(otherPerson.phone)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Regular Channels: Member List */}
          {!isDm && (
            <div className="space-y-2">
              <div className="space-y-1">
                <div className="text-xs font-bold text-ink-muted uppercase tracking-wider px-1">
                  Members ({members.length})
                </div>
                {!isAnnouncement && (
                  <div className="text-xs text-ink-muted px-1">
                    Company admins can always manage every channel.
                  </div>
                )}
              </div>
              <div className="border border-line rounded-xl bg-surface divide-y divide-line overflow-hidden max-h-72 overflow-y-auto">
                {members.map((member) => {
                  const isChannelAdminMember =
                    !isDm &&
                    !isAnnouncement &&
                    Array.isArray(channel.adminIds) &&
                    channel.adminIds.includes(member.id);

                  return (
                    <div key={member.id} className="p-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar
                          role={member.role}
                          initials={initialsOf(member.name)}
                          name={member.name}
                          isOnline={member.isOnline ?? member.online}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-semibold text-ink break-words">{member.name}</span>
                            {member.id === currentUserId && (
                              <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-surface-raised text-ink-muted border border-line">
                                You
                              </span>
                            )}
                            {isChannelAdminMember && member.role !== 'admin' && (
                              <Badge variant="neutral">Channel admin</Badge>
                            )}
                          </div>
                          {member.title && (
                            <div className="text-xs text-ink-muted">
                              {member.title}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="shrink-0 flex items-center gap-2">
                        <Badge role={member.role}>
                          {ROLE_LABELS[member.role] || member.role}
                        </Badge>
                        {canManage && member.id !== currentUserId && member.role !== 'admin' && (
                          <button
                            type="button"
                            aria-label={`Manage ${member.name}`}
                            onClick={() => setSelectedMemberForAdmin(member)}
                            className="w-11 h-11 p-0 rounded-lg flex items-center justify-center text-ink-muted hover:text-ink hover:bg-surface-raised cursor-pointer shrink-0 transition-colors"
                          >
                            <MoreHorizontal className="w-5 h-5" aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </Drawer>

      {/* Admin Action Drawer for Member */}
      {selectedMemberForAdmin && (() => {
        const isTargetAdmin =
          Array.isArray(channel.adminIds) &&
          channel.adminIds.includes(selectedMemberForAdmin.id);
        const adminCount = Array.isArray(channel.adminIds) ? channel.adminIds.length : 0;
        const isOnlyAdmin = isTargetAdmin && adminCount === 1;

        return (
          <Drawer
            isOpen={Boolean(selectedMemberForAdmin)}
            onClose={() => setSelectedMemberForAdmin(null)}
            title={selectedMemberForAdmin.name}
          >
            <div className="space-y-4">
              <p className="text-xs text-ink-muted leading-relaxed">
                Channel admins can change who can send messages and make other admins.
              </p>

              {isOnlyAdmin && (
                <p className="text-xs text-status-warning font-medium">
                  A channel must have at least one admin.
                </p>
              )}

              <Button
                type="button"
                variant={isTargetAdmin ? 'danger' : 'primary'}
                size="md"
                disabled={isOnlyAdmin}
                onClick={() => {
                  setChannelAdmin?.(channel.id, selectedMemberForAdmin.id, !isTargetAdmin);
                  setSelectedMemberForAdmin(null);
                }}
                className="w-full min-h-[44px] justify-center cursor-pointer"
              >
                {isTargetAdmin ? 'Remove as channel admin' : 'Make channel admin'}
              </Button>
            </div>
          </Drawer>
        );
      })()}

      {channel.kind === 'site' && isEditSiteOpen && (
        <EditSiteDrawer
          key={`edit-site-${channel.id}-${channel.title}-${channel.location}`}
          isOpen={isEditSiteOpen}
          onClose={() => setIsEditSiteOpen(false)}
          site={channel}
        />
      )}
    </>
  );
}

export default ChannelInfoDrawer;
