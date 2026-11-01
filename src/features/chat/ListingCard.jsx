import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { formatNaira } from '../../utils/formatters.js';
import { COMPANY_CONFIG } from '../../config/market.js';
import { Badge } from '../../components/common/Badge.jsx';
import { Button } from '../../components/common/Button.jsx';
import { PhotoPlaceholder } from './PhotoPlaceholder.jsx';
import { ListingDetailsDrawer, StatusChangeDrawer } from './ListingDetailsDrawer.jsx';

export function ListingCard({ channel, currentUser, onSetListingStatus }) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  if (!channel || channel.kind !== 'listing') {
    return null;
  }

  // Permission: Admins can change status for any listing; managers can change for their office
  const canChangeStatus =
    currentUser?.role === 'admin' ||
    (currentUser?.role === 'manager' &&
      (currentUser?.office === channel.officeId || !channel.officeId));

  const office = COMPANY_CONFIG.offices.find((o) => o.id === channel.officeId);
  const officeName = office ? office.name : 'All offices';

  const statusVariant =
    channel.status === 'Available'
      ? 'success'
      : channel.status === 'Under offer'
      ? 'warning'
      : 'neutral';

  const handleSaveStatus = (newStatus) => {
    onSetListingStatus?.(channel.id, newStatus);
    setIsStatusOpen(false);
  };

  return (
    <>
      <div className="bg-surface border-b border-line px-3 sm:px-4 py-2 flex items-center justify-between gap-3 shrink-0 select-none max-h-[64px] min-h-[56px]">
        {/* Clickable Strip Button */}
        <button
          type="button"
          onClick={() => setIsDetailsOpen(true)}
          aria-label="Listing details"
          className="flex-1 flex items-center justify-between gap-2.5 sm:gap-3 min-w-0 text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-lg p-1 -m-1"
        >
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            {/* 40px Thumbnail */}
            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-line bg-surface-raised shadow-2xs">
              <PhotoPlaceholder fileName={`${channel.id}.jpg`} className="w-full h-full object-cover" />
            </div>

            {/* Metadata: Line 1 price + status, Line 2 area + office */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-xs sm:text-sm font-semibold text-brand tabular-nums">
                  {formatNaira(channel.price)}
                </span>
                <Badge variant={statusVariant} size="sm">
                  {channel.status || 'Available'}
                </Badge>
              </div>
              <div className="text-xs text-ink-muted line-clamp-1 mt-0.5">
                {channel.title || channel.location || 'Listing'} · {officeName}
              </div>
            </div>
          </div>

          <ChevronRight className="w-4 h-4 text-ink-muted shrink-0 lg:hidden" aria-hidden="true" />
        </button>

        {/* Desktop inline Change Status button for permitted users */}
        {canChangeStatus && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsStatusOpen(true)}
            className="hidden lg:inline-flex h-8 px-2.5 text-xs shrink-0 whitespace-nowrap cursor-pointer"
          >
            Change status
          </Button>
        )}
      </div>

      {/* Listing Details Drawer */}
      <ListingDetailsDrawer
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        channel={channel}
        currentUser={currentUser}
        onSetListingStatus={onSetListingStatus}
      />

      {/* Direct desktop status drawer */}
      {canChangeStatus && isStatusOpen && (
        <StatusChangeDrawer
          key={`${channel.id}-${channel.status}`}
          isOpen={isStatusOpen}
          onClose={() => setIsStatusOpen(false)}
          channel={channel}
          onSaveStatus={handleSaveStatus}
        />
      )}
    </>
  );
}

export default ListingCard;
