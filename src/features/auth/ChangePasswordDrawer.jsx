import { useState, useMemo } from 'react';
import { Lock, Eye, EyeOff, Check, Circle } from 'lucide-react';
import { useChat } from '../../context/ChatContext.jsx';
import { passwordRules, isPasswordValid } from '../../utils/password.js';
import { Drawer } from '../../components/common/Drawer.jsx';
import { Button } from '../../components/common/Button.jsx';

function ChangePasswordForm({ isOpen, onClose }) {
  const { currentUser, changePassword } = useChat();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const rules = useMemo(() => {
    return passwordRules(newPassword, currentUser?.phone || '');
  }, [newPassword, currentUser?.phone]);

  const allRulesPass = useMemo(() => {
    return isPasswordValid(rules);
  }, [rules]);

  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const isDirty = Boolean(currentPassword || newPassword || confirmPassword);
  const canSubmit = currentPassword.trim().length > 0 && allRulesPass && passwordsMatch && !isSubmitting;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setError('');
    setIsSubmitting(true);
    const result = await changePassword(currentPassword, newPassword);
    setIsSubmitting(false);

    if (result.ok) {
      onClose();
    } else {
      if (result.reason === 'current_incorrect') {
        setError('Your current password is incorrect.');
      } else if (result.reason === 'password_invalid') {
        setError('Please choose a new password that satisfies all requirements.');
      } else {
        setError('Unable to update password. Please check your details.');
      }
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Change password"
      variant="form"
      isDirty={isDirty}
      discardTitle="Discard password change?"
      discardMessage="You have unsaved password changes."
    >
      <form onSubmit={handleSubmit} className="space-y-4 p-1">
        {error && (
          <div
            role="alert"
            className="p-3 bg-status-danger-bg border border-status-danger-line rounded-lg text-xs text-status-danger leading-relaxed"
          >
            {error}
          </div>
        )}

        {/* Current Password */}
        <div className="space-y-1.5">
          <label htmlFor="change-current" className="block text-xs font-semibold text-ink">
            Current password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ink-muted">
              <Lock className="w-4 h-4" aria-hidden="true" />
            </div>
            <input
              id="change-current"
              name="change_current"
              type={showCurrent ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                if (error) setError('');
              }}
              placeholder="Enter your current password"
              required
              className="w-full pl-9 pr-11 py-2 text-xs bg-surface border border-line rounded-lg text-ink focus:border-brand focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowCurrent((prev) => !prev)}
              aria-label={showCurrent ? 'Hide password' : 'Show password'}
              className="absolute inset-y-0 right-0 px-3 flex items-center justify-center text-ink-muted hover:text-ink cursor-pointer min-w-[44px] min-h-[44px]"
            >
              {showCurrent ? (
                <EyeOff className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Eye className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div className="space-y-1.5">
          <label htmlFor="change-new" className="block text-xs font-semibold text-ink">
            New password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ink-muted">
              <Lock className="w-4 h-4" aria-hidden="true" />
            </div>
            <input
              id="change-new"
              name="change_new"
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (error) setError('');
              }}
              placeholder="Enter new password"
              required
              className="w-full pl-9 pr-11 py-2 text-xs bg-surface border border-line rounded-lg text-ink focus:border-brand focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowNew((prev) => !prev)}
              aria-label={showNew ? 'Hide password' : 'Show password'}
              className="absolute inset-y-0 right-0 px-3 flex items-center justify-center text-ink-muted hover:text-ink cursor-pointer min-w-[44px] min-h-[44px]"
            >
              {showNew ? (
                <EyeOff className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Eye className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Password Rules Checklist */}
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

        {/* Confirm New Password */}
        <div className="space-y-1.5">
          <label htmlFor="change-confirm" className="block text-xs font-semibold text-ink">
            Confirm new password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ink-muted">
              <Lock className="w-4 h-4" aria-hidden="true" />
            </div>
            <input
              id="change-confirm"
              name="change_confirm"
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

        <div className="pt-2 flex items-center gap-2 justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="min-h-[44px]"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!canSubmit}
            className="min-h-[44px]"
          >
            {isSubmitting ? 'Saving...' : 'Save password'}
          </Button>
        </div>
      </form>
    </Drawer>
  );
}

export function ChangePasswordDrawer({ isOpen, onClose }) {
  const [formKey, setFormKey] = useState(0);

  const handleClose = () => {
    setFormKey((k) => k + 1);
    onClose();
  };

  return (
    <ChangePasswordForm
      key={`change-pwd-${formKey}`}
      isOpen={isOpen}
      onClose={handleClose}
    />
  );
}

export default ChangePasswordDrawer;
