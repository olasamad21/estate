import { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Trash2, Check } from 'lucide-react';
import { Drawer } from '../../components/common/Drawer.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { useChat } from '../../context/ChatContext.jsx';
import { setPreviewUrl } from '../../utils/previewUrls.js';

const PROPERTY_TYPES = [
  'Land',
  'Detached house',
  'Semi-detached',
  'Terrace',
  'Apartment',
  'Commercial',
  'Other',
];

const STATUS_OPTIONS = [
  { id: 'Available', label: 'Available', variant: 'success', desc: 'Available for viewings and enquiries' },
  { id: 'Under offer', label: 'Under offer', variant: 'warning', desc: 'Offer accepted, documentation in progress' },
  { id: 'Sold', label: 'Sold', variant: 'neutral', desc: 'Transaction closed and title transferred' },
];

function formatPriceInput(raw) {
  const digits = String(raw || '').replace(/\D/g, '');
  if (!digits) return '';
  return Number(digits).toLocaleString('en-US');
}

function AddPropertyForm({ site, onClose }) {
  const { createProperty } = useChat();
  const navigate = useNavigate();

  const siteLocation = site?.site?.location || site?.location || '';

  const [title, setTitle] = useState('');
  const [type, setType] = useState('');
  const [size, setSize] = useState('');
  const [priceFormatted, setPriceFormatted] = useState('');
  const [status, setStatus] = useState('Available');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [touched, setTouched] = useState(false);
  const photoInputRef = useRef(null);

  const numericPrice = useMemo(() => {
    const digits = priceFormatted.replace(/\D/g, '');
    return digits ? Number(digits) : 0;
  }, [priceFormatted]);

  const errors = useMemo(() => {
    const errs = {};
    const t = title.trim();
    if (!t) {
      errs.title = 'Property name is required.';
    } else if (t.length < 2) {
      errs.title = 'Property name must be at least 2 characters.';
    } else if (t.length > 40) {
      errs.title = 'Property name must be at most 40 characters.';
    }

    if (!numericPrice || numericPrice <= 0) {
      errs.price = 'Price must be greater than zero.';
    } else if (numericPrice > 100000000000) {
      errs.price = 'Price cannot exceed ₦100,000,000,000.';
    }

    if (size.trim().length > 20) {
      errs.size = 'Size must be at most 20 characters.';
    }

    return errs;
  }, [title, numericPrice, size]);

  const isSubmitDisabled = Object.keys(errors).length > 0;

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (photoInputRef.current) {
      photoInputRef.current.value = '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched(true);
    if (isSubmitDisabled || !site) return;

    const result = createProperty(site.id, {
      title: title.trim(),
      type: type || '',
      size: size.trim(),
      priceNgn: numericPrice,
      status,
    });

    if (!result.ok) {
      return;
    }

    if (photoFile && result.id) {
      const url = URL.createObjectURL(photoFile);
      setPreviewUrl(`listing:${result.id}`, url);
    }

    onClose();
    navigate(`/channels/${result.id}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Property Name */}
      <div className="space-y-1.5">
        <label htmlFor="add-property-title" className="block text-xs font-semibold text-ink">
          Property Name <span className="text-status-danger">*</span>
        </label>
        <input
          id="add-property-title"
          name="add_property_title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder="For example Plot 12 or Block A, Flat 3"
          maxLength={40}
          required
          className="w-full px-3 py-2.5 text-xs bg-surface border border-line rounded-lg text-ink focus:border-brand focus:outline-none"
        />
        {touched && errors.title ? (
          <p className="text-xs text-status-danger font-medium">{errors.title}</p>
        ) : (
          <p className="text-xs text-ink-muted">For example Plot 12 or Block A, Flat 3</p>
        )}
      </div>

      {/* Location (Read-only text taken from the site) */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-ink">Location</label>
        <div className="p-2.5 rounded-lg bg-surface-raised border border-line text-xs font-semibold text-ink">
          {siteLocation || 'Site location'}
        </div>
      </div>

      {/* Type (Single-select chips) */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-ink">Property Type (optional)</label>
        <div className="flex flex-wrap gap-1.5">
          {PROPERTY_TYPES.map((pt) => {
            const isSelected = type === pt;
            return (
              <button
                key={pt}
                type="button"
                onClick={() => setType(isSelected ? '' : pt)}
                className={`min-h-[44px] px-3 py-2 rounded-lg text-xs font-medium border cursor-pointer transition-colors ${
                  isSelected
                    ? 'border-brand bg-brand-bg text-brand-ink font-semibold'
                    : 'border-line bg-surface text-ink-soft hover:bg-surface-raised'
                }`}
              >
                {pt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Size */}
      <div className="space-y-1.5">
        <label htmlFor="add-property-size" className="block text-xs font-semibold text-ink">
          Size (optional)
        </label>
        <input
          id="add-property-size"
          name="add_property_size"
          type="text"
          value={size}
          onChange={(e) => setSize(e.target.value)}
          placeholder="For example 450 sqm"
          maxLength={20}
          className="w-full px-3 py-2.5 text-xs bg-surface border border-line rounded-lg text-ink focus:border-brand focus:outline-none"
        />
        {touched && errors.size ? (
          <p className="text-xs text-status-danger font-medium">{errors.size}</p>
        ) : (
          <p className="text-xs text-ink-muted">For example 450 sqm</p>
        )}
      </div>

      {/* Price */}
      <div className="space-y-1.5">
        <label htmlFor="add-property-price" className="block text-xs font-semibold text-ink">
          Price (NGN) <span className="text-status-danger">*</span>
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-xs font-bold text-ink-muted">
            ₦
          </span>
          <input
            id="add-property-price"
            name="add_property_price"
            type="text"
            inputMode="numeric"
            value={priceFormatted}
            onChange={(e) => setPriceFormatted(formatPriceInput(e.target.value))}
            onBlur={() => setTouched(true)}
            placeholder="85,000,000"
            required
            className="w-full pl-8 pr-3 py-2.5 text-xs bg-surface border border-line rounded-lg text-ink tabular-nums font-semibold focus:border-brand focus:outline-none"
          />
        </div>
        {touched && errors.price && (
          <p className="text-xs text-status-danger font-medium">{errors.price}</p>
        )}
      </div>

      {/* Status (Three radio rows) */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-ink">Status</label>
        <div className="space-y-2" role="radiogroup" aria-label="Status">
          {STATUS_OPTIONS.map((opt) => {
            const isSelected = status === opt.id;
            return (
              <label
                key={opt.id}
                className={`flex items-start justify-between p-3 rounded-xl border transition-colors cursor-pointer ${
                  isSelected
                    ? 'border-brand bg-brand/5 shadow-2xs'
                    : 'border-line bg-surface hover:bg-surface-raised'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0 pr-2">
                  <input
                    type="radio"
                    name="add_property_status"
                    value={opt.id}
                    checked={isSelected}
                    onChange={() => setStatus(opt.id)}
                    className="mt-0.5 accent-brand cursor-pointer"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-ink">{opt.label}</span>
                      <Badge variant={opt.variant} size="sm">
                        {opt.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-ink-muted mt-0.5">{opt.desc}</p>
                  </div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-brand shrink-0" aria-hidden="true" />}
              </label>
            );
          })}
        </div>
      </div>

      {/* Photo (Optional) */}
      <div className="space-y-2 pt-1 border-t border-line">
        <label className="block text-xs font-semibold text-ink">Property Photo (optional)</label>
        <input
          ref={photoInputRef}
          id="add-property-photo"
          name="add_property_photo"
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
                alt="Property preview"
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
          Save property
        </Button>
      </div>
    </form>
  );
}

export function AddPropertyDrawer({ isOpen, onClose, site }) {
  const [formKey, setFormKey] = useState(0);

  const handleClose = () => {
    setFormKey((k) => k + 1);
    onClose();
  };

  return (
    <Drawer isOpen={isOpen} onClose={handleClose} title="Add property">
      {isOpen && site && <AddPropertyForm key={formKey} site={site} onClose={handleClose} />}
    </Drawer>
  );
}

export default AddPropertyDrawer;
