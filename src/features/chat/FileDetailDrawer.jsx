import { Download, MessageSquare, Mic } from 'lucide-react';
import { Drawer } from '../../components/common/Drawer.jsx';
import { Button } from '../../components/common/Button.jsx';
import { formatDateNg } from '../../utils/formatters.js';
import { useToast } from '../../components/common/useToast.js';
import { getFileDownloadStartedMessage } from '../../utils/messages.js';
import { PhotoView } from './PhotoView.jsx';
import { DocumentPreview } from './DocumentPreview.jsx';

function formatDuration(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function FileDetailDrawer({
  isOpen,
  onClose,
  file,
  fileItem,
  staffById = {},
  showInChat = false,
  onShowInChat,
}) {
  const { showToast } = useToast();

  const currentFile = file || fileItem;
  if (!currentFile) return null;

  const isVoice = currentFile.type === 'voice';
  const isPhoto = currentFile.fileKind === 'photo';
  const sender = staffById[currentFile.senderId];
  const senderName = sender?.name || 'Staff';

  const title = isVoice
    ? `Voice note, ${formatDuration(currentFile.durationSec || 15)}`
    : currentFile.fileName || 'Attachment';

  const size = isVoice
    ? formatDuration(currentFile.durationSec || 15)
    : currentFile.fileSize || '1.2 MB';

  const formattedDate = formatDateNg(currentFile.createdAt) || 'Today';

  const handleDownload = () => {
    showToast(getFileDownloadStartedMessage(currentFile.fileName || 'File'));
  };

  const handleShowInChat = () => {
    onShowInChat?.(currentFile.id);
    onClose();
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="File Details">
      <div className="space-y-4">
        {/* Header: file name (wrapping) and metadata subtitle */}
        <div className="space-y-1">
          <h3 className="text-base font-bold text-ink break-words">
            {title}
          </h3>
          <p className="text-xs text-ink-muted">
            Shared by {senderName} on {formattedDate}, {size}
          </p>
        </div>

        {/* Body: large PhotoView for photos, DocumentPreview for documents */}
        {isPhoto ? (
          <div className="w-full max-h-[60dvh] bg-surface-raised border border-line rounded-2xl flex items-center justify-center p-2 overflow-hidden">
            <PhotoView
              message={currentFile}
              fileName={currentFile.fileName}
              fit="contain"
              className="w-full max-h-[58dvh] rounded-xl"
            />
          </div>
        ) : isVoice ? (
          <div className="w-full p-8 bg-surface-raised border border-line rounded-2xl flex flex-col items-center justify-center gap-3">
            <div className="w-14 h-14 rounded-full bg-surface border border-line flex items-center justify-center text-brand shadow-2xs">
              <Mic className="w-7 h-7 text-brand" aria-hidden="true" />
            </div>
            <p className="text-xs font-semibold text-ink">
              Voice Note ({formatDuration(currentFile.durationSec || 15)})
            </p>
          </div>
        ) : (
          <DocumentPreview
            key={currentFile.id || currentFile.fileName}
            fileName={currentFile.fileName}
          />
        )}

        {/* Action Buttons directly UNDER the preview */}
        <div className="space-y-2 pt-2">
          <Button
            type="button"
            variant="primary"
            onClick={handleDownload}
            className="w-full justify-center gap-2 h-11"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            <span>Download</span>
          </Button>

          {showInChat && (
            <Button
              type="button"
              variant="secondary"
              onClick={handleShowInChat}
              className="w-full justify-center gap-2 h-11"
            >
              <MessageSquare className="w-4 h-4" aria-hidden="true" />
              <span>Show in chat</span>
            </Button>
          )}
        </div>
      </div>
    </Drawer>
  );
}

export default FileDetailDrawer;
