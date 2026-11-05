import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hash, Lock, Check, Building2 } from 'lucide-react';
import { Drawer } from '../../components/common/Drawer.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Avatar } from '../../components/common/Avatar.jsx';
import { useChat } from '../../context/ChatContext.jsx';
import { useToast } from '../../components/common/useToast.js';
import { COMPANY_CONFIG } from '../../config/market.js';
import {
  officeChoicesFor,
  isChannelNameValid,
  isStaffActive,
  initialsOf,
  canCreateSite,
} from '../../utils/chat.js';
import { getChannelCreatedMessage } from '../../utils/messages.js';
import { ROLE_LABELS } from '../../mock/staff.js';

function CreateChannelForm({ isOpen, onClose }) {
  const { currentUser, currentUserId, channels, staff, createChannel, createSite } = useChat();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const canUserCreateAnySite = useMemo(() => {
    return COMPANY_CONFIG.offices.some((off) => canCreateSite(currentUser, off.id));
  }, [currentUser]);

  const officeOptions = useMemo(() => {
    return officeChoicesFor(currentUser);
  }, [currentUser]);

  const defaultOfficeId = officeOptions[0] ? officeOptions[0].id : null;

  // General channel state (public & private)
  const [kind, setKind] = useState('public');
  const [name, setName] = useState('');
  const [officeId, setOfficeId] = useState(defaultOfficeId);
  const [description, setDescription] = useState('');
  const [sendPolicy, setSendPolicy] = useState('everyone');
  const [selectedMemberIds, setSelectedMemberIds] = useState(currentUserId ? [currentUserId] : []);
  const [touched, setTouched] = useState(false);

  // Site state
  const defaultSiteOffice = useMemo(() => {
    if (currentUser?.role === 'admin' || currentUser?.seesAllOffices) {
      return COMPANY_CONFIG.offices[0]?.id || 'hq';
    }
    return currentUser?.officeId || currentUser?.office || COMPANY_CONFIG.offices[0]?.id || 'hq';
  }, [currentUser]);

  const [siteOfficeId, setSiteOfficeId] = useState(defaultSiteOffice);
  const [siteTitle, setSiteTitle] = useState('');
  const [siteLocation, setSiteLocation] = useState('');
  const [siteDescription, setSiteDescription] = useState('');

  const isDirty =
    kind === 'site'
      ? Boolean(
          siteTitle.trim() ||
          siteLocation.trim() ||
          siteDescription.trim() ||
          siteOfficeId !== defaultSiteOffice
        )
      : Boolean(
          kind !== 'public' ||
          name.trim() ||
          officeId !== defaultOfficeId ||
          description.trim() ||
          sendPolicy !== 'everyone' ||
          selectedMemberIds.some((id) => id !== currentUserId)
        );

  const discardTitle = kind === 'site' ? 'Discard this site?' : 'Discard this channel?';

  // Clean and sanitize public/private channel name
  const handleNameChange = (e) => {
    const raw = e.target.value;
    const sanitized = raw
      .replace(/\s+/g, '-')
      .replace(/[^A-Za-z0-9-]/g, '');
    setName(sanitized);
    setTouched(true);
  };

  // Inline validation for public/private channel
  const nameError = useMemo(() => {
    if (kind === 'site') return '';
    if (!touched && !name) return '';
    if (!name.trim()) return 'Channel name is required.';
    if (!isChannelNameValid(name)) {
      return 'Letters, digits and hyphens only (2–50 characters).';
    }
    const duplicate = channels.some(
      (c) => c.name.toLowerCase() === name.trim().toLowerCase()
    );
    if (duplicate) return 'A channel with this name already exists.';
    return '';
  }, [kind, name, touched, channels]);

  // Selected office object for site areas
  const currentSiteOffice = useMemo(() => {
    return COMPANY_CONFIG.offices.find((o) => o.id === siteOfficeId) || COMPANY_CONFIG.offices[0];
  }, [siteOfficeId]);

  // Inline validation for site
  const siteErrors = useMemo(() => {
    if (kind !== 'site') return {};
    const errs = {};
    const t = siteTitle.trim();
    if (!t) {
      errs.title = 'Site name is required.';
    } else if (t.length < 3) {
      errs.title = 'Site name must be at least 3 characters.';
    } else if (t.length > 40) {
      errs.title = 'Site name must be at most 40 characters.';
    }

    const loc = siteLocation.trim();
    if (!loc) {
      errs.location = 'Location is required.';
    } else if (loc.length > 30) {
      errs.location = 'Location must be at most 30 characters.';
    }

    if (!siteOfficeId) {
      errs.office = 'Branch office is required.';
    }

    return errs;
  }, [kind, siteTitle, siteLocation, siteOfficeId]);

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

  const handleSiteOfficeChange = (newOfficeId) => {
    setSiteOfficeId(newOfficeId);
    setSiteLocation(''); // Changing the office resets the location per spec
  };

  const isSubmitDisabled =
    kind === 'site'
      ? Object.keys(siteErrors).length > 0
      : Boolean(!name.trim() || nameError);

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched(true);
    if (isSubmitDisabled) return;

    if (kind === 'site') {
      const result = createSite({
        title: siteTitle.trim(),
        officeId: siteOfficeId,
        location: siteLocation.trim(),
        description: siteDescription.trim(),
      });

      if (!result.ok) {
        return;
      }

      onClose();
      navigate(`/channels/${result.id}`);
      return;
    }

    const newChannel = createChannel({
      name: name.trim(),
      kind,
      officeId,
      description: description.trim(),
      memberIds: kind === 'private' ? selectedMemberIds : undefined,
      sendPolicy,
    });

    showToast(getChannelCreatedMessage(newChannel.name));
    onClose();
    navigate(`/channels/${newChannel.id}`);
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={kind === 'site' ? 'Create New Site' : 'Create New Channel'}
      variant="form"
      isDirty={isDirty}
      discardTitle={discardTitle}
    >
      <form onSubmit={handleSubmit} className="space-y-5 flex-1 flex flex-col">
      {/* Kind Selection (Three radio rows: Public, Private, Site) */}
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

          {/* Site (only for people allowed by canCreateSite for at least one office) */}
          {canUserCreateAnySite && (
            <label
              className={`flex items-start justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                kind === 'site'
                  ? 'border-brand bg-brand/5 shadow-2xs'
                  : 'border-line bg-surface hover:bg-surface-raised'
              }`}
            >
              <div className="flex items-start gap-2.5 min-w-0 pr-2">
                <input
                  type="radio"
                  name="new_channel_kind"
                  value="site"
                  checked={kind === 'site'}
                  onChange={() => setKind('site')}
                  className="mt-0.5 accent-brand cursor-pointer"
                />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-ink">
                    <Building2 className="w-3.5 h-3.5 text-brand" aria-hidden="true" />
                    <span>Site</span>
                  </div>
                  <p className="text-xs text-ink-muted">
                    A location or estate project containing multiple individual properties.
                  </p>
                </div>
              </div>
              {kind === 'site' && <Check className="w-4 h-4 text-brand shrink-0" aria-hidden="true" />}
            </label>
          )}
        </div>
      </div>

      {/* Conditional Fields: Site vs Public/Private */}
      {kind === 'site' ? (
        /* Site Fields */
        <div className="space-y-4 pt-1 border-t border-line">
          {/* Site Name */}
          <div className="space-y-1.5">
            <label htmlFor="create-site-title" className="block text-xs font-semibold text-ink">
              Site Name <span className="text-status-danger">*</span>
            </label>
            <input
              id="create-site-title"
              name="new_site_title"
              type="text"
              value={siteTitle}
              onChange={(e) => setSiteTitle(e.target.value)}
              onBlur={() => setTouched(true)}
              placeholder="e.g. Maitama 2"
              maxLength={40}
              required
              className="w-full px-3 py-2.5 text-xs bg-surface border border-line rounded-lg text-ink focus:border-brand focus:outline-none"
            />
            {touched && siteErrors.title ? (
              <p className="text-xs text-status-danger font-medium">{siteErrors.title}</p>
            ) : (
              <p className="text-xs text-ink-muted">3 to 40 characters.</p>
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
                      siteOfficeId === off.id
                        ? 'border-brand bg-brand-bg text-brand-ink font-semibold'
                        : 'border-line bg-surface text-ink-soft hover:bg-surface-raised'
                    }`}
                  >
                    <input
                      type="radio"
                      name="new_site_office"
                      value={off.id}
                      checked={siteOfficeId === off.id}
                      onChange={() => handleSiteOfficeChange(off.id)}
                      className="accent-brand cursor-pointer"
                    />
                    <span>{off.label}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="p-2.5 rounded-lg bg-surface-raised border border-line text-xs font-semibold text-ink">
                {currentSiteOffice.label}
              </div>
            )}
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <label htmlFor="create-site-location" className="block text-xs font-semibold text-ink">
              Location <span className="text-status-danger">*</span>
            </label>
            {currentSiteOffice.areas && currentSiteOffice.areas.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {currentSiteOffice.areas.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setSiteLocation(a)}
                    className={`min-h-[44px] px-2.5 py-1 rounded-lg text-xs font-medium border cursor-pointer transition-colors ${
                      siteLocation === a
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
              id="create-site-location"
              name="new_site_location"
              type="text"
              value={siteLocation}
              onChange={(e) => setSiteLocation(e.target.value)}
              onBlur={() => setTouched(true)}
              placeholder="e.g. Maitama"
              maxLength={30}
              required
              className="w-full px-3 py-2.5 text-xs bg-surface border border-line rounded-lg text-ink focus:border-brand focus:outline-none"
            />
            {touched && siteErrors.location && (
              <p className="text-xs text-status-danger font-medium">{siteErrors.location}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="create-site-description" className="block text-xs font-semibold text-ink">
                Description (optional)
              </label>
              <span className="text-xs text-ink-muted tabular-nums">
                {siteDescription.length}/100
              </span>
            </div>
            <textarea
              id="create-site-description"
              name="new_site_description"
              value={siteDescription}
              onChange={(e) => setSiteDescription(e.target.value.slice(0, 100))}
              maxLength={100}
              rows={2}
              placeholder="Brief description of this site location"
              className="w-full px-3 py-2 text-xs bg-surface border border-line rounded-lg text-ink focus:border-brand focus:outline-none resize-none"
            />
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
                placeholder="e.g. Maitama-inspections"
                required
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-surface border border-line rounded-lg text-ink focus:border-brand focus:outline-none"
              />
            </div>
            {nameError ? (
              <p className="text-xs text-status-danger font-medium">{nameError}</p>
            ) : (
              <p className="text-xs text-ink-muted">
                Letters, numbers, and hyphens. Spaces convert automatically.
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

          {/* Who can send messages */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-ink">Who can send messages</label>
            <div className="space-y-1.5" role="radiogroup" aria-label="Who can send messages">
              <label
                className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer text-xs transition-colors ${
                  sendPolicy === 'everyone'
                    ? 'border-brand bg-surface font-semibold text-ink'
                    : 'border-line bg-surface text-ink-soft hover:bg-surface-raised'
                }`}
              >
                <input
                  type="radio"
                  name="new_channel_send_policy"
                  value="everyone"
                  checked={sendPolicy === 'everyone'}
                  onChange={() => setSendPolicy('everyone')}
                  className="accent-brand cursor-pointer"
                />
                <span>Everyone</span>
              </label>

              <label
                className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer text-xs transition-colors ${
                  sendPolicy === 'admins'
                    ? 'border-brand bg-surface font-semibold text-ink'
                    : 'border-line bg-surface text-ink-soft hover:bg-surface-raised'
                }`}
              >
                <input
                  type="radio"
                  name="new_channel_send_policy"
                  value="admins"
                  checked={sendPolicy === 'admins'}
                  onChange={() => setSendPolicy('admins')}
                  className="accent-brand cursor-pointer"
                />
                <span>Only admins</span>
              </label>
            </div>
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
      <div className="sticky bottom-0 bg-surface border-t border-line py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] flex items-center justify-end gap-2 -mx-5 px-5 mt-auto">
        <Button type="button" variant="ghost" onClick={onClose} className="min-h-[44px]">
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={touched && isSubmitDisabled} className="min-h-[44px]">
          {kind === 'site' ? 'Create Site' : 'Create Channel'}
        </Button>
      </div>
    </form>
  </Drawer>
  );
}

export function CreateChannelDrawer({ isOpen, onClose }) {
  const [formKey, setFormKey] = useState(0);

  const handleClose = () => {
    setFormKey((k) => k + 1);
    onClose();
  };

  if (!isOpen) {
    return <Drawer isOpen={false} onClose={onClose} title="Create New Channel" variant="form" />;
  }

  return <CreateChannelForm key={formKey} isOpen={isOpen} onClose={handleClose} />;
}

export default CreateChannelDrawer;
