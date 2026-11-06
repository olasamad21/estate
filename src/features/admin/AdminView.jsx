import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import {
  ChevronLeft,
  Search,
  Plus,
  Hash,
  Lock,
  Building2,
  Megaphone,
  Archive,
  UserPlus,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Upload,
} from 'lucide-react';
import { useChat } from '../../context/ChatContext.jsx';
import { useToast } from '../../components/common/useToast.js';
import { Button } from '../../components/common/Button.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { Avatar } from '../../components/common/Avatar.jsx';
import { Drawer } from '../../components/common/Drawer.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { CreateChannelDrawer } from '../chat/CreateChannelDrawer.jsx';
import { EmailPreviewDrawer } from './EmailPreviewDrawer.jsx';
import { ImportStaffDrawer } from './ImportStaffDrawer.jsx';
import { ActivityLogTab } from './ActivityLogTab.jsx';
import { COMPANY_CONFIG } from '../../config/market.js';
import {
  canUseAdmin,
  isStaffActive,
  pendingRequests,
  initialsOf,
  slugify,
} from '../../utils/chat.js';
import {
  formatPhoneNg,
  isValidPhoneNg,
  normalisePhoneNg,
  formatDateNg,
  formatListTimeNg,
} from '../../utils/formatters.js';
import {
  getAdminAccessDeniedMessage,
  getStaffAddedMessage,
  getStaffUpdatedMessage,
  getStaffDeactivatedMessage,
  getStaffReactivatedMessage,
  getChannelArchivedMessage,
  getChannelUnarchivedMessage,
  getAccessRequestApprovedMessage,
  getAccessRequestDeclinedMessage,
  getActivationLinkCopiedMessage,
  getActivationLinkSentMessage,
  getPasswordResetLinkSentMessage,
  getStaffImportedMessage,
} from '../../utils/messages.js';
import { ROLE_LABELS, DEPARTMENTS } from '../../mock/staff.js';

const AVAILABLE_ROLES = [
  { id: 'admin', label: 'Admin (Managing Director / Operations)' },
  { id: 'manager', label: 'Manager (Branch Manager / Sales Head)' },
  { id: 'agent', label: 'Agent (Field / Sales Agent)' },
  { id: 'support', label: 'Support (Legal, Accounts, or Admin)' },
  { id: 'intern', label: 'Intern (Sales Intern)' },
];

const AVAILABLE_OFFICES = (COMPANY_CONFIG.offices || []).map((o) => ({
  id: o.id,
  label: o.label || o.name,
}));

function officeLabelOf(id) {
  const o = (COMPANY_CONFIG.offices || []).find((x) => x.id === id);
  return o ? o.label || o.name : 'Head Quarters';
}

function officeNameOf(id) { { return officeLabelOf(id);
}



}

function renderChannelIcon(ch) {
  if (ch.kind === 'announcement') return <Megaphone className="w-4 h-4 text-brand shrink-0" aria-hidden="true" />;
  if (ch.kind === 'private') return <Lock className="w-4 h-4 text-ink-muted shrink-0" aria-hidden="true" />;
  if (ch.kind === 'site' || ch.kind === 'listing') return <Building2 className="w-4 h-4 text-brand shrink-0" aria-hidden="true" />;
  return <Hash className="w-4 h-4 text-ink-muted shrink-0" aria-hidden="true" />;
}

