import { Drawer } from '../../components/common/Drawer.jsx';
import { Avatar } from '../../components/common/Avatar.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { ROLE_LABELS } from '../../mock/staff.js';
import { isStaffActive, initialsOf, officeLabelOf } from '../../utils/chat.js';

export function SeenByDrawer({ isOpen, onClose, message, staffList = [] }) {
  if (!message) return null;

  const activeStaffList = staffList.filter((s) => isStaffActive(s));
  const seenIds = Array.isArray(message.seenBy) ? message.seenBy : [];
  const totalCount = activeStaffList.length;
  const seenCount = activeStaffList.filter((s) => seenIds.includes(s.id)).length;

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Announcement Read Receipts">
      <div className="space-y-4">
        {/* Summary banner */}
        <div className="p-3 rounded-xl bg-surface-raised border border-line flex items-center justify-between">
          <span className="text-xs font-semibold text-ink">Read Status</span>
          <span className="text-xs font-bold text-ink tabular-nums">
            Seen by {seenCount} of {totalCount} staff
          </span>
        </div>

        {/* Staff list */}
        <div className="space-y-1.5" role="list">
          {activeStaffList.map((member) => {
            const hasSeen = seenIds.includes(member.id);
            return (
              <div
                key={member.id}
                className="flex items-center justify-between p-2.5 rounded-lg border border-line bg-surface"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <Avatar
                    role={member.role}
                    initials={initialsOf(member.name)}
                    name={member.name}
                    isOnline={member.isOnline ?? member.online}
                    size="xs"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-ink overflow-hidden text-ellipsis whitespace-nowrap">
                      {member.name}
                    </p>
                    <p className="text-xs text-ink-muted">
                      {ROLE_LABELS[member.role] || member.role} · {officeLabelOf(member.officeId || member.office)}
                    </p>
                  </div>
                </div>

                <Badge variant={hasSeen ? 'success' : 'neutral'} size="sm">
                  {hasSeen ? 'Seen' : 'Not seen'}
                </Badge>
              </div>
            );
          })}
        </div>
      </div>
    </Drawer>
  );
}

export default SeenByDrawer;
