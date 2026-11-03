import { useState, useRef } from 'react';
import { FileText } from 'lucide-react';
import { Drawer } from '../../components/common/Drawer.jsx';
import { Button } from '../../components/common/Button.jsx';
import { PhotoPlaceholder } from './PhotoPlaceholder.jsx';

export function AttachmentPreviewDrawer({
  isOpen,
  onClose,
  attachment,
  onSend,
}) {
  const [caption, setCaption] = useState('');
  const textareaRef = useRef(null);

  if (!attachment) return null;

  const isPhoto = attachment.fileKind === 'photo';
  const isPdf = (attachment.fileName || '').toLowerCase().endsWith('.pdf');
  const title = isPhoto ? 'Send photo' : 'Send document';

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
      panelClassName="h-[100dvh] max-h-[100dvh] rounded-none sm:h-auto sm:max-h-[85dvh] sm:rounded-t-2xl lg:self-center lg:max-h-[90dvh] lg:max-w-lg lg:rounded-2xl lg:border"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
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
      }
    >
      <div className="space-y-4">
        {/* Preview Area */}
        {isPhoto ? (
          attachment.isSample ? (
            <div className="w-full max-h-[55dvh] rounded-xl overflow-hidden bg-surface-raised border border-line flex items-center justify-center aspect-[4/3]">
              <PhotoPlaceholder
                fileName={attachment.fileName}
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="w-full max-h-[55dvh] rounded-xl overflow-hidden bg-surface-raised border border-line flex items-center justify-center p-2">
              {attachment.objectUrl ? (
                <img
                  src={attachment.objectUrl}
                  alt={attachment.fileName || 'Photo preview'}
                  className="w-full max-h-[50dvh] object-contain rounded-lg"
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
      </div>
    </Drawer>
  );
}

export default AttachmentPreviewDrawer;
