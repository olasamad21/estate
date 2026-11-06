import { useRef, useCallback, useMemo, useState, useEffect } from 'react';
import { FileText, Download, MoreHorizontal, Play, Pause, Maximize2 } from 'lucide-react';
import { useToast } from '../../components/common/useToast.js';
import { getFileDownloadStartedMessage } from '../../utils/messages.js';
import { getPreviewUrl } from '../../utils/previewUrls.js';
import { PhotoView } from './PhotoView.jsx';
import { PhotoPlaceholder } from './PhotoPlaceholder.jsx';

function formatSimulatedDuration(sec) {
  if (sec === null || sec === undefined) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function InlineSampleVideoPlayer({
  file,
  uniqueId,
  boxStyle,
  cleanName,
  onOpenFileDetail,
  onOpenActions,
  filePayload,
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const totalSec = file.durationSec || 60;

  useEffect(() => {
    if (!isPlaying) return;
    const stepMs = 100;
    const inc = stepMs / (totalSec * 1000);
    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + inc;
        if (next >= 1) {
          setIsPlaying(false);
          return 1;
        }
        return next;
      });
    }, stepMs);
    return () => clearInterval(timer);
  }, [isPlaying, totalSec]);

  useEffect(() => {
    const handlePauseOthers = (e) => {
      if (e.detail?.sourceId !== uniqueId) {
        setIsPlaying(false);
      }
    };
    window.addEventListener('estate:pause-other-videos', handlePauseOthers);
    return () => {
      window.removeEventListener('estate:pause-other-videos', handlePauseOthers);
    };
  }, [uniqueId]);

  const handleTogglePlay = (e) => {
    e.stopPropagation();
    if (progress >= 1) {
      setProgress(0);
      setIsPlaying(true);
      window.dispatchEvent(new CustomEvent('estate:pause-other-videos', { detail: { sourceId: uniqueId } }));
    } else if (isPlaying) {
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      window.dispatchEvent(new CustomEvent('estate:pause-other-videos', { detail: { sourceId: uniqueId } }));
    }
  };

  const currentSec = Math.min(totalSec, Math.floor(progress * totalSec));

  return (
    <div
      style={boxStyle}
      className="relative rounded-lg border border-line overflow-hidden bg-surface-raised flex items-center justify-center"
    >
      <PhotoPlaceholder
        fileName={file.fileName}
        className="w-full h-full object-contain"
      />

      {/* Top action buttons: Expand and More */}
      <div className="absolute top-1.5 right-1.5 flex items-center gap-1 z-10">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenFileDetail?.(filePayload);
          }}
          aria-label="Open video"
          className="w-11 h-11 rounded-lg bg-surface/90 border border-line hover:border-brand hover:text-brand flex items-center justify-center text-ink-muted transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand shadow-xs"
        >
          <Maximize2 className="w-4 h-4" aria-hidden="true" />
        </button>
        {onOpenActions && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenActions(filePayload);
            }}
            aria-label="Message actions"
            className="w-11 h-11 rounded-lg bg-surface/90 border border-line hover:border-brand hover:text-brand flex items-center justify-center text-ink-muted transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand shadow-xs"
          >
            <MoreHorizontal className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Centred 56px Play/Pause button */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <button
          type="button"
          onClick={handleTogglePlay}
          aria-label={isPlaying ? `Pause video ${cleanName}` : `Play video ${cleanName}`}
          className="w-14 h-14 rounded-full bg-surface/90 border border-line flex items-center justify-center text-ink shadow-md hover:scale-105 active:scale-95 transition-transform cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand pointer-events-auto"
        >
          {isPlaying ? (
            <Pause className="w-6 h-6 fill-current" aria-hidden="true" />
          ) : (
            <Play className="w-6 h-6 fill-current ml-0.5" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Progress and timer bar at bottom */}
      <div className="absolute bottom-1.5 inset-x-1.5 p-1.5 rounded-md bg-surface/90 border border-line space-y-1 backdrop-blur-xs">
        <div className="w-full bg-line rounded-full h-1 overflow-hidden">
          <div
            className="bg-brand h-full rounded-full transition-[width] duration-100 ease-linear"
            style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-ink-muted tabular-nums">
          <span>{formatSimulatedDuration(currentSec)}</span>
          <span>{formatSimulatedDuration(totalSec)}</span>
        </div>
      </div>
    </div>
  );
}

