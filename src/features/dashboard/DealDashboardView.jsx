import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useDeals } from '../../context/DealContext';
import { getVisibleDeals } from '../../utils/access';
import { LISTINGS } from '../../mock/listings';
import { ROLE_DETAILS } from '../../mock/roles';
import { escrowProgress, daysUntil, getStageLabel } from '../../utils/formatters';

export default function DealDashboardView() {
  const {
    activeRole,
    setActiveRole,
    unreadAlertCount,
    simulateLead,
    resetDemo,
  } = useApp();

  const { deals, resetDealState } = useDeals();

  const visibleDeals = getVisibleDeals(activeRole, deals);

  const handleReset = () => {
    resetDemo();
    resetDealState();
  };

  return (
    <div className="p-4 space-y-4">
      {/* TEMPORARY PROOF PANEL */}
      <div className="rounded-xl border border-line-strong bg-surface-raised p-4 space-y-4">
        <div className="flex items-center justify-between border-b border-line pb-2">
          <span className="font-mono text-xs font-bold tracking-wider text-ink bg-line px-2 py-0.5 rounded">
            TEMP DEBUG PANEL
          </span>
          <span className="text-xs text-ink-muted font-sans">
            Unread Alerts: <strong className="text-ink font-bold tabular-nums">{unreadAlertCount}</strong>
          </span>
        </div>

        {/* Role Switcher Buttons */}
        <div>
          <div className="text-xs text-ink-muted mb-1.5 font-medium">
            Active Role: <span className="font-bold text-ink">{ROLE_DETAILS[activeRole]?.name}</span> ({activeRole})
          </div>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            {Object.entries(ROLE_DETAILS).map(([roleKey, details]) => (
              <button
                key={roleKey}
                onClick={() => setActiveRole(roleKey)}
                className={`min-h-[44px] px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                  activeRole === roleKey
                    ? 'bg-brand text-surface border-brand'
                    : 'bg-surface text-ink border-line-strong hover:bg-surface-raised'
                }`}
              >
                {details.name}
              </button>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex gap-2">
          <button
            onClick={simulateLead}
            className="flex-1 min-h-[44px] py-1.5 px-3 bg-surface border border-line-strong rounded-lg text-xs font-medium text-ink hover:bg-surface-raised cursor-pointer"
          >
            Simulate Lead
          </button>
          <button
            onClick={handleReset}
            className="flex-1 min-h-[44px] py-1.5 px-3 bg-surface border border-status-danger-line rounded-lg text-xs font-medium text-status-danger hover:bg-status-danger-bg cursor-pointer"
          >
            Reset Demo
          </button>
        </div>

        {/* Visible Deals Count & List */}
        <div>
          <div className="text-xs font-semibold text-ink mb-2">
            Visible Deals ({visibleDeals.length} of {deals.length}):
          </div>

          <div className="space-y-2">
            {visibleDeals.map((deal) => {
              const listing = LISTINGS.find((l) => l.id === deal.listingId);
              const progress = escrowProgress(deal.contractStartDate, deal.escrowTotalDays);
              const remainingDays = deal.contingency ? daysUntil(deal.contingency.dueDate) : null;
              const stageString = getStageLabel(deal);

              return (
                <div
                  key={deal.id}
                  className="bg-surface border border-line rounded-lg p-3 text-xs space-y-1 shadow-xs"
                >
                  <div className="flex items-center justify-between font-semibold">
                    <Link
                      to={`/deals/${deal.id}`}
                      className="text-ink hover:underline flex items-center gap-1 font-medium"
                    >
                      {listing?.address || deal.id} →
                    </Link>
                    <span className="text-xs font-sans px-2 py-0.5 rounded-full bg-surface-raised text-ink-muted border border-line">
                      {stageString}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1 text-xs text-ink-muted pt-1">
                    <div>
                      Timeline: <span className="font-sans tabular-nums text-ink">{progress.label}</span>
                    </div>
                    <div>
                      Contingency:{' '}
                      <span className="font-sans tabular-nums text-ink">
                        {remainingDays !== null ? `${remainingDays}d due` : 'None'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1 text-xs text-ink-muted border-t border-line pt-1">
                    <div>
                      Commission:{' '}
                      <span className="font-sans tabular-nums text-ink">
                        {deal.commissionAmount !== undefined ? `$${deal.commissionAmount.toLocaleString()}` : '[Hidden]'}
                      </span>
                    </div>
                    <div>
                      Notes:{' '}
                      <span className="font-sans text-ink">
                        {deal.privateAgentNotes !== undefined ? '[Visible]' : '[Hidden]'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
