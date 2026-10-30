import { Check } from 'lucide-react';
import { DEAL_FILTERS } from '../../utils/dashboard.js';

export function DealFilterChips({ counts, activeFilter, onSelectFilter }) {
  const totalDeals = counts.all || 0;

  // Hide the row when the role has 1 deal or fewer
  if (totalDeals <= 1) {
    return null;
  }

  // Show "All" plus only filters with count above 0
  const visibleFilters = DEAL_FILTERS.filter((f) => f.id === 'all' || (counts[f.id] || 0) > 0);

  return (
    <div
      role="group"
      aria-label="Filter deal rooms by stage"
      className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0"
    >
      {visibleFilters.map((filter) => {
        const isSelected = activeFilter === filter.id;
        const count = counts[filter.id] || 0;

        return (
          <button
            key={filter.id}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onSelectFilter(filter.id)}
            className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shrink-0 transition-all cursor-pointer border focus:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
              isSelected
                ? 'bg-brand text-surface border-brand font-bold shadow-xs ring-1 ring-brand'
                : 'bg-surface text-ink-muted border-line hover:border-line-strong hover:text-ink font-medium'
            }`}
          >
            {isSelected && <Check className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
            <span>{filter.label}</span>
            <span
              className={`text-xs tabular-nums px-1.5 py-0.2 rounded-full font-semibold ${
                isSelected
                  ? 'bg-surface/20 text-surface'
                  : 'bg-surface-raised text-ink-muted border border-line'
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default DealFilterChips;
