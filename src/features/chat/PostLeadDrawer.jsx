import { useState, useMemo } from 'react';
import { Drawer } from '../../components/common/Drawer.jsx';
import { Button } from '../../components/common/Button.jsx';
import { COMPANY_CONFIG } from '../../config/market.js';
import { useChat } from '../../context/ChatContext.jsx';

function formatBudgetInput(raw) {
  const digits = String(raw || '').replace(/\D/g, '');
  if (!digits) return '';
  return Number(digits).toLocaleString('en-US');
}

function PostLeadForm({ isOpen, channel, onClose }) {
  const { postLead } = useChat();

  const [clientName, setClientName] = useState('');
  const [enquiry, setEnquiry] = useState('');
  const [area, setArea] = useState('');
  const [budgetFormatted, setBudgetFormatted] = useState('');
  const [touched, setTouched] = useState(false);

  const isDirty = Boolean(
    clientName.trim() ||
    enquiry.trim() ||
    area.trim() ||
    budgetFormatted.trim()
  );

  const officeAreas = useMemo(() => {
    if (channel?.officeId) {
      const office = COMPANY_CONFIG.offices.find((o) => o.id === channel.officeId);
      return office?.areas || [];
    }
    const combined = COMPANY_CONFIG.offices.flatMap((o) => o.areas || []);
    return Array.from(new Set(combined));
  }, [channel]);

  const numericBudget = useMemo(() => {
    const digits = budgetFormatted.replace(/\D/g, '');
    return digits ? Number(digits) : 0;
  }, [budgetFormatted]);

  const errors = useMemo(() => {
    const errs = {};
    const trimmedName = clientName.trim();
    if (!trimmedName) {
      errs.clientName = 'Client name is required.';
    } else if (trimmedName.length < 2) {
      errs.clientName = 'Client name must be at least 2 characters.';
    } else if (trimmedName.length > 60) {
      errs.clientName = 'Client name must be at most 60 characters.';
    }

    const trimmedEnquiry = enquiry.trim();
    if (!trimmedEnquiry) {
      errs.enquiry = 'Enquiry description is required.';
    } else if (trimmedEnquiry.length < 5) {
      errs.enquiry = 'Enquiry must be at least 5 characters.';
    } else if (trimmedEnquiry.length > 160) {
      errs.enquiry = 'Enquiry must be at most 160 characters.';
    }

    const trimmedArea = area.trim();
    if (!trimmedArea) {
      errs.area = 'Area is required.';
    } else if (trimmedArea.length > 30) {
      errs.area = 'Area must be at most 30 characters.';
    }

    if (!numericBudget || numericBudget <= 0) {
      errs.budget = 'Budget must be greater than zero.';
    } else if (numericBudget > 100000000000) {
      errs.budget = 'Budget cannot exceed ₦100,000,000,000.';
    }

    return errs;
  }, [clientName, enquiry, area, numericBudget]);

  const isSubmitDisabled = Object.keys(errors).length > 0;

  const handleBudgetChange = (e) => {
    setBudgetFormatted(formatBudgetInput(e.target.value));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched(true);
    if (isSubmitDisabled || !channel) return;

    postLead(channel.id, {
      clientName: clientName.trim(),
      enquiry: enquiry.trim(),
      area: area.trim(),
      budgetNgn: numericBudget,
    });

    onClose();
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Post a Lead"
      variant="form"
      isDirty={isDirty}
      discardTitle="Discard this lead?"
    >
      <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col">
      {/* Client Name */}
      <div className="space-y-1.5">
        <label htmlFor="post-lead-client-name" className="block text-xs font-semibold text-ink">
          Client name <span className="text-status-danger">*</span>
        </label>
        <input
          id="post-lead-client-name"
          name="post_lead_client_name"
          type="text"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder="e.g. Chief Adeleke"
          maxLength={60}
          required
          className="w-full px-3 py-2.5 text-xs bg-surface border border-line rounded-lg text-ink focus:border-brand focus:outline-none"
        />
        {touched && errors.clientName && (
          <p className="text-xs text-status-danger font-medium">{errors.clientName}</p>
        )}
      </div>

      {/* What they are looking for (textarea with counter) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="post-lead-enquiry" className="block text-xs font-semibold text-ink">
            What they are looking for <span className="text-status-danger">*</span>
          </label>
          <span className="text-xs text-ink-muted tabular-nums">
            {enquiry.length}/160
          </span>
        </div>
        <textarea
          id="post-lead-enquiry"
          name="post_lead_enquiry"
          rows={3}
          value={enquiry}
          onChange={(e) => setEnquiry(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder="e.g. 4-bedroom terrace with boy's quarters and 24hr power"
          maxLength={160}
          required
          className="w-full px-3 py-2 text-xs bg-surface border border-line rounded-lg text-ink focus:border-brand focus:outline-none resize-none leading-relaxed"
        />
        {touched && errors.enquiry && (
          <p className="text-xs text-status-danger font-medium">{errors.enquiry}</p>
        )}
      </div>

      {/* Area with chips + free text */}
      <div className="space-y-1.5">
        <label htmlFor="post-lead-area" className="block text-xs font-semibold text-ink">
          Area / Neighborhood <span className="text-status-danger">*</span>
        </label>
        {officeAreas.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pb-1">
            {officeAreas.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setArea(a)}
                className={`min-h-[44px] px-2.5 py-1 rounded-lg text-xs font-medium border cursor-pointer transition-colors ${
                  area === a
                    ? 'border-brand bg-brand-bg text-brand-ink font-semibold'
                    : 'border-line bg-surface text-ink-soft hover:bg-surface-raised'
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        )}
        <input
          id="post-lead-area"
          name="post_lead_area"
          type="text"
          value={area}
          onChange={(e) => setArea(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder="e.g. Maitama"
          maxLength={30}
          required
          className="w-full px-3 py-2.5 text-xs bg-surface border border-line rounded-lg text-ink focus:border-brand focus:outline-none"
        />
        {touched && errors.area && (
          <p className="text-xs text-status-danger font-medium">{errors.area}</p>
        )}
      </div>

      {/* Budget with ₦ prefix */}
      <div className="space-y-1.5">
        <label htmlFor="post-lead-budget" className="block text-xs font-semibold text-ink">
          Budget (NGN) <span className="text-status-danger">*</span>
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-xs font-bold text-ink-muted">
            ₦
          </span>
          <input
            id="post-lead-budget"
            name="post_lead_budget"
            type="text"
            inputMode="numeric"
            value={budgetFormatted}
            onChange={handleBudgetChange}
            onBlur={() => setTouched(true)}
            placeholder="250,000,000"
            required
            className="w-full pl-8 pr-3 py-2.5 text-xs bg-surface border border-line rounded-lg text-ink tabular-nums font-semibold focus:border-brand focus:outline-none"
          />
        </div>
        {touched && errors.budget && (
          <p className="text-xs text-status-danger font-medium">{errors.budget}</p>
        )}
      </div>

      {/* Actions */}
      <div className="sticky bottom-0 bg-surface border-t border-line py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] flex items-center justify-end gap-2 -mx-5 px-5 mt-auto">
        <Button type="button" variant="ghost" onClick={onClose} className="min-h-[44px]">
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={touched && isSubmitDisabled}
          className="min-h-[44px]"
        >
          Post lead
        </Button>
      </div>
    </form>
  </Drawer>
  );
}

export function PostLeadDrawer({ isOpen, onClose, channel }) {
  const [formKey, setFormKey] = useState(0);

  const handleClose = () => {
    setFormKey((k) => k + 1);
    onClose();
  };

  if (!isOpen || !channel) {
    return <Drawer isOpen={false} onClose={onClose} title="Post a Lead" variant="form" />;
  }

  return (
    <PostLeadForm key={`${channel.id}-${formKey}`} isOpen={isOpen} channel={channel} onClose={handleClose} />
  );
}

export default PostLeadDrawer;
