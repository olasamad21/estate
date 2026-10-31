import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { useChat } from '../../context/ChatContext.jsx';
import { COMPANY_CONFIG } from '../../config/market.js';
import { STAFF, ROLE_LABELS } from '../../mock/staff.js';
import { formatPhoneNg } from '../../utils/formatters.js';
import { Button } from '../../components/common/Button.jsx';
import { Badge } from '../../components/common/Badge.jsx';

export function LoginView() {
  const { login } = useChat();
  const navigate = useNavigate();

  const [phone, setPhone] = useState('+234 803 000 0101');
  const [code, setCode] = useState('123456');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (code.trim().length !== 6) {
      setError('Please enter a 6-digit code.');
      return;
    }

    setIsSubmitting(true);
    const result = login(phone);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/channels', { replace: true });
    } else {
      setError(result.error || "This number hasn't been added by your admin.");
    }
  };

  const handleQuickFill = (staffMember) => {
    setPhone(formatPhoneNg(staffMember.phone));
    setCode('123456');
    setError('');
  };

  return (
    <div className="min-h-dvh bg-canvas flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-md bg-surface border border-line rounded-2xl shadow-xs p-6 sm:p-8 space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-brand text-surface flex items-center justify-center font-mono text-base font-black mx-auto shadow-xs">
            CP
          </div>
          <h1 className="text-xl font-bold text-ink tracking-tight">
            {COMPANY_CONFIG.name}
          </h1>
          <p className="text-xs text-ink-muted">
            Internal Staff Workspace · Lagos & Abuja
          </p>
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div
              role="alert"
              className="p-3 rounded-lg bg-status-danger-bg border border-status-danger-line text-status-danger text-xs flex items-start gap-2"
            >
              <span className="shrink-0 font-bold">•</span>
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* Phone Number */}
          <div className="space-y-1.5">
            <label htmlFor="staff-phone" className="block text-xs font-semibold text-ink">
              Staff Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ink-muted">
                <Phone className="w-4 h-4" aria-hidden="true" />
              </div>
              <input
                id="staff-phone"
                name="login_phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234 803 000 0101"
                required
                className="w-full pl-9 pr-3 py-2 text-xs bg-surface border border-line rounded-lg text-ink focus:border-brand focus:outline-none"
              />
            </div>
            <p className="text-xs text-ink-muted">Format: +234 80X XXX XXXX</p>
          </div>

          {/* 6-Digit Code */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="staff-code" className="block text-xs font-semibold text-ink">
                Verification Code
              </label>
              <span className="text-xs text-ink-muted font-medium">
                Demo: use any 6 digits
              </span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ink-muted">
                <Lock className="w-4 h-4" aria-hidden="true" />
              </div>
              <input
                id="staff-code"
                name="login_code"
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                required
                className="w-full pl-9 pr-3 py-2 text-xs font-mono tracking-widest bg-surface border border-line rounded-lg text-ink focus:border-brand focus:outline-none"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 mt-2"
          >
            <span>Sign in to Workspace</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Button>
        </form>

        {/* Demo Fast Switcher Helper */}
        <div className="border-t border-line pt-4 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-soft">
            <ShieldCheck className="w-4 h-4 text-brand" aria-hidden="true" />
            <span>Click any staff member to test:</span>
          </div>
          <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto no-scrollbar pr-1">
            {STAFF.slice(0, 5).map((member) => (
              <button
                key={member.id}
                type="button"
                onClick={() => handleQuickFill(member)}
                className="w-full flex items-center justify-between p-2 rounded-lg border border-line bg-surface-raised hover:bg-surface hover:border-brand transition-colors text-left cursor-pointer group"
              >
                <div className="min-w-0 pr-2">
                  <p className="text-xs font-semibold text-ink group-hover:text-brand">
                    {member.name}
                  </p>
                  <p className="text-xs text-ink-muted">
                    {formatPhoneNg(member.phone)} · {member.office.toUpperCase()}
                  </p>
                </div>
                <Badge role={member.role} size="sm">
                  {ROLE_LABELS[member.role] || member.role}
                </Badge>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginView;
