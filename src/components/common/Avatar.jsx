import { initialsOf } from '../../utils/chat.js';

const ROLE_SOLIDS = {
  admin: 'bg-role-admin-solid text-surface',
  manager: 'bg-role-manager-solid text-surface',
  agent: 'bg-role-agent-solid text-surface',
  support: 'bg-role-support-solid text-surface',
  intern: 'bg-role-intern-solid text-surface',
  // Legacy aliases
  buyer: 'bg-role-manager-solid text-surface',
  seller: 'bg-role-support-solid text-surface',
  lender: 'bg-role-admin-solid text-surface',
};

const SIZES = {
  xs: 'w-5 h-5 text-xs leading-none',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-xs',
  lg: 'w-12 h-12 text-sm',
};

export function Avatar({
  role = 'agent',
  initials = '',
  name = '',
  size = 'md',
  isOnline = false,
  className = '',
  ...props
}) {
  const displayInitials = initials || (name ? initialsOf(name) : 'ST');
  const roleClass = ROLE_SOLIDS[role] || ROLE_SOLIDS.agent;
  const sizeClass = SIZES[size] || SIZES.md;

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full font-semibold select-none shrink-0 ${roleClass} ${sizeClass} ${className}`}
      title={name || role}
      {...props}
    >
      <span>{displayInitials.toUpperCase()}</span>
      {isOnline && (
        <span
          className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-status-success ring-2 ring-surface"
          aria-label="Online"
        />
      )}
    </div>
  );
}

export function AvatarStack({ children, className = '' }) {
  return (
    <div className={`flex items-center -space-x-2 overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

export default Avatar;
