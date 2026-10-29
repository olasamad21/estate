import { useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useDeals } from '../../context/DealContext';
import { canAccessDeal, getRoleSafeDeal } from '../../utils/access';
import { LISTINGS } from '../../mock/listings';
import { ROLE_DETAILS } from '../../mock/roles';

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
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 mb-4 border border-red-100">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-semibold text-neutral-900">Deal Not Found or No Access</h2>
        <p className="text-sm text-neutral-500 mt-1 max-w-xs">
          This deal room does not exist, or your currently active role ({ROLE_DETAILS[activeRole]?.name || activeRole}) does not have permission to view it.
        </p>
        <Link
          to="/deals"
          className="mt-6 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Deal Rooms
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Active Deal Room
            </span>
            <h2 className="text-lg font-semibold text-neutral-900 tracking-tight mt-0.5">
              {listing?.address || safeDeal.id}
            </h2>
          </div>
          <Link
            to="/deals"
            className="text-xs font-medium text-neutral-600 hover:text-neutral-900 underline inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" />
            Deals
          </Link>
        </div>

        <p className="text-xs text-neutral-500 mt-1 font-mono">Route: /deals/{id}</p>

        {/* Phase 2 verification data block */}
        <div className="mt-4 p-3 rounded-lg bg-neutral-50 border border-neutral-200 text-xs space-y-2">
          <div className="flex items-center justify-between border-b border-neutral-200/60 pb-1.5">
            <span className="text-neutral-500">Viewing as:</span>
            <span className="font-semibold text-neutral-900">{ROLE_DETAILS[activeRole]?.name} ({activeRole})</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-neutral-500">Deal Stage:</span>
            <span className="font-medium text-neutral-800">{safeDeal.stageLabel}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-neutral-500">Commission Visibility:</span>
            <span className="font-mono text-neutral-700">
              {safeDeal.commissionAmount !== undefined ? `$${safeDeal.commissionAmount.toLocaleString()}` : '[Hidden for role]'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-neutral-500">Private Notes Visibility:</span>
            <span className="font-mono text-neutral-700">
              {safeDeal.privateAgentNotes !== undefined ? '[Visible to Agent]' : '[Hidden for role]'}
            </span>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
          Placeholder view for Phase 2. Interactive pinned header, chat feed, document vault drawer, and action composer will be built in Phase 3.
        </div>
      </div>
    </div>
  );
}
