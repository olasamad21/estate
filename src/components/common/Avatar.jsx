const ROLE_SOLIDS = {
  agent: 'bg-role-agent-solid text-surface',
  buyer: 'bg-role-buyer-solid text-surface',
  seller: 'bg-role-seller-solid text-surface',
  lender: 'bg-role-lender-solid text-surface',
};

const SIZES = {
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
  const displayInitials = initials || (name ? name.split(' ').map((n) => n[0]).join('').slice(0, 2) : '??');
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
