import { useState } from 'react';
import { Check, Hash } from 'lucide-react';
import { Drawer } from '../../components/common/Drawer.jsx';
import { useToast } from '../../components/common/useToast.js';
import { TEXT_SIZES, getTextSize, setTextSize, applyTextSize } from '../../utils/textSize.js';
import { getTextSizeChangedMessage } from '../../utils/messages.js';
import { formatNaira } from '../../utils/formatters.js';

export function TextSizeDrawer({ isOpen, onClose }) {
  const { showToast } = useToast();
  const [currentSize, setCurrentSize] = useState(() => getTextSize());

  const handleSelectSize = (size) => {
    applyTextSize(size.id);
    setTextSize(size.id);
    setCurrentSize(size.id);
    showToast(getTextSizeChangedMessage(size.label));
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Text size">
      <div className="space-y-6">
        {/* Caption */}
        <p className="text-xs text-ink-muted leading-relaxed">
          Makes text and buttons larger across the app.
        </p>

        {/* Radio rows (44px min touch target, check on selected) */}
        <div className="space-y-2">
          {TEXT_SIZES.map((size) => {
            const isSelected = currentSize === size.id;
            const sizeLabelClass =
              size.id === 'xl'
                ? 'text-base font-semibold'
                : size.id === 'large'
                ? 'text-sm font-semibold'
                : 'text-xs font-semibold';

            return (
              <button
                key={size.id}
                type="button"
                onClick={() => handleSelectSize(size)}
                className={`w-full min-h-[44px] px-4 py-3 rounded-xl border flex items-center justify-between text-left cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                  isSelected
                    ? 'border-brand bg-brand/5 text-ink'
                    : 'border-line bg-surface hover:bg-surface-raised text-ink-soft'
                }`}
              >
                <span className={sizeLabelClass}>{size.label}</span>
                {isSelected && (
                  <Check className="w-4 h-4 text-brand shrink-0" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>

        {/* Live Preview block */}
        <div className="space-y-2 pt-1">
          <span className="block text-xs font-semibold text-ink-muted uppercase tracking-wider">
            Preview
          </span>
          <div className="border border-line rounded-xl bg-surface p-3.5 sm:p-4 space-y-3 shadow-2xs">
            {/* Sample channel row */}
            <div className="flex items-center gap-2 border-b border-line pb-2.5">
              <Hash className="w-4 h-4 text-brand shrink-0" aria-hidden="true" />
              <span className="text-sm font-bold text-ink">general</span>
              <span className="text-xs text-ink-muted">· Lagos & Abuja</span>
            </div>

            {/* Sample message with formatted Naira price */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-ink">Adaeze Okonkwo</span>
                <span className="text-xs text-ink-muted">12:30 PM</span>
              </div>
              <p className="text-xs text-ink-soft leading-relaxed">
                Viewing at 3:00 PM at Maitama Duplex ({formatNaira(450000000)}).
              </p>
            </div>
          </div>
        </div>
      </div>
    </Drawer>
  );
}

export default TextSizeDrawer;
