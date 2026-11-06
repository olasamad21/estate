import { useEffect, useRef, useId } from 'react';
import { X } from 'lucide-react';

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer = null,
  maxWidth = 'max-w-md',
}) {
  const dialogRef = useRef(null);
  const triggerRef = useRef(null);
  const mouseDownTargetRef = useRef(null);
  const titleId = useId();

  // Latest-ref pattern for onClose callback
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (isOpen) {
      // Capture trigger element once on open
      triggerRef.current = document.activeElement;

      // Focus data-autofocus first, else first enabled focusable, else dialog
      const dialogEl = dialogRef.current;
      if (dialogEl) {
        const autofocusEl = dialogEl.querySelector('[data-autofocus]');
        if (autofocusEl && typeof autofocusEl.focus === 'function') {
          autofocusEl.focus();
        } else {
          const focusable = dialogEl.querySelectorAll(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          );
          if (focusable.length > 0) {
            focusable[0].focus();
          } else {
            dialogEl.focus();
          }
        }
      }

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          onCloseRef.current?.();
        }

        // Tab focus trap
        if (e.key === 'Tab') {
          if (!dialogRef.current) return;
          const focusableElements = dialogRef.current.querySelectorAll(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          );
          if (focusableElements.length === 0) return;

          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
        // Restore focus on close
        triggerRef.current?.focus?.();
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleMouseDown = (e) => {
    mouseDownTargetRef.current = e.target;
  };

  const handleClick = (e) => {
    // Backdrop dismiss only if mousedown AND click both originated on the backdrop
    if (e.target === e.currentTarget && mouseDownTargetRef.current === e.currentTarget) {
      onCloseRef.current?.();
    }
  };

  return (
    <div
      className="fixed inset-x-0 z-50 flex items-center justify-center p-4 bg-scrim transition-opacity duration-200"
      style={{ top: 'var(--app-offset-top, 0px)', height: 'var(--app-h, 100dvh)' }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`w-full max-h-full ${maxWidth} bg-surface rounded-2xl border border-line shadow-2xl flex flex-col overflow-hidden animate-modal-mount focus:outline-none`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-line shrink-0">
          <h2 id={titleId} className="text-base font-semibold text-ink">
            {title}
          </h2>
          <button
            type="button"
            onClick={() => onCloseRef.current?.()}
            aria-label="Close dialog"
            className="w-11 h-11 flex items-center justify-center rounded-lg text-ink-muted hover:text-ink hover:bg-surface-raised cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto min-h-0 max-h-[calc(var(--app-h,100dvh)*0.7)] text-sm text-ink-soft">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-5 py-3.5 bg-surface-raised border-t border-line shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;
