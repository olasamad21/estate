const previewMap = new Map();

/**
 * Register an object URL for a given message ID.
 */
export function setPreviewUrl(id, url) {
  if (id && url) {
    previewMap.set(id, url);
  }
}

/**
 * Retrieve the object URL for a given message ID, returning null when missing.
 */
export function getPreviewUrl(id) {
  if (!id) return null;
  return previewMap.get(id) || null;
}
