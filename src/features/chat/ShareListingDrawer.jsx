import { useState, useMemo } from 'react';
import { Drawer } from '../../components/common/Drawer.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { formatNaira } from '../../utils/formatters.js';
import { COMPANY_CONFIG } from '../../config/market.js';
import { useChat } from '../../context/ChatContext.jsx';
import { shareableListings } from '../../utils/chat.js';
import { ListingPhoto } from './ListingPhoto.jsx';

function ShareListingForm({ channel, onClose }) {
  const { currentUser, channels, shareListing } = useChat();

  const [selectedListingId, setSelectedListingId] = useState('');
  const [note, setNote] = useState('');

  const listings = useMemo(() => {
    return shareableListings(currentUser, channels);
  }, [currentUser, channels]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedListingId || !channel) return;

    shareListing(channel.id, selectedListingId, note);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Listing Selection */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-ink">
          Select listing room <span className="text-status-danger">*</span>
        </label>

        {listings.length === 0 ? (
          <div className="p-4 rounded-xl border border-line bg-surface-raised text-center text-xs text-ink-muted">
            No listing rooms yet.
          </div>
        ) : (
          <div className="space-y-2 max-h-[45dvh] overflow-y-auto pr-1" role="radiogroup" aria-label="Listing rooms">
            {listings.map((item) => {
              const isSelected = selectedListingId === item.id;
              const office = COMPANY_CONFIG.offices.find((o) => o.id === item.officeId);
              const officeName = office ? `${office.name} office` : 'All offices';
              const statusVariant =
                item.status === 'Available'
                  ? 'success'
                  : item.status === 'Under offer'
                  ? 'warning'
                  : 'neutral';

              return (
                <label
                  key={item.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    isSelected
                      ? 'border-brand bg-brand/5 shadow-2xs'
                      : 'border-line bg-surface hover:bg-surface-raised'
                  }`}
                >
                  <input
                    type="radio"
                    name="share_listing_id"
                    value={item.id}
                    checked={isSelected}
                    onChange={() => setSelectedListingId(item.id)}
                    className="accent-brand cursor-pointer shrink-0"
                  />

                  {/* Thumbnail */}
                  <div className="w-12 h-10 rounded-lg overflow-hidden shrink-0 border border-line bg-surface-raised">
                    <ListingPhoto channel={item} className="w-full h-full object-cover" />
                  </div>

                  {/* Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-ink">
                        {item.title || item.name}
                      </span>
                      <Badge variant={statusVariant} size="sm">
                        {item.status || 'Available'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-ink-muted mt-0.5">
                      <span className="font-semibold text-brand tabular-nums">
                        {formatNaira(item.priceNgn || item.price)}
                      </span>
                      <span>·</span>
                      <span>{officeName}</span>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Optional Note */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="share-listing-note" className="block text-xs font-semibold text-ink">
            Note (optional)
          </label>
          <span className="text-xs text-ink-muted tabular-nums">
            {note.length}/140
          </span>
        </div>
        <textarea
          id="share-listing-note"
          name="share_listing_note"
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Price just updated, great match for Lekki buyers"
          maxLength={140}
          className="w-full px-3 py-2 text-xs bg-surface border border-line rounded-lg text-ink focus:border-brand focus:outline-none resize-none leading-relaxed"
        />
      </div>

      {/* Actions */}
      <div className="pt-3 flex items-center justify-end gap-2 border-t border-line">
        <Button type="button" variant="ghost" onClick={onClose} className="min-h-[44px]">
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={!selectedListingId}
          className="min-h-[44px]"
        >
          Share
        </Button>
      </div>
    </form>
  );
}

export function ShareListingDrawer({ isOpen, onClose, channel }) {
  const [formKey, setFormKey] = useState(0);

  const handleClose = () => {
    setFormKey((k) => k + 1);
    onClose();
  };

  return (
    <Drawer isOpen={isOpen} onClose={handleClose} title="Share a Listing">
      {isOpen && channel && (
        <ShareListingForm key={formKey} channel={channel} onClose={handleClose} />
      )}
    </Drawer>
  );
}

export default ShareListingDrawer;
