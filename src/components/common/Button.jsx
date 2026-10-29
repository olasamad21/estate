import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary: 'bg-brand text-surface hover:opacity-90 active:scale-[0.98]',
  secondary: 'bg-surface text-ink border border-line-strong hover:bg-surface-raised active:scale-[0.98]',
  ghost: 'bg-transparent text-ink hover:bg-surface-raised active:scale-[0.98]',
  danger: 'bg-status-danger-bg text-status-danger border border-status-danger-line hover:opacity-95 active:scale-[0.98]',
};

const SIZES = {
  md: 'min-h-[44px] min-w-[44px] px-4 py-2.5 text-sm font-medium',
  sm: 'min-h-[44px] min-w-[44px] px-3 py-2 text-xs font-medium',
};

export const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    className = '',
    type = 'button',
    ...props
  },
  ref
) {
  const variantClass = VARIANTS[variant] || VARIANTS.primary;
  const sizeClass = SIZES[size] || SIZES.md;

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ${variantClass} ${sizeClass} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" aria-hidden="true" />}
      <span>{children}</span>
    </button>
  );
});

export default Button;
