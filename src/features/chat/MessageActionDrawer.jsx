import { useState } from 'react';
import {
  MessageSquare,
  Pin,
  PinOff,
  Pencil,
  Trash2,
  Copy,
  AlertTriangle,
} from 'lucide-react';
import { Drawer } from '../../components/common/Drawer.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { Button } from '../../components/common/Button.jsx';
import { PRIMARY_REACTIONS } from '../../config/reactions.js';
import { canEdit, canDelete, canPin } from '../../utils/chat.js';
import { useToast } from '../../components/common/useToast.js';
import { getMessageCopiedMessage, getMessageDeletedMessage } from '../../utils/messages.js';

export function MessageActionDrawer({
  isOpen,
  onClose,
  message,
  currentUser,
  onReact,
  onReplyInThread,
  onTogglePin,
  onStartEdit,
  onDeleteMessage,
}) {
  const { showToast } = useToast();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  if (!message) return null;

  const allowedToEdit = canEdit(message, currentUser);
  const allowedToDelete = canDelete(message, currentUser);
  const allowedToPin = canPin(message, currentUser);

  const handleCopyText = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(message.text || '');
      }
      showToast(getMessageCopiedMessage(), 'success');
    } catch {
      showToast(getMessageCopiedMessage(), 'success');
    }
    onClose();
  };

  const handleConfirmDelete = () => {
    onDeleteMessage(message.id);
    showToast(getMessageDeletedMessage(), 'info');
    setIsDeleteModalOpen(false);
    onClose();
  };

  return (
    <>
      <Drawer isOpen={isOpen && !isDeleteModalOpen} onClose={onClose} title="Message Actions">
        <div className="space-y-4">
          {/* Quick Reaction Bar */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-ink-muted uppercase tracking-wider block">
              Quick Reactions
            </span>
            <div className="flex items-center justify-between gap-1 p-1.5 rounded-xl bg-surface-raised border border-line">
              {PRIMARY_REACTIONS.map((emoji, idx) => {
                const userReacted = message.reactions?.[emoji]?.includes(currentUser?.id);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      onReact(message.id, emoji);
                      onClose();
                    }}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all cursor-pointer ${
                      userReacted
                        ? 'bg-brand/10 border border-brand/40 scale-105'
                        : 'hover:bg-surface border border-transparent'
                    }`}
                    aria-label={`React with ${emoji}`}
                  >
                    {emoji}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action List */}
          <div className="space-y-1">
            {/* Reply in thread */}
            <button
              type="button"
              onClick={() => {
                onReplyInThread(message);
                onClose();
              }}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-surface-raised transition-colors text-xs font-semibold text-ink text-left cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-ink-muted shrink-0" aria-hidden="true" />
              <span>Reply in thread</span>
            </button>

            {/* Pin / Unpin */}
            {allowedToPin && (
              <button
                type="button"
                onClick={() => {
                  onTogglePin(message.id);
                  onClose();
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-surface-raised transition-colors text-xs font-semibold text-ink text-left cursor-pointer"
              >
                {message.pinned ? (
                  <>
                    <PinOff className="w-4 h-4 text-status-warning shrink-0" aria-hidden="true" />
                    <span>Unpin message</span>
                  </>
                ) : (
                  <>
                    <Pin className="w-4 h-4 text-brand shrink-0" aria-hidden="true" />
                    <span>Pin message to channel</span>
                  </>
                )}
              </button>
            )}

            {/* Edit */}
            {allowedToEdit && (
              <button
                type="button"
                onClick={() => {
                  onStartEdit(message);
                  onClose();
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-surface-raised transition-colors text-xs font-semibold text-ink text-left cursor-pointer"
              >
                <Pencil className="w-4 h-4 text-ink-muted shrink-0" aria-hidden="true" />
                <span>Edit message</span>
              </button>
            )}

            {/* Copy text */}
            {message.type === 'text' && (
              <button
                type="button"
                onClick={handleCopyText}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-surface-raised transition-colors text-xs font-semibold text-ink text-left cursor-pointer"
              >
                <Copy className="w-4 h-4 text-ink-muted shrink-0" aria-hidden="true" />
                <span>Copy message text</span>
              </button>
            )}

            {/* Delete */}
            {allowedToDelete && (
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-status-danger-bg text-status-danger transition-colors text-xs font-semibold text-left cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-status-danger shrink-0" aria-hidden="true" />
                <span>Delete message</span>
              </button>
            )}
          </div>
        </div>
      </Drawer>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Message"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-3 text-xs leading-relaxed text-ink-soft">
          <AlertTriangle className="w-5 h-5 text-status-danger shrink-0 mt-0.5" aria-hidden="true" />
          <p>
            Are you sure you want to delete this message? It will be replaced with &quot;This message was deleted&quot;.
          </p>
        </div>
      </Modal>
    </>
  );
}

export default MessageActionDrawer;
