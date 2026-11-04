import { useState, useMemo, useRef } from 'react';
import { Upload, Trash2 } from 'lucide-react';
import { Drawer } from '../../components/common/Drawer.jsx';
import { Button } from '../../components/common/Button.jsx';
import { COMPANY_CONFIG } from '../../config/market.js';
import { useChat } from '../../context/ChatContext.jsx';
import { getPreviewUrl, setPreviewUrl } from '../../utils/previewUrls.js';

function EditSiteForm({ site, onClose }) {
  const { updateSite } = useChat();

  const office = useMemo(() => {
    const offId = site?.officeId || site?.site?.officeId;
    return COMPANY_CONFIG.offices.find((o) => o.id === offId) || COMPANY_CONFIG.offices[0];
  }, [site]);

  const [title, setTitle] = useState(site?.title || site?.name || '');
  const [location, setLocation] = useState(site?.site?.location || site?.location || '');
  const [description, setDescription] = useState(site?.description || '');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(() => {
    if (!site?.id) return null;
    return getPreviewUrl(`site:${site.id}`) || site?.site?.photoUrl || site?.photoUrl || null;
  });
  const [isPhotoRemoved, setIsPhotoRemoved] = useState(false);
  const [touched, setTouched] = useState(false);
  const photoInputRef = useRef(null);

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

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setIsPhotoRemoved(false);
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setIsPhotoRemoved(true);
    if (photoInputRef.current) {
      photoInputRef.current.value = '';
    }
  };

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

    if (photoFile) {
      const url = URL.createObjectURL(photoFile);
      setPreviewUrl(`site:${site.id}`, url);
    } else if (isPhotoRemoved) {
      setPreviewUrl(`site:${site.id}`, null);
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

      {/* Photo (Replace and Remove) */}
      <div className="space-y-2 pt-1 border-t border-line">
        <label className="block text-xs font-semibold text-ink">Site Photo (optional)</label>
        <input
          ref={photoInputRef}
          id="edit-site-photo"
          name="edit_site_photo"
          type="file"
          accept="image/*"
          onChange={handlePhotoSelect}
          className="hidden"
        />

        {photoPreview ? (
          <div className="flex items-center gap-3 p-2.5 rounded-xl border border-line bg-surface-raised">
            <div className="w-16 h-12 rounded-lg overflow-hidden border border-line shrink-0 bg-surface">
              <img
                src={photoPreview}
                alt="Site preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="min-h-[44px] px-3 py-2 text-xs font-semibold text-brand hover:underline cursor-pointer"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="min-h-[44px] px-2 py-2 text-xs font-medium text-status-danger hover:underline cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        ) : (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => photoInputRef.current?.click()}
            className="cursor-pointer gap-1.5 min-h-[44px]"
          >
            <Upload className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Add a photo</span>
          </Button>
        )}

        <p className="text-xs text-ink-muted">
          Photos are kept only for this session in the prototype.
        </p>
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
