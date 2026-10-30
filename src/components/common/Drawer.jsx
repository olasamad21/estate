import { useEffect, useRef, useId, useState } from 'react';
import { X } from 'lucide-react';

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  footer = null,
}) {
  const drawerRef = useRef(null);
  const triggerRef = useRef(null);
  const mouseDownTargetRef = useRef(null);
  const titleId = useId();

  // Swipe-down dismiss state
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartYRef = useRef(0);
  const currentDragYRef = useRef(0);

  // Latest-ref pattern for onClose
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement;

      const drawerEl = drawerRef.current;
      if (drawerEl) {
        const autofocusEl = drawerEl.querySelector('[data-autofocus]');
        if (autofocusEl && typeof autofocusEl.focus === 'function') {
          autofocusEl.focus();
        } else {
          const focusable = drawerEl.querySelectorAll(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          );
          if (focusable.length > 0) {
            focusable[0].focus();
          } else {
            drawerEl.focus();
          }
        }
      }

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          onCloseRef.current?.();
        }

        if (e.key === 'Tab') {
          if (!drawerRef.current) return;
          const focusableElements = drawerRef.current.querySelectorAll(
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
        triggerRef.current?.focus?.();
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleMouseDown = (e) => {
    mouseDownTargetRef.current = e.target;
  };

  const handleClick = (e) => {
    if (e.target === e.currentTarget && mouseDownTargetRef.current === e.currentTarget) {
      onCloseRef.current?.();
    }
  };

  // Touch handlers for swipe-down to dismiss
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    touchStartYRef.current = touch.clientY;
    currentDragYRef.current = 0;
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const deltaY = touch.clientY - touchStartYRef.current;
    if (deltaY > 0) {
      currentDragYRef.current = deltaY;
      setDragY(deltaY);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (currentDragYRef.current > 80) {
      onCloseRef.current?.();
    }
    setDragY(0);
    currentDragYRef.current = 0;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-scrim transition-opacity duration-300"
      onMouseDown={handleMouseDown}
      onClick={handleClick}
    >
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: dragY > 0 ? `translateY(${dragY}px)` : undefined,
          transition: isDragging ? 'none' : 'transform 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className="w-full max-w-md bg-surface rounded-t-2xl border-t border-x border-line shadow-2xl flex flex-col max-h-[85dvh] animate-drawer-mount focus:outline-none"
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing" aria-hidden="true">
          <div className="w-10 h-1.5 rounded-full bg-line-strong" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-line">
          <h2 id={titleId} className="text-base font-semibold text-ink">
            {title}
          </h2>
          <button
            type="button"
            onClick={() => onCloseRef.current?.()}
            aria-label="Close drawer"
            className="w-11 h-11 flex items-center justify-center rounded-lg text-ink-muted hover:text-ink hover:bg-surface-raised cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto text-sm text-ink-soft flex-1">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-5 py-3.5 bg-surface-raised border-t border-line">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Drawer;
