import { BellOff, Moon } from 'lucide-react';
import { Drawer } from '../../components/common/Drawer.jsx';
import { Button } from '../../components/common/Button.jsx';
import { useChat } from '../../context/ChatContext.jsx';
import { channelDisplayName } from '../../utils/chat.js';

export function NotificationSettingsDrawer({ isOpen, onClose }) {
  const {
    channels,
    staff,
    currentUserId,
    notifyPrefs,
    updateNotifyPrefs,
    toggleMuteChannel,
  } = useChat();

  const mutedChannels = channels.filter((ch) =>
    Array.isArray(notifyPrefs?.mutedChannelIds) && notifyPrefs.mutedChannelIds.includes(ch.id)
  );

  const handleModeChange = (newMode) => {
    updateNotifyPrefs({ mode: newMode });
  };

  const handleQuietStartChange = (e) => {
    updateNotifyPrefs({ quietStart: e.target.value });
  };

  const handleQuietEndChange = (e) => {
    updateNotifyPrefs({ quietEnd: e.target.value });
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Notification Settings">
      <div className="space-y-6">
        {/* Section 1: Notification Mode */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-ink uppercase tracking-wider block">
            Notification Mode
          </label>
          <div className="space-y-2">
            {/* Option 1: All messages */}
            <label
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                notifyPrefs.mode === 'all'
                  ? 'border-brand bg-surface shadow-2xs'
                  : 'border-line bg-surface hover:bg-surface-raised'
              }`}
            >
              <input
                type="radio"
                name="notify_mode"
                value="all"
                checked={notifyPrefs.mode === 'all'}
                onChange={() => handleModeChange('all')}
                className="mt-0.5 accent-brand"
              />
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-ink block">
                  All messages
                </span>
                <span className="text-xs text-ink-muted block leading-relaxed">
                  Receive notifications and unread badges for all channel messages.
                </span>
              </div>
            </label>

            {/* Option 2: Mentions only */}
            <label
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                notifyPrefs.mode === 'mentions'
                  ? 'border-brand bg-surface shadow-2xs'
                  : 'border-line bg-surface hover:bg-surface-raised'
              }`}
            >
              <input
                type="radio"
                name="notify_mode"
                value="mentions"
                checked={notifyPrefs.mode === 'mentions'}
                onChange={() => handleModeChange('mentions')}
                className="mt-0.5 accent-brand"
              />
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-ink block">
                  Mentions only
                </span>
                <span className="text-xs text-ink-muted block leading-relaxed">
                  Only show badge counts when you are directly @mentioned. Unread channels show a subtle dot.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Section 2: Quiet Hours */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5">
            <Moon className="w-4 h-4 text-brand shrink-0" aria-hidden="true" />
            <label className="text-xs font-bold text-ink uppercase tracking-wider">
              Quiet Hours
            </label>
          </div>
          <p className="text-xs text-ink-muted leading-relaxed">
            Mute non-critical alerts during these hours. Handles windows that cross midnight.
          </p>

          <div className="grid grid-cols-2 gap-3 p-3 rounded-xl border border-line bg-surface-raised">
            <div className="space-y-1">
              <label htmlFor="quiet-start-input" className="text-xs font-semibold text-ink-muted block">
                Start Time
              </label>
              <input
                id="quiet-start-input"
                name="notify_quiet_start"
                type="time"
                value={notifyPrefs.quietStart || '21:00'}
                onChange={handleQuietStartChange}
                className="w-full text-xs p-2 rounded-lg border border-line bg-surface text-ink focus:border-brand focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="quiet-end-input" className="text-xs font-semibold text-ink-muted block">
                End Time
              </label>
              <input
                id="quiet-end-input"
                name="notify_quiet_end"
                type="time"
                value={notifyPrefs.quietEnd || '07:00'}
                onChange={handleQuietEndChange}
                className="w-full text-xs p-2 rounded-lg border border-line bg-surface text-ink focus:border-brand focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Muted Channels */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <BellOff className="w-4 h-4 text-ink-muted shrink-0" aria-hidden="true" />
            <label className="text-xs font-bold text-ink uppercase tracking-wider">
              Muted Channels ({mutedChannels.length})
            </label>
          </div>

          {mutedChannels.length === 0 ? (
            <div className="p-4 rounded-xl border border-line bg-surface text-center text-xs text-ink-muted">
              No muted channels
            </div>
          ) : (
            <div className="space-y-1.5">
              {mutedChannels.map((ch) => {
                const name = channelDisplayName(ch, currentUserId, staff);
                return (
                  <div
                    key={ch.id}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-line bg-surface text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <BellOff className="w-3.5 h-3.5 text-ink-muted shrink-0" aria-hidden="true" />
                      <span className="font-semibold text-ink break-words">
                        #{name}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => toggleMuteChannel(ch.id, name)}
                      className="h-7 text-xs px-2.5 cursor-pointer"
                    >
                      Unmute
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
}

export default NotificationSettingsDrawer;
