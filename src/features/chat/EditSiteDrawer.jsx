import { useState, useMemo } from 'react';
import { Drawer } from '../../components/common/Drawer.jsx';
import { Button } from '../../components/common/Button.jsx';
import { COMPANY_CONFIG } from '../../config/market.js';
import { useChat } from '../../context/ChatContext.jsx';

function EditSiteForm({ site, onClose }) {
  const { updateSite } = useChat();

  const office = useMemo(() => {
    const offId = site?.officeId || site?.site?.officeId;
    return COMPANY_CONFIG.offices.find((o) => o.id === offId) || COMPANY_CONFIG.offices[0];
  }, [site]);

  const [title, setTitle] = useState(site?.title || site?.name || '');
  const [location, setLocation] = useState(site?.site?.location || site?.location || '');
  const [description, setDescription] = useState(site?.description || '');
  const [touched, setTouched] = useState(false);

  const errors = useMemo(() => {
    const errs = {};
    const t = title.trim();
    if (!t) {
      errs.title = 'Site name is required.';
    } else if (t.length < 3) {
      errs.title = 'Site name must be at least 3 characters.';
    } else if (t.length > 40) {
      errs.title = 'Site name must be at most 40 characters.';
    }

    const loc = location.trim();
    if (!loc) {
      errs.location = 'Location is required.';
    } else if (loc.length > 30) {
      errs.location = 'Location must be at most 30 characters.';
    }

    return errs;
  }, [title, location]);

  const isSubmitDisabled = Object.keys(errors).length > 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched(true);
    if (isSubmitDisabled || !site) return;

    const result = updateSite(site.id, {
      title: title.trim(),
      location: location.trim(),
      description: description.trim(),
    });

    if (!result.ok) {
      return;
    }

    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Site Name */}
      <div className="space-y-1.5">
        <label htmlFor="edit-site-title" className="block text-xs font-semibold text-ink">
          Site Name <span className="text-status-danger">*</span>
        </label>
        <input
          id="edit-site-title"
          name="edit_site_title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder="e.g. Maitama 2"
          maxLength={40}
          required
          className="w-full px-3 py-2.5 text-xs bg-surface border border-line rounded-lg text-ink focus:border-brand focus:outline-none"
        />
        {touched && errors.title ? (
          <p className="text-xs text-status-danger font-medium">{errors.title}</p>
        ) : (
          <p className="text-xs text-ink-muted">3 to 40 characters.</p>
        )}
      </div>

      {/* Office (Read-only text) */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-ink">Branch Office</label>
        <div className="p-2.5 rounded-lg bg-surface-raised border border-line text-xs font-semibold text-ink">
          {office?.label || office?.name || 'All offices'}
        </div>
      </div>

      {/* Location */}
      <div className="space-y-1.5">
        <label htmlFor="edit-site-location" className="block text-xs font-semibold text-ink">
          Location <span className="text-status-danger">*</span>
        </label>
        {office?.areas && office.areas.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {office.areas.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setLocation(a)}
                className={`min-h-[44px] px-2.5 py-1 rounded-lg text-xs font-medium border cursor-pointer transition-colors ${
                  location === a
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
          id="edit-site-location"
          name="edit_site_location"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder="e.g. Maitama"
          maxLength={30}
          required
          className="w-full px-3 py-2.5 text-xs bg-surface border border-line rounded-lg text-ink focus:border-brand focus:outline-none"
        />
        {touched && errors.location && (
          <p className="text-xs text-status-danger font-medium">{errors.location}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="edit-site-description" className="block text-xs font-semibold text-ink">
            Description (optional)
          </label>
          <span className="text-xs text-ink-muted tabular-nums">
            {description.length}/100
          </span>
        </div>
        <textarea
          id="edit-site-description"
          name="edit_site_description"
          value={description}
          onChange={(e) => setDescription(e.target.value.slice(0, 100))}
          maxLength={100}
          rows={2}
          placeholder="Brief overview of this development location"
          className="w-full px-3 py-2 text-xs bg-surface border border-line rounded-lg text-ink focus:border-brand focus:outline-none resize-none"
        />
      </div>

      {/* Actions */}
      <div className="pt-2 flex items-center justify-end gap-2 border-t border-line">
        <Button type="button" variant="ghost" onClick={onClose} className="min-h-[44px]">
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={touched && isSubmitDisabled}
          className="min-h-[44px]"
        >
          Save site
        </Button>
      </div>
    </form>
  );
}

export function EditSiteDrawer({ isOpen, onClose, site }) {
  const [formKey, setFormKey] = useState(0);

  const handleClose = () => {
    setFormKey((k) => k + 1);
    onClose();
  };

  return (
    <Drawer isOpen={isOpen} onClose={handleClose} title="Edit site details">
      {isOpen && site && <EditSiteForm key={formKey} site={site} onClose={handleClose} />}
    </Drawer>
  );
}

export default EditSiteDrawer;
