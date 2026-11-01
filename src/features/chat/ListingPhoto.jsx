import { useState } from 'react';
import { getPreviewUrl } from '../../utils/previewUrls.js';
import { PhotoPlaceholder } from './PhotoPlaceholder.jsx';

/**
 * ListingPhoto renders an <img> with an object URL when registered under `listing:<channelId>`,
 * falling back to PhotoPlaceholder keyed by title/id when missing or on load error.
 *
 * Props:
 * - channel: optional channel object with { id, title }
 * - channelId: optional channel id string
 * - title: optional title fallback
 * - fit: 'cover' | 'contain' (default 'cover')
 * - className: custom class string
 */
export function ListingPhoto({
  channel,
  channelId,
  title,
  fit = 'cover',
  className = 'w-full h-full',
}) {
  const targetId = channel?.id || channelId;
  const targetTitle = channel?.title || title || targetId || 'Listing';

  const objectUrl = targetId
    ? getPreviewUrl(`listing:${targetId}`) || getPreviewUrl(targetId)
    : null;
  const [hasError, setHasError] = useState(false);

  if (objectUrl && !hasError) {
    return (
      <img
        src={objectUrl}
        alt={`Photo: ${targetTitle}`}
        className={`block ${fit === 'contain' ? 'object-contain' : 'object-cover'} ${className}`}
        onError={() => setHasError(true)}
      />
    );
  }

  return (
    <PhotoPlaceholder
      fileName={`${targetId || targetTitle}.jpg`}
      className={className}
    />
  );
}

export default ListingPhoto;
