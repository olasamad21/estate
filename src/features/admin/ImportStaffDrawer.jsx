import { useState, useMemo, useRef } from 'react';
import { FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { Drawer } from '../../components/common/Drawer.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { COMPANY_CONFIG } from '../../config/market.js';
import { DEPARTMENTS, ROLE_LABELS } from '../../mock/staff.js';
import {
  normalisePhoneNg,
  isValidPhoneNg,
  formatPhoneNg,
} from '../../utils/formatters.js';

const SAMPLE_CSV = `Name,Phone,Email,Office,Department,Job title
Obinna Chukwuma,+2340000000201,obinna@example.com,Lagos,Sales,Senior Sales Associate
Zainab Aliyu,+2340000000202,zainab@example.com,Abuja,Management,Client Relations Manager
Emeka Okeke,+234000000020300,emeka@example.com,Lagos,Sales,Field Agent
Fatima Umar,+2340000000204,fatima@example.com,Head Quarters,Executive,Operations Officer
Kayode Williams,+234 803 000 0101,kayode@example.com,Lagos,Sales,Property Consultant
Hauwa Mohammed,+2340000000206,hauwa@example.com,Abuja,Operations,Facilities Coordinator`;

function parseCSV(text) {
  const lines = [];
  let currentLine = [];
  let currentField = '';
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentField += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentLine.push(currentField.trim());
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentLine.push(currentField.trim());
      if (currentLine.some((f) => f.length > 0)) {
        lines.push(currentLine);
      }
      currentLine = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }
  if (currentField.length > 0 || currentLine.length > 0) {
    currentLine.push(currentField.trim());
    if (currentLine.some((f) => f.length > 0)) {
      lines.push(currentLine);
    }
  }
  return lines;
}

