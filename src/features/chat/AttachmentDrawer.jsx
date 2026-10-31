import { useRef } from 'react';
import { Image, FileText, Sparkles } from 'lucide-react';
import { Drawer } from '../../components/common/Drawer.jsx';

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function AttachmentDrawer({ isOpen, onClose, onAttachFile }) {
  const photoInputRef = useRef(null);
  const docInputRef = useRef(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onAttachFile({
        fileName: file.name,
        fileSize: formatBytes(file.size),
        fileKind: 'photo',
      });
      onClose();
    }
  };

  const handleDocChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onAttachFile({
        fileName: file.name,
        fileSize: formatBytes(file.size),
        fileKind: 'document',
      });
      onClose();
    }
  };

  const handleSampleFile = () => {
    onAttachFile({
      fileName: 'Brochure_Maitama_Duplex.pdf',
      fileSize: '2.4 MB',
      fileKind: 'document',
    });
    onClose();
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Share File or Photo">
      <div className="space-y-3">
        {/* Hidden native file inputs */}
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoChange}
        />
        <input
          ref={docInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
          className="hidden"
          onChange={handleDocChange}
        />

        {/* Action 1: Upload Photo */}
        <button
          type="button"
          onClick={() => photoInputRef.current?.click()}
          className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-line bg-surface hover:bg-surface-raised transition-colors text-left cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-surface-raised border border-line flex items-center justify-center shrink-0 text-brand group-hover:scale-105 transition-transform">
            <Image className="w-5 h-5 text-brand" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-ink">Upload Photo</p>
            <p className="text-xs text-ink-muted">Share property photos, site inspections, or receipts</p>
          </div>
        </button>

        {/* Action 2: Upload Document */}
        <button
          type="button"
          onClick={() => docInputRef.current?.click()}
          className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-line bg-surface hover:bg-surface-raised transition-colors text-left cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-surface-raised border border-line flex items-center justify-center shrink-0 text-brand group-hover:scale-105 transition-transform">
            <FileText className="w-5 h-5 text-brand" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-ink">Upload Document</p>
            <p className="text-xs text-ink-muted">PDFs, C of O scans, deeds, or valuation reports</p>
          </div>
        </button>

        {/* Action 3: Use Sample File */}
        <button
          type="button"
          onClick={handleSampleFile}
          className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-line-strong bg-surface-raised hover:bg-surface hover:border-brand transition-colors text-left cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-brand text-surface flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="w-5 h-5 text-surface" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-ink">Use Sample File</p>
            <p className="text-xs text-ink-muted">Brochure_Maitama_Duplex.pdf (2.4 MB)</p>
          </div>
        </button>
      </div>
    </Drawer>
  );
}

export default AttachmentDrawer;
