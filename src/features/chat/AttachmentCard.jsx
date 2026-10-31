import { FileText, Image, Download } from 'lucide-react';
import { useToast } from '../../components/common/useToast.js';
import { getFileDownloadStartedMessage } from '../../utils/messages.js';

export function AttachmentCard({
  fileName = 'Document.pdf',
  fileSize = '1.5 MB',
  fileKind = 'document',
}) {
  const { showToast } = useToast();

  const isPhoto = fileKind === 'photo';

  const handleDownload = () => {
    showToast(getFileDownloadStartedMessage(fileName), 'info');
  };

  return (
    <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-surface-raised border border-line max-w-sm">
      <div className="flex items-center gap-2.5 min-w-0 pr-2">
        <div className="w-9 h-9 rounded-lg bg-surface border border-line flex items-center justify-center shrink-0 text-brand">
          {isPhoto ? (
            <Image className="w-5 h-5 text-brand" aria-hidden="true" />
          ) : (
            <FileText className="w-5 h-5 text-brand" aria-hidden="true" />
          )}
        </div>

        <div className="min-w-0">
          <p className="text-xs font-bold text-ink overflow-hidden text-ellipsis whitespace-nowrap">
            {fileName}
          </p>
          <p className="text-xs text-ink-muted">
            {fileSize} · {isPhoto ? 'Photo' : 'Document'}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleDownload}
        aria-label={`Download ${fileName}`}
        className="w-8 h-8 rounded-lg bg-surface border border-line hover:border-brand hover:text-brand flex items-center justify-center shrink-0 text-ink-muted transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <Download className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
}

export default AttachmentCard;
