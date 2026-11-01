// Single place to swap in the real company logo file if the company supplies one.

export function BrandMark({ variant = 'tile', size = 'md', className = '' }) {
  if (variant === 'wordmark') {
    const sizeClass = size === 'xl' ? 'text-3xl font-extrabold' : 'text-base sm:text-lg font-extrabold';
    return (
      <span
        className={`font-sans uppercase tracking-tight select-none ${sizeClass} ${className}`}
      >
        DA ACE CRIBS
      </span>
    );
  }

  // Tile variant: rounded-lg tile in bg-brand with letters DAC in text-surface, bold >= 12px, at least 36px x 36px
  const tileDimensions =
    size === 'lg'
      ? 'w-12 h-12 min-w-[48px] min-h-[48px] text-sm'
      : 'w-9 h-9 min-w-[36px] min-h-[36px] text-xs';

  return (
    <div
      aria-hidden="true"
      className={`rounded-lg bg-brand text-surface flex items-center justify-center font-bold tracking-tight select-none shadow-xs shrink-0 ${tileDimensions} ${className}`}
    >
      DAC
    </div>
  );
}

export default BrandMark;
