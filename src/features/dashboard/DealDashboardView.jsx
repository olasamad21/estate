import { useState, useMemo } from 'react';
import { Home } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';
import { useDeals } from '../../context/DealContext.jsx';
import { getVisibleDeals } from '../../utils/access.js';
import {
  filterDeals,
  countByFilter,
  sortDealsByUrgency,
  getLastMessage,
  getDealCardModel,
} from '../../utils/dashboard.js';
import { DealCard } from './DealCard.jsx';
import { DealFilterChips } from './DealFilterChips.jsx';

export default function DealDashboardView() {
  const { activeRole } = useApp();
  const { deals, messages } = useDeals();
  const [activeFilter, setActiveFilter] = useState('all');
  const [prevRole, setPrevRole] = useState(activeRole);

  // Reset filter to 'all' whenever the role changes
  if (prevRole !== activeRole) {
    setPrevRole(activeRole);
    setActiveFilter('all');
  }

  // 1. Get visible deals for active role
  const roleVisibleDeals = useMemo(() => {
    return getVisibleDeals(activeRole, deals);
  }, [activeRole, deals]);

  // 2. Compute filter counts
  const filterCounts = useMemo(() => {
    return countByFilter(roleVisibleDeals);
  }, [roleVisibleDeals]);

  // 3. Filter and sort deals by urgency
  const displayedDeals = useMemo(() => {
    const filtered = filterDeals(roleVisibleDeals, activeFilter);
    return sortDealsByUrgency(filtered);
  }, [roleVisibleDeals, activeFilter]);

  // 4. Header count text format
  const totalCount = roleVisibleDeals.length;
  const countText =
    totalCount === 1
      ? '1 deal'
      : activeFilter !== 'all' && activeFilter !== ''
        ? `${displayedDeals.length} of ${totalCount} deals`
        : `${totalCount} deals`;

  return (
    <div className="p-4 space-y-4">
      {/* Header: Title and Live Count */}
      <div className="flex items-baseline justify-between border-b border-line pb-2.5">
        <h1 className="text-xl font-bold tracking-tight text-ink">Deal rooms</h1>
        <span className="text-xs font-medium text-ink-muted tabular-nums">
          {countText}
        </span>
      </div>

      {/* Filter Chips (hidden if role has <= 1 deal) */}
      <DealFilterChips
        counts={filterCounts}
        activeFilter={activeFilter}
        onSelectFilter={setActiveFilter}
      />

      {/* Deal Cards Feed or Empty State */}
      {displayedDeals.length === 0 ? (
        <div className="text-center py-12 px-4 space-y-2">
          <div className="w-12 h-12 rounded-full bg-surface-raised border border-line flex items-center justify-center mx-auto text-ink-muted">
            <Home className="w-6 h-6" aria-hidden="true" />
          </div>
          <h2 className="text-sm font-semibold text-ink">No deal rooms yet</h2>
          <p className="text-xs text-ink-muted max-w-xs mx-auto leading-relaxed">
            Deals you are part of will appear here.
          </p>
        </div>
      ) : (
        <ul role="list" aria-label="Deal rooms" className="space-y-3">
          {displayedDeals.map((deal) => {
            const lastMsg = getLastMessage(messages, deal.id);
            const cardModel = getDealCardModel(activeRole, deal, { lastMessage: lastMsg });
            return (
              <li key={deal.id}>
                <DealCard model={cardModel} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
