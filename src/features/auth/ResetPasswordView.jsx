import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, Check, Circle, AlertCircle } from 'lucide-react';
import { useChat } from '../../context/ChatContext.jsx';
import { linkState } from '../../utils/chat.js';
import { passwordRules, isPasswordValid } from '../../utils/password.js';
import { BrandMark } from '../../components/common/BrandMark.jsx';
import { Button } from '../../components/common/Button.jsx';
import { TextSizeDrawer } from '../settings/TextSizeDrawer.jsx';

export function ResetPasswordView() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { staff, resetLinks, resetPassword } = useChat();

  const [isTextSizeOpen, setIsTextSizeOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const link = useMemo(() => {
    return (resetLinks || []).find((l) => l.token === token) ?? null;
  }, [resetLinks, token]);

  const person = useMemo(() => {
    if (!link?.staffId) return null;
    return (staff || []).find((s) => s.id === link.staffId) ?? null;
  }, [staff, link]);

  const currentLinkStatus = useMemo(() => {
    return linkState(link);
  }, [link]);

  const rules = useMemo(() => {
    return passwordRules(password, person?.phone || '');
  }, [password, person?.phone]);

  const allRulesPass = useMemo(() => {
    return isPasswordValid(rules);
  }, [rules]);

  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const canSubmit = allRulesPass && passwordsMatch && !isSubmitting;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setError('');
    setIsSubmitting(true);
    const result = await resetPassword(token, password);
    setIsSubmitting(false);

    if (result.ok) {
      navigate('/login', { replace: true });
    } else {
      if (result.reason === 'expired' || result.reason === 'used') {
        setError('This link has expired or was already used. Request a new one.');
      } else if (result.reason === 'password_invalid') {
        setError('Please choose a password that satisfies all requirements.');
      } else {
        setError('Unable to reset password. Please request a new link.');
      }
    }
  };

  const isLinkInvalid = currentLinkStatus !== 'valid';

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
          {isLinkInvalid ? (
            <div className="space-y-4 text-center py-2">
              <div className="w-12 h-12 rounded-full bg-surface-raised border border-line text-ink-muted flex items-center justify-center mx-auto shadow-2xs">
                <AlertCircle className="w-6 h-6" aria-hidden="true" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-base font-bold text-ink tracking-tight">Link invalid or expired</h2>
                <p className="text-xs text-ink-muted leading-relaxed">
                  This link has expired or was already used. Request a new one.
                </p>
              </div>
              <Button
                type="button"
                variant="primary"
                fullWidth
                onClick={() => navigate('/forgot')}
                className="min-h-[44px]"
              >
                Request a new link
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <h2 className="text-base font-bold text-ink tracking-tight">Choose a new password</h2>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Enter your new password below.
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

              {/* New Password */}
              <div className="space-y-1.5">
                <label htmlFor="reset-password" className="block text-xs font-semibold text-ink">
                  New password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ink-muted">
                    <Lock className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <input
                    id="reset-password"
                    name="reset_password"
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

                {/* Rules Checklist */}
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
                <label htmlFor="reset-confirm" className="block text-xs font-semibold text-ink">
                  Confirm new password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ink-muted">
                    <Lock className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <input
                    id="reset-confirm"
                    name="reset_confirm"
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
                {isSubmitting ? 'Saving...' : 'Save password'}
              </Button>
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

export default ResetPasswordView;
