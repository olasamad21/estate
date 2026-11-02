import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, Check, ClipboardList, RotateCcw, WifiOff, UserPlus, Search } from 'lucide-react';
import { useChat } from '../../context/ChatContext.jsx';
import { useToast } from '../common/useToast.js';
import { getSwitchedPersonaMessage } from '../../utils/messages.js';
import { ROLE_LABELS } from '../../mock/staff.js';
import { isStaffActive, initialsOf } from '../../utils/chat.js';
import { Avatar } from '../common/Avatar.jsx';
import { Badge } from '../common/Badge.jsx';
import { Drawer } from '../common/Drawer.jsx';

const ROLE_PRIORITY = {
  admin: 1,
  manager: 2,
  agent: 3,
  support: 4,
  intern: 5,
};

const OFFICE_ORDER = [
  { id: 'hq', label: 'Head Quarters' },
  { id: 'lugbe', label: 'Lugbe office' },
  { id: 'port-harcourt', label: 'Port Harcourt office' },
];

export function RoleSwitcher({
  onOpenFeedbackLog,
  onOpenResetModal,
  isOpen: externalIsOpen,
  onOpenChange,
  triggerClassName = '',
}) {
  const { currentUser, staff, switchUser, isOffline, setOffline, simulateNewLead } = useChat();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const isControlled = typeof externalIsOpen === 'boolean';
  const isOpen = isControlled ? externalIsOpen : internalIsOpen;

  const handleSetOpen = (open) => {
    if (isControlled) {
      onOpenChange?.(open);
    } else {
      setInternalIsOpen(open);
    }
  };

  const staffGroups = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const activeStaff = staff.filter((s) => {
      if (!isStaffActive(s)) return false;
      if (!q) return true;
      const nameMatch = (s.name || '').toLowerCase().includes(q);
      const callMatch = (s.callName || '').toLowerCase().includes(q);
      const titleMatch = (s.title || '').toLowerCase().includes(q);
      return nameMatch || callMatch || titleMatch;
    });

    return OFFICE_ORDER.map((office) => {
      const members = activeStaff
        .filter((s) => (s.officeId || s.office) === office.id)
        .sort((a, b) => {
          const roleDiff = (ROLE_PRIORITY[a.role] || 99) - (ROLE_PRIORITY[b.role] || 99);
          if (roleDiff !== 0) return roleDiff;
          return (a.name || '').localeCompare(b.name || '');
        });

      return {
        id: office.id,
        label: office.label,
        count: members.length,
        members,
      };
    });
  }, [staff, searchQuery]);

  const handleSelectStaff = (staffId) => {
    const target = staff.find((s) => s.id === staffId);
    switchUser(staffId);
    handleSetOpen(false);
    navigate('/channels');
    if (target?.name) {
      showToast(getSwitchedPersonaMessage(target.name));
    }
  };

  const handleToggleOffline = () => {
    setOffline(!isOffline);
  };

  const handleFeedbackLog = () => {
    handleSetOpen(false);
    onOpenFeedbackLog?.();
  };

  const handleResetDemo = () => {
    handleSetOpen(false);
    onOpenResetModal?.();
  };

  const handleSimulateNewLead = () => {
    handleSetOpen(false);
    simulateNewLead?.();
  };

  return (
    <>
      {/* 44px Demo Tools Icon Button */}
      <button
        type="button"
        onClick={() => handleSetOpen(true)}
        aria-label="Demo tools"
        title="Demo tools"
        className={`w-11 h-11 flex items-center justify-center rounded-lg text-ink-muted hover:text-ink hover:bg-surface-raised cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand shrink-0 ${triggerClassName}`}
      >
        <Wrench className="w-5 h-5" aria-hidden="true" />
      </button>

      {/* Demo Tools Drawer */}
      <Drawer
        isOpen={isOpen}
        onClose={() => handleSetOpen(false)}
        title="Demo Tools"
        panelClassName="h-full max-h-[92dvh] lg:max-h-[85dvh] lg:max-w-md lg:rounded-2xl lg:border lg:self-center"
      >
        <div className="space-y-5">
          {/* Top caption */}
          <p className="text-xs text-ink-muted leading-relaxed">
            For presentations only. Not part of the real app.
          </p>

          {/* 1. View as Section */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-ink-muted uppercase tracking-wider block">
              View as
            </span>

            {/* Search field */}
            <div className="relative">
              <label htmlFor="demo-tools-staff-search" className="sr-only">
                Search staff
              </label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ink-muted">
                <Search className="w-4 h-4" aria-hidden="true" />
              </div>
              <input
                id="demo-tools-staff-search"
                name="demo_tools_staff_search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, call name, or title..."
                className="w-full min-h-[44px] pl-9 pr-3 py-2 bg-surface border border-line rounded-xl text-xs text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-colors"
              />
            </div>

            <div className="space-y-3 bg-surface border border-line rounded-xl p-2 max-h-72 overflow-y-auto no-scrollbar">
              {staffGroups.map((group) => (
                <div key={group.label} className="space-y-1">
                  <div className="px-2 pt-1 pb-0.5 text-xs font-bold text-ink-muted uppercase tracking-wider flex items-center justify-between">
                    <span>{group.label}</span>
                    <span className="text-ink-soft font-normal text-xs">{group.count}</span>
                  </div>
                  {group.members.length === 0 ? (
                    <div className="px-2.5 py-2 text-xs text-ink-muted italic">
                      No matching staff
                    </div>
                  ) : (
                    group.members.map((member) => {
                      const isActive = currentUser?.id === member.id;
                      return (
                        <button
                          key={member.id}
                          type="button"
                          aria-current={isActive ? 'true' : undefined}
                          onClick={() => handleSelectStaff(member.id)}
                          className={`w-full px-2.5 py-2 text-left flex items-center justify-between text-xs transition-colors cursor-pointer rounded-lg min-h-[44px] ${
                            isActive
                              ? 'bg-surface-raised font-semibold text-ink'
                              : 'text-ink-soft hover:bg-surface-raised hover:text-ink'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <Avatar
                              role={member.role}
                              initials={initialsOf(member.name)}
                              name={member.name}
                              isOnline={member.isOnline ?? member.online}
                              size="sm"
                            />
                            <div className="min-w-0">
                              <div className="font-semibold text-ink">
                                {member.name}
                              </div>
                              <div className="text-xs text-ink-muted">
                                {member.title}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <Badge role={member.role} size="sm">
                              {ROLE_LABELS[member.role] || member.role}
                            </Badge>
                            {isActive && (
                              <Check className="w-4 h-4 text-brand shrink-0" aria-hidden="true" />
                            )}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-line" />

          {/* 2. Prototype Actions Section */}
          <div className="divide-y divide-line border border-line rounded-xl overflow-hidden bg-surface">
            {/* Simulate Offline (Switch row with state) */}
            <div className="w-full min-h-[44px] px-3.5 py-2.5 flex items-center justify-between text-xs text-ink">
              <div className="flex items-center gap-3 min-w-0">
                <WifiOff
                  className={`w-4 h-4 shrink-0 ${isOffline ? 'text-status-warning' : 'text-ink-muted'}`}
                  aria-hidden="true"
                />
                <span className="font-medium">Simulate offline</span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isOffline}
                aria-label="Simulate offline"
                onClick={handleToggleOffline}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                  isOffline ? 'bg-status-warning' : 'bg-line-strong'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-surface shadow-xs transition duration-200 ease-in-out ${
                    isOffline ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Simulate New Lead */}
            <button
              type="button"
              onClick={handleSimulateNewLead}
              className="w-full min-h-[44px] px-3.5 py-2.5 flex items-center gap-3 text-xs font-medium text-ink hover:bg-surface-raised transition-colors cursor-pointer text-left"
            >
              <UserPlus className="w-4 h-4 text-brand shrink-0" aria-hidden="true" />
              <span>Simulate new lead</span>
            </button>

            {/* Feedback Log */}
            <button
              type="button"
              onClick={handleFeedbackLog}
              className="w-full min-h-[44px] px-3.5 py-2.5 flex items-center gap-3 text-xs font-medium text-ink hover:bg-surface-raised transition-colors cursor-pointer text-left"
            >
              <ClipboardList className="w-4 h-4 text-ink-muted shrink-0" aria-hidden="true" />
              <span>Feedback log</span>
            </button>

            {/* Reset Demo (opens modal) */}
            <button
              type="button"
              onClick={handleResetDemo}
              className="w-full min-h-[44px] px-3.5 py-2.5 flex items-center gap-3 text-xs font-medium text-status-danger hover:bg-status-danger-bg transition-colors cursor-pointer text-left"
            >
              <RotateCcw className="w-4 h-4 text-status-danger shrink-0" aria-hidden="true" />
              <span>Reset demo...</span>
            </button>
          </div>
        </div>
      </Drawer>
    </>
  );
}

export const DemoToolsMenu = RoleSwitcher;
export default RoleSwitcher;
