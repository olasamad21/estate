import { useState } from 'react';
import { Phone, User, CheckCircle2 } from 'lucide-react';
import { useChat } from '../../context/ChatContext.jsx';
import { COMPANY_CONFIG } from '../../config/market.js';
import { Button } from '../../components/common/Button.jsx';
import { isValidPhoneNg, normalisePhoneNg } from '../../utils/formatters.js';

const ROLE_OPTIONS = [
  { id: 'agent', label: 'Agent' },
  { id: 'support', label: 'Support staff' },
  { id: 'intern', label: 'Intern' },
];

export function RequestAccessForm({ onBackToSignIn }) {
  const { submitAccessRequest } = useChat();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+234 ');
  const [officeId, setOfficeId] = useState('lagos');
  const [requestedRole, setRequestedRole] = useState('agent');
  const [touched, setTouched] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched(true);

    const newErrors = {};
    if (!name.trim() || name.trim().length < 2) {
      newErrors.name = 'Full name is required (at least 2 characters).';
    }

    const normalised = normalisePhoneNg(phone);
    if (!normalised || !isValidPhoneNg(phone)) {
      newErrors.phone = 'Please enter a valid Nigerian phone number (+234 80X XXX XXXX).';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const result = submitAccessRequest({
      name: name.trim(),
      phone: phone.trim(),
      officeId,
      requestedRole,
    });

    if (result.ok) {
      setIsSubmitted(true);
      setErrors({});
    } else {
      setErrors({
        [result.field || 'phone']: result.message || 'Unable to submit request.',
      });
    }
  };

  if (isSubmitted) {
    return (
      <div className="space-y-6 text-center py-2">
        <div className="w-12 h-12 rounded-full bg-status-success-bg border border-status-success-line text-status-success flex items-center justify-center mx-auto shadow-2xs">
          <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-base font-bold text-ink tracking-tight">Request sent</h2>
          <p className="text-xs text-ink-muted leading-relaxed max-w-xs mx-auto">
            We will let your admin know. You can sign in once your request is approved.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          fullWidth
          onClick={onBackToSignIn}
          className="min-h-[44px]"
        >
          Back to sign in
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-base font-bold text-ink tracking-tight">Request access</h2>
        <p className="text-xs text-ink-muted leading-relaxed">
          Your admin will review your request. You can sign in once it is approved.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label htmlFor="request-name" className="block text-xs font-semibold text-ink">
            Full name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ink-muted">
              <User className="w-4 h-4" aria-hidden="true" />
            </div>
            <input
              id="request-name"
              name="request_full_name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (touched && errors.name) {
                  setErrors((prev) => ({ ...prev, name: null }));
                }
              }}
              placeholder="e.g. Amina Bello"
              required
              className="w-full pl-9 pr-3 py-2 text-xs bg-surface border border-line rounded-lg text-ink focus:border-brand focus:outline-none"
            />
          </div>
          {errors.name && (
            <p className="text-xs text-status-danger" role="alert">
              {errors.name}
            </p>
          )}
        </div>

        {/* Phone Number */}
        <div className="space-y-1.5">
          <label htmlFor="request-phone" className="block text-xs font-semibold text-ink">
            Phone number
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ink-muted">
              <Phone className="w-4 h-4" aria-hidden="true" />
            </div>
            <input
              id="request-phone"
              name="request_phone_number"
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (touched && errors.phone) {
                  setErrors((prev) => ({ ...prev, phone: null }));
                }
              }}
              placeholder="+234 803 000 0115"
              required
              className="w-full pl-9 pr-3 py-2 text-xs bg-surface border border-line rounded-lg text-ink focus:border-brand focus:outline-none"
            />
          </div>
          {errors.phone ? (
            <p className="text-xs text-status-danger" role="alert">
              {errors.phone}
            </p>
          ) : (
            <p className="text-xs text-ink-muted">Format: +234 80X XXX XXXX</p>
          )}
        </div>

        {/* Office */}
        <div className="space-y-1.5">
          <span className="block text-xs font-semibold text-ink">Office</span>
          <div className="grid grid-cols-2 gap-2">
            {(COMPANY_CONFIG?.offices || []).map((office) => {
              const isChecked = officeId === office.id;
              return (
                <label
                  key={office.id}
                  className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                    isChecked
                      ? 'border-brand bg-brand/5 text-ink'
                      : 'border-line bg-surface hover:bg-surface-raised text-ink-soft'
                  }`}
                >
                  <input
                    type="radio"
                    name="request_office_choice"
                    value={office.id}
                    checked={isChecked}
                    onChange={() => setOfficeId(office.id)}
                    className="accent-brand cursor-pointer"
                  />
                  <span className="text-xs font-medium">{office.name} office</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Role */}
        <div className="space-y-1.5">
          <span className="block text-xs font-semibold text-ink">Your role</span>
          <div className="space-y-1.5">
            {ROLE_OPTIONS.map((r) => {
              const isChecked = requestedRole === r.id;
              return (
                <label
                  key={r.id}
                  className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                    isChecked
                      ? 'border-brand bg-brand/5 text-ink'
                      : 'border-line bg-surface hover:bg-surface-raised text-ink-soft'
                  }`}
                >
                  <input
                    type="radio"
                    name="request_role_choice"
                    value={r.id}
                    checked={isChecked}
                    onChange={() => setRequestedRole(r.id)}
                    className="accent-brand cursor-pointer"
                  />
                  <span className="text-xs font-medium">{r.label}</span>
                </label>
              );
            })}
          </div>
          <p className="text-xs text-ink-muted pt-0.5">Your admin sets your final role.</p>
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-2">
          <Button
            type="submit"
            variant="primary"
            fullWidth
            className="min-h-[44px]"
          >
            Send request
          </Button>

          <button
            type="button"
            onClick={onBackToSignIn}
            className="w-full min-h-[44px] py-2.5 text-xs font-medium text-ink-muted hover:text-ink transition-colors cursor-pointer text-center"
          >
            Back to sign in
          </button>
        </div>
      </form>
    </div>
  );
}

export default RequestAccessForm;
