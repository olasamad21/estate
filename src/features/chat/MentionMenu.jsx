import { useEffect, useRef, useState } from 'react';
import { Avatar } from '../../components/common/Avatar.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { ROLE_LABELS } from '../../mock/staff.js';
import { callNameOf, initialsOf } from '../../utils/chat.js';

export function MentionMenu({
  query = '',
  members = [],
  onSelectMember,
  onClose,
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef(null);

  const filteredMembers = members.filter((m) => {
    if (!query) return true;
    const q = query.toLowerCase();
    const callName = callNameOf(m).toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      callName.includes(q) ||
      m.role.toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (filteredMembers.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredMembers.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredMembers.length) % filteredMembers.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredMembers[selectedIndex]) {
          onSelectMember(filteredMembers[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredMembers, selectedIndex, onSelectMember, onClose]);

  if (filteredMembers.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="absolute bottom-full mb-2 left-2 z-40 w-72 bg-surface border border-line rounded-xl shadow-xl py-1.5 animate-modal-mount max-h-56 overflow-y-auto no-scrollbar"
      role="listbox"
      aria-label="Mention staff members"
    >
      <div className="px-3 py-1 text-xs font-bold text-ink-muted uppercase tracking-wider border-b border-line">
        Mention Colleagues
      </div>
      <div className="py-1">
        {filteredMembers.map((member, idx) => {
          const isSelected = idx === selectedIndex;
          return (
            <button
              key={member.id}
              type="button"
              role="option"
              aria-selected={isSelected}
              onClick={() => onSelectMember(member)}
              onMouseEnter={() => setSelectedIndex(idx)}
              className={`w-full px-3 py-2 text-left flex items-center justify-between text-xs transition-colors cursor-pointer ${
                isSelected ? 'bg-surface-raised font-semibold text-ink' : 'text-ink-soft hover:bg-surface-raised'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <Avatar
                  role={member.role}
                  initials={initialsOf(member.name)}
                  name={member.name}
                  size="xs"
                />
                <div className="min-w-0">
                  <span className="font-semibold text-ink block overflow-hidden text-ellipsis whitespace-nowrap">
                    {member.name}
                  </span>
                  <span className="text-xs text-ink-muted">
                    @{callNameOf(member)}
                  </span>
                </div>
              </div>
              <Badge role={member.role} size="sm">
                {ROLE_LABELS[member.role] || member.role}
              </Badge>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default MentionMenu;
