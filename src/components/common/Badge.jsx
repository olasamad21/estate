import { Briefcase, ShieldCheck, Headphones, GraduationCap, UserCheck, KeyRound, House, Landmark } from 'lucide-react';

const ROLE_VARIANTS = {
  admin: 'bg-role-admin-bg text-role-admin-ink border-role-admin-line',
  manager: 'bg-role-manager-bg text-role-manager-ink border-role-manager-line',
  agent: 'bg-role-agent-bg text-role-agent-ink border-role-agent-line',
  support: 'bg-role-support-bg text-role-support-ink border-role-support-line',
  intern: 'bg-role-intern-bg text-role-intern-ink border-role-intern-line',
  // Legacy aliases
  buyer: 'bg-role-manager-bg text-role-manager-ink border-role-manager-line',
  seller: 'bg-role-support-bg text-role-support-ink border-role-support-line',
  lender: 'bg-role-admin-bg text-role-admin-ink border-role-admin-line',
};

const ROLE_ICONS = {
  admin: ShieldCheck,
  manager: Briefcase,
  agent: UserCheck,
  support: Headphones,
  intern: GraduationCap,
  // Legacy aliases
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
  icon = null,
  shape = 'pill',
  dot = false,
  className = '',
  ...props
}) {
  const variantClass = role
    ? (ROLE_VARIANTS[role] || ROLE_VARIANTS.agent)
    : (STATUS_VARIANTS[variant] || STATUS_VARIANTS.neutral);

  const IconComponent = icon || (role ? ROLE_ICONS[role] : null);
  const shapeClass = shape === 'block' ? 'rounded-lg' : 'rounded-full';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 ${shapeClass} text-xs font-semibold border ${variantClass} ${className}`}
      {...props}
    >
      {IconComponent && <IconComponent className="w-3.5 h-3.5 shrink-0 text-current" aria-hidden="true" />}
      {!IconComponent && dot && <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" aria-hidden="true" />}
      <span className="min-w-0">{children}</span>
    </span>
  );
}

export default Badge;
