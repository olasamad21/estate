import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, CheckCircle2, ArrowRight } from 'lucide-react';
import { useChat } from '../../context/ChatContext.jsx';
import { BrandMark } from '../../components/common/BrandMark.jsx';
import { Button } from '../../components/common/Button.jsx';
import { TextSizeDrawer } from '../settings/TextSizeDrawer.jsx';

export function ForgotView() {
  const navigate = useNavigate();
  const { requestPasswordReset } = useChat();

  const [isTextSizeOpen, setIsTextSizeOpen] = useState(false);
  const [phone, setPhone] = useState('+234 ');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [demoToken, setDemoToken] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = requestPasswordReset(phone);
    setIsSubmitted(true);
    if (result?.demoToken) {
      setDemoToken(result.demoToken);
    }
  };

  return (
    <div className="min-h-dvh bg-canvas flex flex-col justify-between items-center relative">
      {/* Brand Header Band */}
      <div className="w-full h-36 lg:h-44 bg-brand-bright flex items-center justify-center px-4 relative shrink-0">
        <div className="absolute top-4 right-4 z-10">
          <button
            type="button"
            onClick={() => setIsTextSizeOpen(true)}
            aria-label="Text size"
            title="Text size"
            className="w-11 h-11 rounded-xl border border-line bg-surface text-ink font-semibold text-xs flex items-center justify-center shadow-xs hover:bg-surface-raised cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ink"
          >
            <span className="font-bold text-xs tracking-tight">Aa</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <BrandMark variant="tile" size="lg" className="text-surface" />
          <BrandMark variant="wordmark" size="xl" className="text-surface" />
        </div>
      </div>

      {/* Main Card */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-6 sm:py-8 w-full">
        <div className="w-full max-w-[28rem] bg-surface border border-line rounded-2xl shadow-xs p-6 sm:p-8 space-y-6">
          {isSubmitted ? (
            <div className="space-y-6 text-center py-2">
              <div className="w-12 h-12 rounded-full bg-status-success-bg border border-status-success-line text-status-success flex items-center justify-center mx-auto shadow-2xs">
                <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-base font-bold text-ink tracking-tight">Check your email</h2>
                <p className="text-xs text-ink-muted leading-relaxed">
                  If this number has an account, we have sent a reset link to the email on file.
                </p>
              </div>

              {demoToken && (
                <div className="p-3 bg-surface-raised border border-brand/30 rounded-xl space-y-2 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-brand uppercase tracking-wider">
                      Demo only: this is the link the email would contain
                    </span>
                  </div>
                  <p className="text-xs text-ink-muted">
                    In a production environment, this link is delivered privately to the staff member&apos;s email address.
                  </p>
                  <Button
                    type="button"
                    variant="primary"
                    fullWidth
                    onClick={() => navigate(`/reset/${demoToken}`)}
                    className="min-h-[44px]"
                  >
                    <span>Open reset link</span>
                    <ArrowRight className="w-4 h-4 ml-1.5" aria-hidden="true" />
                  </Button>
                </div>
              )}

              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={() => navigate('/login')}
                className="min-h-[44px]"
              >
                Back to sign in
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <h2 className="text-base font-bold text-ink tracking-tight">Forgot password</h2>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Enter your registered phone number. We will send a password reset link to your email on file.
                </p>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="forgot-phone" className="block text-xs font-semibold text-ink">
                  Phone number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ink-muted">
                    <Phone className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <input
                    id="forgot-phone"
                    name="forgot_phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+234 80X XXX XXXX"
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs bg-surface border border-line rounded-lg text-ink focus:border-brand focus:outline-none"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                className="min-h-[44px]"
              >
                Send reset link
              </Button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-xs text-ink-muted hover:text-ink font-medium cursor-pointer transition-colors py-2"
                >
                  Back to sign in
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <footer className="w-full py-4 text-center shrink-0">
        <p className="text-xs text-ink-muted">
          Invented conversations. Front-end prototype only.
        </p>
      </footer>

      <TextSizeDrawer isOpen={isTextSizeOpen} onClose={() => setIsTextSizeOpen(false)} />
    </div>
  );
}

export default ForgotView;
