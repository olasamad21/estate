import { useEffect, useRef } from 'react';
import { ALL_PICKER_EMOJIS } from '../../config/reactions.js';

export function EmojiPicker({ isOpen, onClose, onSelectEmoji }) {
  const popoverRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={popoverRef}
      className="absolute bottom-full mb-2 right-0 z-40 bg-surface border border-line rounded-xl shadow-xl p-2.5 animate-modal-mount"
      role="dialog"
      aria-label="Emoji Picker"
    >
      <div className="text-xs font-semibold text-ink-muted mb-1.5 px-1">
        Reactions & Emojis
      </div>
      <div className="grid grid-cols-6 gap-1 w-64">
        {ALL_PICKER_EMOJIS.map((emoji, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectEmoji(emoji)}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-lg hover:bg-surface-raised transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            aria-label={`Insert emoji`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

export default EmojiPicker;
