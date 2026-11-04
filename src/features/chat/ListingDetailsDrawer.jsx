import { useState } from 'react';
import { formatNaira } from '../../utils/formatters.js';
import { canManageListing, officeLabelOf } from '../../utils/chat.js';
import { Badge } from '../../components/common/Badge.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Drawer } from '../../components/common/Drawer.jsx';
import { ListingPhoto } from './ListingPhoto.jsx';
import { EditListingDrawer } from './EditListingDrawer.jsx';
import { ShareToListingChannelDrawer } from './ShareToListingChannelDrawer.jsx';

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

export function StatusChangeDrawer({ isOpen, onClose, channel, onSaveStatus }) {
  const [selectedStatus, setSelectedStatus] = useState(channel?.status || 'Available');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveStatus(selectedStatus);
    onClose();
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Change property status">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs text-ink-muted">
            Select the current transaction status for {channel?.title || channel?.name || 'property'}.
          </p>

          <div className="space-y-2" role="radiogroup" aria-label="Property Status Options">
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
                      name="listing_status_radio"
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
    </Drawer>
  );
}

export function ListingDetailsDrawer({
  isOpen,
  onClose,
  channel,
  currentUser,
  onSetListingStatus,
}) {
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isShareInChannelOpen, setIsShareInChannelOpen] = useState(false);

  if (!channel) return null;

  const officeName = officeLabelOf(channel.officeId);

  const statusVariant =
    channel.status === 'Available'
      ? 'success'
      : channel.status === 'Under offer'
      ? 'warning'
      : 'neutral';

  const canShareInChannel = currentUser?.role === 'admin' || currentUser?.role === 'manager';

  const canChangeStatus = canManageListing(currentUser, channel);

  const handleSaveStatus = (newStatus) => {
    onSetListingStatus?.(channel.id, newStatus);
    setIsStatusOpen(false);
  };

  return (
    <>
      <Drawer isOpen={isOpen} onClose={onClose} title={channel.title || channel.location || 'Property Details'}>
        <div className="space-y-4">
          {/* 4:3 Image */}
          <div className="w-full aspect-[4/3] rounded-xl overflow-hidden border border-line bg-surface-raised">
            <ListingPhoto
              channel={channel}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Pricing and status badge */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="text-base font-bold text-brand tabular-nums">
              {formatNaira(channel.price)}
            </div>
            <Badge variant={statusVariant}>
              {channel.status || 'Available'}
            </Badge>
          </div>

          {/* Area and Office metadata */}
          <div className="p-3.5 rounded-xl bg-surface-raised border border-line space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-ink">
              <span className="text-ink-muted">Area / Neighborhood</span>
              <span className="font-semibold">{channel.location || 'Area'}</span>
            </div>
            <div className="flex items-center justify-between text-ink">
              <span className="text-ink-muted">Branch Office</span>
              <span className="font-semibold">{officeName}</span>
            </div>
          </div>

          {/* Description */}
          {channel.description && (
            <div className="space-y-1">
              <div className="text-xs font-semibold text-ink">Overview</div>
              <p className="text-xs text-ink-muted leading-relaxed break-words">
                {channel.description}
              </p>
            </div>
          )}

          {/* Actions */}
          {(canShareInChannel || canChangeStatus) && (
            <div className="pt-2 space-y-2">
              {canShareInChannel && (
                <button
                  type="button"
                  onClick={() => setIsShareInChannelOpen(true)}
                  className="w-full h-11 px-4 rounded-xl border border-line bg-surface text-ink font-semibold text-xs flex items-center justify-center hover:bg-surface-raised cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                  Share in a channel
                </button>
              )}
              {canChangeStatus && (
                <>
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(true)}
                    className="w-full h-11 px-4 rounded-xl border border-line bg-surface text-ink font-semibold text-xs flex items-center justify-center hover:bg-surface-raised cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    Edit details
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsStatusOpen(true)}
                    className="w-full h-11 px-4 rounded-xl border border-line bg-surface text-ink font-semibold text-xs flex items-center justify-center hover:bg-surface-raised cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    Change status
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </Drawer>

      {/* Nested Share to Listing Channel Drawer */}
      {canShareInChannel && isShareInChannelOpen && (
        <ShareToListingChannelDrawer
          isOpen={isShareInChannelOpen}
          onClose={() => setIsShareInChannelOpen(false)}
          channel={channel}
        />
      )}

      {/* Nested Status Change Drawer */}
      {canChangeStatus && isStatusOpen && (
        <StatusChangeDrawer
          key={`${channel.id}-${channel.status}`}
          isOpen={isStatusOpen}
          onClose={() => setIsStatusOpen(false)}
          channel={channel}
          onSaveStatus={handleSaveStatus}
        />
      )}

      {/* Nested Edit Listing Details Drawer */}
      {canChangeStatus && isEditOpen && (
        <EditListingDrawer
          key={`edit-${channel.id}-${channel.title}-${channel.price}-${channel.status}`}
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          channel={channel}
        />
      )}
    </>
  );
}

export default ListingDetailsDrawer;
