import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Search,
  Plus,
  Hash,
  Lock,
  Building2,
  Megaphone,
  Archive,
  ArchiveRestore,
  UserPlus,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useChat } from '../../context/ChatContext.jsx';
import { useToast } from '../../components/common/useToast.js';
import { Button } from '../../components/common/Button.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { Avatar } from '../../components/common/Avatar.jsx';
import { Drawer } from '../../components/common/Drawer.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { CreateChannelDrawer } from '../chat/CreateChannelDrawer.jsx';
import {
  canUseAdmin,
  isStaffActive,
} from '../../utils/chat.js';
import {
  formatPhoneNg,
  isValidPhoneNg,
  normalisePhoneNg,
} from '../../utils/formatters.js';
import {
  getAdminAccessDeniedMessage,
  getStaffAddedMessage,
  getStaffUpdatedMessage,
  getStaffDeactivatedMessage,
  getStaffReactivatedMessage,
  getChannelArchivedMessage,
  getChannelUnarchivedMessage,
} from '../../utils/messages.js';
import { ROLE_LABELS } from '../../mock/staff.js';

const AVAILABLE_ROLES = [
  { id: 'admin', label: 'Admin (Managing Director / Operations)' },
  { id: 'manager', label: 'Manager (Branch Manager / Sales Head)' },
  { id: 'agent', label: 'Agent (Field / Sales Agent)' },
  { id: 'support', label: 'Support (Legal, Accounts, or Admin)' },
  { id: 'intern', label: 'Intern (Sales Intern)' },
];

const AVAILABLE_OFFICES = [
  { id: 'lagos', label: 'Lagos office' },
  { id: 'abuja', label: 'Abuja office' },
];

