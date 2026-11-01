import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, Check, ClipboardList, RotateCcw, WifiOff, UserPlus } from 'lucide-react';
import { useChat } from '../../context/ChatContext.jsx';
import { useToast } from '../common/useToast.js';
import { getSwitchedPersonaMessage } from '../../utils/messages.js';
import { ROLE_LABELS } from '../../mock/staff.js';
import { isStaffActive } from '../../utils/chat.js';
import { Avatar } from '../common/Avatar.jsx';
import { Badge } from '../common/Badge.jsx';
import { Drawer } from '../common/Drawer.jsx';

export function RoleSwitcher({ onOpenFeedbackLog, onOpenResetModal }) {
  const { currentUser, staff, switchUser, isOffline, setOffline, simulateNewLead } = useChat();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [isOpen, setIsOpen] = useState(false);

  const staffGroups = useMemo(() => {
    const activeStaff = staff.filter((s) => isStaffActive(s));
    return [
      {
        label: 'All offices',
        members: activeStaff.filter((s) => s.role === 'admin'),
      },
      {
        label: 'Lagos office',
        members: activeStaff.filter((s) => s.role !== 'admin' && (s.officeId === 'lagos' || s.office === 'lagos')),
      },
      {
        label: 'Abuja office',
        members: activeStaff.filter((s) => s.role !== 'admin' && (s.officeId === 'abuja' || s.office === 'abuja')),
      },
    ].filter((g) => g.members.length > 0);
  }, [staff]);

  const handleSelectStaff = (staffId) => {
    const target = staff.find((s) => s.id === staffId);
    switchUser(staffId);
    setIsOpen(false);
    navigate('/channels');
    if (target?.name) {
      showToast(getSwitchedPersonaMessage(target.name));
    }
  };

  const handleToggleOffline = () => {
    setOffline(!isOffline);
  };

  const handleFeedbackLog = () => {
    setIsOpen(false);
    onOpenFeedbackLog?.();
  };

  const handleResetDemo = () => {
    setIsOpen(false);
    onOpenResetModal?.();
  };

  const handleSimulateNewLead = () => {
    setIsOpen(false);
    simulateNewLead?.();
  };

  return (
    <>
      {/* 44px Demo Tools Icon Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Demo tools"
        title="Demo tools"
        className="w-11 h-11 flex items-center justify-center rounded-lg text-ink-muted hover:text-ink hover:bg-surface-raised cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand shrink-0"
      >
        <Wrench className="w-5 h-5" aria-hidden="true" />
      </button>

      {/* Demo Tools Drawer */}
      <Drawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
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

            <div className="space-y-3 bg-surface border border-line rounded-xl p-2 max-h-72 overflow-y-auto no-scrollbar">
              {staffGroups.map((group) => (
                <div key={group.label} className="space-y-1">
                  <div className="px-2 pt-1 pb-0.5 text-xs font-bold text-ink-muted uppercase tracking-wider">
                    {group.label}
                  </div>
                  {group.members.map((member) => {
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
                            initials={member.initials}
                            name={member.name}
                            isOnline={member.online}
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
                  })}
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
