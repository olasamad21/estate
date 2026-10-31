import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hash, Lock, Check } from 'lucide-react';
import { Drawer } from '../../components/common/Drawer.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Avatar } from '../../components/common/Avatar.jsx';
import { useChat } from '../../context/ChatContext.jsx';
import { useToast } from '../../components/common/useToast.js';
import {
  officeChoicesFor,
  isChannelNameValid,
  isStaffActive,
} from '../../utils/chat.js';
import { getChannelCreatedMessage } from '../../utils/messages.js';
import { ROLE_LABELS } from '../../mock/staff.js';

function CreateChannelForm({ onClose }) {
  const { currentUser, currentUserId, channels, staff, createChannel } = useChat();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const officeOptions = useMemo(() => {
    return officeChoicesFor(currentUser);
  }, [currentUser]);

  const defaultOfficeId = officeOptions[0] ? officeOptions[0].id : null;

  const [name, setName] = useState('');
  const [kind, setKind] = useState('public');
  const [officeId, setOfficeId] = useState(defaultOfficeId);
  const [description, setDescription] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState(currentUserId ? [currentUserId] : []);
  const [touched, setTouched] = useState(false);

  // Clean and sanitize channel name input as user types
  const handleNameChange = (e) => {
    const raw = e.target.value;
    const sanitized = raw
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    setName(sanitized);
    setTouched(true);
  };

  // Inline validation
  const nameError = useMemo(() => {
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
  }, [name, touched, channels]);

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
    if (memberId === currentUserId) return; // Creator cannot be unchecked
    setSelectedMemberIds((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const isSubmitDisabled = Boolean(!name.trim() || nameError);

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched(true);
    if (isSubmitDisabled) return;

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
              placeholder="e.g. lekki-inspections"
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

        {/* Kind Selection (Public vs Private) */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-ink">
            Channel Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label
              className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-colors ${
                kind === 'public'
                  ? 'border-brand bg-surface shadow-2xs'
                  : 'border-line bg-surface hover:bg-surface-raised'
              }`}
            >
              <input
                type="radio"
                name="new_channel_kind"
                value="public"
                checked={kind === 'public'}
                onChange={() => setKind('public')}
                className="mt-0.5 accent-brand"
              />
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-ink">
                  <Hash className="w-3.5 h-3.5 text-brand" aria-hidden="true" />
                  <span>Public</span>
                </div>
                <p className="text-xs text-ink-muted">
                  Visible to everyone in the designated office.
                </p>
              </div>
            </label>

            <label
              className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-colors ${
                kind === 'private'
                  ? 'border-brand bg-surface shadow-2xs'
                  : 'border-line bg-surface hover:bg-surface-raised'
              }`}
            >
              <input
                type="radio"
                name="new_channel_kind"
                value="private"
                checked={kind === 'private'}
                onChange={() => setKind('private')}
                className="mt-0.5 accent-brand"
              />
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-ink">
                  <Lock className="w-3.5 h-3.5 text-ink-muted" aria-hidden="true" />
                  <span>Private</span>
                </div>
                <p className="text-xs text-ink-muted">
                  Only invited members and admins can view.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Office Selection */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-ink">
            Office Scope
          </label>
          {currentUser?.role === 'admin' ? (
            <div className="space-y-1.5">
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
                    className="accent-brand"
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

        {/* Description (Max 100 characters with counter) */}
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
            <div className="max-h-48 overflow-y-auto no-scrollbar space-y-1 pr-1 border border-line rounded-xl p-2 bg-surface">
              {eligibleStaff.map((member) => {
                const isSelected = selectedMemberIds.includes(member.id);
                const isCreator = member.id === currentUserId;
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => handleToggleMember(member.id)}
                    disabled={isCreator}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-surface-raised font-semibold text-ink'
                        : 'text-ink-soft hover:bg-surface-raised'
                    } ${isCreator ? 'cursor-not-allowed opacity-90' : ''}`}
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <Avatar
                        role={member.role}
                        initials={member.initials}
                        name={member.name}
                        size="xs"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-ink overflow-hidden text-ellipsis whitespace-nowrap">
                          {member.name} {isCreator && '(creator)'}
                        </div>
                        <div className="text-xs text-ink-muted">
                          {ROLE_LABELS[member.role] || member.role}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
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

        {/* Actions */}
        <div className="pt-2 flex items-center justify-end gap-2 border-t border-line">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitDisabled}>
            Create Channel
          </Button>
        </div>
      </form>
  );
}

export function CreateChannelDrawer({ isOpen, onClose }) {
  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Create New Channel">
      {isOpen && <CreateChannelForm onClose={onClose} />}
    </Drawer>
  );
}

export default CreateChannelDrawer;
