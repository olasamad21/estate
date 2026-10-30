import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Lightbulb, AlertCircle, HelpCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';
import { getFriendlyPageLabel } from '../../utils/formatters.js';
import { Modal } from '../common/Modal.jsx';
import { Button } from '../common/Button.jsx';
import { useToast } from '../common/useToast.js';
import { getFeedbackSavedMessage } from '../../utils/messages.js';

const CATEGORIES = [
  { id: 'Idea', label: 'Idea', icon: Lightbulb },
  { id: 'Problem', label: 'Problem', icon: AlertCircle },
  { id: 'Question', label: 'Question', icon: HelpCircle },
];

export function FeedbackModal({ isOpen, onClose }) {
  const [category, setCategory] = useState('Idea');
  const [text, setText] = useState('');
  const location = useLocation();
  const { addFeedbackItem } = useApp();
  const { showToast } = useToast();

  const handleClose = () => {
    setText('');
    setCategory('Idea');
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim().length < 3) return;

    addFeedbackItem({
      category,
      text: text.trim(),
      route: location.pathname,
    });

    showToast(getFeedbackSavedMessage(), 'success');
    handleClose();
  };

  const isSubmitDisabled = text.trim().length < 3;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Give Feedback"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={isSubmitDisabled}
            onClick={handleSubmit}
          >
            Submit Feedback
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category Radiogroup Chips */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-ink uppercase tracking-wider block">
            Category
          </label>
          <div
            role="radiogroup"
            aria-label="Feedback category"
            className="flex flex-wrap gap-2"
          >
            {CATEGORIES.map((cat) => {
              const isSelected = category === cat.id;
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setCategory(cat.id)}
                  className={`min-h-[44px] px-3 py-2 rounded-lg text-xs font-medium border flex items-center gap-1.5 cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                    isSelected
                      ? 'bg-brand text-surface border-brand shadow-xs'
                      : 'bg-surface text-ink-muted border-field-line hover:border-line-strong hover:text-ink'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 16px Textarea with data-autofocus */}
        <div className="space-y-1.5">
          <label htmlFor="feedback-text" className="text-xs font-semibold text-ink uppercase tracking-wider block">
            Your Note
          </label>
          <textarea
            id="feedback-text"
            data-autofocus
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What's working? What's broken? What should we change?"
            className="w-full text-base p-3 rounded-xl border border-field-line bg-surface text-ink placeholder:text-ink-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand resize-y leading-relaxed"
          />
          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span className="font-medium text-ink-soft">
              Page: <strong className="text-ink font-semibold">{getFriendlyPageLabel(location.pathname)}</strong>
            </span>
            <span>{text.trim().length} chars (min 3)</span>
          </div>
        </div>
      </form>
    </Modal>
  );
}

export default FeedbackModal;