function InlineRealVideoPlayer({
  previewUrl,
  boxStyle,
  cleanName,
  durationFormatted,
  uniqueId,
  onOpenFileDetail,
  onOpenActions,
  filePayload,
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const videoEl = videoRef.current;
    const handlePauseOthers = (e) => {
      if (e.detail?.sourceId !== uniqueId) {
        if (videoEl && !videoEl.paused) {
          videoEl.pause();
        }
        setIsPlaying(false);
      }
    };
    window.addEventListener('estate:pause-other-videos', handlePauseOthers);
    return () => {
      window.removeEventListener('estate:pause-other-videos', handlePauseOthers);
      if (videoEl && !videoEl.paused) {
        videoEl.pause();
      }
    };
  }, [uniqueId]);

  const handlePlay = (e) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('estate:pause-other-videos', { detail: { sourceId: uniqueId } }));
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  return (
    <div
      style={boxStyle}
      className="relative rounded-lg border border-line overflow-hidden bg-surface-raised flex items-center justify-center"
    >
      <video
        ref={videoRef}
        src={`${previewUrl}#t=0.1`}
        preload="metadata"
        muted={!isPlaying}
        playsInline
        controls={isPlaying}
        onPlay={() => {
          window.dispatchEvent(new CustomEvent('estate:pause-other-videos', { detail: { sourceId: uniqueId } }));
          setIsPlaying(true);
        }}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        className="w-full h-full object-contain bg-surface-raised"
      />

      {/* Top action buttons: Expand and More */}
      <div className="absolute top-1.5 right-1.5 flex items-center gap-1 z-10">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenFileDetail?.(filePayload);
          }}
          aria-label="Open video"
          className="w-11 h-11 rounded-lg bg-surface/90 border border-line hover:border-brand hover:text-brand flex items-center justify-center text-ink-muted transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand shadow-xs"
        >
          <Maximize2 className="w-4 h-4" aria-hidden="true" />
        </button>
        {onOpenActions && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenActions(filePayload);
            }}
            aria-label="Message actions"
            className="w-11 h-11 rounded-lg bg-surface/90 border border-line hover:border-brand hover:text-brand flex items-center justify-center text-ink-muted transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand shadow-xs"
          >
            <MoreHorizontal className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Centred 56px Play button when not playing */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            type="button"
            onClick={handlePlay}
            aria-label={`Play video ${cleanName}`}
            className="w-14 h-14 rounded-full bg-surface/90 border border-line flex items-center justify-center text-ink shadow-md hover:scale-105 active:scale-95 transition-transform cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <Play className="w-6 h-6 fill-current ml-0.5" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Duration pill at bottom right when not playing */}
      {!isPlaying && durationFormatted && (
        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-surface/90 border border-line text-xs font-medium text-ink tabular-nums shadow-xs pointer-events-none">
          {durationFormatted}
        </div>
      )}
    </div>
  );
}

