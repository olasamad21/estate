import { useEffect, useRef, useId, useState, useCallback } from 'react';
import { X } from 'lucide-react';
import { Modal } from './Modal.jsx';
import { Button } from './Button.jsx';

// Counter to track open drawers and toggle overscroll-behavior-y: none on document
let openDrawerCount = 0;

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  footer = null,
  panelClassName = '',
  variant = 'sheet',
  isDirty = false,
  discardTitle = 'Discard changes?',
  discardMessage = 'You have unsaved changes.',
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
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  const touchStartYRef = useRef(0);
  const touchStartTimeRef = useRef(0);
  const currentDragYRef = useRef(0);
  const isDragInitiatedRef = useRef(false);

  // Latest-ref pattern for onClose
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  // Track discard modal state for keydown handler
  const showDiscardModalRef = useRef(showDiscardModal);
  useEffect(() => {
    showDiscardModalRef.current = showDiscardModal;
  }, [showDiscardModal]);

  // Prevent browser pull-to-refresh & rubber-band while drawer is open
  useEffect(() => {
    if (!isOpen) return;

    openDrawerCount += 1;
    if (openDrawerCount === 1) {
      document.documentElement.classList.add('overscroll-y-none');
    }

    return () => {
      openDrawerCount = Math.max(0, openDrawerCount - 1);
      if (openDrawerCount === 0) {
        document.documentElement.classList.remove('overscroll-y-none');
      }
    };
  }, [isOpen]);

  // Smooth exit handler: animates sheet down and fades out scrim before unmounting
  const performCloseAnimation = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    closeTimerRef.current = setTimeout(() => {
      setIsClosing(false);
      setDragY(0);
      setIsDragging(false);
      onCloseRef.current?.();
    }, 250);
  }, [isClosing]);

  // Unified close router: if variant is 'form' and isDirty is true, shows discard confirmation
  const requestClose = useCallback(() => {
    if (variant === 'form' && isDirty) {
      setShowDiscardModal(true);
      return;
    }
    performCloseAnimation();
  }, [variant, isDirty, performCloseAnimation]);

  const handleConfirmDiscard = () => {
    setShowDiscardModal(false);
    performCloseAnimation();
  };

  const handleCancelDiscard = () => {
    setShowDiscardModal(false);
  };

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
        // If discard confirmation modal is open, Modal owns keydown (Escape and focus trap)
        if (showDiscardModalRef.current) return;

        if (e.key === 'Escape') {
          e.preventDefault();
          requestClose();
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
  }, [isOpen, requestClose]);

  if (!isOpen) return null;

  const handleMouseDown = (e) => {
    mouseDownTargetRef.current = e.target;
  };

  const handleClick = (e) => {
    // Backdrop taps do nothing for variant 'form'
    if (variant === 'form') return;
    if (e.target === e.currentTarget && mouseDownTargetRef.current === e.currentTarget) {
      requestClose();
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

  // Drag initiation from content area (only if scrolled to top and NOT form variant)
  const handleContentTouchStart = (e) => {
    if (isClosing || variant === 'form') return;
    const touch = e.touches[0];
    touchStartYRef.current = touch.clientY;
    touchStartTimeRef.current = Date.now();
    currentDragYRef.current = 0;
    const scrollTop = scrollContainerRef.current ? scrollContainerRef.current.scrollTop : 0;
    if (scrollTop <= 0) {
      isDragInitiatedRef.current = true;
    } else {
      isDragInitiatedRef.current = false;
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragInitiatedRef.current || isClosing) return;
    const touch = e.touches[0];
    const deltaY = touch.clientY - touchStartYRef.current;

    // Any scrolling cancels the drag
    if (scrollContainerRef.current && scrollContainerRef.current.scrollTop > 0) {
      isDragInitiatedRef.current = false;
      setIsDragging(false);
      setDragY(0);
      currentDragYRef.current = 0;
      return;
    }

    if (deltaY > 0) {
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
    const panelHeight =
      drawerRef.current?.offsetHeight || (typeof window !== 'undefined' ? window.innerHeight : 600);

    if (variant === 'form') {
      // Closes only after a pull of at least 33% of the panel height; otherwise springs back
      if (distance >= 0.33 * panelHeight) {
        requestClose();
      } else {
        setDragY(0);
        currentDragYRef.current = 0;
      }
    } else {
      // INFO sheets: dismiss distance is larger of 120px and 33% panel height; fast flick >= 60px with velocity > 0.65 px/ms
      const dismissDistance = Math.max(120, 0.33 * panelHeight);
      if (distance >= dismissDistance || (velocity > 0.65 && distance >= 60)) {
        requestClose();
      } else {
        setDragY(0);
        currentDragYRef.current = 0;
      }
    }
  };

  const panelLayoutClasses =
    variant === 'form'
      ? 'w-full h-[100dvh] max-h-[100dvh] rounded-none border-none shadow-none flex flex-col bg-surface pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)] lg:relative lg:inset-auto lg:w-full lg:max-w-md lg:h-auto lg:max-h-[85dvh] lg:rounded-2xl lg:border lg:border-line lg:shadow-2xl lg:p-0'
      : 'w-full max-w-md bg-surface rounded-t-2xl border-t border-x border-line shadow-2xl flex flex-col max-h-[92dvh] sm:max-h-[85dvh]';

  return (
    <>
      <div
        className={`fixed inset-0 z-50 flex justify-center bg-scrim transition-opacity duration-250 ${
          variant === 'form' ? 'items-stretch lg:items-center' : 'items-end'
        } ${isClosing ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
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
          className={`${panelLayoutClasses} animate-drawer-mount focus:outline-none ${panelClassName}`}
        >
          {variant === 'form' ? (
            /* Header (variant="form") */
            <div
              onTouchStart={startDragFromHandle}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="h-14 min-h-[56px] px-3 lg:px-5 border-b border-line flex items-center gap-2 lg:justify-between select-none shrink-0"
            >
              {/* Below 1024px: close button at left (44px, X icon, aria-label "Close") */}
              <button
                type="button"
                onClick={requestClose}
                aria-label="Close"
                className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-ink-muted hover:text-ink hover:bg-surface-raised cursor-pointer transition-colors shrink-0 lg:order-last"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
              <h2
                id={titleId}
                className="text-base font-semibold text-ink leading-snug flex-1 lg:order-first"
              >
                {title}
              </h2>
            </div>
          ) : (
            <>
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
                  onClick={requestClose}
                  aria-label="Close drawer"
                  className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-ink-muted hover:text-ink hover:bg-surface-raised cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>
            </>
          )}

          {/* Content */}
          <div
            ref={scrollContainerRef}
            onTouchStart={handleContentTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="p-5 overflow-y-auto overscroll-y-contain text-sm text-ink-soft flex-1 min-h-0 flex flex-col"
          >
            {children}
          </div>

          {/* Footer (for sheet variant or custom footers) */}
          {footer && (
            <div className="flex items-center justify-end gap-3 px-5 py-3.5 bg-surface-raised border-t border-line">
              {footer}
            </div>
          )}
        </div>
      </div>

      {/* Discard Confirmation Modal */}
      {showDiscardModal && (
        <Modal
          isOpen={showDiscardModal}
          onClose={handleCancelDiscard}
          title={discardTitle}
          maxWidth="max-w-sm"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <Button
                type="button"
                variant="danger"
                onClick={handleConfirmDiscard}
                className="min-h-[44px]"
              >
                Discard
              </Button>
              <Button
                type="button"
                variant="primary"
                data-autofocus
                onClick={handleCancelDiscard}
                className="min-h-[44px]"
              >
                Keep editing
              </Button>
            </div>
          }
        >
          <p className="text-sm text-ink-soft leading-relaxed">{discardMessage}</p>
        </Modal>
      )}
    </>
  );
}

export default Drawer;
