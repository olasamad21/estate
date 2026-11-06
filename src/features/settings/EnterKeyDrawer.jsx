import { useState } from 'react';
import { Check } from 'lucide-react';
import { Drawer } from '../../components/common/Drawer.jsx';
import { useToast } from '../../components/common/useToast.js';
import { ENTER_KEY_OPTIONS, getEnterKeyPref, setEnterKeyPref } from '../../utils/enterKey.js';
import { getEnterKeyChangedMessage } from '../../utils/messages.js';

const DESCRIPTIONS = {
  auto: 'Phones add a new line. Computers send.',
  send: 'Shift plus Enter adds a new line.',
  newline: 'Use the send button or Ctrl or Cmd plus Enter to send.',
};

export function EnterKeyDrawer({ isOpen, onClose }) {
  const { showToast } = useToast();
  const [currentPref, setCurrentPref] = useState(() => getEnterKeyPref());

  const handleSelectPref = (option) => {
    setEnterKeyPref(option.id);
    setCurrentPref(option.id);
    showToast(getEnterKeyChangedMessage(option.label));
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Enter key">
      <div className="space-y-6">
        {/* Caption */}
        <p className="text-xs text-ink-muted leading-relaxed">
          Choose what the Enter key does in the message box.
        </p>

        {/* Radio rows (44px min touch target, name="enter_key_pref", check on selected) */}
        <div className="space-y-2" role="radiogroup" aria-label="Enter key behaviour">
          {ENTER_KEY_OPTIONS.map((option) => {
            const isSelected = currentPref === option.id;
            return (
              <label
                key={option.id}
                className={`w-full min-h-[44px] px-4 py-3 rounded-xl border flex items-center justify-between gap-3 text-left cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-brand ${
                  isSelected
                    ? 'border-brand bg-brand/5 text-ink'
                    : 'border-line bg-surface hover:bg-surface-raised text-ink-soft'
                }`}
              >
                <input
                  type="radio"
                  name="enter_key_pref"
                  value={option.id}
                  checked={isSelected}
                  onChange={() => handleSelectPref(option)}
                  className="sr-only"
                />
                <div className="min-w-0 flex-1 space-y-0.5">
                  <span className="text-xs font-semibold text-ink block">
                    {option.label}
                  </span>
                  <span className="text-xs text-ink-muted block leading-relaxed">
                    {DESCRIPTIONS[option.id]}
                  </span>
                </div>
                {isSelected && (
                  <Check className="w-4 h-4 text-brand shrink-0" aria-hidden="true" />
                )}
              </label>
            );
          })}
        </div>

        {/* Muted footer note */}
        <p className="text-xs text-ink-muted leading-relaxed">
          Ctrl or Cmd plus Enter always sends. Shift plus Enter always adds a new line. This setting is saved on this device.
        </p>
      </div>
    </Drawer>
  );
}

export default EnterKeyDrawer;
