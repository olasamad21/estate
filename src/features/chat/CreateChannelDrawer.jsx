import { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hash, Lock, Check, Building2, Upload, Trash2 } from 'lucide-react';
import { Drawer } from '../../components/common/Drawer.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { Avatar } from '../../components/common/Avatar.jsx';
import { useChat } from '../../context/ChatContext.jsx';
import { useToast } from '../../components/common/useToast.js';
import { COMPANY_CONFIG } from '../../config/market.js';
import { setPreviewUrl } from '../../utils/previewUrls.js';
import {
  officeChoicesFor,
  isChannelNameValid,
  isStaffActive,
  initialsOf,
} from '../../utils/chat.js';
import { getChannelCreatedMessage, getListingRoomCreatedMessage } from '../../utils/messages.js';
import { ROLE_LABELS } from '../../mock/staff.js';

const LISTING_STATUS_OPTIONS = [
  { id: 'Available', label: 'Available', variant: 'success', desc: 'Available for viewings and enquiries' },
  { id: 'Under offer', label: 'Under offer', variant: 'warning', desc: 'Offer accepted, documentation in progress' },
  { id: 'Sold', label: 'Sold', variant: 'neutral', desc: 'Transaction closed and title transferred' },
];

function formatPriceInput(raw) {
  const digits = String(raw || '').replace(/\D/g, '');
  if (!digits) return '';
  return Number(digits).toLocaleString('en-US');
}

