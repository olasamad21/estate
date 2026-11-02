import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { useChat } from '../../context/ChatContext.jsx';
import { ROLE_LABELS } from '../../mock/staff.js';
import { formatPhoneNg } from '../../utils/formatters.js';
import { getUnregisteredPhoneLoginErrorMessage } from '../../utils/messages.js';
import { Button } from '../../components/common/Button.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { BrandMark } from '../../components/common/BrandMark.jsx';
import { RequestAccessForm } from './RequestAccessForm.jsx';
import { TextSizeDrawer } from '../settings/TextSizeDrawer.jsx';

export function LoginView() {
  const { staff, login } = useChat();
  const navigate = useNavigate();

  const [mode, setMode] = useState('login'); // 'login' | 'request'
  const [requestFormKey, setRequestFormKey] = useState(0);
  const [isTextSizeOpen, setIsTextSizeOpen] = useState(false);
  const [phone, setPhone] = useState('+234 000 000 0001');
  const [code, setCode] = useState('123456');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const demoStaffMembers = useMemo(() => {
    const list = Array.isArray(staff) ? staff : [];
    const demoPersonas = [
      { id: 'ruth', roleLabel: 'Admin, all offices' },
      { id: 'fortune', roleLabel: 'Manager, all offices' },
      { id: 'micheal', roleLabel: 'Manager, Port Harcourt office' },
      { id: 'taiye', roleLabel: 'Marketer, Lugbe office' },
    ];
    return demoPersonas
      .map((p) => {
        const found = list.find((s) => s.id === p.id);
        return found ? { ...found, demoLabel: p.roleLabel } : null;
      })
      .filter(Boolean);
  }, [staff]);

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
      setError(result.error || getUnregisteredPhoneLoginErrorMessage());
    }
  };

  const handleQuickFill = (staffMember) => {
    setPhone(formatPhoneNg(staffMember.phone));
    setCode('123456');
    setError('');
  };

  const handleQuickFillPending = () => {
    setPhone(formatPhoneNg('+2340000000101'));
    setCode('123456');
    setError('');
  };

  return (
    <div className="min-h-dvh bg-canvas flex flex-col justify-between items-center relative">
      {/* Full-width header band in bg-brand-bright (144px on phones, 176px from 1024px up) */}
      <div className="w-full h-36 lg:h-44 bg-brand-bright flex items-center justify-center px-4 relative shrink-0">
        {/* Accessibility text size button (Aa) */}
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

        <BrandMark variant="wordmark" size="xl" className="text-surface" />
      </div>

      {/* Centered Form Card Area */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-6 sm:py-8 w-full">
        <div className="w-full max-w-[28rem] bg-surface border border-line rounded-2xl shadow-xs p-6 sm:p-8 space-y-6">
          {/* Card header: "Staff workspace" in ink-muted at 14px or larger */}
          <div className="text-center space-y-1">
            <h1 className="text-sm sm:text-base font-medium text-ink-muted">
              Staff workspace
            </h1>
          </div>

          {mode === 'request' ? (
          <RequestAccessForm
            key={requestFormKey}
            onBackToSignIn={() => {
              setMode('login');
              setError('');
            }}
          />
        ) : (
          <>
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
                className="flex items-center justify-center gap-2 mt-2 min-h-[44px]"
              >
                <span>Sign in to Workspace</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode('request');
                    setRequestFormKey((k) => k + 1);
                    setError('');
                  }}
                  className="w-full min-h-[44px] py-2.5 text-xs font-medium text-ink-muted hover:text-brand transition-colors cursor-pointer text-center"
                >
                  New here? Request access
                </button>
              </div>

              <p className="text-xs text-ink-muted text-center pt-1 leading-relaxed">
                All conversations in this demo are invented. Names are used for demonstration only.
              </p>
            </form>

            {/* Demo Fast Switcher Helper */}
            <div className="border-t border-line pt-4 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-soft">
                <ShieldCheck className="w-4 h-4 text-brand" aria-hidden="true" />
                <span>Click any staff member to test:</span>
              </div>
              <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto no-scrollbar pr-1">
                {demoStaffMembers.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => handleQuickFill(member)}
                    className="w-full flex items-center justify-between p-2 rounded-lg border border-line bg-surface-raised hover:bg-surface hover:border-brand transition-colors text-left cursor-pointer group min-h-[44px]"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-semibold text-ink group-hover:text-brand">
                        {member.name}
                      </p>
                      <p className="text-xs text-ink-muted">
                        {formatPhoneNg(member.phone)} · {member.demoLabel}
                      </p>
                    </div>
                    <Badge role={member.role} size="sm">
                      {ROLE_LABELS[member.role] || member.role}
                    </Badge>
                  </button>
                ))}

                {/* Waiting for approval row */}
                <button
                  type="button"
                  onClick={handleQuickFillPending}
                  className="w-full flex items-center justify-between p-2 rounded-lg border border-line bg-surface-raised hover:bg-surface hover:border-brand transition-colors text-left cursor-pointer group min-h-[44px]"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-semibold text-ink group-hover:text-brand">
                      Waiting for approval: Blessing Nwachukwu
                    </p>
                    <p className="text-xs text-ink-muted">
                      {formatPhoneNg('+2340000000101')} · Lugbe office
                    </p>
                  </div>
                  <Badge role="agent" size="sm">
                    {ROLE_LABELS.agent}
                  </Badge>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      </div>

      {/* Text Size Drawer */}
      <TextSizeDrawer
        isOpen={isTextSizeOpen}
        onClose={() => setIsTextSizeOpen(false)}
      />
    </div>
  );
}

export default LoginView;
