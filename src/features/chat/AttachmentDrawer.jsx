import { useRef } from 'react';
import { Image, FileText, Sparkles, UserPlus, Building2 } from 'lucide-react';
import { Drawer } from '../../components/common/Drawer.jsx';
import { setPreviewUrl } from '../../utils/previewUrls.js';
import { useChat } from '../../context/ChatContext.jsx';
import { canPostLead, canShareListing } from '../../utils/chat.js';

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function AttachmentDrawer({
  isOpen,
  onClose,
  onAttachFile,
  onSelectAttachment,
  channel,
  onOpenPostLead,
  onOpenShareListing,
}) {
  const { currentUser } = useChat();
  const photoInputRef = useRef(null);
  const docInputRef = useRef(null);

  const showPostLead = canPostLead(currentUser, channel);
  const showShareListing = canShareListing(currentUser, channel);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = file.type?.startsWith('image/') ? URL.createObjectURL(file) : null;
      if (onSelectAttachment) {
        onSelectAttachment({
          file,
          fileName: file.name,
          fileSize: formatBytes(file.size),
          fileKind: 'photo',
          objectUrl,
          isSample: false,
        });
      } else {
        const msgId = onAttachFile?.({
          fileName: file.name,
          fileSize: formatBytes(file.size),
          fileKind: 'photo',
        });
        if (objectUrl && msgId) {
          setPreviewUrl(msgId, objectUrl);
        }
      }
      e.target.value = '';
      onClose();
    }
  };

  const handleDocChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (onSelectAttachment) {
        onSelectAttachment({
          file,
          fileName: file.name,
          fileSize: formatBytes(file.size),
          fileKind: 'document',
          objectUrl: null,
          isSample: false,
        });
      } else {
        onAttachFile?.({
          fileName: file.name,
          fileSize: formatBytes(file.size),
          fileKind: 'document',
        });
      }
      e.target.value = '';
      onClose();
    }
  };

  const handleSamplePhoto = () => {
    if (onSelectAttachment) {
      onSelectAttachment({
        fileName: 'Site_Photo_Maitama.jpg',
        fileSize: '2.8 MB',
        fileKind: 'photo',
        objectUrl: null,
        isSample: true,
      });
    } else {
      onAttachFile?.({
        fileName: 'Site_Photo_Maitama.jpg',
        fileSize: '2.8 MB',
        fileKind: 'photo',
      });
    }
    onClose();
  };

  const handleSampleDoc = () => {
    if (onSelectAttachment) {
      onSelectAttachment({
        fileName: 'Brochure_Maitama_Duplex.pdf',
        fileSize: '2.4 MB',
        fileKind: 'document',
        objectUrl: null,
        isSample: true,
      });
    } else {
      onAttachFile?.({
        fileName: 'Brochure_Maitama_Duplex.pdf',
        fileSize: '2.4 MB',
        fileKind: 'document',
      });
    }
    onClose();
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Share File or Photo">
      <div className="space-y-3">
        {/* Hidden native file inputs */}
        <input
          ref={photoInputRef}
          name="attach_photo"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoChange}
        />
        <input
          ref={docInputRef}
          name="attach_document"
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
          className="hidden"
          onChange={handleDocChange}
        />

        {/* Option 1: Photo */}
        <button
          type="button"
          onClick={() => photoInputRef.current?.click()}
          className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-line bg-surface hover:bg-surface-raised transition-colors text-left cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-surface-raised border border-line flex items-center justify-center shrink-0 text-brand group-hover:scale-105 transition-transform">
            <Image className="w-5 h-5 text-brand" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-ink">Photo</p>
            <p className="text-xs text-ink-muted">Share property photos or site inspections</p>
          </div>
        </button>

        {/* Option 2: Document */}
        <button
          type="button"
          onClick={() => docInputRef.current?.click()}
          className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-line bg-surface hover:bg-surface-raised transition-colors text-left cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-surface-raised border border-line flex items-center justify-center shrink-0 text-brand group-hover:scale-105 transition-transform">
            <FileText className="w-5 h-5 text-brand" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-ink">Document</p>
            <p className="text-xs text-ink-muted">PDFs, C of O scans, deeds, or valuation reports</p>
          </div>
        </button>

        {/* Option 3: Use a sample photo */}
        <button
          type="button"
          onClick={handleSamplePhoto}
          className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-line-strong bg-surface-raised hover:bg-surface hover:border-brand transition-colors text-left cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-brand text-surface flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="w-5 h-5 text-surface" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-ink">Use a sample photo</p>
            <p className="text-xs text-ink-muted">Site_Photo_Maitama.jpg (2.8 MB)</p>
          </div>
        </button>

        {/* Option 4: Use a sample document */}
        <button
          type="button"
          onClick={handleSampleDoc}
          className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-line bg-surface hover:bg-surface-raised transition-colors text-left cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-surface-raised border border-line flex items-center justify-center shrink-0 text-brand">
            <Sparkles className="w-5 h-5 text-brand" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-ink">Use a sample document</p>
            <p className="text-xs text-ink-muted">Brochure_Maitama_Duplex.pdf (2.4 MB)</p>
          </div>
        </button>

        {/* Option 5: Post a lead (Admin/Manager only on leads channels) */}
        {showPostLead && (
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenPostLead?.();
            }}
            className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-line bg-surface hover:bg-surface-raised transition-colors text-left cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-surface-raised border border-line flex items-center justify-center shrink-0 text-brand group-hover:scale-105 transition-transform">
              <UserPlus className="w-5 h-5 text-brand" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-ink">Post a lead</p>
              <p className="text-xs text-ink-muted">Share client enquiry with budget and requirements</p>
            </div>
          </button>
        )}

        {/* Option 6: Share a listing (Admin/Manager only) */}
        {showShareListing && (
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenShareListing?.();
            }}
            className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-line bg-surface hover:bg-surface-raised transition-colors text-left cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-surface-raised border border-line flex items-center justify-center shrink-0 text-brand group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5 text-brand" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-ink">Share a listing</p>
              <p className="text-xs text-ink-muted">Share an existing property listing room into this channel</p>
            </div>
          </button>
        )}
      </div>
    </Drawer>
  );
}

export default AttachmentDrawer;
