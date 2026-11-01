import { useMemo } from 'react';

/**
 * Generates a stable hash (0 to 3) based on fileName character codes.
 */
function getVariantIndex(fileName = '') {
  let sum = 0;
  for (let i = 0; i < fileName.length; i++) {
    sum += fileName.charCodeAt(i);
  }
  return sum % 4;
}

/**
 * PhotoPlaceholder renders an SVG illustration (4:3 ratio) corresponding to one of 4 variants:
 * 0: House exterior
 * 1: Interior room
 * 2: Terrace with city skyline
 * 3: Building site
 */
export function PhotoPlaceholder({ fileName = '', className = 'w-full h-full' }) {
  const variant = useMemo(() => getVariantIndex(fileName), [fileName]);
  const cleanName = useMemo(() => {
    return (fileName || 'photo')
      .replace(/\.[^/.]+$/, '')
      .replace(/_/g, ' ')
      .trim();
  }, [fileName]);

  const ariaLabel = `Photo: ${cleanName}`;

  return (
    <svg
      viewBox="0 0 400 300"
      role="img"
      aria-label={ariaLabel}
      className={`block select-none ${className}`}
    >
      {variant === 0 && (
        <g>
          {/* Variant 0: House Exterior */}
          {/* Sky */}
          <rect width="400" height="210" className="fill-surface-raised" />
          {/* Ground */}
          <rect y="210" width="400" height="90" className="fill-line" />
          {/* House body */}
          <rect x="75" y="115" width="170" height="105" className="fill-surface stroke-line-strong" strokeWidth="2" />
          {/* Roof */}
          <polygon points="65,115 160,40 255,115" className="fill-line-strong" />
          {/* Door */}
          <rect x="135" y="155" width="40" height="65" className="fill-ink-muted" />
          {/* Door handle */}
          <circle cx="168" cy="188" r="3" className="fill-surface" />
          {/* Windows */}
          <rect x="90" y="135" width="32" height="32" className="fill-surface-raised stroke-line-strong" strokeWidth="1.5" />
          <line x1="106" y1="135" x2="106" y2="167" className="stroke-line-strong" strokeWidth="1.5" />
          <line x1="90" y1="151" x2="122" y2="151" className="stroke-line-strong" strokeWidth="1.5" />

          <rect x="195" y="135" width="32" height="32" className="fill-surface-raised stroke-line-strong" strokeWidth="1.5" />
          <line x1="211" y1="135" x2="211" y2="167" className="stroke-line-strong" strokeWidth="1.5" />
          <line x1="195" y1="151" x2="227" y2="151" className="stroke-line-strong" strokeWidth="1.5" />

          {/* Tree */}
          <rect x="295" y="150" width="16" height="70" className="fill-line-strong" />
          <circle cx="303" cy="135" r="42" className="fill-status-success-bg stroke-status-success-line" strokeWidth="2" />
          <circle cx="295" cy="125" r="28" className="fill-status-success-line" />
        </g>
      )}

      {variant === 1 && (
        <g>
          {/* Variant 1: Interior Room */}
          {/* Wall */}
          <rect width="400" height="195" className="fill-surface-raised" />
          {/* Floor */}
          <rect y="195" width="400" height="105" className="fill-line" />
          <line x1="0" y1="195" x2="400" y2="195" className="stroke-line-strong" strokeWidth="2" />

          {/* Large Window */}
          <rect x="40" y="30" width="110" height="120" className="fill-surface stroke-line-strong" strokeWidth="2" />
          <line x1="95" y1="30" x2="95" y2="150" className="stroke-line-strong" strokeWidth="2" />
          <line x1="40" y1="90" x2="150" y2="90" className="stroke-line-strong" strokeWidth="2" />

          {/* Rug */}
          <ellipse cx="230" cy="245" rx="100" ry="28" className="fill-surface stroke-line" strokeWidth="1.5" />

          {/* Sofa */}
          <rect x="145" y="165" width="170" height="55" rx="8" className="fill-line-strong" />
          <rect x="155" y="130" width="150" height="42" rx="6" className="fill-ink-muted" />
          <rect x="165" y="145" width="35" height="22" rx="4" className="fill-status-warning-bg stroke-status-warning-line" strokeWidth="1" />
          <rect x="255" y="145" width="35" height="22" rx="4" className="fill-status-warning-bg stroke-status-warning-line" strokeWidth="1" />

          {/* Standing Lamp */}
          <polygon points="330,240 360,240 345,185" className="fill-line-strong" />
          <line x1="345" y1="185" x2="345" y2="75" className="stroke-ink-muted" strokeWidth="2.5" />
          <polygon points="330,75 360,75 370,110 320,110" className="fill-status-warning-bg stroke-status-warning-line" strokeWidth="1.5" />
        </g>
      )}

      {variant === 2 && (
        <g>
          {/* Variant 2: Terrace with city skyline */}
          {/* Sky */}
          <rect width="400" height="235" className="fill-surface-raised" />
          {/* Sun */}
          <circle cx="310" cy="65" r="30" className="fill-status-warning-bg stroke-status-warning-line" strokeWidth="2" />

          {/* Skyline Buildings */}
          <rect x="30" y="85" width="55" height="150" className="fill-line" />
          <rect x="95" y="45" width="70" height="190" className="fill-line-strong" />
          <rect x="175" y="105" width="55" height="130" className="fill-line" />
          <rect x="240" y="75" width="65" height="160" className="fill-surface stroke-line" strokeWidth="1.5" />
          <rect x="315" y="115" width="60" height="120" className="fill-line-strong" />

          {/* Window dots on central building */}
          <rect x="110" y="60" width="8" height="10" className="fill-surface" />
          <rect x="135" y="60" width="8" height="10" className="fill-surface" />
          <rect x="110" y="85" width="8" height="10" className="fill-surface" />
          <rect x="135" y="85" width="8" height="10" className="fill-surface" />
          <rect x="110" y="110" width="8" height="10" className="fill-surface" />
          <rect x="135" y="110" width="8" height="10" className="fill-surface" />

          {/* Terrace Floor */}
          <rect y="235" width="400" height="65" className="fill-line" />
          <line x1="0" y1="235" x2="400" y2="235" className="stroke-line-strong" strokeWidth="2" />

          {/* Terrace Railing */}
          <line x1="0" y1="210" x2="400" y2="210" className="stroke-ink-muted" strokeWidth="3" />
          <line x1="40" y1="210" x2="40" y2="235" className="stroke-ink-muted" strokeWidth="2" />
          <line x1="100" y1="210" x2="100" y2="235" className="stroke-ink-muted" strokeWidth="2" />
          <line x1="160" y1="210" x2="160" y2="235" className="stroke-ink-muted" strokeWidth="2" />
          <line x1="220" y1="210" x2="220" y2="235" className="stroke-ink-muted" strokeWidth="2" />
          <line x1="280" y1="210" x2="280" y2="235" className="stroke-ink-muted" strokeWidth="2" />
          <line x1="340" y1="210" x2="340" y2="235" className="stroke-ink-muted" strokeWidth="2" />
        </g>
      )}

      {variant === 3 && (
        <g>
          {/* Variant 3: Building Site */}
          {/* Sky */}
          <rect width="400" height="190" className="fill-surface-raised" />
          {/* Ground */}
          <rect y="190" width="400" height="110" className="fill-line" />
          <line x1="0" y1="190" x2="400" y2="190" className="stroke-line-strong" strokeWidth="2" />

          {/* Crane */}
          <line x1="90" y1="190" x2="90" y2="35" className="stroke-ink-muted" strokeWidth="3" />
          <line x1="40" y1="45" x2="200" y2="45" className="stroke-ink-muted" strokeWidth="3" />
          <rect x="35" y="40" width="18" height="12" className="fill-line-strong" />
          <line x1="170" y1="45" x2="170" y2="95" className="stroke-ink" strokeWidth="1.5" />
          <circle cx="170" cy="98" r="3" className="fill-ink" />

          {/* Half-Built Block */}
          <rect x="180" y="95" width="140" height="95" className="fill-surface stroke-line-strong" strokeWidth="2" />
          {/* Unfinished slab */}
          <rect x="175" y="95" width="150" height="8" className="fill-line-strong" />
          {/* Exposed Pillars */}
          <rect x="190" y="75" width="12" height="20" className="fill-line-strong" />
          <rect x="240" y="75" width="12" height="20" className="fill-line-strong" />
          <rect x="290" y="75" width="12" height="20" className="fill-line-strong" />
          {/* Scaffold Lines */}
          <line x1="175" y1="125" x2="325" y2="125" className="stroke-line-strong" strokeWidth="1.5" strokeDasharray="4 3" />
          <line x1="175" y1="155" x2="325" y2="155" className="stroke-line-strong" strokeWidth="1.5" strokeDasharray="4 3" />

          {/* Fence Posts */}
          <line x1="20" y1="210" x2="20" y2="250" className="stroke-ink-muted" strokeWidth="3" />
          <line x1="70" y1="210" x2="70" y2="250" className="stroke-ink-muted" strokeWidth="3" />
          <line x1="120" y1="210" x2="120" y2="250" className="stroke-ink-muted" strokeWidth="3" />
          <line x1="170" y1="210" x2="170" y2="250" className="stroke-ink-muted" strokeWidth="3" />
          <line x1="10" y1="225" x2="180" y2="225" className="stroke-ink-muted" strokeWidth="2" />
        </g>
      )}
    </svg>
  );
}

export default PhotoPlaceholder;
