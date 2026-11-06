import { useState, useRef, useEffect } from 'react';
import { Send, Lock, Paperclip, Smile, Mic, Pencil } from 'lucide-react';
import { useChat } from '../../context/ChatContext.jsx';
import { canPost, callNameOf, channelMembersFor } from '../../utils/chat.js';
import { Button } from '../../components/common/Button.jsx';
import { EmojiPicker } from './EmojiPicker.jsx';
import { MentionMenu } from './MentionMenu.jsx';

function formatTimer(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function MessageComposer({
  variant = 'channel',
  placeholder,
  inputName = 'composer_message',
  onSubmitText,
  allowAttach,
  allowVoice,
  allowEdit,
  members,
  channel = null,
  currentUser = null,
  channelMembers,
  editingMessage = null,
  onSendMessage,
  onSendVoiceNote,
  onOpenAttachDrawer,
  onSaveEdit,
  onCancelEdit,
}) {
  const { currentUser: contextUser, staff, sendMessage } = useChat();
  const resolvedUser = currentUser ?? contextUser ?? null;

  const isThread = variant === 'thread';
  const effectiveAllowAttach = allowAttach ?? !isThread;
  const effectiveAllowVoice = allowVoice ?? !isThread;
  const effectiveAllowEdit = allowEdit ?? !isThread;
  const activeEditingMessage = effectiveAllowEdit ? (editingMessage ?? null) : null;
  const mentionMembers =
    members ?? channelMembers ?? (channel ? channelMembersFor(channel, staff) : []);

  const [text, setText] = useState(activeEditingMessage?.text || '');
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [mentionQuery, setMentionQuery] = useState(null);

  const textareaRef = useRef(null);
  const recordTimerRef = useRef(null);

  const allowedToPost = channel ? canPost(resolvedUser, channel) : true;
  const hasText = Boolean(text.trim());
  const resolvedPlaceholder = activeEditingMessage
    ? 'Edit your message...'
    : (placeholder ?? (isThread ? 'Reply in thread' : 'Message'));

  // Focus textarea when editing begins
  useEffect(() => {
    if (activeEditingMessage && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [activeEditingMessage]);

  // Voice recording timer
  useEffect(() => {
    if (!isRecording || !effectiveAllowVoice) return;

    recordTimerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current);
        recordTimerRef.current = null;
      }
    };
  }, [isRecording, effectiveAllowVoice]);

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
    const firstName = callNameOf(member);
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
    if (!effectiveAllowVoice) return;
    if (activeEditingMessage && onCancelEdit) {
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
    const trimmed = text.trim();
    if (!trimmed || !allowedToPost) return;

    if (activeEditingMessage) {
      onSaveEdit?.(activeEditingMessage.id, trimmed);
      onCancelEdit?.();
    } else if (onSubmitText) {
      onSubmitText(trimmed);
    } else if (onSendMessage) {
      onSendMessage(trimmed);
    } else if (channel?.id) {
      sendMessage(channel.id, trimmed);
    }

    setText('');
    setMentionQuery(null);
    setIsEmojiOpen(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  if (!allowedToPost) {
    const isAnnouncement = channel?.kind === 'announcement';
    const noticeText = isAnnouncement
      ? 'Only managers and admins can post announcements in this channel.'
      : 'Only admins can send messages.';
    return (
      <div className="p-3 border-t border-line bg-surface-raised flex items-center justify-center gap-2 text-xs text-ink-muted">
        <Lock className="w-4 h-4 shrink-0" aria-hidden="true" />
        <span>{noticeText}</span>
      </div>
    );
  }

  return (
    <div className="relative border-t border-line bg-surface flex-none" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      {/* Mention Menu */}
      {mentionQuery !== null && (
        <MentionMenu
          key={mentionQuery}
          query={mentionQuery}
          members={mentionMembers}
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
      {activeEditingMessage && (
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
      <form onSubmit={handleSubmit} className="p-1.5 sm:p-2.5">
        {effectiveAllowVoice && isRecording ? (
          /* Voice Recording Mode Bar */
          <div className="flex items-center justify-between gap-3 bg-status-danger-bg border border-status-danger-line rounded-xl px-4 py-2.5 min-h-[48px]">
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
          <div className="flex items-end gap-1.5 bg-surface-raised border border-line rounded-xl px-2 py-1 focus-within:border-brand transition-colors min-h-12">
            {/* Attachment Button */}
            {effectiveAllowAttach && (
              <button
                type="button"
                onClick={onOpenAttachDrawer}
                aria-label="Attach file or photo"
                className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-ink-muted hover:text-brand hover:bg-surface rounded-lg transition-colors cursor-pointer shrink-0"
              >
                <Paperclip className="w-4 h-4" aria-hidden="true" />
              </button>
            )}

            {/* Emoji Button */}
            <button
              type="button"
              onClick={() => setIsEmojiOpen((prev) => !prev)}
              aria-label="Insert reaction emoji"
              className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-ink-muted hover:text-brand hover:bg-surface rounded-lg transition-colors cursor-pointer shrink-0"
            >
              <Smile className="w-4 h-4" aria-hidden="true" />
            </button>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              name={inputName}
              rows={1}
              value={text}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder={resolvedPlaceholder}
              className="flex-1 bg-transparent text-xs text-ink placeholder:text-ink-muted resize-none focus:outline-none min-h-11 max-h-[7.5rem] leading-5 py-3 px-2 overflow-y-auto"
            />

            {/* Mic Button */}
            {effectiveAllowVoice && !hasText && !activeEditingMessage && (
              <button
                type="button"
                onClick={handleStartRecording}
                aria-label="Record voice note"
                className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-ink-muted hover:text-brand hover:bg-surface rounded-lg transition-colors cursor-pointer shrink-0"
              >
                <Mic className="w-4 h-4" aria-hidden="true" />
              </button>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant={hasText ? 'primary' : 'ghost'}
              size="sm"
              disabled={!hasText}
              aria-label={
                activeEditingMessage
                  ? 'Save changes'
                  : isThread
                  ? 'Send thread reply'
                  : 'Send message'
              }
              className={`rounded-lg shrink-0 w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center p-0 transition-colors ${
                hasText
                  ? 'cursor-pointer'
                  : 'text-ink-muted/50 hover:bg-transparent active:scale-100 cursor-not-allowed'
              }`}
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
