import { useState, useMemo } from 'react';
import { Hash, Lock, MessageSquare } from 'lucide-react';
import { Drawer } from '../../components/common/Drawer.jsx';
import { Button } from '../../components/common/Button.jsx';
import { useChat } from '../../context/ChatContext.jsx';
import { canShareListing, channelDisplayName } from '../../utils/chat.js';

function ShareToListingChannelForm({ isOpen, listingChannel, onClose }) {
  const { currentUser, channels, staff, shareListing } = useChat();

  const [selectedChannelId, setSelectedChannelId] = useState('');
  const [note, setNote] = useState('');

  const isDirty = Boolean(selectedChannelId || note.trim());

  // Eligible destination channels grouped by section
  const groupedChannels = useMemo(() => {
    const valid = channels.filter((c) => canShareListing(currentUser, c));
    const publicChannels = [];
    const privateChannels = [];
    const directMessages = [];

    valid.forEach((c) => {
      if (c.kind === 'public' || c.kind === 'announcement') {
        publicChannels.push(c);
      } else if (c.kind === 'private') {
        privateChannels.push(c);
      } else if (c.kind === 'dm' || c.kind === 'group') {
        directMessages.push(c);
      }
    });

    return {
      publicChannels,
      privateChannels,
      directMessages,
    };
  }, [currentUser, channels]);

  const selectedChannel = useMemo(() => {
    return channels.find((c) => c.id === selectedChannelId) || null;
  }, [channels, selectedChannelId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedChannelId || !listingChannel) return;

    const targetDisplayName = channelDisplayName(selectedChannel, currentUser?.id, staff);
    shareListing(selectedChannelId, listingChannel.id, note, targetDisplayName);
    onClose();
  };

  const renderChannelGroup = (title, icon, items) => {
    if (!items || items.length === 0) return null;
    const IconComponent = icon;

    return (
      <div className="space-y-1.5 pt-2 first:pt-0">
        <h4 className="text-xs font-semibold text-ink-muted uppercase tracking-wider px-1">
          {title}
        </h4>
        <div className="space-y-1">
          {items.map((c) => {
            const isSelected = selectedChannelId === c.id;
            const displayName = channelDisplayName(c, currentUser?.id, staff);

            return (
              <label
                key={c.id}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                  isSelected
                    ? 'border-brand bg-brand/5 shadow-2xs'
                    : 'border-line bg-surface hover:bg-surface-raised'
                }`}
              >
                <input
                  type="radio"
                  name="share_destination_channel"
                  value={c.id}
                  checked={isSelected}
                  onChange={() => setSelectedChannelId(c.id)}
                  className="accent-brand cursor-pointer shrink-0"
                />
                <IconComponent className="w-4 h-4 text-ink-muted shrink-0" aria-hidden="true" />
                <span className="text-xs font-semibold text-ink min-w-0 break-words flex-1">
                  {c.kind === 'dm' ? displayName : `#${displayName}`}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Share in a Channel"
      variant="form"
      isDirty={isDirty}
      discardTitle="Discard this message?"
    >
      <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col">
      {/* Destination Channel Selector */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-ink">
          Select destination <span className="text-status-danger">*</span>
        </label>

        <div className="space-y-2 max-h-[45dvh] overflow-y-auto pr-1" role="radiogroup" aria-label="Destination Channels">
          {renderChannelGroup('Channels', Hash, groupedChannels.publicChannels)}
          {renderChannelGroup('Private', Lock, groupedChannels.privateChannels)}
          {renderChannelGroup('Direct messages', MessageSquare, groupedChannels.directMessages)}
        </div>
      </div>

      {/* Optional Note */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="destination-share-note" className="block text-xs font-semibold text-ink">
            Note (optional)
          </label>
          <span className="text-xs text-ink-muted tabular-nums">
            {note.length}/140
          </span>
        </div>
        <textarea
          id="destination-share-note"
          name="destination_share_note"
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Please share this property with interested buyers"
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
          disabled={!selectedChannelId}
          className="min-h-[44px]"
        >
          Share
        </Button>
      </div>
    </form>
  </Drawer>
  );
}

export function ShareToListingChannelDrawer({ isOpen, onClose, channel }) {
  const [formKey, setFormKey] = useState(0);

  const handleClose = () => {
    setFormKey((k) => k + 1);
    onClose();
  };

  if (!isOpen || !channel) {
    return <Drawer isOpen={false} onClose={onClose} title="Share in a Channel" variant="form" />;
  }

  return (
    <ShareToListingChannelForm
      key={`${channel.id}-${formKey}`}
      isOpen={isOpen}
      listingChannel={channel}
      onClose={handleClose}
    />
  );
}

export default ShareToListingChannelDrawer;
