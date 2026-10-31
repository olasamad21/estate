import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Check, ClipboardList, RotateCcw, LogOut, WifiOff } from 'lucide-react';
import { useChat } from '../../context/ChatContext.jsx';
import { ROLE_LABELS } from '../../mock/staff.js';
import { isStaffActive } from '../../utils/chat.js';
import { Avatar } from '../common/Avatar.jsx';
import { Badge } from '../common/Badge.jsx';

export function RoleSwitcher({ onOpenFeedbackLog, onOpenResetModal }) {
  const { currentUser, staff, switchUser, logout, isOffline, setOffline } = useChat();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);

  const currentName = currentUser?.name || 'Staff';
  const currentRole = currentUser?.role || 'agent';
  const roleLabel = ROLE_LABELS[currentRole] || currentRole;

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

  // Close on Escape or click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus?.();
      }
    };

    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectStaff = (staffId) => {
    switchUser(staffId);
    setIsOpen(false);
    triggerRef.current?.focus?.();
  };

  const handleToggleOffline = () => {
    setOffline(!isOffline);
    setIsOpen(false);
    triggerRef.current?.focus?.();
  };

  const handleFeedbackLog = () => {
    setIsOpen(false);
    onOpenFeedbackLog?.();
    triggerRef.current?.focus?.();
  };

  const handleResetDemo = () => {
    setIsOpen(false);
    onOpenResetModal?.();
    triggerRef.current?.focus?.();
  };

  const handleLogout = () => {
    setIsOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      {/* Dev-Control Pill Trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls="role-switcher-popover"
        aria-label={`Active staff: ${currentName} (${roleLabel}). Click to switch persona or access tools.`}
        className="h-9 px-2 sm:px-2.5 rounded-full bg-brand text-surface text-xs font-medium border border-line-strong hover:bg-brand/90 transition-colors flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand cursor-pointer shadow-xs shrink-0"
      >
        <Avatar
          role={currentRole}
          initials={currentUser?.initials}
          name={currentName}
          size="xs"
        />
        <span className="font-semibold tracking-tight">{currentName.split(' ')[0]}</span>
        <span className="hidden md:inline text-xs text-surface/70 font-normal">({roleLabel})</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-surface/80 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div
          id="role-switcher-popover"
          role="menu"
          aria-label="Staff Switcher and Tools"
          className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-1.5rem)] rounded-xl bg-surface border border-line shadow-2xl py-1.5 z-50 animate-modal-mount focus:outline-none max-h-[85dvh] overflow-y-auto no-scrollbar"
        >
          {/* Header */}
          <div className="px-3 py-1.5 border-b border-line">
            <span className="text-xs font-bold text-ink-muted uppercase tracking-wider block">
              View Workspace As
            </span>
            <span className="text-xs font-medium text-ink">
              Select any staff member to test permissions
            </span>
          </div>

          {/* Staff List grouped by office */}
          <div className="py-1 max-h-72 overflow-y-auto no-scrollbar" role="group" aria-label="Staff Members">
            {staffGroups.map((group) => (
              <div key={group.label} className="py-0.5">
                <div className="px-3 pt-2 pb-1 text-xs font-bold text-ink-muted uppercase tracking-wider">
                  {group.label}
                </div>
                {group.members.map((member) => {
                  const isActive = currentUser?.id === member.id;
                  return (
                    <button
                      key={member.id}
                      type="button"
                      role="menuitem"
                      aria-current={isActive ? 'true' : undefined}
                      onClick={() => handleSelectStaff(member.id)}
                      className={`w-full px-3 py-2 text-left flex items-center justify-between text-xs transition-colors cursor-pointer ${
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
                          <div className="font-semibold text-ink line-clamp-1">
                            {member.name}
                          </div>
                          <div className="text-xs text-ink-muted line-clamp-1">
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

          <div className="border-t border-line my-1" />

          {/* Dev Controls Section */}
          <div className="px-3 pt-1 pb-0.5">
            <span className="text-xs font-bold text-ink-muted uppercase tracking-wider block">
              Prototype Controls
            </span>
          </div>

          <div className="py-0.5" role="group" aria-label="Prototype Actions">
            {/* Simulate Offline Toggle */}
            <button
              type="button"
              role="menuitem"
              onClick={handleToggleOffline}
              className="w-full px-3 py-2 text-left flex items-center justify-between text-xs text-ink hover:bg-surface-raised cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <WifiOff className={`w-3.5 h-3.5 shrink-0 ${isOffline ? 'text-status-warning' : 'text-ink-muted'}`} aria-hidden="true" />
                <span>Simulate offline</span>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-semibold shrink-0 ${
                  isOffline
                    ? 'bg-status-warning-bg text-status-warning border border-status-warning-line'
                    : 'bg-surface-raised text-ink-muted border border-line'
                }`}
              >
                {isOffline ? 'Active' : 'Off'}
              </span>
            </button>

            {/* Feedback Log */}
            <button
              type="button"
              role="menuitem"
              onClick={handleFeedbackLog}
              className="w-full px-3 py-2 text-left flex items-center gap-2 text-xs text-ink hover:bg-surface-raised cursor-pointer transition-colors"
            >
              <ClipboardList className="w-3.5 h-3.5 text-ink-muted shrink-0" aria-hidden="true" />
              <span>Feedback log</span>
            </button>

            {/* Reset Demo */}
            <button
              type="button"
              role="menuitem"
              onClick={handleResetDemo}
              className="w-full px-3 py-2 text-left flex items-center gap-2 text-xs text-status-danger hover:bg-status-danger-bg cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-status-danger shrink-0" aria-hidden="true" />
              <span>Reset demo...</span>
            </button>

            {/* Sign Out */}
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="w-full px-3 py-2 text-left flex items-center gap-2 text-xs text-ink-muted hover:text-ink hover:bg-surface-raised cursor-pointer transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 text-ink-muted shrink-0" aria-hidden="true" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RoleSwitcher;
