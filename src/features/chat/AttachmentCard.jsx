import { FileText, Download } from 'lucide-react';
import { useToast } from '../../components/common/useToast.js';
import { getFileDownloadStartedMessage } from '../../utils/messages.js';
import { PhotoView } from './PhotoView.jsx';

export function AttachmentCard({
  message,
  fileName = 'Document.pdf',
  fileSize = '1.5 MB',
  fileKind = 'document',
  onOpenFileDetail,
}) {
  const { showToast } = useToast();

  const isPhoto = fileKind === 'photo';
  const isPdf = (fileName || '').toLowerCase().endsWith('.pdf');
  const cleanName = (fileName || 'photo')
    .replace(/\.[^/.]+$/, '')
    .replace(/_/g, ' ')
    .trim();

  const filePayload = message || {
    id: message?.id || null,
    fileName,
    fileSize,
    fileKind,
  };

  const handleDownload = () => {
    showToast(getFileDownloadStartedMessage(fileName));
  };

  // 1. Photo messages show ONLY the 4:3 picture button
  if (isPhoto) {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onOpenFileDetail?.(filePayload);
        }}
        aria-label={`Open photo ${cleanName}`}
        className="block w-full max-w-[280px] sm:max-w-[320px] aspect-[4/3] rounded-lg border border-line overflow-hidden hover:opacity-95 transition-opacity cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand bg-surface-raised"
      >
        <PhotoView
          message={message}
          fileName={fileName}
          fit="cover"
          className="w-full h-full"
        />
      </button>
    );
  }

  // 2. Document messages keep the document row with download button
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onOpenFileDetail?.(filePayload);
      }}
      className="flex items-center justify-between gap-3 p-3 rounded-xl bg-surface-raised border border-line max-w-sm hover:bg-surface-raised/80 transition-colors cursor-pointer group"
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

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleDownload();
        }}
        aria-label={`Download ${fileName}`}
        className="w-8 h-8 rounded-lg bg-surface border border-line hover:border-brand hover:text-brand flex items-center justify-center shrink-0 text-ink-muted transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <Download className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
}

export default AttachmentCard;