function InlineReloadPlaceholder({
  fileName,
  boxStyle,
  onOpenFileDetail,
  onOpenActions,
  filePayload,
}) {
  return (
    <div
      style={boxStyle}
      className="relative rounded-lg border border-line overflow-hidden bg-surface-raised flex flex-col items-center justify-center p-3 text-center"
    >
      <div className="absolute top-1.5 right-1.5 flex items-center gap-1 z-10">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenFileDetail?.(filePayload);
          }}
          aria-label="Open video"
          className="w-11 h-11 rounded-lg bg-surface/90 border border-line hover:border-brand hover:text-brand flex items-center justify-center text-ink-muted transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand shadow-xs"
        >
          <Maximize2 className="w-4 h-4" aria-hidden="true" />
        </button>
        {onOpenActions && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenActions(filePayload);
            }}
            aria-label="Message actions"
            className="w-11 h-11 rounded-lg bg-surface/90 border border-line hover:border-brand hover:text-brand flex items-center justify-center text-ink-muted transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand shadow-xs"
          >
            <MoreHorizontal className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>

      <PhotoPlaceholder
        fileName={fileName}
        className="w-14 h-14 object-contain mb-2 text-ink-muted"
      />
      <p className="text-xs text-ink-muted leading-relaxed max-w-[14rem]">
        The video file is not kept in this demo after a reload.
      </p>
    </div>
  );
}

export function AttachmentCard({
  message,
  fileName = 'Document.pdf',
  fileSize = '1.5 MB',
  fileKind = 'document',
  durationSec = null,
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
    durationSec,
    width: message?.width ?? null,
    height: message?.height ?? null,
  }, [message, fileName, fileSize, fileKind, durationSec]);

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

  const isVideo = message?.type === 'video' || fileKind === 'video';
  const isPhoto = fileKind === 'photo';
  const isPdf = (fileName || '').toLowerCase().endsWith('.pdf');
  const cleanName = (fileName || 'attachment')
    .replace(/\.[^/.]+$/, '')
    .replace(/_/g, ' ')
    .trim();

  const durationFormatted = useMemo(() => {
    const sec = message?.durationSec ?? durationSec;
    if (typeof sec === 'number' && Number.isFinite(sec)) {
      const mins = Math.floor(sec / 60);
      const secs = String(Math.floor(sec % 60)).padStart(2, '0');
      return `${mins}:${secs}`;
    }
    return null;
  }, [message?.durationSec, durationSec]);

  const previewUrl = message?.id ? getPreviewUrl(message.id) : null;

  const handleDownload = () => {
    showToast(getFileDownloadStartedMessage(fileName));
  };

  // 1. Inline Video Player (shape from width/height, inline playback, compact sample player)
  if (isVideo) {
    const w = message?.width ?? null;
    const h = message?.height ?? null;
    const isPortrait = Boolean(w && h && h > w);
    const aspectRatio = (w && h) ? `${w} / ${h}` : '16 / 9';
    const boxStyle = {
      width: isPortrait ? 'min(100%, 15rem)' : 'min(100%, 20rem)',
      aspectRatio,
      maxHeight: '60dvh',
    };
    const uniqueVideoId = message?.id || `vid-${fileName}`;

    if (message?.isSample) {
      return (
        <InlineSampleVideoPlayer
          key={uniqueVideoId}
          file={filePayload}
          uniqueId={uniqueVideoId}
          boxStyle={boxStyle}
          cleanName={cleanName}
          onOpenFileDetail={onOpenFileDetail}
          onOpenActions={onOpenActions}
          filePayload={filePayload}
        />
      );
    }

    if (previewUrl) {
      return (
        <InlineRealVideoPlayer
          key={uniqueVideoId}
          previewUrl={previewUrl}
          boxStyle={boxStyle}
          cleanName={cleanName}
          durationFormatted={durationFormatted}
          uniqueId={uniqueVideoId}
          onOpenFileDetail={onOpenFileDetail}
          onOpenActions={onOpenActions}
          filePayload={filePayload}
        />
      );
    }

    return (
      <InlineReloadPlaceholder
        key={uniqueVideoId}
        fileName={fileName}
        boxStyle={boxStyle}
        onOpenFileDetail={onOpenFileDetail}
        onOpenActions={onOpenActions}
        filePayload={filePayload}
      />
    );
  }

  // 2. Photo messages show the 4:3 picture button with top-right More actions button
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
