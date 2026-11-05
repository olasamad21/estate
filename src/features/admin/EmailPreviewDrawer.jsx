import { useNavigate } from 'react-router-dom';
import { Mail, Copy, ExternalLink } from 'lucide-react';
import { Drawer } from '../../components/common/Drawer.jsx';
import { Button } from '../../components/common/Button.jsx';
import { useToast } from '../../components/common/useToast.js';
import { COMPANY_CONFIG } from '../../config/market.js';
import { callNameOf } from '../../utils/chat.js';
import { getLinkCopiedMessage } from '../../utils/messages.js';

export function EmailPreviewDrawer({
  isOpen = false,
  onClose,
  kind = 'activation',
  person = null,
  token = '',
}) {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const isActivation = kind === 'activation';
  const personCallName = callNameOf(person) || 'there';
  const personEmail = person?.email ?? null;

  const subject = isActivation
    ? 'Your account has been approved'
    : 'Reset your password';

  const bodyText = isActivation
    ? `Hello ${personCallName}, your request to join ${COMPANY_CONFIG.name} has been approved. Use the button below to activate your account. This link works once and expires in 48 hours.`
    : `Hello ${personCallName}, use the button below to reset your password for ${COMPANY_CONFIG.name}. This link works once and expires in 1 hour.`;

  const handleOpenLink = () => {
    if (!token) return;
    const path = isActivation ? `/activate/${token}` : `/reset/${token}`;
    onClose?.();
    navigate(path);
  };

  const handleCopyLink = () => {
    if (!token) return;
    const origin = typeof window !== 'undefined' && window.location?.origin ? window.location.origin : '';
    const fullUrl = `${origin}${isActivation ? '/activate/' : '/reset/'}${token}`;

    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(fullUrl).catch(() => {});
    }
    showToast(getLinkCopiedMessage());
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={isActivation ? 'Activation email' : 'Password reset email'}
    >
      <div className="space-y-5 pb-6">
        {/* Simulated Email Card */}
        <div className="border border-line rounded-2xl bg-surface overflow-hidden shadow-2xs">
          {/* Email Header */}
          <div className="p-4 bg-surface-raised border-b border-line space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <Mail className="w-4 h-4 text-ink-muted shrink-0" aria-hidden="true" />
              <span className="font-semibold text-ink-muted">To:</span>
              {personEmail ? (
                <span className="text-ink font-mono break-all">{personEmail}</span>
              ) : (
                <span className="text-ink-muted italic">No email on file</span>
              )}
            </div>
            <div className="flex items-start gap-2 text-xs pt-1 border-t border-line/60">
              <span className="font-semibold text-ink-muted shrink-0">Subject:</span>
              <span className="font-semibold text-ink">{subject}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-ink-muted pt-1 border-t border-line/60">
              <span className="font-semibold">From:</span>
              <span>{COMPANY_CONFIG.name} &lt;no-reply@example.com&gt;</span>
            </div>
          </div>

          {/* Email Body */}
          <div className="p-4 sm:p-5 space-y-5 bg-surface text-ink text-xs leading-relaxed">
            <p className="break-words">{bodyText}</p>

            {/* Primary Action Button inside email */}
            <div className="pt-2 pb-1 flex flex-col items-center">
              <Button
                type="button"
                variant="primary"
                onClick={handleOpenLink}
                className="w-full sm:w-auto min-h-[44px] px-6"
              >
                <span className="inline-flex items-center gap-2">
                  <span>{isActivation ? 'Activate account' : 'Reset password'}</span>
                  <ExternalLink className="w-4 h-4 shrink-0" aria-hidden="true" />
                </span>
              </Button>
              <p className="text-xs text-ink-muted text-center mt-2">
                Demo only: opens the page the person would reach
              </p>
            </div>

            <div className="pt-2 border-t border-line text-ink-muted">
              <p>{COMPANY_CONFIG.name} Team</p>
            </div>
          </div>
        </div>

        {/* Secondary Sharing Action (WhatsApp / Manual Link Copy) */}
        <div className="p-4 rounded-xl border border-line bg-surface-raised space-y-2.5">
          <Button
            type="button"
            variant="secondary"
            fullWidth
            onClick={handleCopyLink}
            className="min-h-[44px]"
          >
            <span className="inline-flex items-center gap-2">
              <Copy className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Copy link</span>
            </span>
          </Button>
          <p className="text-xs text-ink-muted text-center">
            No email on file? Send this link by WhatsApp.
          </p>
        </div>
      </div>
    </Drawer>
  );
}

export default EmailPreviewDrawer;
