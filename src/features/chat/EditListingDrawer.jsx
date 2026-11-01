import { useState, useMemo, useRef } from 'react';
import { Upload, Trash2, Check } from 'lucide-react';
import { Drawer } from '../../components/common/Drawer.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { COMPANY_CONFIG } from '../../config/market.js';
import { useChat } from '../../context/ChatContext.jsx';
import { getPreviewUrl, setPreviewUrl } from '../../utils/previewUrls.js';
import { ListingPhoto } from './ListingPhoto.jsx';

const STATUS_OPTIONS = [
  { id: 'Available', label: 'Available', variant: 'success', desc: 'Available for viewings and enquiries' },
  { id: 'Under offer', label: 'Under offer', variant: 'warning', desc: 'Offer accepted, contract in progress' },
  { id: 'Sold', label: 'Sold', variant: 'neutral', desc: 'Transaction closed and title transferred' },
];

function formatPriceInput(raw) {
  const digits = String(raw || '').replace(/\D/g, '');
  if (!digits) return '';
  return Number(digits).toLocaleString('en-US');
}

export function EditListingDrawer({ isOpen, onClose, channel }) {
  const { updateListingDetails } = useChat();

  const office = useMemo(() => {
    return COMPANY_CONFIG.offices.find((o) => o.id === channel?.officeId) || COMPANY_CONFIG.offices[0];
  }, [channel?.officeId]);

  const [title, setTitle] = useState(channel?.title || channel?.name || '');
  const [area, setArea] = useState(channel?.area || channel?.location || '');
  const [priceFormatted, setPriceFormatted] = useState(() => formatPriceInput(channel?.priceNgn || channel?.price || ''));
  const [status, setStatus] = useState(channel?.status || 'Available');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(() => {
    if (!channel?.id) return null;
    return getPreviewUrl(`listing:${channel.id}`) || getPreviewUrl(channel.id) || null;
  });
  const [isPhotoRemoved, setIsPhotoRemoved] = useState(false);
  const [touched, setTouched] = useState(false);

  const fileInputRef = useRef(null);

  const numericPrice = useMemo(() => {
    const digits = priceFormatted.replace(/\D/g, '');
    return digits ? Number(digits) : 0;
  }, [priceFormatted]);

  // Validation
  const errors = useMemo(() => {
    const errs = {};
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      errs.title = 'Property name is required.';
    } else if (trimmedTitle.length < 3) {
      errs.title = 'Property name must be at least 3 characters.';
    } else if (trimmedTitle.length > 40) {
      errs.title = 'Property name must be at most 40 characters.';
    }

    const trimmedArea = area.trim();
    if (!trimmedArea) {
      errs.area = 'Area is required.';
    } else if (trimmedArea.length > 30) {
      errs.area = 'Area must be at most 30 characters.';
    }

    if (!numericPrice || numericPrice <= 0) {
      errs.price = 'Price must be greater than zero.';
    } else if (numericPrice > 100000000000) {
      errs.price = 'Price cannot exceed ₦100,000,000,000.';
    }

    return errs;
  }, [title, area, numericPrice]);

  const isSubmitDisabled = Object.keys(errors).length > 0;

  const handlePriceChange = (e) => {
    setPriceFormatted(formatPriceInput(e.target.value));
  };

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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched(true);
    if (isSubmitDisabled || !channel) return;

    updateListingDetails(channel.id, {
      title: title.trim(),
      area: area.trim(),
      priceNgn: numericPrice,
      status,
    });

    if (photoFile) {
      const url = URL.createObjectURL(photoFile);
      setPreviewUrl(`listing:${channel.id}`, url);
    } else if (isPhotoRemoved) {
      setPreviewUrl(`listing:${channel.id}`, null);
    }

    onClose();
  };

  if (!channel) return null;

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Edit listing details">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Property Name */}
        <div className="space-y-1.5">
          <label htmlFor="edit-listing-title" className="block text-xs font-semibold text-ink">
            Property Name <span className="text-status-danger">*</span>
          </label>
          <input
            id="edit-listing-title"
            name="edit_listing_title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="e.g. Lekki Duplex"
            maxLength={40}
            required
            className="w-full px-3 py-2.5 text-xs bg-surface border border-line rounded-lg text-ink focus:border-brand focus:outline-none"
          />
          {touched && errors.title ? (
            <p className="text-xs text-status-danger font-medium">{errors.title}</p>
          ) : (
            <p className="text-xs text-ink-muted">Shown as the room title (3–40 characters).</p>
          )}
        </div>

        {/* Office (Fixed text) */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-ink">Branch Office</label>
          <div className="p-2.5 rounded-lg bg-surface-raised border border-line text-xs font-semibold text-ink">
            {office?.name || 'Branch'} office
          </div>
          <p className="text-xs text-ink-muted">Office location cannot be changed after creation.</p>
        </div>

        {/* Area */}
        <div className="space-y-1.5">
          <label htmlFor="edit-listing-area" className="block text-xs font-semibold text-ink">
            Area / Neighborhood <span className="text-status-danger">*</span>
          </label>
          {office?.areas && office.areas.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {office.areas.map((a) => (
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
            id="edit-listing-area"
            name="edit_listing_area"
            type="text"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="e.g. Lekki Phase 1"
            maxLength={30}
            required
            className="w-full px-3 py-2.5 text-xs bg-surface border border-line rounded-lg text-ink focus:border-brand focus:outline-none"
          />
          {touched && errors.area && (
            <p className="text-xs text-status-danger font-medium">{errors.area}</p>
          )}
        </div>

        {/* Price (₦ Prefix with thousands separators) */}
        <div className="space-y-1.5">
          <label htmlFor="edit-listing-price" className="block text-xs font-semibold text-ink">
            Price (NGN) <span className="text-status-danger">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-xs font-bold text-ink-muted">
              ₦
            </span>
            <input
              id="edit-listing-price"
              name="edit_listing_price"
              type="text"
              inputMode="numeric"
              value={priceFormatted}
              onChange={handlePriceChange}
              onBlur={() => setTouched(true)}
              placeholder="185,000,000"
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
          <label className="block text-xs font-semibold text-ink">Transaction Status</label>
          <div className="space-y-2" role="radiogroup" aria-label="Transaction Status">
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
                      name="edit_listing_status"
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

        {/* Photo Upload / Replace / Remove */}
        <div className="space-y-2 pt-1 border-t border-line">
          <label className="block text-xs font-semibold text-ink">Listing Photo</label>
          <input
            ref={fileInputRef}
            name="edit_listing_photo_input"
            type="file"
            accept="image/*"
            onChange={handlePhotoSelect}
            className="hidden"
          />

          {photoPreview && !isPhotoRemoved ? (
            <div className="flex items-center gap-3 p-2.5 rounded-xl border border-line bg-surface-raised">
              <div className="w-16 h-12 rounded-lg overflow-hidden border border-line shrink-0 bg-surface">
                <img
                  src={photoPreview}
                  alt="Listing preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="min-h-[44px] px-3 py-2 text-xs font-semibold text-brand hover:underline cursor-pointer"
                >
                  Replace photo
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
            <div className="flex items-center gap-3">
              <div className="w-16 h-12 rounded-lg overflow-hidden border border-line shrink-0 bg-surface-raised">
                <ListingPhoto channel={channel} className="w-full h-full object-cover" />
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Add a photo</span>
              </Button>
            </div>
          )}

          <p className="text-xs text-ink-muted">
            Photos are kept only for this session in the prototype.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 flex items-center justify-end gap-2 border-t border-line">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={touched && isSubmitDisabled}>
            Save details
          </Button>
        </div>
      </form>
    </Drawer>
  );
}

export default EditListingDrawer;
