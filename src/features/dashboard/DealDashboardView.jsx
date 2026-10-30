import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useDeals } from '../../context/DealContext';
import { getVisibleDeals } from '../../utils/access';
import { LISTINGS } from '../../mock/listings';
import { ROLE_DETAILS } from '../../mock/roles';
import { getStageLabel, formatCurrency } from '../../utils/formatters';

export default function DealDashboardView() {
  const { activeRole } = useApp();
  const { deals } = useDeals();

  const visibleDeals = getVisibleDeals(activeRole, deals);
  const currentPersona = ROLE_DETAILS[activeRole] || { name: 'User', label: activeRole };

  return (
    <div className="p-4 space-y-4">
      {/* TEMP ROLE PROOF LIST */}
      <div className="rounded-xl border border-line bg-surface p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-line pb-2.5">
          <span className="font-mono text-xs font-bold tracking-wider text-ink bg-surface-raised border border-line px-2 py-0.5 rounded">
            TEMP ROLE PROOF LIST
          </span>
          <span className="text-xs text-ink-muted">
            Viewing as <strong className="text-ink font-semibold">{currentPersona.name}</strong> ({currentPersona.label})
          </span>
        </div>

        <div className="text-xs text-ink-muted">
          Showing <span className="font-semibold text-ink tabular-nums">{visibleDeals.length}</span> of {deals.length} deals accessible to this role.
        </div>

        {/* Visible Deals List */}
        <div className="space-y-2.5">
          {visibleDeals.map((deal) => {
            const listing = LISTINGS.find((l) => l.id === deal.listingId);
            const stageString = getStageLabel(deal);
            const hasCommission = deal.commissionAmount !== undefined;
            const hasNotes = deal.privateAgentNotes !== undefined;

            return (
              <div
                key={deal.id}
                className="bg-surface-raised border border-line rounded-lg p-3 text-xs space-y-2 shadow-xs"
              >
                {/* Deal Header: Address & Computed Stage */}
                <div className="flex items-center justify-between gap-2">
                  <Link
                    to={`/deals/${deal.id}`}
                    className="font-semibold text-ink hover:text-brand hover:underline flex items-center gap-1 line-clamp-1 min-w-0 text-sm"
                  >
                    <span>{listing?.address || 'Deal Room'}</span>
                    <span className="text-ink-muted shrink-0">→</span>
                  </Link>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-surface text-ink-muted border border-line shrink-0">
                    {stageString}
                  </span>
                </div>

                {/* Role-Gated Fields: Commission & Notes only if present for active role */}
                {(hasCommission || hasNotes) && (
                  <div className="pt-2 border-t border-line space-y-1 text-xs">
                    {hasCommission && (
                      <div className="flex items-center justify-between text-ink-soft">
                        <span className="text-ink-muted">Commission:</span>
                        <span className="font-semibold text-ink tabular-nums">
                          {formatCurrency(deal.commissionAmount)}
                          {deal.commissionRate && (
                            <span className="text-ink-muted font-normal ml-1">
                              ({(deal.commissionRate * 100).toFixed(1)}%)
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                    {hasNotes && (
                      <div className="text-ink-soft bg-surface p-2 rounded border border-line">
                        <span className="font-semibold text-ink block text-xs mb-0.5">
                          Private Agent Note:
                        </span>
                        <span className="text-xs text-ink-muted leading-relaxed">
                          {deal.privateAgentNotes}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