function AddStaffDrawer({ isOpen, staff, onSave, onClose }) {
  const [addName, setAddName] = useState('');
  const [addCallName, setAddCallName] = useState('');
  const [addPhone, setAddPhone] = useState('+234 ');
  const [addEmail, setAddEmail] = useState('');
  const [addRole, setAddRole] = useState('agent');
  const [addDepartment, setAddDepartment] = useState('Sales');
  const [addOffice, setAddOffice] = useState(AVAILABLE_OFFICES[0]?.id || 'hq');
  const [addSeesAllOffices, setAddSeesAllOffices] = useState(false);
  const [addCanMessageExecutives, setAddCanMessageExecutives] = useState(false);
  const [addTouched, setAddTouched] = useState(false);

  const isDirty = Boolean(
    addName.trim() ||
    addCallName.trim() ||
    (addPhone.trim() && addPhone.trim() !== '+234') ||
    addEmail.trim() ||
    addRole !== 'agent' ||
    addDepartment !== 'Sales' ||
    addOffice !== (AVAILABLE_OFFICES[0]?.id || 'hq') ||
    addSeesAllOffices ||
    addCanMessageExecutives
  );

  const addErrors = useMemo(() => {
    if (!addTouched) return {};
    const errs = {};
    if (!addName.trim()) {
      errs.name = 'Full name is required.';
    }
    const callNameTrimmed = addCallName.trim();
    if (!callNameTrimmed) {
      errs.callName = 'Call name is required.';
    } else if (callNameTrimmed.length < 2 || callNameTrimmed.length > 20) {
      errs.callName = 'Call name must be between 2 and 20 characters.';
    } else {
      const callLower = callNameTrimmed.toLowerCase();
      const duplicateCall = staff.some(
        (s) => (s.callName || '').toLowerCase() === callLower || s.id === slugify(callNameTrimmed)
      );
      if (duplicateCall) {
        errs.callName = 'This call name is already taken.';
      }
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
    const emailTrimmed = addEmail.trim();
    if (emailTrimmed) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailTrimmed.length > 80 || !emailRegex.test(emailTrimmed)) {
        errs.email = 'Please enter a valid email address (maximum 80 characters).';
      }
    }
    return errs;
  }, [addName, addCallName, addPhone, addEmail, addTouched, staff]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setAddTouched(true);
    if (Object.keys(addErrors).length > 0 || !addName.trim() || !addCallName.trim()) return;

    onSave({
      name: addName.trim(),
      callName: addCallName.trim(),
      phone: addPhone.trim(),
      email: addEmail.trim() || null,
      role: addRole,
      department: addDepartment,
      office: addOffice,
      officeId: addOffice,
      seesAllOffices: addRole === 'admin' ? addSeesAllOffices : false,
      canMessageExecutives: (addRole === 'agent' || addRole === 'support' || addRole === 'intern') ? addCanMessageExecutives : false,
    });
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Add Staff Member"
      variant="form"
      isDirty={isDirty}
      discardTitle="Discard this staff member?"
    >
      <form onSubmit={handleSubmit} className="space-y-5 flex-1 flex flex-col">
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
          placeholder="e.g. Aminu Bello"
          required
          className="w-full min-h-[44px] px-3 py-2 text-xs bg-surface border border-line rounded-lg text-ink focus:border-brand focus:outline-none"
        />
        {addErrors.name && (
          <p className="text-xs text-status-danger font-medium">{addErrors.name}</p>
        )}
      </div>

      {/* Call Name */}
      <div className="space-y-1.5">
        <label htmlFor="add-staff-call-name" className="block text-xs font-semibold text-ink">
          Call Name <span className="text-status-danger">*</span>
        </label>
        <input
          id="add-staff-call-name"
          name="add_staff_call_name"
          type="text"
          value={addCallName}
          onChange={(e) => setAddCallName(e.target.value)}
          placeholder="e.g. Aminu (2-20 characters, unique)"
          required
          className="w-full min-h-[44px] px-3 py-2 text-xs bg-surface border border-line rounded-lg text-ink focus:border-brand focus:outline-none"
        />
        {addErrors.callName && (
          <p className="text-xs text-status-danger font-medium">{addErrors.callName}</p>
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
          className="w-full min-h-[44px] px-3 py-2 text-xs bg-surface border border-line rounded-lg text-ink focus:border-brand focus:outline-none font-mono"
        />
        {addErrors.phone ? (
          <p className="text-xs text-status-danger font-medium">{addErrors.phone}</p>
        ) : (
          <p className="text-xs text-ink-muted">Format: +234 80X XXX XXXX</p>
        )}
      </div>

      {/* Email (optional) */}
      <div className="space-y-1.5">
        <label htmlFor="add-staff-email" className="block text-xs font-semibold text-ink">
          Email Address <span className="text-ink-muted font-normal">(optional)</span>
        </label>
        <input
          id="add-staff-email"
          name="staff_email"
          type="email"
          maxLength={80}
          value={addEmail}
          onChange={(e) => setAddEmail(e.target.value)}
          placeholder="e.g. aminu@example.com"
          className="w-full min-h-[44px] px-3 py-2 text-xs bg-surface border border-line rounded-lg text-ink focus:border-brand focus:outline-none"
        />
        {addErrors.email && (
          <p className="text-xs text-status-danger font-medium">{addErrors.email}</p>
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
                onChange={() => {
                  setAddRole(r.id);
                  if (r.id === 'admin') {
                    setAddDepartment('Executive');
                  }
                }}
                className="accent-brand"
              />
              <span>{r.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Sees all offices switch (admins only) */}
      {addRole === 'admin' && (
        <div className="p-3 rounded-xl border border-line bg-surface-raised flex items-center justify-between min-h-[44px]">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-ink block">Sees all offices</span>
            <span className="text-xs text-ink-muted block">Allow visibility across all office channels</span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={addSeesAllOffices}
            aria-label="Sees all offices"
            onClick={() => setAddSeesAllOffices(!addSeesAllOffices)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
              addSeesAllOffices ? 'bg-brand' : 'bg-line-strong'
            }`}
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-surface shadow-xs transition duration-200 ease-in-out ${
                addSeesAllOffices ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      )}

      {/* Can message executives switch (agent, support, intern) */}
      {(addRole === 'agent' || addRole === 'support' || addRole === 'intern') && (
        <div className="p-3 rounded-xl border border-line bg-surface-raised flex items-center justify-between min-h-[44px]">
          <div className="space-y-0.5 pr-2">
            <span className="text-xs font-semibold text-ink block">Can message executives</span>
            <span className="text-xs text-ink-muted block">Lets this person start a direct message with the MD, the Group Head and the General Manager.</span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={addCanMessageExecutives}
            aria-label="Can message executives"
            onClick={() => setAddCanMessageExecutives(!addCanMessageExecutives)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
              addCanMessageExecutives ? 'bg-brand' : 'bg-line-strong'
            }`}
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-surface shadow-xs transition duration-200 ease-in-out ${
                addCanMessageExecutives ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      )}

      {/* Department selection */}
      <div className="space-y-1.5">
        <label htmlFor="add-staff-department" className="block text-xs font-semibold text-ink">
          Department <span className="text-status-danger">*</span>
        </label>
        <select
          id="add-staff-department"
          name="add_staff_department"
          value={addDepartment}
          onChange={(e) => setAddDepartment(e.target.value)}
          className="w-full min-h-[44px] px-3 py-2 text-xs bg-surface border border-line rounded-lg text-ink focus:border-brand focus:outline-none"
        >
          {DEPARTMENTS.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </div>

      {/* Office selection radio rows */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-ink">
          Office Assignment <span className="text-status-danger">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
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
      <div className="sticky bottom-0 bg-surface border-t border-line py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] flex items-center justify-end gap-2 -mx-5 px-5 mt-auto">
        <Button type="button" variant="ghost" onClick={onClose} className="min-h-[44px]">
          Cancel
        </Button>
        <Button type="submit" variant="primary" className="min-h-[44px]">
          Save Staff Member
        </Button>
      </div>
    </form>
  </Drawer>
  );
}

function EditStaffContent({ isOpen, staff: staffMember, onSave, onClose }) {
  const [editRole, setEditRole] = useState(staffMember.role);
  const [editDepartment, setEditDepartment] = useState(staffMember.department || 'Sales');
  const [editOffice, setEditOffice] = useState(
    staffMember.officeId || staffMember.office || AVAILABLE_OFFICES[0]?.id || 'hq'
  );
  const [editEmail, setEditEmail] = useState(staffMember.email || '');
  const [editSeesAllOffices, setEditSeesAllOffices] = useState(
    Boolean(staffMember.seesAllOffices)
  );
  const [editCanMessageExecutives, setEditCanMessageExecutives] = useState(
    Boolean(staffMember.canMessageExecutives)
  );

  const editEmailError = useMemo(() => {
    const trimmed = editEmail.trim();
    if (!trimmed) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (trimmed.length > 80 || !emailRegex.test(trimmed)) {
      return 'Please enter a valid email address (maximum 80 characters).';
    }
    return null;
  }, [editEmail]);

  const isDirty = Boolean(
    editRole !== staffMember.role ||
    editDepartment !== (staffMember.department || 'Sales') ||
    editOffice !== (staffMember.officeId || staffMember.office || AVAILABLE_OFFICES[0]?.id || 'hq') ||
    (editEmail.trim() || '') !== (staffMember.email || '') ||
    editSeesAllOffices !== Boolean(staffMember.seesAllOffices) ||
    editCanMessageExecutives !== Boolean(staffMember.canMessageExecutives)
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editEmailError) return;
    onSave({
      role: editRole,
      department: editDepartment,
      office: editOffice,
      officeId: editOffice,
      email: editEmail.trim() || null,
      seesAllOffices: editRole === 'admin' ? editSeesAllOffices : false,
      canMessageExecutives: (editRole === 'agent' || editRole === 'support' || editRole === 'intern') ? editCanMessageExecutives : false,
    });
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Role and Office"
      variant="form"
      isDirty={isDirty}
      discardTitle="Discard these changes?"
    >
      <form onSubmit={handleSubmit} className="space-y-5 flex-1 flex flex-col">
      <div className="p-3 rounded-xl bg-surface-raised border border-line flex items-center gap-3">
        <Avatar
          role={staffMember.role}
          initials={initialsOf(staffMember.name)}
          name={staffMember.name}
          size="md"
        />
        <div className="min-w-0">
          <div className="text-xs font-bold text-ink">{staffMember.name}</div>
          <div className="text-xs text-ink-muted">{formatPhoneNg(staffMember.phone)}</div>
        </div>
      </div>

      {/* Email (optional) */}
      <div className="space-y-1.5">
        <label htmlFor="edit-staff-email" className="block text-xs font-semibold text-ink">
          Email Address <span className="text-ink-muted font-normal">(optional)</span>
        </label>
        <input
          id="edit-staff-email"
          name="staff_email"
          type="email"
          maxLength={80}
          value={editEmail}
          onChange={(e) => setEditEmail(e.target.value)}
          placeholder="e.g. aminu@example.com"
          className="w-full min-h-[44px] px-3 py-2 text-xs bg-surface border border-line rounded-lg text-ink focus:border-brand focus:outline-none"
        />
        {editEmailError && (
          <p className="text-xs text-status-danger font-medium">{editEmailError}</p>
        )}
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
                onChange={() => {
                  setEditRole(r.id);
                  if (r.id === 'admin') {
                    setEditDepartment('Executive');
                  }
                }}
                className="accent-brand"
              />
              <span>{r.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Sees all offices switch (admins only) */}
      {editRole === 'admin' && (
        <div className="p-3 rounded-xl border border-line bg-surface-raised flex items-center justify-between min-h-[44px]">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-ink block">Sees all offices</span>
            <span className="text-xs text-ink-muted block">Allow visibility across all office channels</span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={editSeesAllOffices}
            aria-label="Sees all offices"
            onClick={() => setEditSeesAllOffices(!editSeesAllOffices)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
              editSeesAllOffices ? 'bg-brand' : 'bg-line-strong'
            }`}
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-surface shadow-xs transition duration-200 ease-in-out ${
                editSeesAllOffices ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      )}

      {/* Can message executives switch (agent, support, intern) */}
      {(editRole === 'agent' || editRole === 'support' || editRole === 'intern') && (
        <div className="p-3 rounded-xl border border-line bg-surface-raised flex items-center justify-between min-h-[44px]">
          <div className="space-y-0.5 pr-2">
            <span className="text-xs font-semibold text-ink block">Can message executives</span>
            <span className="text-xs text-ink-muted block">Lets this person start a direct message with the MD, the Group Head and the General Manager.</span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={editCanMessageExecutives}
            aria-label="Can message executives"
            onClick={() => setEditCanMessageExecutives(!editCanMessageExecutives)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
              editCanMessageExecutives ? 'bg-brand' : 'bg-line-strong'
            }`}
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-surface shadow-xs transition duration-200 ease-in-out ${
                editCanMessageExecutives ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      )}

      {/* Department selection */}
      <div className="space-y-1.5">
        <label htmlFor="edit-staff-department" className="block text-xs font-semibold text-ink">
          Department
        </label>
        <select
          id="edit-staff-department"
          name="edit_staff_department"
          value={editDepartment}
          onChange={(e) => setEditDepartment(e.target.value)}
          className="w-full min-h-[44px] px-3 py-2 text-xs bg-surface border border-line rounded-lg text-ink focus:border-brand focus:outline-none"
        >
          {DEPARTMENTS.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </div>

      {/* Office Radio Rows */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-ink">Office</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
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
      <div className="sticky bottom-0 bg-surface border-t border-line py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] flex items-center justify-end gap-2 -mx-5 px-5 mt-auto">
        <Button type="button" variant="ghost" onClick={onClose} className="min-h-[44px]">
          Cancel
        </Button>
        <Button type="submit" variant="primary" className="min-h-[44px]">
          Save Changes
        </Button>
      </div>
    </form>
  </Drawer>
  );
}

function EditStaffDrawer({ isOpen, staff: staffMember, onSave, onClose }) {
  if (!isOpen || !staffMember) {
    return <Drawer isOpen={false} onClose={onClose} title="Role and Office" variant="form" />;
  }

  return (
    <EditStaffContent
      key={`edit-${staffMember.id}`}
      isOpen={isOpen}
      staff={staffMember}
      onSave={onSave}
      onClose={onClose}
    />
  );
}

function ChannelRow({
  channel,
  onOpenSheet,
  onArchive,
  onUnarchive,
}) {
  const isAnnouncement = channel.kind === 'announcement';
  const isPrivate = channel.kind === 'private';
  const isArchived = Boolean(channel.archived);

  return (
    <div
      className={`p-3.5 sm:p-4 flex items-center justify-between gap-3 transition-colors ${
        isArchived ? 'bg-surface-raised/40' : 'hover:bg-surface-raised/40'
      }`}
    >
      {/* Icon + Details */}
      <div className="flex items-start gap-3 min-w-0 pr-2 flex-1">
        <div className="mt-0.5">
          {renderChannelIcon(channel)}
        </div>
        <div className="min-w-0 flex-1">
          {/* Row 1: Name and kind badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-xs font-bold text-ink break-words ${
                isArchived ? 'line-through opacity-70' : ''
              }`}
            >
              {channel.kind === 'listing' || channel.kind === 'site' ? (channel.title || channel.name) : `#${channel.name}`}
            </span>
            {isAnnouncement && (
              <Badge variant="neutral">Announcement</Badge>
            )}
          </div>

          {/* Row 2: Description (line-clamp-2) */}
          {channel.description && (
            <p className="text-xs text-ink-muted break-words line-clamp-2 mt-0.5">
              {channel.description}
            </p>
          )}

          {/* Row 3: Quiet caption row when relevant */}
          {channel.sendPolicy === 'admins' && (
            <div className="text-xs text-ink-muted mt-0.5">
              Only admins can send
            </div>
          )}
          {isPrivate && Array.isArray(channel.members) && (
            <div className="text-xs text-ink-muted mt-0.5">
              {channel.members.length} members
            </div>
          )}
          {isArchived && (
            <div className="mt-0.5">
              <Badge variant="neutral">Archived</Badge>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      {/* Mobile (<1024px): 44px MoreHorizontal button, or reserved 44px space for announcement */}
      <div className="flex lg:hidden items-center shrink-0">
        {isAnnouncement ? (
          <div className="w-11 h-11 shrink-0" aria-hidden="true" />
        ) : (
          <button
            type="button"
            onClick={() => onOpenSheet(channel)}
            aria-label={`Actions for ${channel.kind === 'listing' || channel.kind === 'site' ? (channel.title || channel.name) : `#${channel.name}`}`}
            className="w-11 h-11 flex items-center justify-center rounded-lg text-ink-muted hover:text-ink hover:bg-surface-raised cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand shrink-0"
          >
            <MoreHorizontal className="w-5 h-5" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Desktop (>=1024px): Neutral secondary button on row, or reserved space for announcement */}
      <div className="hidden lg:flex items-center shrink-0">
        {isAnnouncement ? (
          <div className="w-[4.625rem] shrink-0" aria-hidden="true" />
        ) : isArchived ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onUnarchive(channel)}
            className="shrink-0"
          >
            Unarchive
          </Button>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onArchive(channel)}
            className="shrink-0"
          >
            Archive
          </Button>
        )}
      </div>
    </div>
  );
}

function SiteAdminRow({
  site,
  properties = [],
  isExpanded,
  onToggleExpand,
  onOpenSheet,
  onArchive,
  onUnarchive,
}) {
  const isArchived = Boolean(site.archived);
  const location = site.location || '';
  const propCount = properties.length;
  const caption = `${location ? `${location} · ` : ''}${propCount} ${propCount === 1 ? 'property' : 'properties'}`;

  return (
    <div className={`transition-colors ${isArchived ? 'bg-surface-raised/40' : ''}`}>
      {/* Site Main Row */}
      <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
        {/* Icon + Details */}
        <div className="flex items-start gap-3 min-w-0 pr-2 flex-1">
          <div className="mt-0.5">
            <Building2 className="w-4 h-4 text-brand shrink-0" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-xs font-bold text-ink break-words ${
                  isArchived ? 'line-through opacity-70' : ''
                }`}
              >
                {site.title || site.name}
              </span>
              {/* Sites and properties show no kind Badge */}
            </div>
            <div className="text-xs text-ink-muted mt-0.5">
              {caption}
            </div>
            {/* Show properties toggle */}
            <div className="mt-1">
              <button
                type="button"
                onClick={() => onToggleExpand(site.id)}
                aria-expanded={isExpanded}
                aria-label={isExpanded ? 'Hide properties' : 'Show properties'}
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline cursor-pointer min-h-[44px] -my-2 py-2"
              >
                <span>{isExpanded ? 'Hide properties' : 'Show properties'}</span>
                {isExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        {/* Mobile */}
        <div className="flex lg:hidden items-center shrink-0">
          <button
            type="button"
            onClick={() => onOpenSheet(site)}
            aria-label={`Actions for ${site.title || site.name}`}
            className="w-11 h-11 flex items-center justify-center rounded-lg text-ink-muted hover:text-ink hover:bg-surface-raised cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand shrink-0"
          >
            <MoreHorizontal className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Desktop */}
        <div className="hidden lg:flex items-center shrink-0">
          {isArchived ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onUnarchive(site)}
              className="shrink-0"
            >
              Unarchive
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onArchive(site)}
              className="shrink-0"
            >
              Archive
            </Button>
          )}
        </div>
      </div>

      {/* Expanded properties of site */}
      {isExpanded && (
        <div className="border-t border-line divide-y divide-line bg-surface-raised/20 pl-6 sm:pl-8">
          {properties.length === 0 ? (
            <div className="p-3 text-xs text-ink-muted">No properties yet.</div>
          ) : (
            properties.map((prop) => {
              const propArchived = Boolean(prop.archived);
              const status = prop.listing?.status || prop.status || 'Available';
              const statusVariant =
                status === 'Available'
                  ? 'success'
                  : status === 'Under offer'
                  ? 'warning'
                  : 'neutral';

              return (
                <div
                  key={prop.id}
                  className="p-2.5 sm:p-3 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1 flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-xs font-semibold text-ink break-words ${
                        propArchived ? 'line-through opacity-70' : ''
                      }`}
                    >
                      {prop.title || prop.name}
                    </span>
                    <Badge variant={statusVariant} size="sm">
                      {status}
                    </Badge>
                  </div>

                  {/* Property Action Menu */}
                  {/* Mobile */}
                  <div className="flex lg:hidden items-center shrink-0">
                    <button
                      type="button"
                      onClick={() => onOpenSheet(prop)}
                      aria-label={`Actions for ${prop.title || prop.name}`}
                      className="w-11 h-11 flex items-center justify-center rounded-lg text-ink-muted hover:text-ink hover:bg-surface-raised cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand shrink-0"
                    >
                      <MoreHorizontal className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>

                  {/* Desktop */}
                  <div className="hidden lg:flex items-center shrink-0">
                    {propArchived ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onUnarchive(prop)}
                        className="shrink-0"
                      >
                        Unarchive
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onArchive(prop)}
                        className="shrink-0"
                      >
                        Archive
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
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
    accessRequests,
    approveAccessRequest,
    declineAccessRequest,
    activityLog,
    sendActivationLink,
    sendPasswordResetLink,
    importStaff,
    activationLinks,
  } = useChat();

  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();

  // Route protection: Admins only
  useEffect(() => {
    if (currentUser && !canUseAdmin(currentUser)) {
      showToast(getAdminAccessDeniedMessage());
      navigate('/channels', { replace: true });
    }
  }, [currentUser, navigate, showToast]);

  const [activeTab, setActiveTab] = useState(() => {
    if (location.state?.tab === 'requests' || searchParams.get('tab') === 'requests') {
      return 'requests';
    }
    return 'staff';
  });

  useEffect(() => {
    if (searchParams.get('tab') === 'requests') {
      const next = new URLSearchParams(searchParams);
      next.delete('tab');
      setSearchParams(next, { replace: true });
    }
    if (location.state?.tab) {
      window.history.replaceState({}, document.title);
    }
  }, [location.state, searchParams, setSearchParams]);

  // Access requests state
  const pending = useMemo(() => {
    return pendingRequests(accessRequests);
  }, [accessRequests]);

  const decidedRequests = useMemo(() => {
    const list = Array.isArray(accessRequests) ? accessRequests : [];
    return list.filter((r) => r && r.status !== 'pending');
  }, [accessRequests]);

  const [reviewingRequest, setReviewingRequest] = useState(null);
  const [reviewRole, setReviewRole] = useState('agent');
  const [reviewOffice, setReviewOffice] = useState(AVAILABLE_OFFICES[0]?.id || 'hq');
  const [reviewDepartment, setReviewDepartment] = useState('Sales');
  const [reviewCanMessageExecutives, setReviewCanMessageExecutives] = useState(false);

  const isReviewDirty = Boolean(
    reviewingRequest && (
      reviewRole !== (reviewingRequest.requestedRole || 'agent') ||
      reviewOffice !== (reviewingRequest.officeId || AVAILABLE_OFFICES[0]?.id || 'hq') ||
      reviewDepartment !== defaultDepartmentForRole(reviewingRequest.requestedRole || 'agent') ||
      reviewCanMessageExecutives !== false
    )
  );
  const [declineModalRequest, setDeclineModalRequest] = useState(null);
  const [isDecidedOpen, setIsDecidedOpen] = useState(false);
  const [staffFilter, setStaffFilter] = useState('all'); // 'all' | office.id | 'not_activated' | 'deactivated'
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [staffSearchQuery, setStaffSearchQuery] = useState('');
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [isImportStaffOpen, setIsImportStaffOpen] = useState(false);
  const [emailPreviewState, setEmailPreviewState] = useState({
    isOpen: false,
    kind: 'activation',
    person: null,
    token: '',
  });

  const openEmailPreview = (kind, person, token) => {
    setEmailPreviewState({
      isOpen: true,
      kind,
      person,
      token: token || '',
    });
  };

  const closeEmailPreview = () => {
    setEmailPreviewState((prev) => ({ ...prev, isOpen: false }));
  };

  const [editingStaff, setEditingStaff] = useState(null);
  const [deactivatingStaff, setDeactivatingStaff] = useState(null);
  const [reactivatingStaff, setReactivatingStaff] = useState(null);
  const [selectedStaffForSheet, setSelectedStaffForSheet] = useState(null);

  // Channels state
  const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false);
  const [channelToArchive, setChannelToArchive] = useState(null);
  const [channelToUnarchive, setChannelToUnarchive] = useState(null);
  const [selectedChannelForSheet, setSelectedChannelForSheet] = useState(null);
  const [isArchivedSectionOpen, setIsArchivedSectionOpen] = useState(false);
  const [expandedSiteIds, setExpandedSiteIds] = useState(() => new Set());

  const toggleSiteExpanded = (siteId) => {
    setExpandedSiteIds((prev) => {
      const next = new Set(prev);
      if (next.has(siteId)) next.delete(siteId);
      else next.add(siteId);
      return next;
    });
  };

  const totalActiveStaff = useMemo(() => staff.filter(isStaffActive).length, [staff]);
  const totalNotActivatedStaff = useMemo(
    () => staff.filter((s) => s.status === 'invited').length,
    [staff]
  );

  // Counts for staff filter chips
  const staffCounts = useMemo(() => {
    const counts = {
      all: staff.length,
      not_activated: staff.filter((s) => s.status === 'invited').length,
      deactivated: staff.filter((s) => s.status === 'deactivated').length,
    };
    (COMPANY_CONFIG.offices || []).forEach((o) => {
      counts[o.id] = staff.filter((s) => (s.officeId || s.office) === o.id).length;
    });
    return counts;
  }, [staff]);

  // Combined search and chip filter for staff
  const filteredStaff = useMemo(() => {
    let list = staff;
    if (staffFilter === 'not_activated') {
      list = list.filter((s) => s.status === 'invited');
    } else if (staffFilter === 'deactivated') {
      list = list.filter((s) => s.status === 'deactivated');
    } else if (staffFilter !== 'all') {
      list = list.filter((s) => (s.officeId || s.office) === staffFilter);
    }

    if (departmentFilter !== 'all') {
      list = list.filter((s) => (s.department || '').toLowerCase() === departmentFilter.toLowerCase());
    }

    const q = staffSearchQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter((s) => {
      const nameMatch = (s.name || '').toLowerCase().includes(q);
      const callMatch = (s.callName || '').toLowerCase().includes(q);
      const titleMatch = (s.title || '').toLowerCase().includes(q);
      const deptMatch = (s.department || '').toLowerCase().includes(q);
      const phoneMatch = s.phone && s.phone.includes(q);
      return nameMatch || callMatch || titleMatch || deptMatch || phoneMatch;
    });
  }, [staff, staffFilter, departmentFilter, staffSearchQuery]);

  // Group filtered staff in COMPANY_CONFIG.offices order, hiding empty groups
  const groupedStaff = useMemo(() => {
    return COMPANY_CONFIG.offices
      .map((office) => {
        const officeMembers = filteredStaff.filter(
          (s) => (s.officeId || s.office) === office.id
        );
        return {
          office,
          members: officeMembers,
        };
      })
      .filter((group) => group.members.length > 0);
  }, [filteredStaff]);

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

  const channelsByOffice = useMemo(() => {
    return (COMPANY_CONFIG.offices || [])
      .map((off) => ({
        office: off,
        channels: activeChannels.filter((c) => c.officeId === off.id),
      }))
      .filter((group) => group.channels.length > 0);
  }, [activeChannels]);

  const handleAddStaff = (staffData) => {
    const newPerson = addStaff(staffData);
    setIsAddStaffOpen(false);
    showToast(getStaffAddedMessage(newPerson.name));
    const token = newPerson.link?.token || '';
    openEmailPreview('activation', newPerson, token);
  };

  const handleImportStaff = (readyRows) => {
    const count = importStaff(readyRows);
    showToast(getStaffImportedMessage(count));
    setStaffFilter('not_activated');
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

    // If deactivating oneself, navigate back to /channels
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
    if (channel.kind === 'site') {
      setChannelToUnarchive(channel);
      return;
    }
    setChannelArchived(channel.id, false);
    showToast(getChannelUnarchivedMessage(channel.name));
  };

  const handleConfirmUnarchive = () => {
    if (!channelToUnarchive) return;
    const target = channelToUnarchive;
    setChannelArchived(target.id, false);
    showToast(getChannelUnarchivedMessage(target.name));
    setChannelToUnarchive(null);
  };

  // Default department helper based on role
  const defaultDepartmentForRole = (role) => {
    if (role === 'admin') return 'Executive';
    if (role === 'agent') return 'Sales';
    if (role === 'intern') return 'Interns';
    return 'Management';
  };

  // Review request handlers
  const handleOpenReview = (req) => {
    setReviewingRequest(req);
    const role = req.requestedRole || 'agent';
    setReviewRole(role);
    setReviewOffice(req.officeId || AVAILABLE_OFFICES[0]?.id || 'hq');
    setReviewDepartment(defaultDepartmentForRole(role));
    setReviewCanMessageExecutives(false);
  };

  const handleApprove = () => {
    if (!reviewingRequest) return;
    const req = reviewingRequest;
    const newPerson = approveAccessRequest(req.id, {
      role: reviewRole,
      officeId: reviewOffice,
      department: reviewDepartment,
      canMessageExecutives: (reviewRole === 'agent' || reviewRole === 'support' || reviewRole === 'intern') ? reviewCanMessageExecutives : false,
    });
    setReviewingRequest(null);
    showToast(getAccessRequestApprovedMessage(req.name));
    if (newPerson) {
      const token = newPerson.link?.token || '';
      openEmailPreview('activation', newPerson, token);
    }
  };

  const handleStartDecline = () => {
    setDeclineModalRequest(reviewingRequest);
  };

  const handleConfirmDecline = () => {
    if (!declineModalRequest) return;
    const req = declineModalRequest;
    declineAccessRequest(req.id);
    setDeclineModalRequest(null);
    setReviewingRequest(null);
    showToast(getAccessRequestDeclinedMessage(req.name));
  };

  if (!currentUser || !canUseAdmin(currentUser)) {
    return null;
  }

  return (
    <div className="h-full flex flex-col bg-canvas overflow-y-auto">
      {/* Top Header */}
      <header className="bg-surface border-b border-line px-4 sm:px-6 py-4 shrink-0">
        <div className="max-w-[56rem] lg:max-w-6xl mx-auto space-y-3">
          <Link
            to="/channels"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-ink hover:underline"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            <span>Back to Channels</span>
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-lg font-bold text-ink">Admin</h1>
              <p className="text-xs text-ink-muted">
                Manage staff and channels.
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
                Staff ({totalActiveStaff})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('requests')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'requests'
                    ? 'bg-surface text-ink shadow-2xs'
                    : 'text-ink-soft hover:text-ink'
                }`}
              >
                <span>Requests ({pending.length})</span>
                {pending.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-status-danger" aria-hidden="true" />
                )}
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
              <button
                type="button"
                onClick={() => setActiveTab('activity')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'activity'
                    ? 'bg-surface text-ink shadow-2xs'
                    : 'text-ink-soft hover:text-ink'
                }`}
              >
                Activity ({activityLog.length})
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:px-6 py-6">
        <div className="max-w-[56rem] lg:max-w-6xl mx-auto space-y-6">
          {activeTab === 'staff' && (
            <div className="space-y-4">
              {/* Staff tab count heading: active + not activated */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <div>
                  <h2 className="text-base font-bold text-ink">
                    Staff{' '}
                    <span className="text-xs font-normal text-ink-muted">
                      ({totalActiveStaff} active{totalNotActivatedStaff > 0 ? `, ${totalNotActivatedStaff} not activated` : ''})
                    </span>
                  </h2>
                  <p className="text-xs text-ink-muted">
                    Manage team members, roles, and offices.
                  </p>
                </div>
              </div>

              {/* Controls bar: search input (full width) + Import & Add staff buttons */}
              <div className="flex items-center justify-between gap-2.5 sm:gap-3">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ink-muted">
                    <Search className="w-4 h-4 shrink-0" aria-hidden="true" />
                  </div>
                  <input
                    name="admin_staff_search"
                    type="text"
                    value={staffSearchQuery}
                    onChange={(e) => setStaffSearchQuery(e.target.value)}
                    placeholder="Search staff by name, role, or phone..."
                    className="w-full h-11 pl-9 pr-3 text-xs bg-surface border border-line rounded-xl text-ink placeholder:text-ink-muted focus:border-brand focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsImportStaffOpen(true)}
                    className="h-11 px-3 sm:px-4 shrink-0 whitespace-nowrap"
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <Upload className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>Import</span>
                    </span>
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setIsAddStaffOpen(true)}
                    className="h-11 px-3 sm:px-4 shrink-0 whitespace-nowrap"
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <UserPlus className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>Add staff</span>
                    </span>
                  </Button>
                </div>
              </div>

              {/* Filter chips: All, offices from config, Not activated, Deactivated + Department select */}
              <div className="flex items-center gap-2 flex-wrap">
                {[
                  { id: 'all', label: 'All', count: staffCounts.all },
                  ...(COMPANY_CONFIG.offices || []).map((o) => ({
                    id: o.id,
                    label: o.name,
                    count: staffCounts[o.id] || 0,
                  })),
                  { id: 'not_activated', label: 'Not activated', count: staffCounts.not_activated },
                  { id: 'deactivated', label: 'Deactivated', count: staffCounts.deactivated },
                ].map((chip) => {
                  const isSelected = staffFilter === chip.id;
                  return (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={() => setStaffFilter(chip.id)}
                      className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                        isSelected
                          ? 'bg-brand text-surface border-brand shadow-2xs'
                          : 'bg-surface text-ink-soft border-line hover:text-ink hover:bg-surface-raised'
                      }`}
                    >
                      <span>{chip.label}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-xs tabular-nums font-mono ${
                          isSelected
                            ? 'bg-surface/20 text-surface'
                            : 'bg-surface-raised text-ink-muted'
                        }`}
                      >
                        {chip.count}
                      </span>
                    </button>
                  );
                })}

                {/* Department Select */}
                <div className="ml-auto flex items-center gap-1.5">
                  <label htmlFor="admin-department-filter" className="sr-only">
                    Filter by Department
                  </label>
                  <select
                    id="admin-department-filter"
                    name="admin_department_filter"
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="min-h-[44px] px-3 py-2 text-xs bg-surface border border-line rounded-xl text-ink font-medium focus:border-brand focus:outline-none cursor-pointer"
                  >
                    <option value="all">All departments</option>
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Staff grouped under section headings "<Office name> office" with count */}
              {groupedStaff.length === 0 ? (
                <div className="p-8 text-center space-y-2 border border-line rounded-2xl bg-surface shadow-2xs">
                  <p className="text-xs text-ink-muted">
                    {staffSearchQuery
                      ? `No staff members found matching "${staffSearchQuery}"`
                      : 'No staff members found.'}
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
                <div className="space-y-6">
                  {groupedStaff.map((group) => (
                    <div key={group.office.id} className="space-y-2">
                      <h2 className="text-xs font-bold text-ink-muted uppercase tracking-wider px-1">
                        {group.office.label || `${group.office.name} office`}{' '}
                        <span className="normal-case font-normal text-ink-muted">
                          ({group.members.filter(isStaffActive).length} active
                          {group.members.filter((s) => s.status === 'invited').length > 0 &&
                            `, ${group.members.filter((s) => s.status === 'invited').length} not activated`}
                          )
                        </span>
                      </h2>
                      <div className="border border-line rounded-2xl bg-surface divide-y divide-line overflow-hidden shadow-2xs">
                        {group.members.map((member) => {
                          const active = isStaffActive(member);
                          const isInvited = member.status === 'invited';
                          const isDeactivated = member.status === 'deactivated';
                          const isSelf = member.id === currentUserId;
                          const isOnlyAdmin = member.role === 'admin' && activeAdminCount <= 1;
                          const canDeactivate = (active || isInvited) && !isSelf && !isOnlyAdmin;

                          let disableReason = '';
                          if (isSelf) {
                            disableReason = 'You cannot deactivate your own account.';
                          } else if (isOnlyAdmin) {
                            disableReason = 'Cannot deactivate the only active administrator.';
                          }

                          return (
                            <div key={member.id}>
                              {/* Compact Row (below 1024px) */}
                              <div
                                className={`p-3.5 sm:p-4 min-h-[4.5rem] sm:min-h-[4.75rem] flex items-center justify-between gap-3 xl:hidden transition-colors ${
                                  active ? 'hover:bg-surface-raised/40' : 'bg-surface-raised/50 opacity-75'
                                }`}
                              >
                                <div className="flex items-start gap-3 min-w-0 flex-1">
                                  <div className="pt-0.5 shrink-0">
                                    <Avatar
                                      role={member.role}
                                      initials={initialsOf(member.name)}
                                      name={member.name}
                                      isOnline={active && (member.isOnline ?? member.online)}
                                      size="md"
                                    />
                                  </div>
                                  <div className="min-w-0 flex-1 space-y-1.5">
                                    {/* Name and optional neutral "You" tag */}
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="text-xs font-semibold text-ink break-words">
                                        {member.name}
                                      </span>
                                      {isSelf && (
                                        <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-surface-raised text-ink-muted border border-line shrink-0">
                                          You
                                        </span>
                                      )}
                                    </div>

                                    {/* Role Badge and status badges */}
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <Badge role={member.role}>
                                        {ROLE_LABELS[member.role] || member.role}
                                      </Badge>
                                      {isInvited && (
                                        <Badge variant="warning">
                                          Not activated
                                        </Badge>
                                      )}
                                      {isDeactivated && (
                                        <Badge variant="danger">
                                          Deactivated
                                        </Badge>
                                      )}
                                    </div>

                                    {/* Job title & department caption line + Office + Phone */}
                                    <div className="flex items-center gap-1.5 text-xs text-ink-muted flex-wrap">
                                      {member.showOldDetails && (
                                        <>
                                          <span className="text-ink-soft font-medium">
                                            {member.title && (
                                          <span className="text-ink-soft font-medium">
                                            {member.title}
                                          </span>
                                        )}
                                        {member.showOldDetails && member.title && member.department && (
                                          <span aria-hidden="true">·</span>
                                        )}
                                        {(member.title || member.department) && (
                                         <>
                                           <span className="text-ink-soft font-medium">
                                             {member.title ? (member.department ? `${member.title} · ${member.department}` : member.title) : member.department}
                                           </span>
                                           {member.showOldDetails && <span>·</span>}
                                         </>
                                       )}
                                       {member.showOldDetails && (
                                          <span>
                                            {member.department}
                                          </span>
                                        )}
                                          </span>
                                          <span>·</span>
                                        </>
                                      )}
                                      {member.department && (
                                        <>
                                          <span className="text-ink-soft font-medium">
                                            {member.department}
                                          </span>
                                          <span>·</span>
                                        </>
                                      )}
                                      <span>
                                        {officeLabelOf(member.officeId || member.office)}
                                      </span>
                                      <span>·</span>
                                      <span className="tabular-nums tracking-normal">
                                        {formatPhoneNg(member.phone)}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* One 44px icon button (MoreHorizontal) */}
                                <button
                                  type="button"
                                  onClick={() => setSelectedStaffForSheet(member)}
                                  aria-label={`Actions for ${member.name}`}
                                  className="w-11 h-11 flex items-center justify-center rounded-lg text-ink-muted hover:text-ink hover:bg-surface-raised cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand shrink-0"
                                >
                                  <MoreHorizontal className="w-5 h-5" aria-hidden="true" />
                                </button>
                              </div>

                              {/* Desktop Row (from 1024px up) */}
                              <div
                                className={`p-3.5 hidden xl:flex items-center justify-between gap-4 transition-colors ${
                                  active ? 'hover:bg-surface-raised/40' : 'bg-surface-raised/50 opacity-75'
                                }`}
                              >
                                {/* Avatar + Name with job title caption */}
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                  <Avatar
                                    role={member.role}
                                    initials={initialsOf(member.name)}
                                    name={member.name}
                                    isOnline={active && (member.isOnline ?? member.online)}
                                    size="md"
                                  />
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="text-xs font-semibold text-ink break-words">
                                        {member.name}
                                      </span>
                                      {isSelf && (
                                        <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-surface-raised text-ink-muted border border-line shrink-0">
                                          You
                                        </span>
                                      )}
                                    </div>
                                    {(member.title || member.department) && (
                                      <div className="text-xs text-ink-muted mt-0.5 flex items-center gap-1.5 flex-wrap">
                                        {member.showOldDetails && (
                                          <span className="text-ink-soft font-medium">
                                            {member.title}
                                          </span>
                                        )}
                                        {member.showOldDetails && member.title && member.department && (
                                          <span aria-hidden="true">·</span>
                                        )}
                                        {(member.title || member.department) && (
                                         <>
                                           <span className="text-ink-soft font-medium">
                                             {member.title ? (member.department ? `${member.title} · ${member.department}` : member.title) : member.department}
                                           </span>
                                           {member.showOldDetails && <span>·</span>}
                                         </>
                                       )}
                                       {member.showOldDetails && (
                                          <span>
                                            {member.department}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Department */}{member.showOldDetails && (
                                <div className="text-xs text-ink-soft shrink-0 w-28">
                                  {member.department || 'General'}
                                </div>

                                )}{/* Role Badge & Status Badges */}
                                <div className="shrink-0 flex items-center gap-1.5 flex-wrap">
                                  <Badge role={member.role}>
                                    {ROLE_LABELS[member.role] || member.role}
                                  </Badge>
                                  {isInvited && (
                                    <Badge variant="warning">
                                      Not activated
                                    </Badge>
                                  )}
                                  {isDeactivated && (
                                    <Badge variant="danger">
                                      Deactivated
                                    </Badge>
                                  )}
                                </div>
                                <div className="shrink-0">
                                  <Badge role={member.role}>
                                    {ROLE_LABELS[member.role] || member.role}
                                  </Badge>
                                </div>

                                {/* Office */}{member.showOldDetails && (
                                <div className="text-xs text-ink-muted shrink-0 w-32">
                                  {officeNameOf(member.officeId || member.office)}
                                </div>

                                )}{/* Phone */}
                                <div className="text-xs text-ink-muted tabular-nums tracking-normal shrink-0">
                                  {formatPhoneNg(member.phone)}
                                </div>

                                {/* Status */}{member.showOldDetails && (
                                <div className="w-28 shrink-0 flex items-center justify-start">
                                  {isInvited && (
                                    <Badge variant="warning">
                                      Not activated
                                    </Badge>
                                  )}
                                  {isDeactivated && (
                                    <Badge variant="danger">
                                      Deactivated
                                    </Badge>
                                  )}
                                </div>

                                )}{/* Actions: Edit and More */}
                                <div className="flex items-center gap-2 shrink-0">
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setEditingStaff(member)}
                                  >
                                    Edit
                                  </Button>
                                  {member.canQuickDeactivate && active ? (
                                    <Button
                                      variant="secondary"
                                      size="sm"
                                      disabled={!canDeactivate}
                                      title={disableReason || undefined}
                                      onClick={() => setDeactivatingStaff(member)}
                                    >
                                      Deactivate
                                    </Button>
                                  ) : isInvited ? (
                                    <Button
                                      variant="secondary"
                                      size="sm"
                                      disabled={!canDeactivate}
                                      title={disableReason || undefined}
                                      onClick={() => setDeactivatingStaff(member)}
                                    >
                                      Deactivate
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="secondary"
                                      size="sm"
                                      onClick={() => setReactivatingStaff(member)}
                                    >
                                      Reactivate
                                    </Button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => setSelectedStaffForSheet(member)}
                                    aria-label={`More actions for ${member.name}`}
                                    className="w-11 h-11 flex items-center justify-center rounded-lg text-ink-muted hover:text-ink hover:bg-surface-raised cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand shrink-0"
                                  >
                                    <MoreHorizontal className="w-5 h-5" aria-hidden="true" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-ink">Access Requests</h2>
                  <p className="text-xs text-ink-muted">
                    Review and approve new team members requesting to join the workspace.
                  </p>
                </div>
              </div>

              {/* Pending requests section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-ink-muted px-1">
                  <span>Waiting for approval ({pending.length})</span>
                </div>

                {pending.length === 0 ? (
                  <div className="border border-line rounded-xl bg-surface p-8 text-center space-y-2">
                    <p className="text-sm font-semibold text-ink">No requests waiting.</p>
                    <p className="text-xs text-ink-muted">
                      New access requests submitted from the login screen will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="border border-line rounded-xl bg-surface divide-y divide-line overflow-hidden shadow-2xs">
                    {pending.map((req) => {
                      const initials = initialsOf(req.name);
                      const officeLabel = officeLabelOf(req.officeId);
                      const roleLabel = ROLE_LABELS[req.requestedRole] || req.requestedRole;

                      return (
                        <div
                          key={req.id}
                          className="p-3 sm:p-4 flex items-center justify-between gap-3 hover:bg-surface-raised transition-colors"
                        >
                          <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                            <Avatar name={req.name} initials={initials} role={req.requestedRole} size="md" />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-ink text-xs sm:text-sm">
                                  {req.name}
                                </span>
                                <span className="text-xs font-mono text-ink-muted">
                                  {formatPhoneNg(req.phone)}
                                </span>
                              </div>
                              <div className="text-xs text-ink-muted flex items-center gap-1.5 flex-wrap mt-0.5">
                                <span>{officeLabel} · wants to join as {roleLabel}</span>
                                <span>·</span>
                                <span className="tabular-nums">{formatListTimeNg(req.createdAt)}</span>
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleOpenReview(req)}
                            className="min-h-[44px] min-w-[44px] px-3.5 py-2 rounded-lg text-xs font-semibold bg-surface-raised border border-line hover:border-brand hover:text-brand cursor-pointer transition-colors shrink-0"
                          >
                            Review
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Decided section (collapsed group) */}
              {decidedRequests.length > 0 && (
                <div className="space-y-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsDecidedOpen((open) => !open)}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-line bg-surface hover:bg-surface-raised transition-colors cursor-pointer text-left min-h-[44px]"
                  >
                    <span className="text-xs font-semibold text-ink">
                      Decided ({decidedRequests.length})
                    </span>
                    {isDecidedOpen ? (
                      <ChevronUp className="w-4 h-4 text-ink-muted" aria-hidden="true" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-ink-muted" aria-hidden="true" />
                    )}
                  </button>

                  {isDecidedOpen && (
                    <div className="border border-line rounded-xl bg-surface divide-y divide-line overflow-hidden shadow-2xs">
                      {decidedRequests.map((req) => {
                        const initials = initialsOf(req.name);
                        const officeLabel = officeLabelOf(req.officeId);
                        const roleLabel = ROLE_LABELS[req.requestedRole] || req.requestedRole;
                        const isApproved = req.status === 'approved';
                        const matchedPerson = staff.find(
                          (s) => s.phone && normalisePhoneNg(s.phone) === normalisePhoneNg(req.phone)
                        );
                        const isPersonActivated = matchedPerson ? matchedPerson.status === 'active' : false;

                        return (
                          <div
                            key={req.id}
                            className="p-3 sm:p-4 flex items-center justify-between gap-3"
                          >
                            <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                              <Avatar name={req.name} initials={initials} role={req.requestedRole} size="sm" />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-semibold text-ink text-xs">
                                    {req.name}
                                  </span>
                                  <span className="text-xs font-mono text-ink-muted">
                                    {formatPhoneNg(req.phone)}
                                  </span>
                                </div>
                                <div className="text-xs text-ink-muted flex items-center gap-1.5 flex-wrap mt-0.5">
                                  <span>{officeLabel} · {roleLabel}</span>
                                  <span>·</span>
                                  <span className="tabular-nums">
                                    {formatDateNg(req.decidedAt || req.createdAt)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {isApproved ? (
                              <div className="flex flex-col items-end gap-1 shrink-0">
                                <Badge variant="success" size="sm">
                                  Approved
                                </Badge>
                                <span className="text-xs text-ink-muted">
                                  {isPersonActivated ? 'Activated' : 'Not activated yet'}
                                </span>
                              </div>
                            ) : (
                              <Badge variant="neutral" size="sm">
                                Declined
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'channels' && (
            <div className="space-y-6">
              {/* Channel header action: New channel button aligned right */}
              <div className="flex justify-end">
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
                  <h2 className="text-xs font-bold text-ink-muted uppercase tracking-wider px-1">
                    Company-wide ({companyWideChannels.length})
                  </h2>
                  <div className="border border-line rounded-2xl bg-surface divide-y divide-line overflow-hidden shadow-2xs">
                    {companyWideChannels.map((ch) => (
                      <ChannelRow
                        key={ch.id}
                        channel={ch}
                        onOpenSheet={setSelectedChannelForSheet}
                        onArchive={setChannelToArchive}
                        onUnarchive={handleUnarchive}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Office Sections */}
              {channelsByOffice.map(({ office, channels: offChannels }) => {
                const regularChannels = offChannels.filter(
                  (c) => c.kind !== 'site' && c.kind !== 'listing'
                );
                const sites = offChannels.filter((c) => c.kind === 'site');

                return (
                  <div key={office.id} className="space-y-4">
                    <h2 className="text-xs font-bold text-ink-muted uppercase tracking-wider px-1">
                      {office.label} ({regularChannels.length + sites.length})
                    </h2>

                    {/* Regular Channels */}
                    {regularChannels.length > 0 && (
                      <div className="border border-line rounded-2xl bg-surface divide-y divide-line overflow-hidden shadow-2xs">
                        {regularChannels.map((ch) => (
                          <ChannelRow
                            key={ch.id}
                            channel={ch}
                            onOpenSheet={setSelectedChannelForSheet}
                            onArchive={setChannelToArchive}
                            onUnarchive={handleUnarchive}
                          />
                        ))}
                      </div>
                    )}

                    {/* Sites Group */}
                    {sites.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="text-xs font-bold text-ink-muted uppercase tracking-wider px-1">
                          Sites ({sites.length})
                        </h3>
                        <div className="border border-line rounded-2xl bg-surface divide-y divide-line overflow-hidden shadow-2xs">
                          {sites.map((site) => {
                            const siteProperties = channels.filter(
                              (c) =>
                                c.kind === 'listing' &&
                                !c.archived &&
                                (c.listing?.siteId === site.id || c.siteId === site.id)
                            );

                            return (
                              <SiteAdminRow
                                key={site.id}
                                site={site}
                                properties={siteProperties}
                                isExpanded={expandedSiteIds.has(site.id)}
                                onToggleExpand={toggleSiteExpanded}
                                onOpenSheet={setSelectedChannelForSheet}
                                onArchive={setChannelToArchive}
                                onUnarchive={handleUnarchive}
                              />
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Collapsed Archived Section at Bottom */}
              <div className="border border-line rounded-2xl bg-surface overflow-hidden shadow-2xs">
                <button
                  type="button"
                  onClick={() => setIsArchivedSectionOpen((prev) => !prev)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-surface-raised transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-ink-muted uppercase tracking-wider">
                    <Archive className="w-4 h-4 text-ink-muted" aria-hidden="true" />
                    <span>Archived ({archivedChannels.length})</span>
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
                        <ChannelRow
                          key={ch.id}
                          channel={ch}
                          onOpenSheet={setSelectedChannelForSheet}
                          onArchive={setChannelToArchive}
                          onUnarchive={handleUnarchive}
                        />
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <ActivityLogTab activityLog={activityLog} staff={staff} />
          )}
        </div>
      </main>

      {/* Add Staff Drawer */}
      <AddStaffDrawer
        key={`add-staff-${isAddStaffOpen}`}
        isOpen={isAddStaffOpen}
        staff={staff}
        onSave={handleAddStaff}
        onClose={() => setIsAddStaffOpen(false)}
      />

      {/* Edit Staff Drawer (Role and office) */}
      <EditStaffDrawer
        key={editingStaff ? `edit-staff-${editingStaff.id}` : 'edit-staff-none'}
        isOpen={Boolean(editingStaff)}
        staff={editingStaff}
        onSave={handleEditStaff}
        onClose={() => setEditingStaff(null)}
      />

      {/* Staff Action Sheet Drawer */}
      <Drawer
        isOpen={Boolean(selectedStaffForSheet)}
        onClose={() => setSelectedStaffForSheet(null)}
        title={selectedStaffForSheet?.name ?? ''}
      >
        {selectedStaffForSheet && (() => {
          const member = selectedStaffForSheet;
          const active = isStaffActive(member);
          const isInvited = member.status === 'invited';
          const isDeactivated = member.status === 'deactivated';
          const isSelf = member.id === currentUserId;
          const isOnlyAdmin = member.role === 'admin' && activeAdminCount <= 1;
          const canDeactivate = (active || isInvited) && !isSelf && !isOnlyAdmin;

          let disableReason = '';
          if (isSelf) {
            disableReason = 'You cannot deactivate your own account.';
          } else if (isOnlyAdmin) {
            disableReason = 'Cannot deactivate the only active administrator.';
          }

          return (
            <div className="space-y-4">
              {/* Header: avatar, name, job title, role Badge, office, phone */}
              <div className="p-3.5 rounded-xl bg-surface-raised border border-line flex items-start gap-3">
                <div className="pt-0.5 shrink-0">
                  <Avatar
                    role={member.role}
                    initials={initialsOf(member.name)}
                    name={member.name}
                    isOnline={active && (member.isOnline ?? member.online)}
                    size="md"
                  />
                </div>
                <div className="min-w-0 flex-1 space-y-1.5">
                  {/* Name and optional neutral "You" tag */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-ink break-words">{member.name}</span>
                    {isSelf && (
                      <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-surface text-ink-muted border border-line">
                        You
                      </span>
                    )}
                  </div>

                  {/* Role Badge and status badges */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Badge role={member.role}>
                      {ROLE_LABELS[member.role] || member.role}
                    </Badge>
                    {isInvited && (
                      <Badge variant="warning">
                        Not activated
                      </Badge>
                    )}
                    {isDeactivated && (
                      <Badge variant="danger">
                        Deactivated
                      </Badge>
                    )}
                  </div>

                  {/* Job title if present */}
                  {member.title && (
                    <div className="text-xs text-ink-soft font-medium">
                      {member.title}
                    </div>
                  )}

                  {/* Office, Department, Phone, Email metadata row */}
                  <div className="text-xs text-ink-muted flex items-center gap-1.5 flex-wrap">
                    <span>{officeLabelOf(member.officeId || member.office)}</span>
                    {member.department && (
                      <>
                        <span>·</span>
                        <span>{member.department}</span>
                      </>
                    )}
                    <span>·</span>
                    <span className="tabular-nums tracking-normal">{formatPhoneNg(member.phone)}</span>
                    {member.email && (
                      <>
                        <span>·</span>
                        <span className="break-all font-mono">{member.email}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions as full-width rows (44px) */}
              <div className="space-y-2 pt-1">
                {isInvited && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        const target = member;
                        setSelectedStaffForSheet(null);
                        let link = (activationLinks || []).slice().reverse().find((l) => l.staffId === target.id && !l.usedAt);
                        let token = link?.token;
                        if (!token) {
                          const res = sendActivationLink(target.id);
                          token = res?.link?.token;
                        }
                        openEmailPreview('activation', target, token);
                      }}
                      className="w-full h-11 px-4 rounded-xl border border-line bg-surface text-ink font-semibold text-xs flex items-center justify-center hover:bg-surface-raised cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                    >
                      Email preview
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const target = member;
                        setSelectedStaffForSheet(null);
                        let link = (activationLinks || []).slice().reverse().find((l) => l.staffId === target.id && !l.usedAt);
                        let token = link?.token;
                        if (!token) {
                          const res = sendActivationLink(target.id);
                          token = res?.link?.token;
                        }
                        if (token) {
                          const origin = typeof window !== 'undefined' && window.location?.origin ? window.location.origin : '';
                          const fullUrl = `${origin}/activate/${token}`;
                          if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
                            navigator.clipboard.writeText(fullUrl).catch(() => {});
                          }
                        }
                        showToast(getActivationLinkCopiedMessage());
                      }}
                      className="w-full h-11 px-4 rounded-xl border border-line bg-surface text-ink font-semibold text-xs flex items-center justify-center hover:bg-surface-raised cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                    >
                      Copy activation link
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const target = member;
                        setSelectedStaffForSheet(null);
                        const res = sendActivationLink(target.id);
                        showToast(getActivationLinkSentMessage(target.name));
                        openEmailPreview('activation', target, res?.link?.token);
                      }}
                      className="w-full h-11 px-4 rounded-xl border border-line bg-surface text-ink font-semibold text-xs flex items-center justify-center hover:bg-surface-raised cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                    >
                      Send new link
                    </button>
                  </>
                )}

                {active && (
                  <button
                    type="button"
                    onClick={() => {
                      const target = member;
                      setSelectedStaffForSheet(null);
                      const res = sendPasswordResetLink(target.id);
                      showToast(getPasswordResetLinkSentMessage(target.name));
                      openEmailPreview('reset', target, res?.link?.token);
                    }}
                    className="w-full h-11 px-4 rounded-xl border border-line bg-surface text-ink font-semibold text-xs flex items-center justify-center hover:bg-surface-raised cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    Send password reset link
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    const target = member;
                    setSelectedStaffForSheet(null);
                    setEditingStaff(target);
                  }}
                  className="w-full h-11 px-4 rounded-xl border border-line bg-surface text-ink font-semibold text-xs flex items-center justify-center hover:bg-surface-raised cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                  Edit role and office
                </button>

                {(active || isInvited) ? (
                  <div className="space-y-1.5">
                    <button
                      type="button"
                      disabled={!canDeactivate}
                      onClick={() => {
                        if (!canDeactivate) return;
                        const target = member;
                        setSelectedStaffForSheet(null);
                        setDeactivatingStaff(target);
                      }}
                      className={`w-full h-11 px-4 rounded-xl border font-semibold text-xs flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                        canDeactivate
                          ? 'border-line bg-surface text-ink hover:bg-surface-raised cursor-pointer'
                          : 'border-line bg-surface-raised text-ink-muted opacity-50 cursor-not-allowed'
                      }`}
                    >
                      Deactivate
                    </button>
                    {!canDeactivate && disableReason && (
                      <p className="text-xs text-status-warning font-medium px-1 text-center">
                        {disableReason}
                      </p>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const target = member;
                      setSelectedStaffForSheet(null);
                      setReactivatingStaff(target);
                    }}
                    className="w-full h-11 px-4 rounded-xl border border-line bg-surface text-ink font-semibold text-xs flex items-center justify-center hover:bg-surface-raised cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    Reactivate
                  </button>
                )}
              </div>
            </div>
          );
        })()}
      </Drawer>

      {/* Channel Action Sheet Drawer */}
      <Drawer
        isOpen={Boolean(selectedChannelForSheet)}
        onClose={() => setSelectedChannelForSheet(null)}
        title={
          selectedChannelForSheet?.kind === 'listing' || selectedChannelForSheet?.kind === 'site'
            ? (selectedChannelForSheet?.title || selectedChannelForSheet?.name || '')
            : `#${selectedChannelForSheet?.name ?? ''}`
        }
      >
        {selectedChannelForSheet && (
          <div className="space-y-4">
            {/* Channel details card */}
            <div className="p-3.5 rounded-xl bg-surface-raised border border-line flex items-center gap-3">
              {renderChannelIcon(selectedChannelForSheet)}
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-ink">
                    {selectedChannelForSheet.kind === 'listing' || selectedChannelForSheet.kind === 'site'
                      ? (selectedChannelForSheet.title || selectedChannelForSheet.name)
                      : `#${selectedChannelForSheet.name}`}
                  </span>
                  {selectedChannelForSheet.kind === 'announcement' && (
                    <Badge variant="neutral">Announcement</Badge>
                  )}
                  {selectedChannelForSheet.archived && (
                    <Badge variant="neutral">Archived</Badge>
                  )}
                </div>
                {selectedChannelForSheet.description && (
                  <p className="text-xs text-ink-muted break-words line-clamp-2">
                    {selectedChannelForSheet.description}
                  </p>
                )}
                {selectedChannelForSheet.kind === 'private' && Array.isArray(selectedChannelForSheet.members) && (
                  <p className="text-xs text-ink-muted">
                    {selectedChannelForSheet.members.length} members
                  </p>
                )}
              </div>
            </div>

            {/* Action button */}
            <div className="pt-1">
              {selectedChannelForSheet.archived ? (
                <button
                  type="button"
                  onClick={() => {
                    const target = selectedChannelForSheet;
                    setSelectedChannelForSheet(null);
                    handleUnarchive(target);
                  }}
                  className="w-full h-11 px-4 rounded-xl border border-line bg-surface text-ink font-semibold text-xs flex items-center justify-center hover:bg-surface-raised cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                  Unarchive
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const target = selectedChannelForSheet;
                    setSelectedChannelForSheet(null);
                    setChannelToArchive(target);
                  }}
                  className="w-full h-11 px-4 rounded-xl border border-line bg-surface text-ink font-semibold text-xs flex items-center justify-center hover:bg-surface-raised cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                  Archive
                </button>
              )}
            </div>
          </div>
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
        title={
          channelToArchive?.kind === 'site' || channelToArchive?.kind === 'listing'
            ? `Archive ${channelToArchive?.title || channelToArchive?.name}?`
            : `Archive #${channelToArchive?.name}?`
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-ink leading-relaxed">
            {channelToArchive?.kind === 'site'
              ? `This also archives its ${
                  channels.filter(
                    (c) =>
                      c.kind === 'listing' &&
                      (c.listing?.siteId === channelToArchive.id || c.siteId === channelToArchive.id)
                  ).length
                } properties.`
              : 'Archiving this channel will disable new messages, reactions, edits, and pins. The channel will be moved to the archived section.'}
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

      {/* Unarchive Site Modal */}
      <Modal
        isOpen={Boolean(channelToUnarchive)}
        onClose={() => setChannelToUnarchive(null)}
        title={`Unarchive ${channelToUnarchive?.title || channelToUnarchive?.name}?`}
      >
        <div className="space-y-4">
          <p className="text-xs text-ink leading-relaxed">
            {`This also restores its ${
              channels.filter(
                (c) =>
                  c.kind === 'listing' &&
                  (c.listing?.siteId === channelToUnarchive?.id || c.siteId === channelToUnarchive?.id)
              ).length
            } properties.`}
          </p>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setChannelToUnarchive(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmUnarchive}
            >
              Unarchive Channel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Shared Create Channel Drawer */}
      <CreateChannelDrawer
        isOpen={isCreateChannelOpen}
        onClose={() => setIsCreateChannelOpen(false)}
      />

      {/* Review Access Request Drawer */}
      <Drawer
        isOpen={Boolean(reviewingRequest)}
        onClose={() => setReviewingRequest(null)}
        title="Review Access Request"
        variant="form"
        isDirty={isReviewDirty}
        discardTitle="Discard this review?"
      >
        {reviewingRequest && (
          <div className="space-y-6 flex-1 flex flex-col">
            {/* Person details */}
            <div className="p-4 rounded-xl border border-line bg-surface-raised space-y-3">
              <div className="flex items-center gap-3">
                <Avatar
                  name={reviewingRequest.name}
                  initials={initialsOf(reviewingRequest.name)}
                  role={reviewingRequest.requestedRole}
                  size="lg"
                />
                <div className="min-w-0 space-y-0.5">
                  <h3 className="text-sm font-bold text-ink">{reviewingRequest.name}</h3>
                  <p className="text-xs font-mono text-ink-muted">
                    {formatPhoneNg(reviewingRequest.phone)}
                  </p>
                  {reviewingRequest.email ? (
                    <p className="text-xs font-mono text-ink-soft break-all">
                      {reviewingRequest.email}
                    </p>
                  ) : (
                    <p className="text-xs text-ink-muted italic">
                      No email on file
                    </p>
                  )}
                  <p className="text-xs text-ink-muted pt-1">
                    Approving creates the account and prepares an activation email.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap text-xs text-ink-muted pt-1 border-t border-line">
                <span>Requested: <strong className="text-ink font-semibold">{ROLE_LABELS[reviewingRequest.requestedRole] || reviewingRequest.requestedRole}</strong></span>
                <span>·</span>
                <span>{officeLabelOf(reviewingRequest.officeId)}</span>
                <span>·</span>
                <span className="tabular-nums">{formatListTimeNg(reviewingRequest.createdAt)}</span>
              </div>
            </div>

            {/* Role choices (5 radio rows) */}
            <div className="space-y-2">
              <span className="block text-xs font-semibold text-ink">Role</span>
              <div className="space-y-1.5">
                {AVAILABLE_ROLES.map((r) => {
                  const isChecked = reviewRole === r.id;
                  return (
                    <label
                      key={r.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                        isChecked
                          ? 'border-brand bg-brand/5 text-ink'
                          : 'border-line bg-surface hover:bg-surface-raised text-ink-soft'
                      }`}
                    >
                      <input
                        type="radio"
                        name="review_role_choice"
                        value={r.id}
                        checked={isChecked}
                        onChange={() => {
                          setReviewRole(r.id);
                          setReviewDepartment(defaultDepartmentForRole(r.id));
                        }}
                        className="accent-brand cursor-pointer"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold">{ROLE_LABELS[r.id] || r.id}</div>
                        <div className="text-xs text-ink-muted">{r.label}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Department select */}
            <div className="space-y-2">
              <label htmlFor="review_department_select" className="block text-xs font-semibold text-ink">
                Department
              </label>
              <div className="relative">
                <select
                  id="review_department_select"
                  name="review_department_choice"
                  value={reviewDepartment}
                  onChange={(e) => setReviewDepartment(e.target.value)}
                  className="w-full h-11 px-3.5 pr-8 rounded-xl border border-line bg-surface text-ink text-xs font-medium appearance-none focus:outline-none focus-visible:ring-2 focus-visible:ring-brand cursor-pointer"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-ink-muted absolute right-3 top-3.5 pointer-events-none" aria-hidden="true" />
              </div>
            </div>

            {/* Office choices (3 radio rows) */}
            <div className="space-y-2">
              <span className="block text-xs font-semibold text-ink">Office</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {AVAILABLE_OFFICES.map((off) => {
                  const isChecked = reviewOffice === off.id;
                  return (
                    <label
                      key={off.id}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-colors ${
                        isChecked
                          ? 'border-brand bg-brand/5 text-ink'
                          : 'border-line bg-surface hover:bg-surface-raised text-ink-soft'
                      }`}
                    >
                      <input
                        type="radio"
                        name="review_office_choice"
                        value={off.id}
                        checked={isChecked}
                        onChange={() => setReviewOffice(off.id)}
                        className="accent-brand cursor-pointer"
                      />
                      <span className="text-xs font-semibold">{off.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Can message executives switch (agent, support, intern) */}
            {(reviewRole === 'agent' || reviewRole === 'support' || reviewRole === 'intern') && (
              <div className="p-3 rounded-xl border border-line bg-surface-raised flex items-center justify-between min-h-[44px]">
                <div className="space-y-0.5 pr-2">
                  <span className="text-xs font-semibold text-ink block">Can message executives</span>
                  <span className="text-xs text-ink-muted block">Lets this person start a direct message with the MD, the Group Head and the General Manager.</span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={reviewCanMessageExecutives}
                  aria-label="Can message executives"
                  onClick={() => setReviewCanMessageExecutives(!reviewCanMessageExecutives)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                    reviewCanMessageExecutives ? 'bg-brand' : 'bg-line-strong'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-surface shadow-xs transition duration-200 ease-in-out ${
                      reviewCanMessageExecutives ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            )}

            {/* Action buttons */}
            <div className="sticky bottom-0 bg-surface border-t border-line py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] space-y-2 -mx-5 px-5 mt-auto">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                onClick={handleApprove}
                className="min-h-[44px]"
              >
                Approve
              </Button>
              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={handleStartDecline}
                className="min-h-[44px]"
              >
                Decline
              </Button>
            </div>
          </div>
        )}
      </Drawer>

      {/* Decline Confirmation Modal */}
      <Modal
        isOpen={Boolean(declineModalRequest)}
        onClose={() => setDeclineModalRequest(null)}
        title="Decline access request?"
      >
        <div className="space-y-4">
          <p className="text-xs text-ink leading-relaxed">
            Are you sure you want to decline {declineModalRequest?.name}&apos;s request to join?
            They will not be able to sign in to the workspace.
          </p>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setDeclineModalRequest(null)}
              className="min-h-[44px]"
            >
              Keep request
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleConfirmDecline}
              className="min-h-[44px]"
            >
              Decline request
            </Button>
          </div>
        </div>
      </Modal>

      {/* Import Staff Drawer */}
      <ImportStaffDrawer
        key={`import-staff-${isImportStaffOpen}`}
        isOpen={isImportStaffOpen}
        onClose={() => setIsImportStaffOpen(false)}
        staff={staff}
        onImport={handleImportStaff}
      />

      {/* Simulated Email Preview Drawer */}
      <EmailPreviewDrawer
        isOpen={emailPreviewState.isOpen}
        onClose={closeEmailPreview}
        kind={emailPreviewState.kind}
        person={emailPreviewState.person}
        token={emailPreviewState.token}
      />
    </div>
  );
}

export default AdminView;
