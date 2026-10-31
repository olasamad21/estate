import { Image, FileText, Mic, Download, MessageSquare } from 'lucide-react';
import { Drawer } from '../../components/common/Drawer.jsx';
import { Button } from '../../components/common/Button.jsx';
import { formatDateNg, formatTimeNg } from '../../utils/formatters.js';
import { useToast } from '../../components/common/useToast.js';
import { getFileDownloadStartedMessage } from '../../utils/messages.js';

function formatDuration(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function FileDetailDrawer({
  isOpen,
  onClose,
  file,
  staffById = {},
  onShowInChat,
}) {
  const { showToast } = useToast();

  if (!file) return null;

  const isVoice = file.type === 'voice';
  const isPhoto = file.fileKind === 'photo';
  const sender = staffById[file.senderId];
  const senderName = sender?.name || 'Staff';

  const title = isVoice
    ? `Voice note, ${formatDuration(file.durationSec || 15)}`
    : file.fileName || 'Attachment';

  const sizeOrDuration = isVoice
    ? formatDuration(file.durationSec || 15)
    : file.fileSize || 'Unknown size';

  const handleDownload = () => {
    showToast(getFileDownloadStartedMessage(file.fileName || 'Voice note'));
  };

  const handleShowInChat = () => {
    onShowInChat?.(file.id);
    onClose();
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="File Details">
      <div className="space-y-5">
        {/* Large icon & title banner */}
        <div className="flex flex-col items-center text-center p-6 bg-surface-raised border border-line rounded-2xl space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-surface border border-line flex items-center justify-center text-brand shadow-xs">
            {isPhoto ? (
              <Image className="w-8 h-8 text-brand" aria-hidden="true" />
            ) : isVoice ? (
              <Mic className="w-8 h-8 text-brand" aria-hidden="true" />
            ) : (
              <FileText className="w-8 h-8 text-brand" aria-hidden="true" />
            )}
          </div>
          <div className="space-y-1 max-w-full">
            <h3 className="text-sm font-bold text-ink break-words">
              {title}
            </h3>
            <p className="text-xs text-ink-muted">
              {sizeOrDuration} · {isPhoto ? 'Photo' : isVoice ? 'Audio' : 'Document'}
            </p>
          </div>
        </div>

        {/* Metadata section */}
        <div className="p-4 rounded-xl border border-line bg-surface space-y-2.5 text-xs">
          <div className="flex items-center justify-between py-1 border-b border-line">
            <span className="text-ink-muted">Shared by</span>
            <span className="font-semibold text-ink">{senderName}</span>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-line">
            <span className="text-ink-muted">Date</span>
            <span className="font-semibold text-ink tabular-nums">{formatDateNg(file.createdAt)}</span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-ink-muted">Time</span>
            <span className="font-semibold text-ink tabular-nums">{formatTimeNg(file.createdAt)}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-2 pt-2">
          <Button
            type="button"
            variant="primary"
            onClick={handleShowInChat}
            className="w-full justify-center gap-2 h-11"
          >
            <MessageSquare className="w-4 h-4" aria-hidden="true" />
            <span>Show in chat</span>
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={handleDownload}
            className="w-full justify-center gap-2 h-11"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            <span>Download</span>
          </Button>
        </div>
      </div>
    </Drawer>
  );
}

export default FileDetailDrawer;
