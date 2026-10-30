import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Sparkles, ClipboardList, RotateCcw } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';
import { ROLE_DETAILS, PARTICIPANTS } from '../../mock/roles.js';
import { SIMULATED_LEAD_TEMPLATE } from '../../mock/alerts.js';
import { Avatar } from '../common/Avatar.jsx';
import { useToast } from '../common/useToast.js';
import { getSimulatedLeadMessage } from '../../utils/messages.js';

export function RoleSwitcher({ onOpenFeedbackLog, onOpenResetModal }) {
  const { activeRole, setActiveRole, simulateLead } = useApp();
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);

  const currentPersona = ROLE_DETAILS[activeRole] || { name: 'Sarah Chen', label: 'Agent' };

  // Short role label: Agent, Buyer, Seller, Lender
  const shortRoleLabel = activeRole.charAt(0).toUpperCase() + activeRole.slice(1);

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

  const handleSelectRole = (roleKey) => {
    setActiveRole(roleKey);
    setIsOpen(false);
    triggerRef.current?.focus?.();
  };

  const handleSimulateLead = () => {
    setIsOpen(false);
    const needSwitch = activeRole !== 'agent';
    if (needSwitch) {
      setActiveRole('agent');
    }
    simulateLead();
    const agentName = PARTICIPANTS.usr_sarah?.name || 'Sarah Chen';
    const leadAddress = SIMULATED_LEAD_TEMPLATE.actionPayload?.address || '512 Aspen Ridge Way';
    showToast(getSimulatedLeadMessage(agentName, leadAddress, needSwitch), 'info');
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

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      {/* Dark Dev-Control Pill Trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls="role-switcher-popover"
        aria-label={`Active role: ${shortRoleLabel}. Click to switch persona or access dev tools.`}
        className="h-9 px-2.5 rounded-full bg-brand text-surface text-xs font-medium border border-line-strong hover:bg-brand/90 transition-colors flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand cursor-pointer shadow-xs"
      >
        <Avatar role={activeRole} name={currentPersona.name} size="xs" />
        <span className="font-semibold tracking-tight">{shortRoleLabel}</span>
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
          aria-label="Persona and Dev Controls"
          className="absolute right-0 mt-2 w-64 rounded-xl bg-surface border border-line shadow-2xl py-1.5 z-50 animate-modal-mount focus:outline-none"
        >
          {/* Header */}
          <div className="px-3 py-1.5 border-b border-line">
            <span className="text-xs font-bold text-ink-muted uppercase tracking-wider block">
              Active Persona
            </span>
            <span className="text-xs font-medium text-ink">
              Switch role to test access boundaries
            </span>
          </div>

          {/* Persona List */}
          <div className="py-1" role="group" aria-label="Available Personas">
            {Object.entries(ROLE_DETAILS).map(([roleKey, details]) => {
              const isActive = activeRole === roleKey;
              return (
                <button
                  key={roleKey}
                  type="button"
                  role="menuitem"
                  aria-current={isActive ? 'true' : undefined}
                  onClick={() => handleSelectRole(roleKey)}
                  className={`w-full px-3 py-2 text-left flex items-center justify-between text-xs transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-surface-raised font-semibold text-ink'
                      : 'text-ink-soft hover:bg-surface-raised hover:text-ink'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar role={roleKey} name={details.name} size="sm" />
                    <div className="min-w-0">
                      <div className="font-semibold text-ink line-clamp-1">
                        {details.name}
                      </div>
                      <div className="text-xs text-ink-muted line-clamp-1">
                        {details.label}
                      </div>
                    </div>
                  </div>
                  {isActive && (
                    <Check className="w-4 h-4 text-brand shrink-0" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="border-t border-line my-1" />

          {/* Dev Controls Section */}
          <div className="px-3 pt-1 pb-0.5">
            <span className="text-xs font-bold text-ink-muted uppercase tracking-wider block">
              Dev Controls
            </span>
          </div>

          <div className="py-0.5" role="group" aria-label="Developer Actions">
            {/* Simulate New Lead */}
            <button
              type="button"
              role="menuitem"
              onClick={handleSimulateLead}
              className="w-full px-3 py-2 text-left flex items-center gap-2 text-xs text-ink hover:bg-surface-raised cursor-pointer transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-status-warning shrink-0" aria-hidden="true" />
              <span>Simulate new lead</span>
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
          </div>
        </div>
      )}
    </div>
  );
}

export default RoleSwitcher;
