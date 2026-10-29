import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useDeals } from '../../context/DealContext';
import { getVisibleDeals } from '../../utils/access';
import { LISTINGS } from '../../mock/listings';
import { ROLE_DETAILS } from '../../mock/roles';
import { escrowProgress, daysUntil } from '../../utils/formatters';

export default function DealDashboardView() {
  const {
    activeRole,
    setActiveRole,
    unreadAlertCount,
    simulateLead,
    pendingToast,
    clearPendingToast,
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
      {/* Toast Alert Banner */}
      {pendingToast && (
        <div className="p-3 bg-neutral-900 text-white rounded-lg text-xs flex items-center justify-between">
          <span>{pendingToast}</span>
          <button
            onClick={clearPendingToast}
            className="text-neutral-400 hover:text-white ml-2 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* TEMPORARY PROOF PANEL */}
      <div className="rounded-xl border-2 border-neutral-300 bg-neutral-50 p-4 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
          <span className="font-mono text-xs font-bold tracking-wider text-neutral-600 bg-neutral-200 px-2 py-0.5 rounded">
            TEMP DEBUG PANEL
          </span>
          <span className="text-xs text-neutral-500 font-mono">
            Unread Alerts: <strong className="text-neutral-900">{unreadAlertCount}</strong>
          </span>
        </div>

        {/* Role Switcher Buttons */}
        <div>
          <div className="text-xs text-neutral-500 mb-1.5 font-medium">
            Active Role: <span className="font-bold text-neutral-900">{ROLE_DETAILS[activeRole]?.name}</span> ({activeRole})
          </div>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            {Object.entries(ROLE_DETAILS).map(([roleKey, details]) => (
              <button
                key={roleKey}
                onClick={() => setActiveRole(roleKey)}
                className={`px-2.5 py-1.5 text-xs font-medium rounded border transition-colors ${
                  activeRole === roleKey
                    ? 'bg-neutral-900 text-white border-neutral-900'
                    : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-100'
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
            className="flex-1 py-1.5 px-3 bg-white border border-neutral-300 rounded text-xs font-medium text-neutral-800 hover:bg-neutral-100"
          >
            Simulate Lead
          </button>
          <button
            onClick={handleReset}
            className="flex-1 py-1.5 px-3 bg-white border border-red-200 rounded text-xs font-medium text-red-600 hover:bg-red-50"
          >
            Reset Demo
          </button>
        </div>

        {/* Visible Deals Count & List */}
        <div>
          <div className="text-xs font-semibold text-neutral-700 mb-2">
            Visible Deals ({visibleDeals.length} of {deals.length}):
          </div>

          <div className="space-y-2">
            {visibleDeals.map((deal) => {
              const listing = LISTINGS.find((l) => l.id === deal.listingId);
              const progress = escrowProgress(deal.contractStartDate, deal.escrowTotalDays);
              const remainingDays = deal.contingency ? daysUntil(deal.contingency.dueDate) : null;

              return (
                <div
                  key={deal.id}
                  className="bg-white border border-neutral-200 rounded-lg p-3 text-xs space-y-1 shadow-2xs"
                >
                  <div className="flex items-center justify-between font-semibold">
                    <Link
                      to={`/deals/${deal.id}`}
                      className="text-neutral-900 hover:underline flex items-center gap-1"
                    >
                      {listing?.address || deal.id} →
                    </Link>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600">
                      {deal.stageLabel}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1 text-[11px] text-neutral-500 pt-1">
                    <div>
                      Timeline: <span className="font-mono text-neutral-700">{progress.label}</span>
                    </div>
                    <div>
                      Contingency:{' '}
                      <span className="font-mono text-neutral-700">
                        {remainingDays !== null ? `${remainingDays}d due` : 'None'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1 text-[10px] text-neutral-400 border-t border-neutral-100 pt-1">
                    <div>
                      Commission:{' '}
                      <span className="font-mono text-neutral-600">
                        {deal.commissionAmount !== undefined ? `$${deal.commissionAmount.toLocaleString()}` : '[Hidden]'}
                      </span>
                    </div>
                    <div>
                      Notes:{' '}
                      <span className="font-mono text-neutral-600">
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
