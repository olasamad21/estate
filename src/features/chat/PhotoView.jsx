import { useState } from 'react';
import { getPreviewUrl } from '../../utils/previewUrls.js';
import { PhotoPlaceholder } from './PhotoPlaceholder.jsx';

/**
 * PhotoView renders an <img> with an object URL when available from getPreviewUrl,
 * falling back to PhotoPlaceholder on missing URL or image load error.
 *
 * Props:
 * - message: message object with { id, fileName }
 * - id: optional fallback message id
 * - fileName: optional fallback file name
 * - className: custom class string
 * - fit: 'cover' | 'contain' (default 'cover')
 */
export function PhotoView({
  message,
  id,
  fileName,
  className = '',
  fit = 'cover',
}) {
  const targetId = message?.id || id;
  const targetFileName = message?.fileName || fileName || 'photo';

  const objectUrl = getPreviewUrl(targetId);
  const [hasError, setHasError] = useState(false);

  const cleanName = (targetFileName || 'photo')
    .replace(/\.[^/.]+$/, '')
    .replace(/_/g, ' ')
    .trim();

  if (objectUrl && !hasError) {
    return (
      <img
        src={objectUrl}
        alt={`Photo: ${cleanName}`}
        className={`block ${fit === 'contain' ? 'object-contain' : 'object-cover'} ${className}`}
        onError={() => setHasError(true)}
      />
    );
  }

  return (
    <PhotoPlaceholder
      fileName={targetFileName}
      className={className}
    />
  );
}

export default PhotoView;
