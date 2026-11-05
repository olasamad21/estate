import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Phone, Lock, Eye, EyeOff, Check, Circle, AlertCircle } from 'lucide-react';
import { useChat } from '../../context/ChatContext.jsx';
import { linkState, callNameOf } from '../../utils/chat.js';
import { passwordRules, isPasswordValid } from '../../utils/password.js';
import { BrandMark } from '../../components/common/BrandMark.jsx';
import { Button } from '../../components/common/Button.jsx';
import { TextSizeDrawer } from '../settings/TextSizeDrawer.jsx';

export function ActivateView() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { staff, activationLinks, activateAccount } = useChat();

  const [isTextSizeOpen, setIsTextSizeOpen] = useState(false);
  const [phone, setPhone] = useState('+234 ');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const link = useMemo(() => {
    return (activationLinks || []).find((l) => l.token === token) ?? null;
  }, [activationLinks, token]);

  const person = useMemo(() => {
    if (!link?.staffId) return null;
    return (staff || []).find((s) => s.id === link.staffId) ?? null;
  }, [staff, link]);

  const currentLinkStatus = useMemo(() => {
    return linkState(link);
  }, [link]);

  const rules = useMemo(() => {
    return passwordRules(password, phone);
  }, [password, phone]);

  const allRulesPass = useMemo(() => {
    return isPasswordValid(rules);
  }, [rules]);

  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const isPhoneFilled = phone.trim().length > 6;
  const canSubmit = isPhoneFilled && allRulesPass && passwordsMatch && !isSubmitting;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setError('');
    setIsSubmitting(true);
    const result = await activateAccount(token, phone, password);
    setIsSubmitting(false);

    if (result.ok) {
      navigate('/channels', { replace: true });
    } else {
      if (result.reason === 'phone') {
        setError('That number does not match this invitation.');
      } else if (result.reason === 'locked') {
        setError('This link is locked. Ask your admin to send you a new one.');
      } else if (result.reason === 'expired') {
        setError('This link has expired. Ask your admin to send you a new one.');
      } else if (result.reason === 'used') {
        setError('This link has already been used.');
      } else if (result.reason === 'password_invalid') {
        setError('Please choose a password that satisfies all requirements.');
      } else {
        setError('Unable to activate account. Please check your details or contact your admin.');
      }
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

      {/* Main Activation Card */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-6 sm:py-8 w-full">
        <div className="w-full max-w-[28rem] bg-surface border border-line rounded-2xl shadow-xs p-6 sm:p-8 space-y-6">
          {currentLinkStatus === 'used' ? (
            <div className="space-y-4 text-center py-2">
              <div className="w-12 h-12 rounded-full bg-status-warning-bg border border-status-warning-line text-status-warning flex items-center justify-center mx-auto shadow-2xs">
                <AlertCircle className="w-6 h-6" aria-hidden="true" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-base font-bold text-ink tracking-tight">Link already used</h2>
                <p className="text-xs text-ink-muted leading-relaxed">
                  This link has already been used.
                </p>
              </div>
              <Button
                type="button"
                variant="primary"
                fullWidth
                onClick={() => navigate('/login')}
                className="min-h-[44px]"
              >
                Go to sign in
              </Button>
            </div>
          ) : currentLinkStatus === 'locked' ? (
            <div className="space-y-4 text-center py-2">
              <div className="w-12 h-12 rounded-full bg-status-danger-bg border border-status-danger-line text-status-danger flex items-center justify-center mx-auto shadow-2xs">
                <AlertCircle className="w-6 h-6" aria-hidden="true" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-base font-bold text-ink tracking-tight">Link locked</h2>
                <p className="text-xs text-ink-muted leading-relaxed">
                  This link is locked. Ask your admin to send you a new one.
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={() => navigate('/login')}
                className="min-h-[44px]"
              >
                Go to sign in
              </Button>
            </div>
          ) : currentLinkStatus === 'expired' || currentLinkStatus === 'unknown' ? (
            <div className="space-y-4 text-center py-2">
              <div className="w-12 h-12 rounded-full bg-surface-raised border border-line text-ink-muted flex items-center justify-center mx-auto shadow-2xs">
                <AlertCircle className="w-6 h-6" aria-hidden="true" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-base font-bold text-ink tracking-tight">Link expired</h2>
                <p className="text-xs text-ink-muted leading-relaxed">
                  This link has expired. Ask your admin to send you a new one.
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={() => navigate('/login')}
                className="min-h-[44px]"
              >
                Go to sign in
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <h2 className="text-base font-bold text-ink tracking-tight">Activate your account</h2>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Welcome, {callNameOf(person) || person?.name || 'Colleague'}.
                </p>
              </div>

              {error && (
                <div
                  role="alert"
                  className="p-3 bg-status-danger-bg border border-status-danger-line rounded-lg text-xs text-status-danger leading-relaxed"
                >
                  {error}
                </div>
              )}

              {/* Phone confirmation */}
              <div className="space-y-1.5">
                <label htmlFor="activate-phone" className="block text-xs font-semibold text-ink">
                  Enter the number you requested access with
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ink-muted">
                    <Phone className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <input
                    id="activate-phone"
                    name="activate_phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="+234 80X XXX XXXX"
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs bg-surface border border-line rounded-lg text-ink focus:border-brand focus:outline-none"
                  />
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label htmlFor="activate-password" className="block text-xs font-semibold text-ink">
                  New password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ink-muted">
                    <Lock className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <input
                    id="activate-password"
                    name="activate_password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Enter new password"
                    required
                    className="w-full pl-9 pr-11 py-2 text-xs bg-surface border border-line rounded-lg text-ink focus:border-brand focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 right-0 px-3 flex items-center justify-center text-ink-muted hover:text-ink cursor-pointer min-w-[44px] min-h-[44px]"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" aria-hidden="true" />
                    ) : (
                      <Eye className="w-4 h-4" aria-hidden="true" />
                    )}
                  </button>
                </div>

                {/* Live Password Rules Checklist */}
                <div className="pt-2 pb-1 space-y-1.5" aria-label="Password requirements">
                  {rules.map((rule) => (
                    <div key={rule.id} className="flex items-center gap-2 text-xs">
                      {rule.ok ? (
                        <Check className="w-3.5 h-3.5 text-status-success shrink-0" aria-hidden="true" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-ink-muted shrink-0" aria-hidden="true" />
                      )}
                      <span className={rule.ok ? 'text-ink font-medium' : 'text-ink-muted'}>
                        {rule.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label htmlFor="activate-confirm" className="block text-xs font-semibold text-ink">
                  Confirm password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ink-muted">
                    <Lock className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <input
                    id="activate-confirm"
                    name="activate_confirm"
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Confirm new password"
                    required
                    className="w-full pl-9 pr-11 py-2 text-xs bg-surface border border-line rounded-lg text-ink focus:border-brand focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((prev) => !prev)}
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 right-0 px-3 flex items-center justify-center text-ink-muted hover:text-ink cursor-pointer min-w-[44px] min-h-[44px]"
                  >
                    {showConfirm ? (
                      <EyeOff className="w-4 h-4" aria-hidden="true" />
                    ) : (
                      <Eye className="w-4 h-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
                {confirmPassword && !passwordsMatch && (
                  <p className="text-xs text-status-danger" role="alert">
                    Passwords do not match.
                  </p>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={!canSubmit}
                className="min-h-[44px]"
              >
                {isSubmitting ? 'Activating...' : 'Activate account'}
              </Button>
            </form>
          )}
        </div>
      </div>

      {/* Footer note */}
      <footer className="w-full py-4 text-center shrink-0">
        <p className="text-xs text-ink-muted">
          Invented conversations. Front-end prototype only.
        </p>
      </footer>

      <TextSizeDrawer isOpen={isTextSizeOpen} onClose={() => setIsTextSizeOpen(false)} />
    </div>
  );
}

export default ActivateView;
