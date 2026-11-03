import { useState, useMemo } from 'react';
import { FileText, Mic, ChevronRight } from 'lucide-react';
import { Drawer } from '../../components/common/Drawer.jsx';
import { formatDateNg } from '../../utils/formatters.js';
import { PhotoView } from './PhotoView.jsx';
import { FileDetailDrawer } from './FileDetailDrawer.jsx';

function formatDuration(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

const TABS = [
  { id: 'media', label: 'Media' },
  { id: 'documents', label: 'Documents' },
  { id: 'voice', label: 'Voice notes' },
];

export function ChannelFilesDrawer({
  isOpen,
  onClose,
  channel,
  messages = [],
  staffById = {},
  onSelectFile,
  onShowInChat,
}) {
  const [activeTab, setActiveTab] = useState('media');
  const [previewItem, setPreviewItem] = useState(null);

  // Filter messages for current channel (including thread replies) that are files or voice notes
  const channelFiles = useMemo(() => {
    if (!channel) return [];
    return messages.filter(
      (m) => m.channelId === channel.id && !m.deletedAt && (m.type === 'file' || m.type === 'voice')
    );
  }, [messages, channel]);

  const displayedItems = useMemo(() => {
    if (activeTab === 'media') {
      return channelFiles.filter((m) => m.type === 'file' && m.fileKind === 'photo');
    }
    if (activeTab === 'documents') {
      return channelFiles.filter((m) => m.type === 'file' && m.fileKind !== 'photo');
    }
    if (activeTab === 'voice') {
      return channelFiles.filter((m) => m.type === 'voice');
    }
    return [];
  }, [channelFiles, activeTab]);

  const handleItemClick = (item) => {
    if (onSelectFile) {
      onSelectFile(item);
    }
    setPreviewItem(item);
  };

  return (
    <>
      <Drawer isOpen={isOpen} onClose={onClose} title="Files & Media">
        <div className="space-y-4">
          {/* Tab switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-surface-raised border border-line rounded-xl">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer text-center ${
                    isActive
                      ? 'bg-surface text-ink shadow-2xs'
                      : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          {displayedItems.length === 0 ? (
            <div className="text-center py-12 text-xs text-ink-muted">
              Nothing shared here yet
            </div>
          ) : activeTab === 'media' ? (
            /* Media Tab: 3-column grid of square thumbnails */
            <div className="grid grid-cols-3 gap-2">
              {displayedItems.map((item) => {
                const cleanName = (item.fileName || 'photo')
                  .replace(/\.[^/.]+$/, '')
                  .replace(/_/g, ' ')
                  .trim();

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleItemClick(item)}
                    aria-label={`Open photo ${cleanName}`}
                    className="aspect-square rounded-xl border border-line overflow-hidden bg-surface-raised hover:opacity-90 transition-opacity cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand block"
                  >
                    <PhotoView
                      message={item}
                      fileName={item.fileName}
                      fit="cover"
                      className="w-full h-full"
                    />
                  </button>
                );
              })}
            </div>
          ) : (
            /* Documents & Voice Tab: standard list rows */
            <div className="space-y-2">
              {displayedItems.map((item) => {
                const sender = staffById[item.senderId];
                const senderName = sender?.name || 'Staff';
                const isVoice = item.type === 'voice';

                const title = isVoice
                  ? `Voice note, ${formatDuration(item.durationSec || 15)}`
                  : item.fileName || 'Attachment';

                const subtitle = `${senderName} · ${formatDateNg(item.createdAt)} · ${
                  isVoice ? formatDuration(item.durationSec || 15) : item.fileSize || 'File'
                }`;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleItemClick(item)}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-line bg-surface hover:bg-surface-raised transition-colors cursor-pointer text-left gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <div className="w-10 h-10 rounded-lg bg-surface-raised border border-line flex items-center justify-center text-brand shrink-0">
                        {isVoice ? (
                          <Mic className="w-5 h-5 text-brand" aria-hidden="true" />
                        ) : (
                          <FileText className="w-5 h-5 text-brand" aria-hidden="true" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-ink break-words">
                          {title}
                        </p>
                        {item.caption && (
                          <p className="text-xs text-ink-muted mt-0.5 break-words">
                            {item.caption}
                          </p>
                        )}
                        <p className="text-xs text-ink-muted mt-0.5">
                          {subtitle}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-ink-muted shrink-0" aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </Drawer>

      {/* FileDetailDrawer with showInChat={true} when opened from Files Tab */}
      <FileDetailDrawer
        isOpen={Boolean(previewItem)}
        onClose={() => setPreviewItem(null)}
        file={previewItem}
        staffById={staffById}
        showInChat={true}
        onShowInChat={(messageId) => {
          setPreviewItem(null);
          onClose();
          onShowInChat?.(messageId);
        }}
      />
    </>
  );
}

export default ChannelFilesDrawer;
