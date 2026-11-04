import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Lock, ShieldAlert, MessageSquare } from 'lucide-react';
import { Drawer } from '../../components/common/Drawer.jsx';
import { Avatar } from '../../components/common/Avatar.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { useChat } from '../../context/ChatContext.jsx';
import { useToast } from '../../components/common/useToast.js';
import { ROLE_LABELS } from '../../mock/staff.js';
import {
  isStaffActive,
  initialsOf,
  canInitiateDm,
  officeLabelOf,
} from '../../utils/chat.js';
import { getDirectMessageRestrictedMessage } from '../../utils/messages.js';

export function NewDirectMessageDrawer({ isOpen, onClose }) {
  const { staff, currentUser, openOrCreateDm } = useChat();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  // Autofocus input when drawer opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const currentUserId = currentUser?.id ?? null;

  // Filter active staff excluding current user
  const otherStaff = useMemo(() => {
    return (staff || []).filter(
      (m) => m && m.id !== currentUserId && isStaffActive(m)
    );
  }, [staff, currentUserId]);

  // Split and filter staff by search and permission
  const { permitted, restricted } = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = (m) => {
      if (!q) return true;
      const name = (m.name || '').toLowerCase();
      const title = (m.title || '').toLowerCase();
      const dept = (m.department || '').toLowerCase();
      const roleLabel = (ROLE_LABELS[m.role] || m.role || '').toLowerCase();
      return (
        name.includes(q) ||
        title.includes(q) ||
        dept.includes(q) ||
        roleLabel.includes(q)
      );
    };

    const permittedList = [];
    const restrictedList = [];

    otherStaff.forEach((m) => {
      if (!matches(m)) return;
      if (canInitiateDm(currentUser, m)) {
        permittedList.push(m);
      } else {
        restrictedList.push(m);
      }
    });

    return { permitted: permittedList, restricted: restrictedList };
  }, [otherStaff, query, currentUser]);

  const handleClose = () => {
    setQuery('');
    onClose?.();
  };

  const handleSelect = (member) => {
    const dmId = openOrCreateDm(member.id);
    if (dmId) {
      setQuery('');
      onClose?.();
      navigate(`/channels/${dmId}`);
    }
  };

  const handleRestrictedClick = () => {
    showToast(getDirectMessageRestrictedMessage());
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={handleClose}
      title="New Direct Message"
      panelClassName="max-w-lg"
    >
      <div className="flex flex-col h-full">
        {/* Search Bar */}
        <div className="p-3 border-b border-line shrink-0">
          <div className="relative flex items-center">
            <Search
              className="absolute left-3 w-4 h-4 text-ink-muted pointer-events-none"
              aria-hidden="true"
            />
            <input
              ref={inputRef}
              type="text"
              name="dm_recipient_search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, role or department..."
              className="w-full pl-9 pr-9 py-2 text-xs bg-surface-raised border border-line rounded-lg text-ink placeholder:text-ink-muted focus:outline-hidden focus:border-brand transition-colors"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="absolute right-1.5 p-1 text-ink-muted hover:text-ink rounded-md min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {/* Staff List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {permitted.length === 0 && restricted.length === 0 ? (
            <div className="text-center py-10 px-4">
              <div className="w-10 h-10 rounded-full bg-surface-raised flex items-center justify-center mx-auto mb-2 text-ink-muted">
                <MessageSquare className="w-5 h-5" aria-hidden="true" />
              </div>
              <p className="text-xs font-semibold text-ink">No colleagues found</p>
              <p className="text-xs text-ink-muted mt-1">Try searching with a different name or role.</p>
            </div>
          ) : (
            <>
              {/* Permitted Colleagues */}
              {permitted.length > 0 && (
                <div className="space-y-1">
                  <div className="px-2 py-1 text-xs font-bold text-ink-muted uppercase tracking-wider">
                    Available Staff ({permitted.length})
                  </div>
                  {permitted.map((member) => (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => handleSelect(member)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-surface-raised text-left transition-colors cursor-pointer border border-transparent hover:border-line min-h-[44px]"
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <Avatar
                          role={member.role || 'agent'}
                          initials={initialsOf(member.name)}
                          name={member.name}
                          isOnline={Boolean(member.isOnline)}
                          size="md"
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-ink overflow-hidden text-ellipsis whitespace-nowrap">
                            {member.name}
                          </div>
                          <div className="text-xs text-ink-muted overflow-hidden text-ellipsis whitespace-nowrap">
                            {member.title ? `${member.title} · ` : ''}
                            {officeLabelOf(member.officeId)}
                          </div>
                        </div>
                      </div>
                      <Badge role={member.role} variant="neutral" className="shrink-0">
                        {ROLE_LABELS[member.role] || member.role}
                      </Badge>
                    </button>
                  ))}
                </div>
              )}

              {/* Hierarchy-Restricted Management (e.g. Executive Admins for Agents) */}
              {restricted.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-line">
                  <div className="flex items-center justify-between px-2 py-1">
                    <span className="text-xs font-bold text-ink-muted uppercase tracking-wider">
                      Executive Administration
                    </span>
                    <span className="text-xs text-ink-muted flex items-center gap-1">
                      <Lock className="w-3 h-3" aria-hidden="true" />
                      Restricted
                    </span>
                  </div>

                  <div className="p-2.5 bg-surface-raised/60 border border-line rounded-xl flex items-start gap-2.5">
                    <ShieldAlert className="w-4 h-4 text-ink-soft shrink-0 mt-0.5" aria-hidden="true" />
                    <p className="text-xs text-ink-muted leading-relaxed">
                      Direct messaging with executive leadership is routed through managers or departmental channels.
                    </p>
                  </div>

                  <div className="space-y-1 opacity-70">
                    {restricted.map((member) => (
                      <button
                        key={member.id}
                        type="button"
                        onClick={handleRestrictedClick}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-surface hover:bg-surface-raised text-left transition-colors cursor-pointer border border-line/60 min-h-[44px]"
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-2">
                          <Avatar
                            role={member.role || 'admin'}
                            initials={initialsOf(member.name)}
                            name={member.name}
                            isOnline={Boolean(member.isOnline)}
                            size="md"
                          />
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-ink overflow-hidden text-ellipsis whitespace-nowrap">
                              {member.name}
                            </div>
                            <div className="text-xs text-ink-muted overflow-hidden text-ellipsis whitespace-nowrap">
                              {member.title || 'Executive'}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Lock className="w-3.5 h-3.5 text-ink-muted" aria-hidden="true" />
                          <Badge role={member.role} variant="neutral">
                            {ROLE_LABELS[member.role] || member.role}
                          </Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Drawer>
  );
}

export default NewDirectMessageDrawer;
