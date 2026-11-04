import { useState } from 'react';
import { getPreviewUrl } from '../../utils/previewUrls.js';
import { PhotoPlaceholder } from './PhotoPlaceholder.jsx';
import { CHANNELS_BY_ID } from '../../mock/channels.js';

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
  previewKey,
}) {
  const targetId = channel?.id || channelId;
  const resolvedChannel = channel || (targetId && CHANNELS_BY_ID ? CHANNELS_BY_ID[targetId] : null);
  const targetTitle = resolvedChannel?.title || title || targetId || 'Property';

  const defaultKey = resolvedChannel?.kind === 'site' ? `site:${targetId}` : `listing:${targetId}`;
  const effectiveKey = previewKey || (targetId ? defaultKey : null);

  const staticPhotoUrl =
    resolvedChannel?.listing?.photoUrl ||
    resolvedChannel?.site?.photoUrl ||
    resolvedChannel?.photoUrl ||
    null;

  const objectUrl = effectiveKey
    ? getPreviewUrl(effectiveKey) || (targetId ? getPreviewUrl(targetId) : null) || staticPhotoUrl
    : staticPhotoUrl;
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
