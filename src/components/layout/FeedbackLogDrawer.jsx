import { Copy, ClipboardList } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';
import { ROLE_DETAILS } from '../../mock/roles.js';
import { formatRelativeTime, getFriendlyPageLabel } from '../../utils/formatters.js';
import { Drawer } from '../common/Drawer.jsx';
import { Button } from '../common/Button.jsx';
import { Badge } from '../common/Badge.jsx';
import { useToast } from '../common/useToast.js';
import { getFeedbackCopiedMessage, getFeedbackCopyFailedMessage } from '../../utils/messages.js';

export function FeedbackLogDrawer({ isOpen, onClose }) {
  const { feedbackItems } = useApp();
  const { showToast } = useToast();

  const handleCopyAll = async () => {
    if (feedbackItems.length === 0) return;

    try {
      const formatted = feedbackItems
        .map((item, idx) => {
          const roleName = ROLE_DETAILS[item.role]?.name || item.role;
          const pageLabel = getFriendlyPageLabel(item.route);
          return `[${idx + 1}] ${item.timestamp} | ${roleName} (${item.role}) | [${item.category}] on ${pageLabel} (${item.route})\n"${item.text}"`;
        })
        .join('\n\n---\n\n');

      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(formatted);
        showToast(getFeedbackCopiedMessage(), 'success');
      } else {
        // Fallback for non-secure / restricted environments
        const textArea = document.createElement('textarea');
        textArea.value = formatted;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast(getFeedbackCopiedMessage(), 'success');
      }
    } catch {
      showToast(getFeedbackCopyFailedMessage(), 'warning');
    }
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Feedback Log">
      <div className="space-y-4">
        {/* Subheader & Copy Action */}
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="text-xs text-ink-muted">
            <strong className="text-ink font-semibold tabular-nums">
              {feedbackItems.length}
            </strong>{' '}
            {feedbackItems.length === 1 ? 'item recorded' : 'items recorded'}
          </div>
          {feedbackItems.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopyAll}
              className="text-xs py-1 px-2.5 h-8 gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" aria-hidden="true" />
              Copy all feedback
            </Button>
          )}
        </div>

        {/* Feedback List or Empty State */}
        {feedbackItems.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-2">
            <div className="w-12 h-12 rounded-full bg-surface-raised border border-line flex items-center justify-center mx-auto text-ink-muted">
              <ClipboardList className="w-6 h-6" aria-hidden="true" />
            </div>
            <p className="text-sm font-semibold text-ink">No feedback yet</p>
            <p className="text-xs text-ink-muted max-w-xs mx-auto">
              Tap the message bubble icon in the top navigation bar to log ideas, problems, or notes.
            </p>
          </div>
        ) : (
          <div className="space-y-3" role="feed" aria-label="Submitted feedback list">
            {feedbackItems.map((item) => {
              const roleName = ROLE_DETAILS[item.role]?.name || item.role;
              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-line bg-surface-raised space-y-2"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <Badge variant={item.role} size="sm">
                        {roleName}
                      </Badge>
                      <span className="text-xs font-semibold text-ink-muted bg-surface px-1.5 py-0.5 rounded border border-line">
                        {item.category}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-ink-muted tabular-nums">
                      {formatRelativeTime(item.timestamp)}
                    </span>
                  </div>

                  <p className="text-xs text-ink leading-relaxed whitespace-pre-wrap break-words">
                    {item.text}
                  </p>

                  <div className="text-xs font-mono text-ink-muted pt-1 border-t border-line flex items-center justify-between">
                    <span>Page: {getFriendlyPageLabel(item.route)} ({item.route})</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Drawer>
  );
}

export default FeedbackLogDrawer;
