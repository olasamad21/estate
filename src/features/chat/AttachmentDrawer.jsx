import { useRef, useState } from 'react';
import { Image, Video, FileText, Sparkles, UserPlus, Building2, Camera } from 'lucide-react';
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
  const [isTouchDevice] = useState(() => (
    typeof window !== 'undefined' && Boolean(window.matchMedia?.('(pointer: coarse)')?.matches)
  ));
  const photoInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const cameraPhotoInputRef = useRef(null);
  const cameraVideoInputRef = useRef(null);
  const docInputRef = useRef(null);
  const [videoError, setVideoError] = useState(null);

  const showPostLead = canPostLead(currentUser, channel);
  const showShareListing = canShareListing(currentUser, channel);

  const handleClose = () => {
    setVideoError(null);
    onClose();
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoError(null);
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

  const handleVideoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoError(null);

    // Limit 1: Size at most 100 MB (100 * 1024 * 1024 bytes)
    const maxSizeBytes = 100 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setVideoError('This video is too large. The limit is about 100 MB or 2 minutes.');
      e.target.value = '';
      return;
    }

    // Limit 2: Duration at most 120 seconds via temporary video element
    const tempUrl = URL.createObjectURL(file);
    const tempVideo = document.createElement('video');
    tempVideo.preload = 'metadata';

    let isFinished = false;
    const cleanupAndProceed = (duration, width = null, height = null) => {
      if (isFinished) return;
      isFinished = true;
      try {
        URL.revokeObjectURL(tempUrl);
      } catch {
        // ignore
      }
      e.target.value = '';

      if (duration !== null && duration > 120) {
        setVideoError('This video is too large. The limit is about 100 MB or 2 minutes.');
        return;
      }

      const objectUrl = URL.createObjectURL(file);
      const durationSec = duration !== null ? Math.round(duration) : null;
      if (onSelectAttachment) {
        onSelectAttachment({
          file,
          fileName: file.name,
          fileSize: formatBytes(file.size),
          fileKind: 'video',
          type: 'video',
          durationSec,
          width: width ?? null,
          height: height ?? null,
          objectUrl,
          isSample: false,
        });
      } else {
        const msgId = onAttachFile?.({
          fileName: file.name,
          fileSize: formatBytes(file.size),
          fileKind: 'video',
          type: 'video',
          durationSec,
          width: width ?? null,
          height: height ?? null,
          isSample: false,
        });
        if (objectUrl && msgId) {
          setPreviewUrl(msgId, objectUrl);
        }
      }
      onClose();
    };

    tempVideo.onloadedmetadata = () => {
      const dur = tempVideo.duration;
      const w = typeof tempVideo.videoWidth === 'number' && tempVideo.videoWidth > 0 ? tempVideo.videoWidth : null;
      const h = typeof tempVideo.videoHeight === 'number' && tempVideo.videoHeight > 0 ? tempVideo.videoHeight : null;
      if (Number.isFinite(dur) && dur > 0) {
        cleanupAndProceed(dur, w, h);
      } else {
        cleanupAndProceed(null, w, h);
      }
    };

    tempVideo.onerror = () => {
      // If duration cannot be read but size is fine, allow it with duration unknown
      cleanupAndProceed(null);
    };

    tempVideo.src = tempUrl;
  };

  const handleDocChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoError(null);
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
    setVideoError(null);
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

  const handleSampleVideo = () => {
    setVideoError(null);
    if (onSelectAttachment) {
      onSelectAttachment({
        fileName: 'Site_Walkthrough_Maitama.mp4',
        fileSize: '34.9 MB',
        fileKind: 'video',
        type: 'video',
        durationSec: 75,
        width: 1280,
        height: 720,
        objectUrl: null,
        isSample: true,
      });
    } else {
      onAttachFile?.({
        fileName: 'Site_Walkthrough_Maitama.mp4',
        fileSize: '34.9 MB',
        fileKind: 'video',
        type: 'video',
        durationSec: 75,
        width: 1280,
        height: 720,
        isSample: true,
      });
    }
    onClose();
  };

  const handleSampleDoc = () => {
    setVideoError(null);
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
    <Drawer isOpen={isOpen} onClose={handleClose} title="Share File or Photo">
      <div className="space-y-3">
        {videoError && (
          <div className="p-3 rounded-xl bg-status-danger-bg border border-status-danger-line text-xs text-status-danger space-y-1">
            <p className="font-medium">{videoError}</p>
            <p className="text-ink-muted">Try a shorter recording.</p>
          </div>
        )}

        {/* Hidden native file inputs */}
        {isTouchDevice && (
          <>
            <input
              ref={cameraPhotoInputRef}
              name="attach_camera_photo"
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handlePhotoChange}
            />
            <input
              ref={cameraVideoInputRef}
              name="attach_camera_video"
              type="file"
              accept="video/*"
              capture="environment"
              className="hidden"
              onChange={handleVideoChange}
            />
          </>
        )}
        <input
          ref={photoInputRef}
          name="attach_photo"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoChange}
        />
        <input
          ref={videoInputRef}
          name="attach_video"
          type="file"
          accept="video/*"
          className="hidden"
          onChange={handleVideoChange}
        />
        <input
          ref={docInputRef}
          name="attach_document"
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
          className="hidden"
          onChange={handleDocChange}
        />

        {/* Touch only: Take photo */}
        {isTouchDevice && (
          <button
            type="button"
            onClick={() => cameraPhotoInputRef.current?.click()}
            className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-line bg-surface hover:bg-surface-raised transition-colors text-left cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-surface-raised border border-line flex items-center justify-center shrink-0 text-brand group-hover:scale-105 transition-transform">
              <Camera className="w-5 h-5 text-brand" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-ink">Take photo</p>
              <p className="text-xs text-ink-muted">Capture property photo with camera</p>
            </div>
          </button>
        )}

        {/* Touch only: Record video */}
        {isTouchDevice && (
          <button
            type="button"
            onClick={() => cameraVideoInputRef.current?.click()}
            className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-line bg-surface hover:bg-surface-raised transition-colors text-left cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-surface-raised border border-line flex items-center justify-center shrink-0 text-brand group-hover:scale-105 transition-transform">
              <Video className="w-5 h-5 text-brand" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-ink">Record video</p>
              <p className="text-xs text-ink-muted">Record walkthrough with camera</p>
            </div>
          </button>
        )}

        {/* Option 1: Choose photo */}
        <button
          type="button"
          onClick={() => photoInputRef.current?.click()}
          className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-line bg-surface hover:bg-surface-raised transition-colors text-left cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-surface-raised border border-line flex items-center justify-center shrink-0 text-brand group-hover:scale-105 transition-transform">
            <Image className="w-5 h-5 text-brand" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-ink">Choose photo</p>
            <p className="text-xs text-ink-muted">Share property photos or site inspections</p>
          </div>
        </button>

        {/* Option: Choose video */}
        <button
          type="button"
          onClick={() => videoInputRef.current?.click()}
          className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-line bg-surface hover:bg-surface-raised transition-colors text-left cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-surface-raised border border-line flex items-center justify-center shrink-0 text-brand group-hover:scale-105 transition-transform">
            <Video className="w-5 h-5 text-brand" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-ink">Choose video</p>
            <p className="text-xs text-ink-muted">Share property walkthroughs or site recordings</p>
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

        {/* Option: Use a sample video */}
        <button
          type="button"
          onClick={handleSampleVideo}
          className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-line-strong bg-surface-raised hover:bg-surface hover:border-brand transition-colors text-left cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-brand text-surface flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="w-5 h-5 text-surface" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-ink">Use a sample video</p>
            <p className="text-xs text-ink-muted">Site_Walkthrough_Maitama.mp4 (34.9 MB)</p>
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
              handleClose();
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
              handleClose();
              onOpenShareListing?.();
            }}
            className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-line bg-surface hover:bg-surface-raised transition-colors text-left cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-surface-raised border border-line flex items-center justify-center shrink-0 text-brand group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5 text-brand" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-ink">Share a property</p>
              <p className="text-xs text-ink-muted">Share an existing property into this channel</p>
            </div>
          </button>
        )}
      </div>
    </Drawer>
  );
}

export default AttachmentDrawer;