function AddStaffForm({ staff, onSave, onClose }) {
  const [addName, setAddName] = useState('');
  const [addPhone, setAddPhone] = useState('+234 ');
  const [addRole, setAddRole] = useState('agent');
  const [addOffice, setAddOffice] = useState('lagos');
  const [addTouched, setAddTouched] = useState(false);

  const addErrors = useMemo(() => {
    if (!addTouched) return {};
    const errs = {};
    if (!addName.trim()) {
      errs.name = 'Full name is required.';
    }
    const normalised = normalisePhoneNg(addPhone);
    if (!normalised || !isValidPhoneNg(addPhone)) {
      errs.phone = 'Valid Nigerian phone number required (+234 80X XXX XXXX).';
    } else {
      const duplicate = staff.some((s) => normalisePhoneNg(s.phone) === normalised);
      if (duplicate) {
        errs.phone = 'A staff member with this phone number already exists.';
      }
    }
    return errs;
  }, [addName, addPhone, addTouched, staff]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setAddTouched(true);
    if (Object.keys(addErrors).length > 0 || !addName.trim()) return;

    onSave({
      name: addName.trim(),
      phone: addPhone.trim(),
      role: addRole,
      office: addOffice,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Full Name */}
      <div className="space-y-1.5">
        <label htmlFor="add-staff-name" className="block text-xs font-semibold text-ink">
          Full Name <span className="text-status-danger">*</span>
        </label>
        <input
          id="add-staff-name"
          name="add_staff_name"
          type="text"
          value={addName}
          onChange={(e) => setAddName(e.target.value)}
          placeholder="e.g. Babatunde Fashola"
          required
          className="w-full px-3 py-2 text-xs bg-surface border border-line rounded-lg text-ink focus:border-brand focus:outline-none"
        />
        {addErrors.name && (
          <p className="text-xs text-status-danger font-medium">{addErrors.name}</p>
        )}
      </div>

      {/* +234 Phone */}
      <div className="space-y-1.5">
        <label htmlFor="add-staff-phone" className="block text-xs font-semibold text-ink">
          Phone Number <span className="text-status-danger">*</span>
        </label>
        <input
          id="add-staff-phone"
          name="add_staff_phone"
          type="tel"
          value={addPhone}
          onChange={(e) => setAddPhone(e.target.value)}
          placeholder="+234 803 000 0112"
          required
          className="w-full px-3 py-2 text-xs bg-surface border border-line rounded-lg text-ink focus:border-brand focus:outline-none font-mono"
        />
        {addErrors.phone ? (
          <p className="text-xs text-status-danger font-medium">{addErrors.phone}</p>
        ) : (
          <p className="text-xs text-ink-muted">Format: +234 80X XXX XXXX</p>
        )}
      </div>

      {/* Role selection radio rows */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-ink">
          Staff Role <span className="text-status-danger">*</span>
        </label>
        <div className="space-y-1.5">
          {AVAILABLE_ROLES.map((r) => (
            <label
              key={r.id}
              className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer text-xs transition-colors ${
                addRole === r.id
                  ? 'border-brand bg-surface font-semibold text-ink'
                  : 'border-line bg-surface text-ink-soft hover:bg-surface-raised'
              }`}
            >
              <input
                type="radio"
                name="add_staff_role"
                value={r.id}
                checked={addRole === r.id}
                onChange={() => setAddRole(r.id)}
                className="accent-brand"
              />
              <span>{r.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Office selection radio rows */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-ink">
          Office Assignment <span className="text-status-danger">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {AVAILABLE_OFFICES.map((off) => (
            <label
              key={off.id}
              className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer text-xs transition-colors ${
                addOffice === off.id
                  ? 'border-brand bg-surface font-semibold text-ink'
                  : 'border-line bg-surface text-ink-soft hover:bg-surface-raised'
              }`}
            >
              <input
                type="radio"
                name="add_staff_office"
                value={off.id}
                checked={addOffice === off.id}
                onChange={() => setAddOffice(off.id)}
                className="accent-brand"
              />
              <span>{off.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Submit cluster */}
      <div className="pt-2 flex items-center justify-end gap-2 border-t border-line">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          Save Staff Member
        </Button>
      </div>
    </form>
  );
}

function EditStaffForm({ staff: staffMember, onSave, onClose }) {
  const [editRole, setEditRole] = useState(staffMember.role);
  const [editOffice, setEditOffice] = useState(
    staffMember.officeId || staffMember.office || 'lagos'
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      role: editRole,
      office: editOffice,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="p-3 rounded-xl bg-surface-raised border border-line flex items-center gap-3">
        <Avatar
          role={staffMember.role}
          initials={staffMember.initials}
          name={staffMember.name}
          size="md"
        />
        <div className="min-w-0">
          <div className="text-xs font-bold text-ink">{staffMember.name}</div>
          <div className="text-xs text-ink-muted">{formatPhoneNg(staffMember.phone)}</div>
        </div>
      </div>

      {/* Role Radio Rows */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-ink">Role</label>
        <div className="space-y-1.5">
          {AVAILABLE_ROLES.map((r) => (
            <label
              key={r.id}
              className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer text-xs transition-colors ${
                editRole === r.id
                  ? 'border-brand bg-surface font-semibold text-ink'
                  : 'border-line bg-surface text-ink-soft hover:bg-surface-raised'
              }`}
            >
              <input
                type="radio"
                name="edit_staff_role"
                value={r.id}
                checked={editRole === r.id}
                onChange={() => setEditRole(r.id)}
                className="accent-brand"
              />
              <span>{r.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Office Radio Rows */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-ink">Office</label>
        <div className="grid grid-cols-2 gap-2">
          {AVAILABLE_OFFICES.map((off) => (
            <label
              key={off.id}
              className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer text-xs transition-colors ${
                editOffice === off.id
                  ? 'border-brand bg-surface font-semibold text-ink'
                  : 'border-line bg-surface text-ink-soft hover:bg-surface-raised'
              }`}
            >
              <input
                type="radio"
                name="edit_staff_office"
                value={off.id}
                checked={editOffice === off.id}
                onChange={() => setEditOffice(off.id)}
                className="accent-brand"
              />
              <span>{off.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Submit */}
      <div className="pt-2 flex items-center justify-end gap-2 border-t border-line">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          Save Changes
        </Button>
      </div>
    </form>
  );
}

export function AdminView() {
  const {
    currentUser,
    currentUserId,
    staff,
    channels,
    addStaff,
    updateStaff,
    setStaffActive,
    setChannelArchived,
  } = useChat();

  const navigate = useNavigate();
  const { showToast } = useToast();

  // Route protection: Admins only
  useEffect(() => {
    if (currentUser && !canUseAdmin(currentUser)) {
      showToast(getAdminAccessDeniedMessage());
      navigate('/channels', { replace: true });
    }
  }, [currentUser, navigate, showToast]);

  const [activeTab, setActiveTab] = useState('staff'); // 'staff' | 'channels'
  const [staffSearchQuery, setStaffSearchQuery] = useState('');
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [deactivatingStaff, setDeactivatingStaff] = useState(null);
  const [reactivatingStaff, setReactivatingStaff] = useState(null);

  // Channels state
  const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false);
  const [channelToArchive, setChannelToArchive] = useState(null);
  const [isArchivedSectionOpen, setIsArchivedSectionOpen] = useState(false);

  // Filtered staff list by search query
  const filteredStaff = useMemo(() => {
    const q = staffSearchQuery.trim().toLowerCase();
    if (!q) return staff;
    return staff.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (ROLE_LABELS[s.role] || s.role).toLowerCase().includes(q) ||
        (s.phone && s.phone.includes(q))
    );
  }, [staff, staffSearchQuery]);

  const activeAdminCount = useMemo(() => {
    return staff.filter((s) => s.role === 'admin' && isStaffActive(s)).length;
  }, [staff]);

  // Channels grouping (excluding DMs and groups)
  const nonDirectChannels = useMemo(() => {
    return channels.filter((c) => c.kind !== 'dm' && c.kind !== 'group');
  }, [channels]);

  const activeChannels = useMemo(() => {
    return nonDirectChannels.filter((c) => !c.archived);
  }, [nonDirectChannels]);

  const archivedChannels = useMemo(() => {
    return nonDirectChannels.filter((c) => c.archived);
  }, [nonDirectChannels]);

  const companyWideChannels = useMemo(() => {
    return activeChannels.filter((c) => !c.officeId);
  }, [activeChannels]);

  const lagosChannels = useMemo(() => {
    return activeChannels.filter((c) => c.officeId === 'lagos');
  }, [activeChannels]);

  const abujaChannels = useMemo(() => {
    return activeChannels.filter((c) => c.officeId === 'abuja');
  }, [activeChannels]);

  const handleAddStaff = (staffData) => {
    const newPerson = addStaff(staffData);
    showToast(getStaffAddedMessage(newPerson.name));
    setIsAddStaffOpen(false);
  };

  const handleEditStaff = (updatedData) => {
    if (!editingStaff) return;
    updateStaff(editingStaff.id, updatedData);
    showToast(getStaffUpdatedMessage(editingStaff.name));
    setEditingStaff(null);
  };

  // Deactivate confirm
  const handleConfirmDeactivate = () => {
    if (!deactivatingStaff) return;
    const target = deactivatingStaff;
    setStaffActive(target.id, false);
    showToast(getStaffDeactivatedMessage(target.name));
    setDeactivatingStaff(null);

    // If deactivating oneself, navigate back to /channels as the new active admin
    if (target.id === currentUserId) {
      navigate('/channels', { replace: true });
    }
  };

  // Reactivate confirm
  const handleConfirmReactivate = () => {
    if (!reactivatingStaff) return;
    const target = reactivatingStaff;
    setStaffActive(target.id, true);
    showToast(getStaffReactivatedMessage(target.name));
    setReactivatingStaff(null);
  };

  // Archive confirm
  const handleConfirmArchive = () => {
    if (!channelToArchive) return;
    const target = channelToArchive;
    setChannelArchived(target.id, true);
    showToast(getChannelArchivedMessage(target.name));
    setChannelToArchive(null);
  };

  // Unarchive handler
  const handleUnarchive = (channel) => {
    setChannelArchived(channel.id, false);
    showToast(getChannelUnarchivedMessage(channel.name));
  };

  const renderChannelIcon = (ch) => {
    if (ch.kind === 'announcement') return <Megaphone className="w-4 h-4 text-brand shrink-0" aria-hidden="true" />;
    if (ch.kind === 'private') return <Lock className="w-4 h-4 text-ink-muted shrink-0" aria-hidden="true" />;
    if (ch.kind === 'listing') return <Building2 className="w-4 h-4 text-brand shrink-0" aria-hidden="true" />;
    return <Hash className="w-4 h-4 text-ink-muted shrink-0" aria-hidden="true" />;
  };

  if (!currentUser || !canUseAdmin(currentUser)) {
    return null;
  }

  return (
    <div className="h-full flex flex-col bg-canvas overflow-y-auto">
      {/* Top Header */}
      <header className="bg-surface border-b border-line px-4 sm:px-6 py-4 shrink-0">
        <div className="max-w-5xl mx-auto space-y-3">
          <Link
            to="/channels"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            <span>Back to Channels</span>
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-lg font-bold text-ink">Admin Workspace</h1>
              <p className="text-xs text-ink-muted">
                Manage staff accounts, credentials, and company channels.
              </p>
            </div>
            {/* Tab switch buttons */}
            <div className="flex items-center gap-1.5 p-1 bg-surface-raised border border-line rounded-xl shrink-0 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setActiveTab('staff')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'staff'
                    ? 'bg-surface text-ink shadow-2xs'
                    : 'text-ink-soft hover:text-ink'
                }`}
              >
                Staff ({staff.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('channels')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'channels'
                    ? 'bg-surface text-ink shadow-2xs'
                    : 'text-ink-soft hover:text-ink'
                }`}
              >
                Channels ({nonDirectChannels.length})
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {activeTab === 'staff' && (
            <div className="space-y-4">
              {/* Controls bar: search input + Add Staff button */}
              <div className="flex items-center justify-between gap-2.5 sm:gap-3">
                <div className="relative flex-1 max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ink-muted">
                    <Search className="w-4 h-4 shrink-0" aria-hidden="true" />
                  </div>
                  <input
                    name="admin_staff_search"
                    type="text"
                    value={staffSearchQuery}
                    onChange={(e) => setStaffSearchQuery(e.target.value)}
                    placeholder="Search staff by name or role..."
                    className="w-full h-11 pl-9 pr-3 text-xs bg-surface border border-line rounded-xl text-ink placeholder:text-ink-muted focus:border-brand focus:outline-none"
                  />
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsAddStaffOpen(true)}
                  className="h-11 px-3 sm:px-4 shrink-0 whitespace-nowrap"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <UserPlus className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>Add Staff</span>
                  </span>
                </Button>
              </div>

              {/* Staff table as hairline-separated rows */}
              <div className="border border-line rounded-2xl bg-surface overflow-hidden shadow-2xs">
                {filteredStaff.length === 0 ? (
                  <div className="p-8 text-center space-y-2">
                    <p className="text-xs text-ink-muted">
                      No staff members found matching &quot;{staffSearchQuery}&quot;
                    </p>
                    {staffSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setStaffSearchQuery('')}
                        className="text-xs font-semibold text-brand hover:underline cursor-pointer"
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-line" role="list">
                  {filteredStaff.map((member) => {
                    const active = isStaffActive(member);
                    const isSelf = member.id === currentUserId;
                    const isOnlyAdmin = member.role === 'admin' && activeAdminCount <= 1;
                    const canDeactivate = active && !isSelf && !isOnlyAdmin;

                    let disableReason = '';
                    if (isSelf) {
                      disableReason = 'You cannot deactivate your own account.';
                    } else if (isOnlyAdmin) {
                      disableReason = 'Cannot deactivate the only active administrator.';
                    }

                    return (
                      <div
                        key={member.id}
                        className={`p-3.5 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors ${
                          active ? 'hover:bg-surface-raised/40' : 'bg-surface-raised/60 opacity-80'
                        }`}
                      >
                        {/* Member Identity & Details */}
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar
                            role={member.role}
                            initials={member.initials}
                            name={member.name}
                            isOnline={active && member.online}
                            size="md"
                          />
                          <div className="min-w-0 space-y-0.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-ink">
                                {member.name}
                              </span>
                              <Badge role={member.role} size="sm">
                                {ROLE_LABELS[member.role] || member.role}
                              </Badge>
                              <Badge variant={active ? 'success' : 'neutral'} size="sm">
                                {active ? 'Active' : 'Deactivated'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-ink-muted flex-wrap">
                              <span>{(member.officeId || member.office) === 'abuja' ? 'Abuja office' : 'Lagos office'}</span>
                              <span>·</span>
                              <span className="font-mono">{formatPhoneNg(member.phone)}</span>
                              <span>·</span>
                              <span>{member.title}</span>
                            </div>
                            {disableReason && (
                              <p className="text-xs text-status-warning font-medium">
                                {disableReason}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setEditingStaff(member)}
                          >
                            Edit
                          </Button>
                          {active ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={!canDeactivate}
                              onClick={() => setDeactivatingStaff(member)}
                              className="text-status-danger hover:bg-status-danger-bg"
                            >
                              Deactivate
                            </Button>
                          ) : (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setReactivatingStaff(member)}
                              className="text-status-success hover:bg-status-success-bg"
                            >
                              Reactivate
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

          {activeTab === 'channels' && (
            <div className="space-y-6">
              {/* Channel header action */}
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-ink-muted">
                  Create public or private branch channels, or archive retired rooms.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsCreateChannelOpen(true)}
                  className="h-11 px-3 sm:px-4 shrink-0 whitespace-nowrap"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <Plus className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>New Channel</span>
                  </span>
                </Button>
              </div>

              {/* Company-wide Section */}
              {companyWideChannels.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-ink-muted uppercase tracking-wider px-1">
                    Company-wide Channels ({companyWideChannels.length})
                  </div>
                  <div className="border border-line rounded-2xl bg-surface divide-y divide-line overflow-hidden shadow-2xs">
                    {companyWideChannels.map((ch) => (
                      <div
                        key={ch.id}
                        className="p-3 sm:p-3.5 flex items-center justify-between gap-3 hover:bg-surface-raised/40 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          {renderChannelIcon(ch)}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-ink break-words">
                                #{ch.name}
                              </span>
                              <Badge variant="neutral" size="sm">
                                {ch.kind === 'announcement' ? 'Announcement' : ch.kind === 'listing' ? 'Listing' : ch.kind === 'private' ? 'Private' : 'Public'}
                              </Badge>
                              {ch.kind === 'private' && Array.isArray(ch.members) && (
                                <span className="text-xs text-ink-muted">
                                  {ch.members.length} members
                                </span>
                              )}
                            </div>
                            {ch.description && (
                              <p className="text-xs text-ink-muted break-words line-clamp-1 mt-0.5">
                                {ch.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {ch.kind !== 'announcement' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setChannelToArchive(ch)}
                            className="text-status-danger hover:bg-status-danger-bg shrink-0"
                          >
                            <Archive className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
                            <span>Archive</span>
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lagos Office Section */}
              {lagosChannels.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-ink-muted uppercase tracking-wider px-1">
                    Lagos Office ({lagosChannels.length})
                  </div>
                  <div className="border border-line rounded-2xl bg-surface divide-y divide-line overflow-hidden shadow-2xs">
                    {lagosChannels.map((ch) => (
                      <div
                        key={ch.id}
                        className="p-3 sm:p-3.5 flex items-center justify-between gap-3 hover:bg-surface-raised/40 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          {renderChannelIcon(ch)}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-ink break-words">
                                #{ch.name}
                              </span>
                              <Badge variant="neutral" size="sm">
                                {ch.kind === 'listing' ? 'Listing' : ch.kind === 'private' ? 'Private' : 'Public'}
                              </Badge>
                              {ch.kind === 'private' && Array.isArray(ch.members) && (
                                <span className="text-xs text-ink-muted">
                                  {ch.members.length} members
                                </span>
                              )}
                            </div>
                            {ch.description && (
                              <p className="text-xs text-ink-muted break-words line-clamp-1 mt-0.5">
                                {ch.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setChannelToArchive(ch)}
                          className="text-status-danger hover:bg-status-danger-bg shrink-0"
                        >
                          <Archive className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
                          <span>Archive</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Abuja Office Section */}
              {abujaChannels.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-ink-muted uppercase tracking-wider px-1">
                    Abuja Office ({abujaChannels.length})
                  </div>
                  <div className="border border-line rounded-2xl bg-surface divide-y divide-line overflow-hidden shadow-2xs">
                    {abujaChannels.map((ch) => (
                      <div
                        key={ch.id}
                        className="p-3 sm:p-3.5 flex items-center justify-between gap-3 hover:bg-surface-raised/40 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          {renderChannelIcon(ch)}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-ink break-words">
                                #{ch.name}
                              </span>
                              <Badge variant="neutral" size="sm">
                                {ch.kind === 'listing' ? 'Listing' : ch.kind === 'private' ? 'Private' : 'Public'}
                              </Badge>
                              {ch.kind === 'private' && Array.isArray(ch.members) && (
                                <span className="text-xs text-ink-muted">
                                  {ch.members.length} members
                                </span>
                              )}
                            </div>
                            {ch.description && (
                              <p className="text-xs text-ink-muted break-words line-clamp-1 mt-0.5">
                                {ch.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setChannelToArchive(ch)}
                          className="text-status-danger hover:bg-status-danger-bg shrink-0"
                        >
                          <Archive className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
                          <span>Archive</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Collapsed Archived Section at Bottom */}
              <div className="border border-line rounded-2xl bg-surface overflow-hidden shadow-2xs">
                <button
                  type="button"
                  onClick={() => setIsArchivedSectionOpen((prev) => !prev)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-surface-raised transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-ink-muted uppercase tracking-wider">
                    <Archive className="w-4 h-4 text-ink-muted" aria-hidden="true" />
                    <span>Archived Channels ({archivedChannels.length})</span>
                  </div>
                  {isArchivedSectionOpen ? (
                    <ChevronUp className="w-4 h-4 text-ink-muted" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-ink-muted" aria-hidden="true" />
                  )}
                </button>

                {isArchivedSectionOpen && (
                  <div className="border-t border-line divide-y divide-line">
                    {archivedChannels.length === 0 ? (
                      <p className="p-4 text-xs text-ink-muted text-center">
                        No archived channels.
                      </p>
                    ) : (
                      archivedChannels.map((ch) => (
                        <div
                          key={ch.id}
                          className="p-3 sm:p-3.5 flex items-center justify-between gap-3 bg-surface-raised/40"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            {renderChannelIcon(ch)}
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-ink break-words line-through opacity-70">
                                  #{ch.name}
                                </span>
                                <Badge variant="neutral" size="sm">
                                  Archived
                                </Badge>
                              </div>
                              <p className="text-xs text-ink-muted line-clamp-1 mt-0.5">
                                {ch.description || 'Archived channel'}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleUnarchive(ch)}
                            className="shrink-0"
                          >
                            <ArchiveRestore className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
                            <span>Unarchive</span>
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Add Staff Drawer */}
      <Drawer
        isOpen={isAddStaffOpen}
        onClose={() => setIsAddStaffOpen(false)}
        title="Add Staff Member"
      >
        {isAddStaffOpen && (
          <AddStaffForm
            staff={staff}
            onSave={handleAddStaff}
            onClose={() => setIsAddStaffOpen(false)}
          />
        )}
      </Drawer>

      {/* Edit Staff Drawer (Role and office) */}
      <Drawer
        isOpen={Boolean(editingStaff)}
        onClose={() => setEditingStaff(null)}
        title="Role and Office"
      >
        {editingStaff && (
          <EditStaffForm
            key={editingStaff.id}
            staff={editingStaff}
            onSave={handleEditStaff}
            onClose={() => setEditingStaff(null)}
          />
        )}
      </Drawer>

      {/* Deactivate Staff Modal */}
      <Modal
        isOpen={Boolean(deactivatingStaff)}
        onClose={() => setDeactivatingStaff(null)}
        title={`Deactivate ${deactivatingStaff?.name}?`}
      >
        <div className="space-y-4">
          <p className="text-xs text-ink leading-relaxed">
            This person will no longer be able to log in, appear in staff lists, or receive messages. Their past messages will remain preserved.
          </p>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setDeactivatingStaff(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDeactivate}
            >
              Deactivate Staff
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reactivate Staff Modal */}
      <Modal
        isOpen={Boolean(reactivatingStaff)}
        onClose={() => setReactivatingStaff(null)}
        title={`Reactivate ${reactivatingStaff?.name}?`}
      >
        <div className="space-y-4">
          <p className="text-xs text-ink leading-relaxed">
            This person will regain access to log in and participate in their office channels immediately.
          </p>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setReactivatingStaff(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmReactivate}
            >
              Reactivate Staff
            </Button>
          </div>
        </div>
      </Modal>

      {/* Archive Channel Modal */}
      <Modal
        isOpen={Boolean(channelToArchive)}
        onClose={() => setChannelToArchive(null)}
        title={`Archive #${channelToArchive?.name}?`}
      >
        <div className="space-y-4">
          <p className="text-xs text-ink leading-relaxed">
            Archiving this channel will disable new messages, reactions, edits, and pins. The channel will be moved to the archived section.
          </p>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setChannelToArchive(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmArchive}
            >
              Archive Channel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Shared Create Channel Drawer */}
      <CreateChannelDrawer
        isOpen={isCreateChannelOpen}
        onClose={() => setIsCreateChannelOpen(false)}
      />
    </div>
  );
}

export default AdminView;
