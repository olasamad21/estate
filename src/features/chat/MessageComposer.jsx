import { useState, useRef, useEffect } from 'react';
import { Send, Lock, Paperclip, Smile, Mic, Pencil } from 'lucide-react';
import { useChat } from '../../context/ChatContext.jsx';
import { canPost, callNameOf, channelMembersFor, normaliseMessageText } from '../../utils/chat.js';
import { getEnterKeyPref, shouldEnterSend } from '../../utils/enterKey.js';
import { channelDraftKey, threadDraftKey, getDraft, setDraft } from '../../utils/drafts.js';
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
  parentId = null,
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
  const resolvedUserId = resolvedUser?.id ?? null;

  const isThread = variant === 'thread';
  const effectiveAllowAttach = allowAttach ?? !isThread;
  const effectiveAllowVoice = allowVoice ?? !isThread;
  const effectiveAllowEdit = allowEdit ?? !isThread;
  const activeEditingMessage = effectiveAllowEdit ? (editingMessage ?? null) : null;
  const scopeKey = isThread
    ? threadDraftKey(resolvedUserId, parentId)
    : channelDraftKey(resolvedUserId, channel?.id ?? null);
  const mentionMembers =
    members ?? channelMembers ?? (channel ? channelMembersFor(channel, staff) : []);

  const [text, setText] = useState(() => {
    if (activeEditingMessage) {
      return activeEditingMessage.text ?? '';
    }
    return scopeKey ? getDraft(scopeKey) : '';
  });
  const [sendHint, setSendHint] = useState(null);
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [mentionQuery, setMentionQuery] = useState(null);
  const [enterKeyHint] = useState(() =>
    shouldEnterSend(getEnterKeyPref()) ? 'send' : 'enter'
  );

  const textareaRef = useRef(null);
  const recordTimerRef = useRef(null);

  const allowedToPost = channel ? canPost(resolvedUser, channel) : true;
  const hasText = Boolean(normaliseMessageText(text));
  const resolvedPlaceholder = activeEditingMessage
    ? 'Edit your message...'
    : (placeholder ?? (isThread ? 'Reply in thread' : 'Message'));

  // Focus textarea when editing begins; when mounting with a non-empty draft, place caret at end without stealing focus
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    if (activeEditingMessage) {
      el.focus();
      const len = el.value.length;
      try {
        el.setSelectionRange(len, len);
      } catch {
        // ignore
      }
      return;
    }
    if (el.value.length > 0) {
      const len = el.value.length;
      try {
        el.setSelectionRange(len, len);
      } catch {
        // ignore
      }
    }
  }, [activeEditingMessage, allowedToPost]);

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
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text, allowedToPost]);

  const handleTextChange = (e) => {
    const val = e.target.value;
    const cursorPos = e.target.selectionStart || 0;
    if (sendHint !== null) {
      setSendHint(null);
    }
    setText(val);
    if (!activeEditingMessage && scopeKey) {
      setDraft(scopeKey, val);
    }

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
      if (sendHint !== null) {
        setSendHint(null);
      }
      setText(newText);
      if (!activeEditingMessage && scopeKey) {
        setDraft(scopeKey, newText);
      }
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
    if (sendHint !== null) {
      setSendHint(null);
    }
    setText(newText);
    if (!activeEditingMessage && scopeKey) {
      setDraft(scopeKey, newText);
    }
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
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        return;
      }
      if (e.key === 'Escape') {
        setMentionQuery(null);
        return;
      }
    }

    if (e.key !== 'Enter') {
      return;
    }

    if (e.isComposing || e.nativeEvent?.isComposing || e.keyCode === 229) {
      return;
    }

    if (mentionQuery !== null) {
      return;
    }

    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      handleSubmit();
      return;
    }

    if (e.shiftKey) {
      return;
    }

    const pref = getEnterKeyPref();
    if (shouldEnterSend(pref)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleKeepFocusDown = (e) => {
    e.preventDefault();
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const trimmed = normaliseMessageText(text);
    if (!trimmed) return;

    let didSend = false;
    if (activeEditingMessage) {
      didSend = Boolean(onSaveEdit?.(activeEditingMessage.id, trimmed));
    } else if (onSubmitText) {
      didSend = Boolean(onSubmitText(trimmed));
    } else if (onSendMessage) {
      didSend = Boolean(onSendMessage(trimmed));
    } else if (channel?.id) {
      didSend = Boolean(sendMessage(channel.id, trimmed));
    }

    if (!didSend) {
      setSendHint("Message not sent. You can't send here.");
      if (textareaRef.current) {
        textareaRef.current.focus({ preventScroll: true });
      }
      return;
    }

    setSendHint(null);
    setText('');
    setMentionQuery(null);
    setIsEmojiOpen(false);

    if (activeEditingMessage) {
      onCancelEdit?.();
    } else if (scopeKey) {
      setDraft(scopeKey, '');
    }

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.focus({ preventScroll: true });
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

  const isActivelyRecording = effectiveAllowVoice && isRecording;
  const showSendInChannel = !isActivelyRecording && (hasText || Boolean(activeEditingMessage));
  const showMicInChannel = !isActivelyRecording && !showSendInChannel;
  const sendAriaLabel = activeEditingMessage ? 'Save changes' : 'Send message';

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

      {/* Editing Message Banner */}
      {activeEditingMessage && (
        <div className="px-2 sm:px-3 bg-brand/10 border-b border-brand/20 flex items-center justify-between gap-2 text-xs">
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
            className="min-h-11 min-w-11 px-2 inline-flex items-center justify-center text-xs text-ink-muted hover:text-ink font-semibold cursor-pointer rounded-lg shrink-0"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Inline Send Failure Hint */}
      {sendHint && (
        <div role="status" className="px-3 sm:px-4 pt-1.5 text-xs text-ink-muted">
          {sendHint}
        </div>
      )}

      {/* Composer Input Area */}
      <form onSubmit={handleSubmit} className="flex items-end gap-2 px-2 sm:px-3 py-2">
        {/* Attachment Button */}
        {effectiveAllowAttach && (
          <button
            type="button"
            onClick={onOpenAttachDrawer}
            aria-label="Attach file or photo"
            className="w-11 h-11 min-w-11 min-h-11 rounded-full flex items-center justify-center text-ink-muted hover:text-ink hover:bg-surface-raised active:bg-surface-raised transition-colors duration-150 cursor-pointer shrink-0"
          >
            <Paperclip className="w-5 h-5" aria-hidden="true" />
          </button>
        )}

        {isActivelyRecording ? (
          /* Voice Recording Mode Bar (in pill's place) */
          <div className="flex-1 min-w-0 flex items-center justify-between gap-2 bg-status-danger-bg border border-status-danger-line rounded-3xl pl-3 pr-1">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-status-danger animate-pulse shrink-0" />
              <Mic className="w-4 h-4 text-status-danger shrink-0 hidden sm:block" aria-hidden="true" />
              <span className="text-xs font-mono font-bold text-status-danger tabular-nums shrink-0">
                {formatTimer(recordingSeconds)}
              </span>
              <span className="text-xs text-ink-muted hidden md:inline overflow-hidden text-ellipsis whitespace-nowrap">
                Recording voice note...
              </span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={handleCancelRecording}
                className="min-h-11 min-w-11 h-11 px-2 rounded-full inline-flex items-center justify-center text-xs font-medium text-ink-muted hover:text-ink hover:bg-surface/60 transition-colors duration-150 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendVoiceNote}
                aria-label="Send voice note"
                className="min-h-11 min-w-11 h-11 px-2.5 sm:px-3 rounded-full bg-brand text-surface hover:bg-brand-ink inline-flex items-center justify-center gap-1.5 font-medium transition-colors duration-150 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span className="text-xs hidden sm:inline">Send</span>
              </button>
            </div>
          </div>
        ) : (
          /* Input Pill + Emoji Picker Anchor */
          <div className="relative flex-1 min-w-0">
            <EmojiPicker
              isOpen={isEmojiOpen}
              onClose={() => setIsEmojiOpen(false)}
              onSelectEmoji={handleSelectEmoji}
            />
            <div className="relative flex items-end bg-surface-raised border border-line rounded-3xl transition-[border-color,box-shadow] duration-150 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand-line">
              <textarea
                ref={textareaRef}
                name={inputName}
                rows={1}
                value={text}
                onChange={handleTextChange}
                onKeyDown={handleKeyDown}
                enterKeyHint={enterKeyHint}
                placeholder={resolvedPlaceholder}
                className="composer-pill-textarea block w-full bg-transparent text-base text-ink placeholder:text-ink-muted resize-none outline-none focus:outline-none focus-visible:outline-none min-h-11 max-h-[7.5rem] leading-6 py-2.5 overflow-y-auto"
              />
              <button
                type="button"
                onClick={() => setIsEmojiOpen((prev) => !prev)}
                aria-label="Insert reaction emoji"
                className="composer-emoji-btn absolute right-1 bottom-1 w-9 h-9 rounded-full items-center justify-center text-ink-muted hover:text-ink hover:bg-surface active:bg-surface transition-colors duration-150 cursor-pointer before:content-[''] before:absolute before:-inset-1"
              >
                <Smile className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}

        {/* Fixed 2.75rem Action Slot */}
        <div className="relative w-11 h-11 min-w-11 min-h-11 shrink-0">
          {effectiveAllowVoice ? (
            <>
              <button
                type="button"
                onClick={handleStartRecording}
                aria-label="Record voice note"
                tabIndex={showMicInChannel ? 0 : -1}
                aria-hidden={showMicInChannel ? undefined : true}
                className={`composer-action-morph absolute inset-0 w-11 h-11 min-w-11 min-h-11 rounded-full flex items-center justify-center bg-transparent text-ink-muted hover:text-ink hover:bg-surface-raised active:bg-surface-raised ${
                  showMicInChannel
                    ? 'opacity-100 scale-100 cursor-pointer'
                    : 'opacity-0 scale-[0.85] pointer-events-none'
                }`}
              >
                <Mic className="w-5 h-5" aria-hidden="true" />
              </button>
              <button
                type="submit"
                disabled={!hasText}
                onPointerDown={handleKeepFocusDown}
                onMouseDown={handleKeepFocusDown}
                aria-label={sendAriaLabel}
                tabIndex={showSendInChannel ? 0 : -1}
                aria-hidden={showSendInChannel ? undefined : true}
                className={`composer-action-morph absolute inset-0 w-11 h-11 min-w-11 min-h-11 rounded-full flex items-center justify-center ${
                  activeEditingMessage && !hasText
                    ? 'bg-surface-raised text-ink-muted cursor-not-allowed'
                    : 'bg-brand text-surface hover:bg-brand-ink cursor-pointer'
                } ${
                  showSendInChannel
                    ? 'opacity-100 scale-100'
                    : 'opacity-0 scale-[0.85] pointer-events-none'
                }`}
              >
                <Send className="w-4 h-4" aria-hidden="true" />
              </button>
            </>
          ) : (
            <button
              type="submit"
              disabled={!hasText}
              onPointerDown={handleKeepFocusDown}
              onMouseDown={handleKeepFocusDown}
              aria-label={sendAriaLabel}
              className={`composer-action-morph absolute inset-0 w-11 h-11 min-w-11 min-h-11 rounded-full flex items-center justify-center ${
                hasText
                  ? 'bg-brand text-surface hover:bg-brand-ink cursor-pointer'
                  : 'bg-surface-raised text-ink-muted cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default MessageComposer;
