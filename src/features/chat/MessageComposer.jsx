import { useState, useRef, useEffect } from 'react';
import { Send, Lock, Paperclip, Smile, Mic, Pencil } from 'lucide-react';
import { canPost } from '../../utils/chat.js';
import { Button } from '../../components/common/Button.jsx';
import { EmojiPicker } from './EmojiPicker.jsx';
import { MentionMenu } from './MentionMenu.jsx';

function formatTimer(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function MessageComposer({
  channel,
  currentUser,
  channelMembers = [],
  editingMessage = null,
  onSendMessage,
  onSendVoiceNote,
  onOpenAttachDrawer,
  onSaveEdit,
  onCancelEdit,
}) {
  const [text, setText] = useState(editingMessage?.text || '');
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [mentionQuery, setMentionQuery] = useState(null);

  const textareaRef = useRef(null);
  const recordTimerRef = useRef(null);

  const allowedToPost = canPost(currentUser, channel);

  // Focus textarea when editing begins
  useEffect(() => {
    if (editingMessage && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [editingMessage]);

  // Voice recording timer
  useEffect(() => {
    if (!isRecording) return;

    recordTimerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current);
        recordTimerRef.current = null;
      }
    };
  }, [isRecording]);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  const handleTextChange = (e) => {
    const val = e.target.value;
    const cursorPos = e.target.selectionStart || 0;
    setText(val);

    const textBeforeCursor = val.slice(0, cursorPos);
    const match = textBeforeCursor.match(/@([a-zA-Z0-9_]*)$/);
    if (match) {
      setMentionQuery(match[1]);
    } else {
      setMentionQuery(null);
    }
  };

  const handleSelectMention = (member) => {
    const firstName = member.name.split(' ')[0];
    const cursorPos = textareaRef.current ? textareaRef.current.selectionStart : text.length;
    const textBeforeCursor = text.slice(0, cursorPos);
    const textAfterCursor = text.slice(cursorPos);

    const match = textBeforeCursor.match(/@([a-zA-Z0-9_]*)$/);
    if (match) {
      const mentionStart = match.index;
      const newTextBefore = textBeforeCursor.slice(0, mentionStart) + `@${firstName} `;
      const newText = newTextBefore + textAfterCursor;
      setText(newText);
      setMentionQuery(null);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          const newPos = newTextBefore.length;
          textareaRef.current.setSelectionRange(newPos, newPos);
        }
      }, 0);
    }
  };

  const handleSelectEmoji = (emoji) => {
    const cursorPos = textareaRef.current ? textareaRef.current.selectionStart : text.length;
    const newText = text.slice(0, cursorPos) + emoji + text.slice(cursorPos);
    setText(newText);
    setIsEmojiOpen(false);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newPos = cursorPos + emoji.length;
        textareaRef.current.setSelectionRange(newPos, newPos);
      }
    }, 0);
  };

  const handleStartRecording = () => {
    if (editingMessage && onCancelEdit) {
      onCancelEdit();
    }
    setRecordingSeconds(0);
    setIsRecording(true);
  };

  const handleCancelRecording = () => {
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  const handleSendVoiceNote = () => {
    const duration = Math.max(1, recordingSeconds);
    onSendVoiceNote?.(duration);
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  const handleKeyDown = (e) => {
    if (mentionQuery !== null) {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'Enter') {
        return;
      }
      if (e.key === 'Escape') {
        setMentionQuery(null);
        return;
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!text.trim() || !allowedToPost) return;

    if (editingMessage) {
      onSaveEdit?.(editingMessage.id, text.trim());
      onCancelEdit?.();
    } else {
      onSendMessage(text.trim());
    }

    setText('');
    setMentionQuery(null);
    setIsEmojiOpen(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  if (!allowedToPost) {
    return (
      <div className="p-3 border-t border-line bg-surface-raised flex items-center justify-center gap-2 text-xs text-ink-muted">
        <Lock className="w-4 h-4 shrink-0" aria-hidden="true" />
        <span>Only managers and admins can post announcements in this channel.</span>
      </div>
    );
  }

  return (
    <div className="relative border-t border-line bg-surface">
      {/* Mention Menu */}
      {mentionQuery !== null && (
        <MentionMenu
          key={mentionQuery}
          query={mentionQuery}
          members={channelMembers}
          onSelectMember={handleSelectMention}
          onClose={() => setMentionQuery(null)}
        />
      )}

      {/* Emoji Picker Popover */}
      <EmojiPicker
        isOpen={isEmojiOpen}
        onClose={() => setIsEmojiOpen(false)}
        onSelectEmoji={handleSelectEmoji}
      />

      {/* Editing Message Banner */}
      {editingMessage && (
        <div className="px-3 py-1.5 bg-brand/10 border-b border-brand/20 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 min-w-0 text-brand font-medium">
            <Pencil className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span className="overflow-hidden text-ellipsis whitespace-nowrap">
              Editing message
            </span>
          </div>
          <button
            type="button"
            onClick={onCancelEdit}
            aria-label="Cancel editing"
            className="text-xs text-ink-muted hover:text-ink font-semibold ml-2 cursor-pointer"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Composer Input Area */}
      <form onSubmit={handleSubmit} className="p-2 sm:p-3">
        {isRecording ? (
          /* Voice Recording Mode Bar */
          <div className="flex items-center justify-between gap-3 bg-status-danger-bg border border-status-danger-line rounded-xl px-4 py-2.5">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-status-danger animate-pulse shrink-0" />
              <Mic className="w-4 h-4 text-status-danger shrink-0" aria-hidden="true" />
              <span className="text-xs font-mono font-bold text-status-danger tabular-nums">
                {formatTimer(recordingSeconds)}
              </span>
              <span className="text-xs text-ink-muted hidden sm:inline">
                Recording voice note...
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCancelRecording}
                className="text-xs text-ink-muted hover:text-ink h-8 px-2.5 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleSendVoiceNote}
                aria-label="Send voice note"
                className="h-8 px-3 rounded-lg flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" aria-hidden="true" />
                <span className="text-xs">Send</span>
              </Button>
            </div>
          </div>
        ) : (
          /* Regular Message Bar */
          <div className="flex items-end gap-1.5 sm:gap-2 bg-surface-raised border border-line rounded-xl px-2.5 py-1.5 sm:py-2 focus-within:border-brand transition-colors">
            {/* Attachment Button */}
            <button
              type="button"
              onClick={onOpenAttachDrawer}
              aria-label="Attach file or photo"
              className="p-1.5 text-ink-muted hover:text-brand hover:bg-surface rounded-lg transition-colors cursor-pointer shrink-0"
            >
              <Paperclip className="w-4 h-4" aria-hidden="true" />
            </button>

            {/* Emoji Button */}
            <button
              type="button"
              onClick={() => setIsEmojiOpen((prev) => !prev)}
              aria-label="Insert reaction emoji"
              className="p-1.5 text-ink-muted hover:text-brand hover:bg-surface rounded-lg transition-colors cursor-pointer shrink-0"
            >
              <Smile className="w-4 h-4" aria-hidden="true" />
            </button>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              name="composer_message"
              rows={1}
              value={text}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder={editingMessage ? 'Edit your message...' : `Message #${channel?.name || 'channel'}... (@ to mention)`}
              className="flex-1 bg-transparent text-xs text-ink placeholder:text-ink-muted resize-none focus:outline-none min-h-[24px] max-h-[120px] leading-relaxed py-1"
            />

            {/* Mic Button */}
            {!text.trim() && !editingMessage && (
              <button
                type="button"
                onClick={handleStartRecording}
                aria-label="Record voice note"
                className="p-1.5 text-ink-muted hover:text-brand hover:bg-surface rounded-lg transition-colors cursor-pointer shrink-0"
              >
                <Mic className="w-4 h-4" aria-hidden="true" />
              </button>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!text.trim()}
              aria-label={editingMessage ? 'Save changes' : 'Send message'}
              className="rounded-lg shrink-0 p-1.5 h-8 w-8 flex items-center justify-center cursor-pointer"
            >
              <Send className="w-4 h-4" aria-hidden="true" />
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}

export default MessageComposer;
