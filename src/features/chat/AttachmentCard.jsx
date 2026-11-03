import { useRef, useCallback, useMemo } from 'react';
import { FileText, Download, MoreHorizontal } from 'lucide-react';
import { useToast } from '../../components/common/useToast.js';
import { getFileDownloadStartedMessage } from '../../utils/messages.js';
import { PhotoView } from './PhotoView.jsx';

export function AttachmentCard({
  message,
  fileName = 'Document.pdf',
  fileSize = '1.5 MB',
  fileKind = 'document',
  onOpenFileDetail,
  onOpenActions,
}) {
  const { showToast } = useToast();
  const timerRef = useRef(null);
  const touchStartPos = useRef({ x: 0, y: 0 });
  const didLongPressRef = useRef(false);

  const filePayload = useMemo(() => message || {
    id: message?.id || null,
    fileName,
    fileSize,
    fileKind,
  }, [message, fileName, fileSize, fileKind]);

  const handleLongPress = useCallback(() => {
    if (onOpenActions) {
      onOpenActions(filePayload);
    }
  }, [onOpenActions, filePayload]);

  const onTouchStart = useCallback((e) => {
    didLongPressRef.current = false;
    if (e.touches && e.touches.length > 0) {
      touchStartPos.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
    timerRef.current = setTimeout(() => {
      didLongPressRef.current = true;
      handleLongPress();
    }, 500);
  }, [handleLongPress]);

  const onTouchMove = useCallback((e) => {
    if (timerRef.current && e.touches && e.touches.length > 0) {
      const dx = Math.abs(e.touches[0].clientX - touchStartPos.current.x);
      const dy = Math.abs(e.touches[0].clientY - touchStartPos.current.y);
      if (dx > 10 || dy > 10) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }
  }, []);

  const onTouchEnd = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const isPhoto = fileKind === 'photo';
  const isPdf = (fileName || '').toLowerCase().endsWith('.pdf');
  const cleanName = (fileName || 'photo')
    .replace(/\.[^/.]+$/, '')
    .replace(/_/g, ' ')
    .trim();

  const handleDownload = () => {
    showToast(getFileDownloadStartedMessage(fileName));
  };

  // 1. Photo messages show the 4:3 picture button with top-right More actions button
  if (isPhoto) {
    return (
      <div className="relative inline-block w-full max-w-[280px] sm:max-w-[320px]">
        <button
          type="button"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onTouchCancel={onTouchEnd}
          onClick={(e) => {
            if (didLongPressRef.current) return;
            e.stopPropagation();
            onOpenFileDetail?.(filePayload);
          }}
          aria-label={`Open photo ${cleanName}`}
          className="block w-full aspect-[4/3] rounded-lg border border-line overflow-hidden hover:opacity-95 transition-opacity cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand bg-surface-raised"
        >
          <PhotoView
            message={message}
            fileName={fileName}
            fit="cover"
            className="w-full h-full"
          />
        </button>

        {onOpenActions && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenActions(filePayload);
            }}
            aria-label="Message actions"
            className="absolute top-1.5 right-1.5 w-11 h-11 rounded-lg bg-surface/90 border border-line hover:border-brand hover:text-brand flex items-center justify-center text-ink-muted transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand shadow-xs z-10"
          >
            <MoreHorizontal className="w-5 h-5" aria-hidden="true" />
          </button>
        )}
      </div>
    );
  }

  // 2. Document messages keep the document row with download and More buttons
  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
      onClick={(e) => {
        if (didLongPressRef.current) return;
        e.stopPropagation();
        onOpenFileDetail?.(filePayload);
      }}
      className="relative flex items-center justify-between gap-3 p-3 rounded-xl bg-surface-raised border border-line max-w-sm hover:bg-surface-raised/80 transition-colors cursor-pointer group"
    >
      <div className="flex items-center gap-2.5 min-w-0 pr-2">
        <div className="w-9 h-9 rounded-lg bg-surface border border-line flex items-center justify-center shrink-0 text-brand">
          <FileText className="w-5 h-5 text-brand" aria-hidden="true" />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-bold text-ink break-words">
            {fileName}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-ink-muted">
            <span className="tabular-nums">{fileSize}</span>
            {isPdf && (
              <>
                <span>·</span>
                <span className="font-semibold text-ink-muted uppercase">PDF</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleDownload();
          }}
          aria-label={`Download ${fileName}`}
          className="w-11 h-11 rounded-lg bg-surface border border-line hover:border-brand hover:text-brand flex items-center justify-center shrink-0 text-ink-muted transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <Download className="w-4 h-4" aria-hidden="true" />
        </button>

        {onOpenActions && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenActions(filePayload);
            }}
            aria-label="Message actions"
            className="w-11 h-11 rounded-lg bg-surface border border-line hover:border-brand hover:text-brand flex items-center justify-center shrink-0 text-ink-muted transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <MoreHorizontal className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}

export default AttachmentCard;
