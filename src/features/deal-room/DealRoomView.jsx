import { useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useDeals } from '../../context/DealContext';
import { canAccessDeal, getRoleSafeDeal } from '../../utils/access';
import { LISTINGS } from '../../mock/listings';
import { ROLE_DETAILS } from '../../mock/roles';
import { getStageLabel } from '../../utils/formatters';

export default function DealRoomView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { activeRole, setPendingToast } = useApp();
  const { deals } = useDeals();

  const rawDeal = deals.find((d) => d.id === id);
  const hasAccess = canAccessDeal(activeRole, id, deals);
  const safeDeal = hasAccess ? getRoleSafeDeal(activeRole, rawDeal) : null;
  const listing = safeDeal ? LISTINGS.find((l) => l.id === safeDeal.listingId) : null;

  // Track previous role to detect in-view role changes
  const prevRoleRef = useRef(activeRole);

  useEffect(() => {
    // If the role changes while on this screen and the new role cannot access it, redirect with a toast
    if (prevRoleRef.current !== activeRole) {
      if (rawDeal && !canAccessDeal(activeRole, id, deals)) {
        const roleLabel = ROLE_DETAILS[activeRole]?.name || activeRole;
        setPendingToast(`Access restricted: ${roleLabel} does not have access to deal ${id}. Redirected to Deals.`);
        navigate('/deals', { replace: true });
      }
      prevRoleRef.current = activeRole;
    }
  }, [activeRole, id, rawDeal, deals, navigate, setPendingToast]);

  // If deal doesn't exist OR the role has no access, render the friendly error screen
  if (!rawDeal || !hasAccess) {
    return (
      <div className="p-6 flex flex-col items-center justify-center text-center min-h-[50vh]">
        <div className="w-12 h-12 rounded-full bg-status-danger-bg flex items-center justify-center text-status-danger mb-4 border border-status-danger-line">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-semibold text-ink">Deal Not Found or No Access</h2>
        <p className="text-sm text-ink-muted mt-1 max-w-xs">
          This deal room does not exist, or your currently active role ({ROLE_DETAILS[activeRole]?.name || activeRole}) does not have permission to view it.
        </p>
        <Link
          to="/deals"
          className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-surface bg-brand hover:opacity-90 rounded-lg transition-opacity"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Deal Rooms
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="rounded-xl border border-line bg-surface p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Active Deal Room
            </span>
            <h2 className="text-lg font-semibold text-ink tracking-tight mt-0.5">
              {listing?.address || safeDeal.id}
            </h2>
          </div>
          <Link
            to="/deals"
            className="text-xs font-medium text-ink-muted hover:text-ink underline inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" />
            Deals
          </Link>
        </div>

        <p className="text-xs text-ink-muted mt-1 font-sans tabular-nums">Route: /deals/{id}</p>

        {/* Phase 2 verification data block */}
        <div className="mt-4 p-3 rounded-lg bg-surface-raised border border-line text-xs space-y-2">
          <div className="flex items-center justify-between border-b border-line pb-1.5">
            <span className="text-ink-muted">Viewing as:</span>
            <span className="font-semibold text-ink">{ROLE_DETAILS[activeRole]?.name} ({activeRole})</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-ink-muted">Deal Stage:</span>
            <span className="font-medium text-ink">{getStageLabel(safeDeal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-ink-muted">Commission Visibility:</span>
            <span className="font-sans tabular-nums text-ink-soft">
              {safeDeal.commissionAmount !== undefined ? `$${safeDeal.commissionAmount.toLocaleString()}` : '[Hidden for role]'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-ink-muted">Private Notes Visibility:</span>
            <span className="font-sans text-ink-soft">
              {safeDeal.privateAgentNotes !== undefined ? '[Visible to Agent]' : '[Hidden for role]'}
            </span>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-lg bg-status-warning-bg border border-status-warning-line text-xs text-status-warning">
          Placeholder view for Phase 3b-1. Interactive pinned header, chat feed, document vault drawer, and action composer will be built in Phase 3b-2 / Phase 4.
        </div>
      </div>
    </div>
  );
}
