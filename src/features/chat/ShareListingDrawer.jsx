import { useState, useMemo } from 'react';
import { Drawer } from '../../components/common/Drawer.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { formatNaira } from '../../utils/formatters.js';
import { useChat } from '../../context/ChatContext.jsx';
import { shareableListings, officeLabelOf, normaliseMessageText } from '../../utils/chat.js';
import { ListingPhoto } from './ListingPhoto.jsx';

function ShareListingForm({ isOpen, channel, onClose }) {
  const { currentUser, channels, shareListing } = useChat();

  const [selectedListingId, setSelectedListingId] = useState('');
  const [note, setNote] = useState('');

  const isDirty = Boolean(selectedListingId || normaliseMessageText(note));

  const siteGroups = useMemo(() => {
    const list = shareableListings(currentUser, channels);
    const groups = [];
    const map = new Map();

    list.forEach((prop) => {
      const siteId = prop.listing?.siteId || prop.siteId || 'other';
      if (!map.has(siteId)) {
        const site = channels.find((c) => c.kind === 'site' && c.id === siteId) ?? null;
        const groupObj = {
          siteId,
          site,
          title: site?.title || 'Properties',
          location: site?.location || '',
          properties: [],
        };
        map.set(siteId, groupObj);
        groups.push(groupObj);
      }
      map.get(siteId).properties.push(prop);
    });

    return groups;
  }, [currentUser, channels]);

  const totalProperties = useMemo(() => {
    return siteGroups.reduce((acc, g) => acc + g.properties.length, 0);
  }, [siteGroups]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedListingId || !channel) return;

    shareListing(channel.id, selectedListingId, normaliseMessageText(note));
    onClose();
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Share a property"
      variant="form"
      isDirty={isDirty}
      discardTitle="Discard this message?"
    >
      <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col">
      {/* Property Selection */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-ink">
          Select property <span className="text-status-danger">*</span>
        </label>

        {totalProperties === 0 ? (
          <div className="p-4 rounded-xl border border-line bg-surface-raised text-center text-xs text-ink-muted">
            No properties yet.
          </div>
        ) : (
          <div className="space-y-4 max-h-[calc(var(--app-h,100dvh)*0.45)] overflow-y-auto pr-1" role="radiogroup" aria-label="Properties">
            {siteGroups.map((group) => {
              const headingText = group.location
                ? `${group.title} · ${group.location}`
                : group.title;

              return (
                <div key={group.siteId} className="space-y-2">
                  <h3 className="text-xs font-bold text-ink-muted uppercase tracking-wider px-1">
                    {headingText}
                  </h3>
                  <div className="space-y-2">
                    {group.properties.map((item) => {
                      const isSelected = selectedListingId === item.id;
                      const officeName = officeLabelOf(item.officeId);
                      const statusVariant =
                        item.status === 'Available'
                          ? 'success'
                          : item.status === 'Under offer'
                          ? 'warning'
                          : 'neutral';

                      return (
                        <label
                          key={item.id}
                          className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors min-h-[44px] ${
                            isSelected
                              ? 'border-brand bg-brand/5 shadow-2xs'
                              : 'border-line bg-surface hover:bg-surface-raised'
                          }`}
                        >
                          <input
                            type="radio"
                            name="share_property_id"
                            value={item.id}
                            checked={isSelected}
                            onChange={() => setSelectedListingId(item.id)}
                            className="accent-brand cursor-pointer shrink-0"
                          />

                          {/* 48px Thumbnail */}
                          <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-line bg-surface-raised">
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
                </div>
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
          placeholder="e.g. Price just updated, great match for Maitama buyers"
          maxLength={140}
          className="w-full px-3 py-2 text-xs bg-surface border border-line rounded-lg text-ink focus:border-brand focus:outline-none resize-none leading-relaxed"
        />
      </div>

      {/* Actions */}
      <div className="sticky bottom-0 bg-surface border-t border-line py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] flex items-center justify-end gap-2 -mx-5 px-5 mt-auto">
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
  </Drawer>
  );
}

export function ShareListingDrawer({ isOpen, onClose, channel }) {
  const [formKey, setFormKey] = useState(0);

  const handleClose = () => {
    setFormKey((k) => k + 1);
    onClose();
  };

  if (!isOpen || !channel) {
    return <Drawer isOpen={false} onClose={onClose} title="Share a property" variant="form" />;
  }

  return (
    <ShareListingForm key={`${channel.id}-${formKey}`} isOpen={isOpen} channel={channel} onClose={handleClose} />
  );
}

export default ShareListingDrawer;
