import { useState, useRef } from 'react';
import { FileText, Play } from 'lucide-react';
import { Drawer } from '../../components/common/Drawer.jsx';
import { Button } from '../../components/common/Button.jsx';
import { PhotoPlaceholder } from './PhotoPlaceholder.jsx';

function formatDuration(sec) {
  if (sec === null || sec === undefined) return 'Duration unknown';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function AttachmentPreviewDrawer({
  isOpen,
  onClose,
  attachment,
  onSend,
}) {
  const [caption, setCaption] = useState('');
  const textareaRef = useRef(null);

  const isDirty = Boolean(caption.trim());

  if (!attachment) return null;

  const isVideo = attachment.type === 'video' || attachment.fileKind === 'video';
  const isPhoto = attachment.fileKind === 'photo';
  const isPdf = (attachment.fileName || '').toLowerCase().endsWith('.pdf');
  const title = isVideo ? 'Send video' : isPhoto ? 'Send photo' : 'Send document';

  const handleCaptionChange = (e) => {
    const val = e.target.value.slice(0, 300);
    setCaption(val);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 120);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  };

  const handleSend = () => {
    onSend?.({
      caption: caption.trim(),
    });
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      variant="form"
      isDirty={isDirty}
      discardTitle="Discard this message?"
      panelClassName="lg:max-w-lg"
    >
      <div className="space-y-4 flex-1 flex flex-col">
        {/* Preview Area */}
        {isVideo ? (
          <div className="space-y-2">
            {attachment.isSample ? (
              <div
                className="relative w-full max-h-[calc(var(--app-h,100dvh)*0.55)] rounded-xl overflow-hidden bg-surface-raised border border-line flex items-center justify-center mx-auto"
                style={{
                  aspectRatio: (attachment.width && attachment.height)
                    ? `${attachment.width} / ${attachment.height}`
                    : '16 / 9',
                }}
              >
                <PhotoPlaceholder
                  fileName={attachment.fileName}
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-14 h-14 rounded-full bg-surface/90 border border-line flex items-center justify-center text-ink shadow-md">
                    <Play className="w-7 h-7 fill-current ml-0.5" aria-hidden="true" />
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="w-full max-h-[calc(var(--app-h,100dvh)*0.55)] rounded-xl overflow-hidden bg-surface-raised border border-line flex items-center justify-center p-2 mx-auto"
                style={{
                  aspectRatio: (attachment.width && attachment.height)
                    ? `${attachment.width} / ${attachment.height}`
                    : '16 / 9',
                }}
              >
                {attachment.objectUrl ? (
                  <video
                    src={attachment.objectUrl}
                    controls
                    playsInline
                    preload="metadata"
                    className="w-full max-h-[calc(var(--app-h,100dvh)*0.5)] object-contain rounded-lg"
                  />
                ) : (
                  <PhotoPlaceholder
                    fileName={attachment.fileName}
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
            )}
            <div className="flex items-center justify-between text-xs text-ink-muted px-1">
              <span className="font-medium text-ink break-words">{attachment.fileName}</span>
              <span className="tabular-nums shrink-0">
                {attachment.fileSize} · {formatDuration(attachment.durationSec)}
              </span>
            </div>
          </div>
        ) : isPhoto ? (
          attachment.isSample ? (
            <div className="w-full max-h-[calc(var(--app-h,100dvh)*0.55)] rounded-xl overflow-hidden bg-surface-raised border border-line flex items-center justify-center aspect-[4/3]">
              <PhotoPlaceholder
                fileName={attachment.fileName}
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="w-full max-h-[calc(var(--app-h,100dvh)*0.55)] rounded-xl overflow-hidden bg-surface-raised border border-line flex items-center justify-center p-2">
              {attachment.objectUrl ? (
                <img
                  src={attachment.objectUrl}
                  alt={attachment.fileName || 'Photo preview'}
                  className="w-full max-h-[calc(var(--app-h,100dvh)*0.5)] object-contain rounded-lg"
                />
              ) : (
                <PhotoPlaceholder
                  fileName={attachment.fileName}
                  className="w-full h-full object-contain"
                />
              )}
            </div>
          )
        ) : (
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-surface-raised border border-line w-full">
            <div className="w-10 h-10 rounded-lg bg-surface border border-line flex items-center justify-center shrink-0 text-brand">
              <FileText className="w-5 h-5 text-brand" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-ink break-words">
                {attachment.fileName}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-ink-muted mt-0.5">
                <span className="tabular-nums">{attachment.fileSize}</span>
                {isPdf && (
                  <>
                    <span>·</span>
                    <span className="font-semibold text-ink-muted uppercase">
                      PDF
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Caption Field */}
        <div className="space-y-1">
          <label htmlFor="attachment_caption" className="sr-only">
            Add a caption
          </label>
          <textarea
            id="attachment_caption"
            ref={textareaRef}
            name="attachment_caption"
            value={caption}
            onChange={handleCaptionChange}
            onKeyDown={handleKeyDown}
            placeholder="Add a caption"
            rows={2}
            maxLength={300}
            className="w-full resize-none rounded-xl border border-line bg-surface p-3 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:border-brand max-h-32 leading-relaxed"
          />
          {caption.length >= 250 && (
            <div className="flex justify-end text-xs text-ink-muted tabular-nums">
              {caption.length}/300
            </div>
          )}
        </div>
        {/* Actions */}
        <div className="sticky bottom-0 bg-surface border-t border-line py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] flex items-center justify-end gap-3 -mx-5 px-5 mt-auto">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="min-h-[44px] px-4"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSend}
            className="min-h-[44px] px-6 text-sm font-semibold justify-center"
          >
            Send
          </Button>
        </div>
      </div>
    </Drawer>
  );
}

export default AttachmentPreviewDrawer;
