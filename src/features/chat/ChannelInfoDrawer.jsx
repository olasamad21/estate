import { useMemo } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { Drawer } from '../../components/common/Drawer.jsx';
import { Avatar } from '../../components/common/Avatar.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { ROLE_LABELS } from '../../mock/staff.js';
import { formatPhoneNg } from '../../utils/formatters.js';
import { channelMembersFor } from '../../utils/chat.js';

export function ChannelInfoDrawer({
  isOpen,
  onClose,
  channel,
  currentUserId,
  staff,
  staffById,
  isMuted,
  onToggleMute,
  displayName,
}) {
  const members = useMemo(() => {
    if (!channel) return [];
    return channelMembersFor(channel, staff);
  }, [channel, staff]);

  const otherPerson = useMemo(() => {
    if (!channel || channel.kind !== 'dm') return null;
    const otherId = channel.members?.find((id) => id !== currentUserId) || channel.members?.[0];
    return staffById[otherId] || null;
  }, [channel, currentUserId, staffById]);

  if (!channel) return null;

  const isDm = channel.kind === 'dm';
  const officeLine = channel.officeId === 'lagos'
    ? 'Lagos office'
    : channel.officeId === 'abuja'
    ? 'Abuja office'
    : 'All offices';

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={isDm ? displayName : `#${channel.name}`}
    >
      <div className="space-y-5">
        {/* Channel / DM Header Summary */}
        <div className="p-3.5 rounded-xl bg-surface-raised border border-line space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-bold text-ink">
              {isDm ? displayName : `#${channel.name}`}
            </h3>
            {!isDm && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-surface text-ink-muted border border-line font-medium">
                {officeLine}
              </span>
            )}
          </div>
          {channel.description && (
            <p className="text-xs text-ink-muted leading-relaxed break-words">
              {channel.description}
            </p>
          )}
        </div>

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
                  initials={otherPerson.initials}
                  name={otherPerson.name}
                  isOnline={otherPerson.online}
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
                  {(otherPerson.officeId || otherPerson.office) === 'abuja' ? 'Abuja office' : 'Lagos office'}
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
            <div className="text-xs font-bold text-ink-muted uppercase tracking-wider px-1">
              Members ({members.length})
            </div>
            <div className="border border-line rounded-xl bg-surface divide-y divide-line overflow-hidden max-h-72 overflow-y-auto">
              {members.map((member) => (
                <div key={member.id} className="p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar
                      role={member.role}
                      initials={member.initials}
                      name={member.name}
                      isOnline={member.online}
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
                      </div>
                      <div className="text-xs text-ink-muted">
                        {(member.officeId || member.office) === 'abuja' ? 'Abuja office' : 'Lagos office'}
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <Badge role={member.role}>
                      {ROLE_LABELS[member.role] || member.role}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
}

export default ChannelInfoDrawer;
