import { useState, useRef, useEffect } from 'react';
import { Send, Lock } from 'lucide-react';
import { canPost } from '../../utils/chat.js';
import { Button } from '../../components/common/Button.jsx';

export function MessageComposer({ channel, currentUser, onSendMessage }) {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  const allowedToPost = canPost(currentUser, channel);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!text.trim() || !allowedToPost) return;
    onSendMessage(text);
    setText('');
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

  const isSendDisabled = !text.trim();

  return (
    <form onSubmit={handleSubmit} className="p-2 sm:p-3 border-t border-line bg-surface">
      <div className="flex items-end gap-2 bg-surface-raised border border-line rounded-xl px-3 py-2 focus-within:border-brand transition-colors">
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Message #${channel?.name || 'channel'}...`}
          className="flex-1 bg-transparent text-xs text-ink placeholder:text-ink-muted resize-none focus:outline-none min-h-[24px] max-h-[120px] leading-relaxed"
        />

        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={isSendDisabled}
          aria-label="Send message"
          className="rounded-lg shrink-0 p-1.5 h-8 w-8 flex items-center justify-center cursor-pointer"
        >
          <Send className="w-4 h-4" aria-hidden="true" />
        </Button>
      </div>
    </form>
  );
}

export default MessageComposer;
