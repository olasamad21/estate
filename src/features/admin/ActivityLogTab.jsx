import { useState, useMemo } from 'react';
import { Avatar } from '../../components/common/Avatar.jsx';
import { formatDayLabelNg, formatTimeNg } from '../../utils/formatters.js';
import { initialsOf, callNameOf } from '../../utils/chat.js';

const ACTION_PHRASES = {
  staff_added: 'added',
  staff_imported: 'imported',
  role_changed: 'updated',
  role_or_office_changed: 'updated',
  office_changed: 'updated',
  department_changed: 'updated department for',
  deactivated: 'deactivated',
  reactivated: 'reactivated',
  request_approved: 'approved request for',
  request_declined: 'declined request for',
  activation_link_sent: 'sent activation link to',
  password_reset_link_sent: 'sent password reset link to',
  channel_created: 'created channel',
  channel_archived: 'archived channel',
  channel_unarchived: 'unarchived channel',
  site_created: 'created site',
  property_created: 'added property',
  channel_admin_changed: 'updated channel admin for',
  send_policy_changed: 'changed posting policy for',
};

function categoryOfActivity(type) {
  if (['request_approved', 'request_declined'].includes(type)) {
    return 'requests';
  }
  if (
    [
      'channel_created',
      'channel_archived',
      'channel_unarchived',
      'site_created',
      'property_created',
      'channel_admin_changed',
      'send_policy_changed',
    ].includes(type)
  ) {
    return 'channels';
  }
  return 'people';
}

export function ActivityLogTab({ activityLog = [], staff = [] }) {
  const [filter, setFilter] = useState('all');

  const staffById = useMemo(() => {
    const map = {};
    staff.forEach((s) => {
      map[s.id] = s;
    });
    return map;
  }, [staff]);

  const counts = useMemo(() => {
    const total = activityLog.length;
    let people = 0;
    let requests = 0;
    let channels = 0;

    activityLog.forEach((item) => {
      const cat = categoryOfActivity(item.type);
      if (cat === 'people') people++;
      else if (cat === 'requests') requests++;
      else if (cat === 'channels') channels++;
    });

    return { all: total, people, requests, channels };
  }, [activityLog]);

  const filteredEntries = useMemo(() => {
    if (filter === 'all') return activityLog;
    return activityLog.filter((item) => categoryOfActivity(item.type) === filter);
  }, [activityLog, filter]);

  // Group by day label (Today, Yesterday, DD/MM/YYYY)
  const groupedByDay = useMemo(() => {
    const groups = [];
    let currentDayLabel = null;
    let currentGroup = null;

    filteredEntries.forEach((entry) => {
      const dayLabel = formatDayLabelNg(entry.at);
      if (dayLabel !== currentDayLabel) {
        currentDayLabel = dayLabel;
        currentGroup = {
          dayLabel,
          entries: [],
        };
        groups.push(currentGroup);
      }
      currentGroup.entries.push(entry);
    });

    return groups;
  }, [filteredEntries]);

  return (
    <div className="space-y-6">
      {/* Header and description */}
      <div>
        <h2 className="text-base font-bold text-ink">Activity Log</h2>
        <p className="text-xs text-ink-muted">
          Recent administrative actions and team updates.
        </p>
      </div>

      {/* Filter chips: All, People, Requests, Channels */}
      <div className="flex items-center gap-2 flex-wrap">
        {[
          { id: 'all', label: 'All', count: counts.all },
          { id: 'people', label: 'People', count: counts.people },
          { id: 'requests', label: 'Requests', count: counts.requests },
          { id: 'channels', label: 'Channels', count: counts.channels },
        ].map((chip) => {
          const isSelected = filter === chip.id;
          return (
            <button
              key={chip.id}
              type="button"
              onClick={() => setFilter(chip.id)}
              className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                isSelected
                  ? 'bg-brand text-surface border-brand shadow-2xs'
                  : 'bg-surface text-ink-soft border-line hover:text-ink hover:bg-surface-raised'
              }`}
            >
              <span>{chip.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-xs tabular-nums font-mono ${
                  isSelected
                    ? 'bg-surface/20 text-surface'
                    : 'bg-surface-raised text-ink-muted'
                }`}
              >
                {chip.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grouped Day Sections */}
      {groupedByDay.length === 0 ? (
        <div className="border border-line rounded-2xl bg-surface p-8 text-center space-y-1 shadow-2xs">
          <p className="text-xs text-ink-muted">No activity yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedByDay.map((group) => (
            <div key={group.dayLabel} className="space-y-2">
              <h3 className="text-xs font-bold text-ink-muted uppercase tracking-wider px-1">
                {group.dayLabel}
              </h3>
              <div className="border border-line rounded-2xl bg-surface divide-y divide-line overflow-hidden shadow-2xs">
                {group.entries.map((entry) => {
                  const actor = staffById[entry.actorId] ?? null;
                  const actorCallName = callNameOf(actor) || 'Admin';
                  const actionPhrase = ACTION_PHRASES[entry.type] || 'updated';

                  return (
                    <div
                      key={entry.id}
                      className="p-3.5 sm:p-4 flex items-start justify-between gap-3 hover:bg-surface-raised/40 transition-colors"
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="mt-0.5 shrink-0">
                          <Avatar
                            role={actor?.role || 'admin'}
                            initials={initialsOf(actor?.name || actorCallName)}
                            name={actor?.name || actorCallName}
                            size="md"
                          />
                        </div>
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="text-xs text-ink leading-snug">
                            <span className="font-semibold text-ink">{actorCallName}</span>{' '}
                            <span className="text-ink-soft">{actionPhrase}</span>{' '}
                            <span className="font-semibold text-ink break-words">{entry.subject}</span>
                          </div>
                          {entry.detail && (
                            <p className="text-xs text-ink-muted break-words">
                              {entry.detail}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-xs text-ink-muted tabular-nums shrink-0 mt-0.5 font-mono">
                        {formatTimeNg(entry.at)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ActivityLogTab;