export function ImportStaffDrawer({
  isOpen = false,
  onClose,
  staff = [],
  onImport,
}) {
  const [csvText, setCsvText] = useState('');
  const fileInputRef = useRef(null);

  const isDirty = Boolean(csvText.trim());

  // Existing phones normalized for duplicate checking
  const existingPhones = useMemo(() => {
    const set = new Set();
    staff.forEach((s) => {
      const norm = normalisePhoneNg(s.phone);
      if (norm) set.add(norm);
    });
    return set;
  }, [staff]);

  const officesList = useMemo(() => {
    return COMPANY_CONFIG.offices || [];
  }, []);

  // Parse and validate rows
  const parsedResults = useMemo(() => {
    if (!csvText.trim()) return [];

    const lines = parseCSV(csvText.trim());
    if (lines.length < 2) return [];

    const header = lines[0].map((h) => h.toLowerCase().replace(/[\s_-]+/g, ''));
    const nameIdx = header.findIndex((h) => h === 'name' || h === 'fullname');
    const phoneIdx = header.findIndex((h) => h === 'phone' || h === 'phonenumber');
    const emailIdx = header.findIndex((h) => h === 'email' || h === 'emailaddress');
    const officeIdx = header.findIndex((h) => h === 'office' || h === 'officeassignment');
    const deptIdx = header.findIndex((h) => h === 'department' || h === 'dept');
    const titleIdx = header.findIndex((h) => h === 'jobtitle' || h === 'title');
    const roleIdx = header.findIndex((h) => h === 'role');

    const seenPhonesInFile = new Set();
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line || line.length === 0 || (line.length === 1 && !line[0])) continue;

      const rawName = nameIdx >= 0 ? line[nameIdx] || '' : '';
      const rawPhone = phoneIdx >= 0 ? line[phoneIdx] || '' : '';
      const rawEmail = emailIdx >= 0 ? line[emailIdx] || '' : '';
      const rawOffice = officeIdx >= 0 ? line[officeIdx] || '' : '';
      const rawDept = deptIdx >= 0 ? line[deptIdx] || '' : '';
      const rawTitle = titleIdx >= 0 ? line[titleIdx] || '' : '';
      const rawRole = roleIdx >= 0 ? line[roleIdx] || '' : '';

      let error = null;

      // 1. Name required
      const name = rawName.trim();
      if (!name) {
        error = 'Name is required';
      }

      // 2. Phone valid and unique
      const phoneNorm = normalisePhoneNg(rawPhone);
      if (!error) {
        if (!rawPhone.trim() || !isValidPhoneNg(rawPhone) || !phoneNorm) {
          error = 'Invalid phone number';
        } else if (seenPhonesInFile.has(phoneNorm)) {
          error = 'Duplicate phone in file';
        } else if (existingPhones.has(phoneNorm)) {
          error = 'Phone number already in use';
        }
      }
      if (phoneNorm) {
        seenPhonesInFile.add(phoneNorm);
      }

      // 3. Email format or empty
      const email = rawEmail.trim();
      if (!error && email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email.length > 80 || !emailRegex.test(email)) {
          error = 'Invalid email format';
        }
      }

      // 4. Office match
      let matchedOffice = officesList[0];
      if (!error) {
        const offQuery = rawOffice.trim().toLowerCase();
        if (offQuery) {
          const match = officesList.find(
            (o) =>
              o.id.toLowerCase() === offQuery ||
              (o.name && o.name.toLowerCase() === offQuery) ||
              (o.label && o.label.toLowerCase() === offQuery)
          );
          if (!match) {
            error = 'Unknown office';
          } else {
            matchedOffice = match;
          }
        }
      }

      // 5. Department match or default
      let department = DEPARTMENTS[0] || 'Sales';
      if (!error) {
        const deptQuery = rawDept.trim().toLowerCase();
        if (deptQuery) {
          const matchDept = DEPARTMENTS.find((d) => d.toLowerCase() === deptQuery);
          if (!matchDept) {
            error = 'Unknown department';
          } else {
            department = matchDept;
          }
        }
      }

      // 6. Role (default 'agent')
      let role = 'agent';
      if (!error && rawRole.trim()) {
        const rQuery = rawRole.trim().toLowerCase();
        const validRoles = ['admin', 'manager', 'agent', 'support', 'intern'];
        if (validRoles.includes(rQuery)) {
          role = rQuery;
        }
      }

      const title = rawTitle.trim() || `${ROLE_LABELS[role] || 'Agent'}, ${matchedOffice?.name || 'Head Quarters'}`;
      const callName = name.split(/\s+/)[0] || name;

      rows.push({
        id: `row-${i}`,
        index: i,
        name,
        callName,
        phone: phoneNorm || rawPhone,
        rawPhone,
        email: email || null,
        officeId: matchedOffice?.id || 'hq',
        officeName: matchedOffice?.name || 'Head Quarters',
        department,
        role,
        title,
        status: error ? 'error' : 'ready',
        error,
      });
    }

    return rows;
  }, [csvText, existingPhones, officesList]);

  const readyRows = useMemo(() => {
    return parsedResults.filter((r) => r.status === 'ready');
  }, [parsedResults]);

  const attentionCount = parsedResults.length - readyRows.length;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setCsvText(content);
      }
    };
    reader.readAsText(file);
  };

  const handleLoadSample = () => {
    setCsvText(SAMPLE_CSV);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCreateAccounts = () => {
    if (readyRows.length === 0) return;
    onImport(readyRows);
    onClose?.();
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Import staff"
      variant="form"
      isDirty={isDirty}
      discardTitle="Discard imported staff?"
    >
      <div className="space-y-6 flex-1 flex flex-col pb-6">
        {/* Short explanation */}
        <p className="text-xs text-ink-muted leading-relaxed">
          Add many people at once. They receive an activation link when you send it.
        </p>

        {/* Expected columns list */}
        <div className="p-3.5 rounded-xl border border-line bg-surface-raised space-y-1.5">
          <div className="text-xs font-semibold text-ink">Expected CSV columns:</div>
          <div className="text-xs text-ink-muted leading-normal">
            Name, Phone, Email, Office, Department, Job title
          </div>
        </div>

        {/* File input and Sample button */}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label htmlFor="import-file-input" className="block text-xs font-semibold text-ink">
              Choose CSV file
            </label>
            <input
              id="import-file-input"
              ref={fileInputRef}
              name="import_file"
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="block w-full text-xs text-ink-muted file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border file:border-line file:text-xs file:font-semibold file:bg-surface file:text-ink hover:file:bg-surface-raised file:cursor-pointer cursor-pointer border border-line rounded-xl bg-surface p-1.5 min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            />
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <span className="text-xs text-ink-muted">Want to test the format?</span>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleLoadSample}
              className="min-h-[44px] px-3.5 shrink-0"
            >
              <span className="inline-flex items-center gap-1.5">
                <FileText className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Use a sample list</span>
              </span>
            </Button>
          </div>
        </div>

        {/* Preview section if rows are loaded */}
        {parsedResults.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-ink">
                Preview ({parsedResults.length} {parsedResults.length === 1 ? 'row' : 'rows'})
              </span>
              <span className="text-xs font-semibold text-ink">
                <span className="text-status-success">{readyRows.length} ready</span>
                {attentionCount > 0 && (
                  <span className="text-status-danger ml-2">{attentionCount} need attention</span>
                )}
              </span>
            </div>

            {/* Preview table-like list (rows, not cards) */}
            <div className="border border-line rounded-xl bg-surface divide-y divide-line overflow-hidden shadow-2xs max-h-72 overflow-y-auto">
              {parsedResults.map((row) => {
                const isReady = row.status === 'ready';

                return (
                  <div
                    key={row.id}
                    className={`p-3 flex items-center justify-between gap-3 transition-colors ${
                      isReady ? 'bg-surface' : 'bg-status-danger/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="shrink-0">
                        {isReady ? (
                          <CheckCircle2 className="w-4 h-4 text-status-success" aria-hidden="true" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-status-danger" aria-hidden="true" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-ink break-words">
                            {row.name || 'Unnamed'}
                          </span>
                          <span className="text-xs font-mono text-ink-muted tabular-nums">
                            {formatPhoneNg(row.phone || row.rawPhone)}
                          </span>
                        </div>
                        <div className="text-xs text-ink-muted flex items-center gap-2 flex-wrap mt-0.5">
                          <span>{row.officeName}</span>
                          <span>·</span>
                          <span>{row.department}</span>
                          {row.email && (
                            <>
                              <span>·</span>
                              <span className="break-all font-mono">{row.email}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isReady ? (
                        <Badge variant="success" size="sm">
                          Ready
                        </Badge>
                      ) : (
                        <Badge variant="danger" size="sm">
                          {row.error}
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action cluster */}
        <div className="sticky bottom-0 bg-surface border-t border-line py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] flex items-center justify-end gap-2 -mx-5 px-5 mt-auto">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="min-h-[44px]"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={readyRows.length === 0}
            onClick={handleCreateAccounts}
            className="min-h-[44px]"
          >
            Create {readyRows.length} accounts
          </Button>
        </div>
      </div>
    </Drawer>
  );
}

export default ImportStaffDrawer;
