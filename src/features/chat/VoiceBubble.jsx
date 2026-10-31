import { useState, useEffect, useRef } from 'react';
import { Play, Pause } from 'lucide-react';

function formatDuration(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

const WAVEFORM_HEIGHTS = [
  'h-2', 'h-4', 'h-6', 'h-3', 'h-5', 'h-7', 'h-4', 'h-2',
  'h-6', 'h-5', 'h-7', 'h-3', 'h-6', 'h-4', 'h-5', 'h-2',
  'h-4', 'h-6', 'h-3', 'h-5'
];

export function VoiceBubble({ durationSec = 15 }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentProgress((prev) => {
          if (prev >= durationSec) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 0.25;
        });
      }, 250);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, durationSec]);

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (currentProgress >= durationSec) {
        setCurrentProgress(0);
      }
      setIsPlaying(true);
    }
  };

  const progressFraction = Math.min(1, currentProgress / (durationSec || 1));
  const activeBarsCount = Math.floor(progressFraction * WAVEFORM_HEIGHTS.length);

  return (
    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-surface-raised border border-line max-w-xs select-none">
      <button
        type="button"
        onClick={togglePlay}
        aria-label={isPlaying ? 'Pause voice note' : 'Play voice note'}
        className="w-9 h-9 rounded-full bg-brand text-surface flex items-center justify-center shrink-0 cursor-pointer hover:bg-brand/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        {isPlaying ? (
          <Pause className="w-4 h-4 fill-current" aria-hidden="true" />
        ) : (
          <Play className="w-4 h-4 fill-current ml-0.5" aria-hidden="true" />
        )}
      </button>

      <div className="flex-1 min-w-0 flex flex-col gap-1">
        {/* Waveform bars */}
        <div className="flex items-center gap-0.5 h-7">
          {WAVEFORM_HEIGHTS.map((heightClass, idx) => {
            const isBarActive = idx <= activeBarsCount;
            return (
              <span
                key={idx}
                className={`w-1 rounded-full transition-colors ${heightClass} ${
                  isBarActive ? 'bg-brand' : 'bg-line-strong'
                }`}
              />
            );
          })}
        </div>

        {/* Running timer / total duration */}
        <div className="flex items-center justify-between text-xs font-mono text-ink-muted tabular-nums">
          <span>{formatDuration(isPlaying ? currentProgress : durationSec)}</span>
          <span className="text-xs text-ink-muted">Voice note</span>
        </div>
      </div>
    </div>
  );
}

export default VoiceBubble;
