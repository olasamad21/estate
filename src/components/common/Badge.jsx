import { Briefcase, KeyRound, House, Landmark } from 'lucide-react';

const ROLE_VARIANTS = {
  agent: 'bg-role-agent-bg text-role-agent-ink border-role-agent-line',
  buyer: 'bg-role-buyer-bg text-role-buyer-ink border-role-buyer-line',
  seller: 'bg-role-seller-bg text-role-seller-ink border-role-seller-line',
  lender: 'bg-role-lender-bg text-role-lender-ink border-role-lender-line',
};

const ROLE_ICONS = {
  agent: Briefcase,
  buyer: KeyRound,
  seller: House,
  lender: Landmark,
};

const STATUS_VARIANTS = {
  neutral: 'bg-surface-raised text-ink border-line-strong',
  success: 'bg-status-success-bg text-status-success border-status-success-line',
  warning: 'bg-status-warning-bg text-status-warning border-status-warning-line',
  danger: 'bg-status-danger-bg text-status-danger border-status-danger-line',
  info: 'bg-status-info-bg text-status-info border-status-info-line',
};

export function Badge({
  children,
  role = null,
  variant = 'neutral',
  dot = false,
  className = '',
  ...props
}) {
  const variantClass = role
    ? (ROLE_VARIANTS[role] || ROLE_VARIANTS.agent)
    : (STATUS_VARIANTS[variant] || STATUS_VARIANTS.neutral);

  const RoleIcon = role ? ROLE_ICONS[role] : null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variantClass} ${className}`}
      {...props}
    >
      {RoleIcon && <RoleIcon className="w-3.5 h-3.5 shrink-0 text-current" aria-hidden="true" />}
      {!RoleIcon && dot && <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" aria-hidden="true" />}
      <span>{children}</span>
    </span>
  );
}

export default Badge;