function CreateChannelForm({ onClose }) {
  const { currentUser, currentUserId, channels, staff, createChannel } = useChat();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const canCreateListing = currentUser?.role === 'admin' || currentUser?.role === 'manager';

  const officeOptions = useMemo(() => {
    return officeChoicesFor(currentUser);
  }, [currentUser]);

  const defaultOfficeId = officeOptions[0] ? officeOptions[0].id : null;

  // General channel state (public & private)
  const [kind, setKind] = useState('public');
  const [name, setName] = useState('');
  const [officeId, setOfficeId] = useState(defaultOfficeId);
  const [description, setDescription] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState(currentUserId ? [currentUserId] : []);
  const [touched, setTouched] = useState(false);

  // Listing room state
  const managerOfficeId = currentUser?.officeId || currentUser?.office || COMPANY_CONFIG.offices[0]?.id || 'hq';
  const defaultListingOffice = (currentUser?.role === 'admin' || currentUser?.seesAllOffices)
    ? (COMPANY_CONFIG.offices[0]?.id || 'hq')
    : managerOfficeId;
  const [listingOfficeId, setListingOfficeId] = useState(defaultListingOffice);
  const [listingTitle, setListingTitle] = useState('');
  const [listingArea, setListingArea] = useState('');
  const [listingPriceFormatted, setListingPriceFormatted] = useState('');
  const [listingStatus, setListingStatus] = useState('Available');
  const [listingPhotoFile, setListingPhotoFile] = useState(null);
  const [listingPhotoPreview, setListingPhotoPreview] = useState(null);
  const photoInputRef = useRef(null);

  // Clean and sanitize public/private channel name
  const handleNameChange = (e) => {
    const raw = e.target.value;
    const sanitized = raw
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    setName(sanitized);
    setTouched(true);
  };

  // Inline validation for public/private channel
  const nameError = useMemo(() => {
    if (kind === 'listing') return '';
    if (!touched && !name) return '';
    if (!name.trim()) return 'Channel name is required.';
    if (!isChannelNameValid(name)) {
      return 'Lowercase letters, digits and hyphens only (2–50 characters).';
    }
    const duplicate = channels.some(
      (c) => c.name.toLowerCase() === name.trim().toLowerCase()
    );
    if (duplicate) return 'A channel with this name already exists.';
    return '';
  }, [kind, name, touched, channels]);

  // Numeric price calculation for listing
  const numericPrice = useMemo(() => {
    const digits = listingPriceFormatted.replace(/\D/g, '');
    return digits ? Number(digits) : 0;
  }, [listingPriceFormatted]);

  // Selected office object for listing areas
  const currentListingOffice = useMemo(() => {
    return COMPANY_CONFIG.offices.find((o) => o.id === listingOfficeId) || COMPANY_CONFIG.offices[0];
  }, [listingOfficeId]);

  // Inline validation for listing room
  const listingErrors = useMemo(() => {
    if (kind !== 'listing') return {};
    const errs = {};
    const t = listingTitle.trim();
    if (!t) {
      errs.title = 'Property name is required.';
    } else if (t.length < 3) {
      errs.title = 'Property name must be at least 3 characters.';
    } else if (t.length > 40) {
      errs.title = 'Property name must be at most 40 characters.';
    }

    const a = listingArea.trim();
    if (!a) {
      errs.area = 'Area is required.';
    } else if (a.length > 30) {
      errs.area = 'Area must be at most 30 characters.';
    }

    if (!numericPrice || numericPrice <= 0) {
      errs.price = 'Price must be greater than zero.';
    } else if (numericPrice > 100000000000) {
      errs.price = 'Price cannot exceed ₦100,000,000,000.';
    }

    return errs;
  }, [kind, listingTitle, listingArea, numericPrice]);

  // Eligible staff for private channel based on selected office
  const eligibleStaff = useMemo(() => {
    const activeStaff = staff.filter((s) => isStaffActive(s));
    if (!officeId) {
      return activeStaff;
    }
    return activeStaff.filter(
      (s) => s.role === 'admin' || (s.officeId || s.office) === officeId
    );
  }, [staff, officeId]);

  // Toggle member in private channel checklist
  const handleToggleMember = (memberId) => {
    if (memberId === currentUserId) return;
    setSelectedMemberIds((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleListingOfficeChange = (newOfficeId) => {
    setListingOfficeId(newOfficeId);
    setListingArea(''); // reset area on office switch per spec
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setListingPhotoFile(file);
      const url = URL.createObjectURL(file);
      setListingPhotoPreview(url);
    }
  };

  const handleRemovePhoto = () => {
    setListingPhotoFile(null);
    setListingPhotoPreview(null);
    if (photoInputRef.current) {
      photoInputRef.current.value = '';
    }
  };

  const isSubmitDisabled =
    kind === 'listing'
      ? Object.keys(listingErrors).length > 0
      : Boolean(!name.trim() || nameError);

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched(true);
    if (isSubmitDisabled) return;

    if (kind === 'listing') {
      const newChannel = createChannel({
        kind: 'listing',
        title: listingTitle.trim(),
        officeId: listingOfficeId,
        area: listingArea.trim(),
        priceNgn: numericPrice,
        status: listingStatus,
      });

      if (listingPhotoFile) {
        const url = URL.createObjectURL(listingPhotoFile);
        setPreviewUrl(`listing:${newChannel.id}`, url);
      }

      showToast(getListingRoomCreatedMessage(newChannel.title || newChannel.name));
      onClose();
      navigate(`/channels/${newChannel.id}`);
      return;
    }

    const newChannel = createChannel({
      name: name.trim(),
      kind,
      officeId,
      description: description.trim(),
      memberIds: kind === 'private' ? selectedMemberIds : undefined,
    });

    showToast(getChannelCreatedMessage(newChannel.name));
    onClose();
    navigate(`/channels/${newChannel.id}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Kind Selection (Three radio rows: Public, Private, Listing room) */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-ink">Channel Type</label>
        <div className="space-y-2" role="radiogroup" aria-label="Channel Type">
          {/* Public */}
          <label
            className={`flex items-start justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
              kind === 'public'
                ? 'border-brand bg-brand/5 shadow-2xs'
                : 'border-line bg-surface hover:bg-surface-raised'
            }`}
          >
            <div className="flex items-start gap-2.5 min-w-0 pr-2">
              <input
                type="radio"
                name="new_channel_kind"
                value="public"
                checked={kind === 'public'}
                onChange={() => setKind('public')}
                className="mt-0.5 accent-brand cursor-pointer"
              />
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-ink">
                  <Hash className="w-3.5 h-3.5 text-brand" aria-hidden="true" />
                  <span>Public</span>
                </div>
                <p className="text-xs text-ink-muted">
                  Open to everyone in the designated branch or company-wide.
                </p>
              </div>
            </div>
            {kind === 'public' && <Check className="w-4 h-4 text-brand shrink-0" aria-hidden="true" />}
          </label>

          {/* Private */}
          <label
            className={`flex items-start justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
              kind === 'private'
                ? 'border-brand bg-brand/5 shadow-2xs'
                : 'border-line bg-surface hover:bg-surface-raised'
            }`}
          >
            <div className="flex items-start gap-2.5 min-w-0 pr-2">
              <input
                type="radio"
                name="new_channel_kind"
                value="private"
                checked={kind === 'private'}
                onChange={() => setKind('private')}
                className="mt-0.5 accent-brand cursor-pointer"
              />
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-ink">
                  <Lock className="w-3.5 h-3.5 text-ink-muted" aria-hidden="true" />
                  <span>Private</span>
                </div>
                <p className="text-xs text-ink-muted">
                  Restricted to invited members and administrators.
                </p>
              </div>
            </div>
            {kind === 'private' && <Check className="w-4 h-4 text-brand shrink-0" aria-hidden="true" />}
          </label>

          {/* Listing Room (Admins and managers only) */}
          {canCreateListing && (
            <label
              className={`flex items-start justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                kind === 'listing'
                  ? 'border-brand bg-brand/5 shadow-2xs'
                  : 'border-line bg-surface hover:bg-surface-raised'
              }`}
            >
              <div className="flex items-start gap-2.5 min-w-0 pr-2">
                <input
                  type="radio"
                  name="new_channel_kind"
                  value="listing"
                  checked={kind === 'listing'}
                  onChange={() => setKind('listing')}
                  className="mt-0.5 accent-brand cursor-pointer"
                />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-ink">
                    <Building2 className="w-3.5 h-3.5 text-brand" aria-hidden="true" />
                    <span>Listing room</span>
                  </div>
                  <p className="text-xs text-ink-muted">
                    Dedicated property transaction room with metadata, price and photos.
                  </p>
                </div>
              </div>
              {kind === 'listing' && <Check className="w-4 h-4 text-brand shrink-0" aria-hidden="true" />}
            </label>
          )}
        </div>
      </div>

      {/* Conditional Fields: Listing Room vs Public/Private */}
      {kind === 'listing' ? (
        /* Listing Room Fields */
        <div className="space-y-4 pt-1 border-t border-line">
          {/* Property Name */}
          <div className="space-y-1.5">
            <label htmlFor="create-listing-title" className="block text-xs font-semibold text-ink">
              Property Name <span className="text-status-danger">*</span>
            </label>
            <input
              id="create-listing-title"
              name="new_listing_title"
              type="text"
              value={listingTitle}
              onChange={(e) => setListingTitle(e.target.value)}
              onBlur={() => setTouched(true)}
              placeholder="e.g. Maitama Terrace Duplex"
              maxLength={40}
              required
              className="w-full px-3 py-2.5 text-xs bg-surface border border-line rounded-lg text-ink focus:border-brand focus:outline-none"
            />
            {touched && listingErrors.title ? (
              <p className="text-xs text-status-danger font-medium">{listingErrors.title}</p>
            ) : (
              <p className="text-xs text-ink-muted">Shown as the room title (3–40 characters).</p>
            )}
          </div>

          {/* Office */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-ink">Branch Office</label>
            {currentUser?.role === 'admin' || currentUser?.seesAllOffices ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2" role="radiogroup" aria-label="Branch Office">
                {COMPANY_CONFIG.offices.map((off) => (
                  <label
                    key={off.id}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer text-xs transition-colors ${
                      listingOfficeId === off.id
                        ? 'border-brand bg-brand-bg text-brand-ink font-semibold'
                        : 'border-line bg-surface text-ink-soft hover:bg-surface-raised'
                    }`}
                  >
                    <input
                      type="radio"
                      name="new_listing_office"
                      value={off.id}
                      checked={listingOfficeId === off.id}
                      onChange={() => handleListingOfficeChange(off.id)}
                      className="accent-brand cursor-pointer"
                    />
                    <span>{off.label}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="p-2.5 rounded-lg bg-surface-raised border border-line text-xs font-semibold text-ink">
                {currentListingOffice.label}
              </div>
            )}
          </div>

          {/* Area */}
          <div className="space-y-1.5">
            <label htmlFor="create-listing-area" className="block text-xs font-semibold text-ink">
              Area / Neighborhood <span className="text-status-danger">*</span>
            </label>
            {currentListingOffice.areas && currentListingOffice.areas.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {currentListingOffice.areas.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setListingArea(a)}
                    className={`min-h-[44px] px-2.5 py-1 rounded-lg text-xs font-medium border cursor-pointer transition-colors ${
                      listingArea === a
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
              id="create-listing-area"
              name="new_listing_area"
              type="text"
              value={listingArea}
              onChange={(e) => setListingArea(e.target.value)}
              onBlur={() => setTouched(true)}
              placeholder="e.g. Maitama"
              maxLength={30}
              required
              className="w-full px-3 py-2.5 text-xs bg-surface border border-line rounded-lg text-ink focus:border-brand focus:outline-none"
            />
            {touched && listingErrors.area && (
              <p className="text-xs text-status-danger font-medium">{listingErrors.area}</p>
            )}
          </div>

          {/* Price */}
          <div className="space-y-1.5">
            <label htmlFor="create-listing-price" className="block text-xs font-semibold text-ink">
              Price (NGN) <span className="text-status-danger">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-xs font-bold text-ink-muted">
                ₦
              </span>
              <input
                id="create-listing-price"
                name="new_listing_price"
                type="text"
                inputMode="numeric"
                value={listingPriceFormatted}
                onChange={(e) => setListingPriceFormatted(formatPriceInput(e.target.value))}
                onBlur={() => setTouched(true)}
                placeholder="185,000,000"
                required
                className="w-full pl-8 pr-3 py-2.5 text-xs bg-surface border border-line rounded-lg text-ink tabular-nums font-semibold focus:border-brand focus:outline-none"
              />
            </div>
            {touched && listingErrors.price && (
              <p className="text-xs text-status-danger font-medium">{listingErrors.price}</p>
            )}
          </div>

          {/* Status (Three radio rows) */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-ink">Transaction Status</label>
            <div className="space-y-2" role="radiogroup" aria-label="Transaction Status">
              {LISTING_STATUS_OPTIONS.map((opt) => {
                const isSelected = listingStatus === opt.id;
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
                        name="new_listing_status"
                        value={opt.id}
                        checked={isSelected}
                        onChange={() => setListingStatus(opt.id)}
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
            <label className="block text-xs font-semibold text-ink">Listing Photo (optional)</label>
            <input
              ref={photoInputRef}
              name="new_listing_photo_file"
              type="file"
              accept="image/*"
              onChange={handlePhotoSelect}
              className="hidden"
            />

            {listingPhotoPreview ? (
              <div className="flex items-center gap-3 p-2.5 rounded-xl border border-line bg-surface-raised">
                <div className="w-16 h-12 rounded-lg overflow-hidden border border-line shrink-0 bg-surface">
                  <img
                    src={listingPhotoPreview}
                    alt="Listing thumbnail preview"
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
                className="cursor-pointer gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Add a photo</span>
              </Button>
            )}

            <p className="text-xs text-ink-muted">
              Photos are kept only for this session in the prototype.
            </p>
          </div>
        </div>
      ) : (
        /* Regular Public/Private Channel Fields */
        <>
          {/* Channel Name */}
          <div className="space-y-1.5">
            <label htmlFor="create-channel-name" className="block text-xs font-semibold text-ink">
              Channel Name <span className="text-status-danger">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ink-muted">
                {kind === 'private' ? (
                  <Lock className="w-4 h-4 text-ink-muted" aria-hidden="true" />
                ) : (
                  <Hash className="w-4 h-4 text-ink-muted" aria-hidden="true" />
                )}
              </div>
              <input
                id="create-channel-name"
                name="new_channel_name"
                type="text"
                value={name}
                onChange={handleNameChange}
                onBlur={() => setTouched(true)}
                placeholder="e.g. maitama-inspections"
                required
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-surface border border-line rounded-lg text-ink focus:border-brand focus:outline-none"
              />
            </div>
            {nameError ? (
              <p className="text-xs text-status-danger font-medium">{nameError}</p>
            ) : (
              <p className="text-xs text-ink-muted">
                Use lowercase letters, numbers, and hyphens. Spaces convert automatically.
              </p>
            )}
          </div>

          {/* Office Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-ink">Office Scope</label>
            {officeOptions.length > 1 ? (
              <div className="space-y-1.5" role="radiogroup" aria-label="Office Scope">
                {officeOptions.map((opt) => (
                  <label
                    key={String(opt.id)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer text-xs transition-colors ${
                      officeId === opt.id
                        ? 'border-brand bg-surface font-semibold text-ink'
                        : 'border-line bg-surface text-ink-soft hover:bg-surface-raised'
                    }`}
                  >
                    <input
                      type="radio"
                      name="new_channel_office"
                      value={opt.id ?? 'company-wide'}
                      checked={officeId === opt.id}
                      onChange={() => setOfficeId(opt.id)}
                      className="accent-brand cursor-pointer"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="p-2.5 rounded-lg bg-surface-raised border border-line text-xs font-semibold text-ink">
                {officeOptions[0]?.label || 'Branch Office'}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="create-channel-desc" className="block text-xs font-semibold text-ink">
                Description (optional)
              </label>
              <span className="text-xs text-ink-muted tabular-nums">
                {description.length}/100
              </span>
            </div>
            <input
              id="create-channel-desc"
              name="new_channel_description"
              type="text"
              maxLength={100}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief overview of channel purpose"
              className="w-full px-3 py-2 text-xs bg-surface border border-line rounded-lg text-ink focus:border-brand focus:outline-none"
            />
          </div>

          {/* Private Channel Member Checklist */}
          {kind === 'private' && (
            <div className="space-y-2 border-t border-line pt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-ink">Add Channel Members</span>
                <span className="text-xs text-ink-muted">
                  {selectedMemberIds.length} selected
                </span>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1 pr-1 divide-y divide-line">
                {eligibleStaff.map((person) => {
                  const isSelected = selectedMemberIds.includes(person.id);
                  const isCreator = person.id === currentUserId;

                  return (
                    <button
                      key={person.id}
                      type="button"
                      onClick={() => handleToggleMember(person.id)}
                      disabled={isCreator}
                      className={`w-full min-h-[44px] flex items-center justify-between p-2 rounded-lg text-left transition-colors ${
                        isCreator
                          ? 'opacity-70 cursor-not-allowed bg-surface-raised/40'
                          : 'cursor-pointer hover:bg-surface-raised'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <Avatar
                          role={person.role}
                          initials={initialsOf(person.name)}
                          name={person.name}
                          size="xs"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-ink">
                              {person.name}
                            </span>
                            {isCreator && (
                              <span className="text-xs text-ink-muted">(you)</span>
                            )}
                          </div>
                          <span className="text-xs text-ink-muted">
                            {ROLE_LABELS[person.role] || person.role}
                          </span>
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-brand border-brand text-surface'
                            : 'border-line bg-surface'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" aria-hidden="true" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Actions */}
      <div className="pt-2 flex items-center justify-end gap-2 border-t border-line">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={touched && isSubmitDisabled}>
          {kind === 'listing' ? 'Create Listing Room' : 'Create Channel'}
        </Button>
      </div>
    </form>
  );
}

export function CreateChannelDrawer({ isOpen, onClose }) {
  const [formKey, setFormKey] = useState(0);

  const handleClose = () => {
    setFormKey((k) => k + 1);
    onClose();
  };

  return (
    <Drawer isOpen={isOpen} onClose={handleClose} title="Create New Channel">
      {isOpen && <CreateChannelForm key={formKey} onClose={handleClose} />}
    </Drawer>
  );
}

export default CreateChannelDrawer;
