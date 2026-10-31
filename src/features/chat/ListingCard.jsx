import { useState } from 'react';
import { formatNaira } from '../../utils/formatters.js';
import { COMPANY_CONFIG } from '../../config/market.js';
import { Badge } from '../../components/common/Badge.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Drawer } from '../../components/common/Drawer.jsx';
import { PhotoPlaceholder } from './PhotoPlaceholder.jsx';

const STATUS_OPTIONS = [
  {
    id: 'Available',
    label: 'Available',
    variant: 'success',
    desc: 'Available for client viewings and enquiries',
  },
  {
    id: 'Under offer',
    label: 'Under offer',
    variant: 'warning',
    desc: 'Offer accepted, contract and documentation in progress',
  },
  {
    id: 'Sold',
    label: 'Sold',
    variant: 'neutral',
    desc: 'Transaction closed, funds verified and title transferred',
  },
];

function StatusDrawerContent({ channel, currentStatus, onSave, onClose }) {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus || 'Available');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(selectedStatus);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <p className="text-xs text-ink-muted">
          Select the current transaction status for #{channel?.name || 'listing'}.
        </p>

        <div className="space-y-2" role="radiogroup" aria-label="Listing Status Options">
          {STATUS_OPTIONS.map((opt) => {
            const isSelected = selectedStatus === opt.id;
            return (
              <label
                key={opt.id}
                className={`flex items-start justify-between p-3 rounded-xl border transition-colors cursor-pointer ${
                  isSelected
                    ? 'border-brand bg-brand/5 shadow-2xs'
                    : 'border-line bg-surface hover:bg-surface-raised'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0 pr-2">
                  <input
                    type="radio"
                    name="listing_status"
                    value={opt.id}
                    checked={isSelected}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="mt-0.5 accent-brand cursor-pointer"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-ink">{opt.label}</span>
                      <Badge variant={opt.variant} size="sm">
                        {opt.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-ink-muted mt-0.5">{opt.desc}</p>
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-line">
        <Button type="button" variant="ghost" size="sm" onClick={onClose} className="h-10 px-4">
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="sm" className="h-10 px-4">
          Save status
        </Button>
      </div>
    </form>
  );
}

export function ListingCard({ channel, currentUser, onSetListingStatus }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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
  };

  return (
    <>
      <div className="bg-surface border-b border-line px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-3 shrink-0 select-none max-h-[96px]">
        {/* Left: Thumbnail + Metadata */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-14 h-11 sm:w-16 sm:h-12 rounded-lg overflow-hidden shrink-0 border border-line bg-surface-raised shadow-2xs">
            <PhotoPlaceholder fileName={`${channel.id}.jpg`} className="w-full h-full object-cover" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-bold text-ink">
                {channel.location || 'Listing'}
              </span>
              <Badge variant={statusVariant} size="sm">
                {channel.status || 'Available'}
              </Badge>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-ink-muted mt-0.5">
              <span className="font-semibold text-brand tabular-nums">
                {formatNaira(channel.price)}
              </span>
              <span>·</span>
              <span>{officeName}</span>
            </div>
          </div>
        </div>

        {/* Right: Change status action (strictly absent from DOM for unauthorized roles) */}
        {canChangeStatus && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsDrawerOpen(true)}
            className="h-8 px-2.5 text-xs shrink-0 whitespace-nowrap cursor-pointer"
          >
            Change status
          </Button>
        )}
      </div>

      {canChangeStatus && isDrawerOpen && (
        <Drawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          title="Change listing status"
        >
          <StatusDrawerContent
            key={`${channel.id}-${channel.status}`}
            channel={channel}
            currentStatus={channel.status}
            onSave={handleSaveStatus}
            onClose={() => setIsDrawerOpen(false)}
          />
        </Drawer>
      )}
    </>
  );
}

export default ListingCard;
