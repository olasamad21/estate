import { useEffect, useRef, useId, useState, useCallback } from 'react';
import { X } from 'lucide-react';

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  footer = null,
  panelClassName = '',
}) {
  const drawerRef = useRef(null);
  const triggerRef = useRef(null);
  const mouseDownTargetRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const closeTimerRef = useRef(null);
  const titleId = useId();

  // Swipe-down dismiss and animated exit state
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const touchStartYRef = useRef(0);
  const touchStartTimeRef = useRef(0);
  const currentDragYRef = useRef(0);
  const isDragInitiatedRef = useRef(false);

  // Latest-ref pattern for onClose
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  // Smooth exit handler: animates sheet down and fades out scrim before unmounting
  const handleRequestClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    closeTimerRef.current = setTimeout(() => {
      setIsClosing(false);
      setDragY(0);
      setIsDragging(false);
      onCloseRef.current?.();
    }, 250);
  }, [isClosing]);

  // Clean up any pending timer on unmount
  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      currentDragYRef.current = 0;
      isDragInitiatedRef.current = false;

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
          handleRequestClose();
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
  }, [isOpen, handleRequestClose]);

  if (!isOpen) return null;

  const handleMouseDown = (e) => {
    mouseDownTargetRef.current = e.target;
  };

  const handleClick = (e) => {
    if (e.target === e.currentTarget && mouseDownTargetRef.current === e.currentTarget) {
      handleRequestClose();
    }
  };

  // Drag initiation from dedicated handle/header
  const startDragFromHandle = (e) => {
    if (isClosing) return;
    const touch = e.touches[0];
    touchStartYRef.current = touch.clientY;
    touchStartTimeRef.current = Date.now();
    currentDragYRef.current = 0;
    isDragInitiatedRef.current = true;
    setIsDragging(true);
  };

  // Drag initiation from content area (only if scrolled to top)
  const handleContentTouchStart = (e) => {
    if (isClosing) return;
    const touch = e.touches[0];
    touchStartYRef.current = touch.clientY;
    touchStartTimeRef.current = Date.now();
    currentDragYRef.current = 0;
    if (scrollContainerRef.current && scrollContainerRef.current.scrollTop <= 0) {
      isDragInitiatedRef.current = true;
    } else {
      isDragInitiatedRef.current = false;
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragInitiatedRef.current || isClosing) return;
    const touch = e.touches[0];
    const deltaY = touch.clientY - touchStartYRef.current;

    if (deltaY > 0) {
      // If scroll container has moved down, cancel sheet dragging
      if (scrollContainerRef.current && scrollContainerRef.current.scrollTop > 0) {
        isDragInitiatedRef.current = false;
        setIsDragging(false);
        setDragY(0);
        return;
      }
      // Damped drag resistance curve
      const dampedY = deltaY < 120 ? deltaY : 120 + (deltaY - 120) * 0.7;
      currentDragYRef.current = dampedY;
      setDragY(dampedY);
      if (!isDragging) setIsDragging(true);
    } else {
      if (currentDragYRef.current > 0) {
        currentDragYRef.current = 0;
        setDragY(0);
      }
      setIsDragging(false);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragInitiatedRef.current || isClosing) return;
    isDragInitiatedRef.current = false;
    setIsDragging(false);

    const elapsed = Date.now() - touchStartTimeRef.current;
    const distance = currentDragYRef.current;
    const velocity = elapsed > 0 ? distance / elapsed : 0; // px/ms

    // Deliberate swipe-down criteria: > 140px drag or intentional flick (> 0.65 px/ms with > 60px)
    if (distance > 140 || (velocity > 0.65 && distance > 60)) {
      handleRequestClose();
    } else {
      // Smoothly snap back
      setDragY(0);
      currentDragYRef.current = 0;
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center bg-scrim transition-opacity duration-250 ${
        isClosing ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
    >
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        style={{
          transform: isClosing
            ? 'translateY(100%)'
            : dragY > 0
            ? `translateY(${dragY}px)`
            : undefined,
          transition: isDragging
            ? 'none'
            : isClosing
            ? 'transform 250ms cubic-bezier(0.16, 1, 0.3, 1)'
            : 'transform 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className={`w-full max-w-md bg-surface rounded-t-2xl border-t border-x border-line shadow-2xl flex flex-col max-h-[92dvh] sm:max-h-[85dvh] animate-drawer-mount focus:outline-none ${panelClassName}`}
      >
        {/* Drag handle */}
        <div
          onTouchStart={startDragFromHandle}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing select-none touch-none"
          aria-hidden="true"
        >
          <div className="w-10 h-1.5 rounded-full bg-line-strong" />
        </div>

        {/* Header */}
        <div
          onTouchStart={startDragFromHandle}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="flex items-center justify-between px-5 py-3 border-b border-line select-none"
        >
          <h2 id={titleId} className="text-base font-semibold text-ink">
            {title}
          </h2>
          <button
            type="button"
            onClick={handleRequestClose}
            aria-label="Close drawer"
            className="w-11 h-11 flex items-center justify-center rounded-lg text-ink-muted hover:text-ink hover:bg-surface-raised cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        <div
          ref={scrollContainerRef}
          onTouchStart={handleContentTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="p-5 overflow-y-auto text-sm text-ink-soft flex-1"
        >
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
