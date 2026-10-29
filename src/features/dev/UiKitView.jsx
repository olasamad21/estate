import { useState } from 'react';
import { Button } from '../../components/common/Button.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { Avatar, AvatarStack } from '../../components/common/Avatar.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { Drawer } from '../../components/common/Drawer.jsx';
import { useToast } from '../../components/common/Toast.jsx';

export default function UiKitView() {
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { showToast } = useToast();

  return (
    <div className="p-4 space-y-6 bg-canvas min-h-screen text-ink pb-16">
      <div className="border-b border-line pb-2">
        <h1 className="text-xl font-bold tracking-tight text-ink">Design Tokens & UI Kit</h1>
        <p className="text-xs text-ink-muted mt-0.5">Route: /__kit (Phase 3b-1 proof)</p>
      </div>

      {/* 1. BUTTON PRIMITIVES */}
      <section className="space-y-3 bg-surface p-4 rounded-xl border border-line">
        <h2 className="text-sm font-semibold text-ink uppercase tracking-wider">Buttons & States</h2>

        <div className="space-y-2">
          <div className="text-xs font-medium text-ink-muted">Variants (md)</div>
          <div className="flex flex-wrap gap-2">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-medium text-ink-muted">Sizes & States</div>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="primary">Small</Button>
            <Button size="md" variant="primary">Medium</Button>
            <Button variant="primary" loading>Loading</Button>
            <Button variant="secondary" disabled>Disabled</Button>
          </div>
        </div>
      </section>

      {/* 2. BADGE PRIMITIVES */}
      <section className="space-y-3 bg-surface p-4 rounded-xl border border-line">
        <h2 className="text-sm font-semibold text-ink uppercase tracking-wider">Badges (≥12px Semibold)</h2>

        <div className="space-y-2">
          <div className="text-xs font-medium text-ink-muted">Status Badges</div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="neutral">Neutral</Badge>
            <Badge variant="success" dot>Success</Badge>
            <Badge variant="warning" dot>Warning</Badge>
            <Badge variant="danger" dot>Danger</Badge>
            <Badge variant="info">Info</Badge>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-medium text-ink-muted">Role Badges (Tinted, High Contrast)</div>
          <div className="flex flex-wrap gap-2">
            <Badge role="agent">Sarah (Agent)</Badge>
            <Badge role="buyer">David (Buyer)</Badge>
            <Badge role="seller">Elena (Seller)</Badge>
            <Badge role="lender">Marcus (Lender)</Badge>
          </div>
        </div>
      </section>

      {/* 3. AVATARS & AVATAR STACK */}
      <section className="space-y-3 bg-surface p-4 rounded-xl border border-line">
        <h2 className="text-sm font-semibold text-ink uppercase tracking-wider">Avatars (Role Solids & Initials)</h2>

        <div className="space-y-2">
          <div className="text-xs font-medium text-ink-muted">4 Roles with Online Indicators</div>
          <div className="flex items-center gap-3">
            <Avatar role="agent" initials="SC" isOnline size="md" name="Sarah Chen" />
            <Avatar role="buyer" initials="DK" isOnline size="md" name="David Kim" />
            <Avatar role="seller" initials="ER" size="md" name="Elena Rostova" />
            <Avatar role="lender" initials="MV" isOnline size="md" name="Marcus Vance" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-medium text-ink-muted">Sizes (sm, md, lg)</div>
          <div className="flex items-center gap-3">
            <Avatar role="agent" initials="SC" size="sm" />
            <Avatar role="agent" initials="SC" size="md" />
            <Avatar role="agent" initials="SC" size="lg" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-medium text-ink-muted">AvatarStack</div>
          <AvatarStack>
            <Avatar role="agent" initials="SC" size="md" className="ring-2 ring-surface" />
            <Avatar role="buyer" initials="DK" size="md" className="ring-2 ring-surface" />
            <Avatar role="seller" initials="ER" size="md" className="ring-2 ring-surface" />
            <Avatar role="lender" initials="MV" size="md" className="ring-2 ring-surface" />
          </AvatarStack>
        </div>
      </section>

      {/* 4. DIALOG PRIMITIVES (MODAL & DRAWER) */}
      <section className="space-y-3 bg-surface p-4 rounded-xl border border-line">
        <h2 className="text-sm font-semibold text-ink uppercase tracking-wider">Modal & Bottom-Sheet Drawer</h2>
        <p className="text-xs text-ink-muted">
          Flat rgba(17,24,39,0.45) scrim, zero blur, Escape key listener, focus trap, and return-to-trigger.
        </p>

        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setModalOpen(true)}>
            Open Accessible Modal
          </Button>
          <Button variant="secondary" onClick={() => setDrawerOpen(true)}>
            Open Accessible Drawer
          </Button>
        </div>
      </section>

      {/* 5. TOAST PRIMITIVE */}
      <section className="space-y-3 bg-surface p-4 rounded-xl border border-line">
        <h2 className="text-sm font-semibold text-ink uppercase tracking-wider">Toast Notifications</h2>
        <p className="text-xs text-ink-muted">
          role=&quot;status&quot; aria-live=&quot;polite&quot;, auto-dismiss 4s, 44px dismiss target.
        </p>

        <div className="grid grid-cols-2 gap-2">
          <Button size="sm" variant="secondary" onClick={() => showToast('Sample information notification', 'info')}>
            Info Toast
          </Button>
          <Button size="sm" variant="secondary" onClick={() => showToast('Agreement successfully signed', 'success')}>
            Success Toast
          </Button>
          <Button size="sm" variant="secondary" onClick={() => showToast('Contingency expires in 2 days', 'warning')}>
            Warning Toast
          </Button>
          <Button size="sm" variant="secondary" onClick={() => showToast('Document upload error occurred', 'danger')}>
            Danger Toast
          </Button>
        </div>
      </section>

      {/* 6. ACCESSIBLE FORM CONTROL INPUTS (16px to prevent iOS zoom) */}
      <section className="space-y-3 bg-surface p-4 rounded-xl border border-line">
        <h2 className="text-sm font-semibold text-ink uppercase tracking-wider">Form Controls (16px font rule)</h2>
        <div>
          <label htmlFor="kit-sample-input" className="block text-xs font-medium text-ink-muted mb-1">
            Sample Input (16px text on focus)
          </label>
          <input
            id="kit-sample-input"
            type="text"
            placeholder="Type note or offer amount..."
            className="w-full text-base px-3 py-2.5 rounded-lg border border-line-strong bg-surface text-ink placeholder:text-ink-muted focus:border-ink"
          />
        </div>
      </section>

      {/* Modal Instance */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Escrow Document Verification"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => { setModalOpen(false); showToast('Document verified successfully', 'success'); }}>
              Confirm Verification
            </Button>
          </>
        }
      >
        <p className="mb-2">
          This accessible modal captures focus on mount and returns focus to the trigger button when dismissed via Escape or backdrop click.
        </p>
        <p className="text-xs text-ink-muted">
          Background scrim is flat rgba(17,24,39,0.45) with zero decorative blur.
        </p>
      </Modal>

      {/* Drawer Instance */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Document Vault Details"
        footer={
          <Button variant="primary" className="w-full" onClick={() => setDrawerOpen(false)}>
            Close Drawer
          </Button>
        }
      >
        <p className="mb-2">
          This accessible bottom-sheet drawer slides up on phone viewports with a drag handle and accessible title hierarchy.
        </p>
        <p className="text-xs text-ink-muted">
          Tabbing is trapped within the drawer contents and Escape safely closes it.
        </p>
      </Drawer>
    </div>
  );
}
