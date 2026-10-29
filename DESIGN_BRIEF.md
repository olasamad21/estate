# DealRoom Shell Design Brief

## 1. Design Direction

DealRoom adopts an architectural editorial aesthetic characterized by structured geometry, high text contrast, and crisp hairline divisions that evoke legal escrow agreements and financial statements. It replaces consumer messaging visual noise with disciplined typography, functional status badges, and anchored transaction telemetry that keeps the property asset front and center. The interface conveys quiet fiduciary authority through warm neutrals, purposeful monochromatic structure, and selective accent badges rather than decorative flair.

This aesthetic fits real estate professionals because agents, lenders, and escrow officers operate under legal scrutiny and tight contractual deadlines where ambiguity is expensive. Buyers and sellers navigating multi-hundred-thousand-dollar transactions require calm reassurance and clarity rather than playful micro-interactions or noisy chat streams. Clean hairline borders, tabular figures for currency, and uncluttered role tagging establish bank-grade credibility and immediate glanceability on mobile devices in the field.

---

## 2. Color Tokens & WCAG Contrast

All colors are chosen for high legibility, strict WCAG 2.1 AA/AAA compliance, and zero reliance on arbitrary decorative gradients.

### Surfaces & Backgrounds
- **Page Canvas:** `#F8F9FA` (Clean warm off-white canvas)
- **Surface / Card Canvas:** `#FFFFFF` (Pure white)
- **Elevated / Hover Canvas:** `#F3F4F6` (Neutral 100)
- **Hairline Border:** `#E5E7EB` (Neutral 200)
- **Active Structural Border:** `#D1D5DB` (Neutral 300)

### Neutrals (Typography & Hierarchy)
- **Primary Text (`neutral-900`):** `#111827` — Headings, prominent labels, primary buttons. Contrast on `#FFFFFF`: **16.1:1 (AAA)**.
- **Secondary Text (`neutral-700`):** `#374151` — Body copy, field labels, metadata. Contrast on `#FFFFFF`: **9.3:1 (AAA)**.
- **Muted Text (`neutral-500`):** `#6B7280` — Timestamps, secondary metadata, placeholders. Contrast on `#FFFFFF`: **4.8:1 (AA compliant > 4.5:1)**.

### Primary Brand
- **Brand Navy-Charcoal (`slate-900`):** `#0F172A` — Primary buttons, top banner, selected controls. Contrast on `#FFFFFF`: **17.5:1 (AAA)**.

### Semantic Status Colors
- **Success (Cleared milestones, signed docs):**
  - Background: `#ECFDF5` (`emerald-50`)
  - Border: `#A7F3D0` (`emerald-200`)
  - Text: `#065F46` (`emerald-800`). Contrast on `#ECFDF5`: **7.2:1 (AAA)**; on `#FFFFFF`: **7.1:1 (AAA)**.
- **Warning (Contingencies due soon, escrow progress):**
  - Background: `#FFFBEB` (`amber-50`)
  - Border: `#FDE68A` (`amber-200`)
  - Text: `#92400E` (`amber-800`). Contrast on `#FFFBEB`: **5.4:1 (AA)**; on `#FFFFFF`: **5.2:1 (AA)**.
- **Danger (Urgent alerts, expired contingency, reset):**
  - Background: `#FEF2F2` (`red-50`)
  - Border: `#FECACA` (`red-200`)
  - Text: `#991B1B` (`red-800`). Contrast on `#FEF2F2`: **7.3:1 (AAA)**; on `#FFFFFF`: **7.2:1 (AAA)**.
- **Info (System notes, notifications):**
  - Background: `#EFF6FF` (`blue-50`)
  - Border: `#BFDBFE` (`blue-200`)
  - Text: `#1E40AF` (`blue-800`). Contrast on `#EFF6FF`: **7.4:1 (AAA)**; on `#FFFFFF`: **7.3:1 (AAA)**.

### Distinct Accessible Colors for the 4 Roles
1. **Agent (Sarah Chen) — Emerald:**
   - Badge BG: `#ECFDF5` | Border: `#A7F3D0` | Text: `#065F46` (Contrast: **7.2:1**)
   - Avatar Background: `#047857` (`emerald-700`) with `#FFFFFF` text (Contrast: **5.6:1**)
2. **Buyer (David Kim) — Blue:**
   - Badge BG: `#EFF6FF` | Border: `#BFDBFE` | Text: `#1E40AF` (Contrast: **7.4:1**)
   - Avatar Background: `#1D4ED8` (`blue-700`) with `#FFFFFF` text (Contrast: **5.7:1**)
3. **Seller (Elena Rostova) — Amber:**
   - Badge BG: `#FEF3C7` | Border: `#FDE68A` | Text: `#78350F` (Contrast: **7.6:1**)
   - Avatar Background: `#B45309` (`amber-700`) with `#FFFFFF` text (Contrast: **4.8:1**)
4. **Lender (Marcus Vance) — Indigo:**
   - Badge BG: `#EEF2FF` | Border: `#C7D2FE` | Text: `#3730A3` (Contrast: **8.5:1**)
   - Avatar Background: `#4338CA` (`indigo-700`) with `#FFFFFF` text (Contrast: **6.2:1**)

---

## 3. Typography

Strict adherence to a native system font stack: zero external CDN links, zero web fonts, zero network latency.

### Font Stacks
- **Interface Sans:** `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`
- **Tabular Mono (Data & Currency):** `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`

### Tabular Numbers Rule
All currency values, countdown days, timestamps, and escrow timeline days apply `font-variant-numeric: tabular-nums` to guarantee zero layout shift during countdowns and data updates.

### Type Scale & Hierarchy
| Level | Font Size | Line Height | Weight | Tracking | Usage |
|---|---|---|---|---|---|
| **Display / Price** | 22px (`1.375rem`) | 1.25 | Bold (700) | `-0.025em` | Pinned hero property price |
| **Title / H1** | 18px (`1.125rem`) | 1.3 | Semibold (600) | `-0.02em` | Deal address, modal header titles |
| **Heading / H2** | 15px (`0.9375rem`) | 1.35 | Semibold (600) | `-0.01em` | Section headers, card titles |
| **Body Primary** | 14px (`0.875rem`) | 1.5 | Regular (400) | `0em` | Chat messages, drawer descriptions |
| **Body Medium** | 14px (`0.875rem`) | 1.5 | Medium (500) | `0em` | Button labels, active tab text |
| **Caption / Meta** | 12px (`0.75rem`) | 1.4 | Regular (400) | `0em` | Timestamps, file size, escrow day count |
| **Badge / Micro** | 11px (`0.6875rem`) | 1.2 | Semibold (600) | `0.02em` | Role pills, status tags, stage indicators |

*Anti-pattern guardrail:* No kicker/eyebrow text above headings. Headings lead directly.

---

## 4. Spacing, Radius, Borders, and Elevation Rules

### Spacing Scale (4px Base Grid)
- **Compact (`gap-1.5`, `gap-2`):** 6px–8px for icon-label lockups, badge contents, and avatar stacks.
- **Form & Control (`p-2.5`, `py-2`):** 8px–10px for input and button internal padding.
- **Card Padding (`p-4`):** 16px standard container and card internal padding.
- **Section Rhythm (`space-y-4`):** 16px between major content groups.

### Radius Scale
- `rounded-full`: Avatars, role tags, notification count pills, floating pills.
- `rounded-lg` (8px): Action buttons, text inputs, message bubbles, cards inside list items.
- `rounded-xl` (12px): Pinned deal banner, dashboard cards.
- `rounded-2xl` (16px): Bottom-sheet drawers and modal overlays.

### Border System
- Crisp 1px hairline borders (`border border-neutral-200`) provide structure.
- Card interiors use soft dividing lines (`divide-y divide-neutral-100`).
- Strict refusal: No thick colored side borders (e.g. `border-l-4`). State is conveyed via role badges and background tints.

### Elevation Rules
- **Cards & Pinned Headers:** Flush with surface (`border border-neutral-200`, zero shadow).
- **Floating Controls (Pill, Feedback button):** `shadow-md` (`0 4px 6px -1px rgb(0 0 0 / 0.08)`).
- **Modals & Drawers:** `shadow-2xl` with a neutral dark backdrop (`bg-neutral-900/40 backdrop-blur-[2px]`).
- Refusal: Zero muddy 0-blur block drop shadows or neon glows.

---

## 5. Motion Rules

- **Durations:**
  - Fast feedback (hover, button click, focus ring): `150ms`.
  - Dropdowns & Accordion toggles: `200ms`.
  - Toast entry & exit: `250ms`.
  - Bottom-sheet Drawer slide-up & Modal reveal: `300ms`.
- **Easing:**
  - Enter: `cubic-bezier(0.16, 1, 0.3, 1)` (smooth exponential deceleration).
  - Exit: `cubic-bezier(0.7, 0, 0.84, 0)` (accelerating exit).
- **Animated Properties:** `transform`, `opacity`. (Zero expensive layout reflows or animating width/height).
- **Accessibility (`prefers-reduced-motion: reduce`):**
  - All transitions and transform offsets drop to `0ms`.
  - Overlays and drawers toggle instantly without translation.

---

## 6. Shell Layout at 390px (Mobile-First) & Desktop Scaling

### 390px Mobile Viewport Layout (Top to Bottom)
1. **Prototype Disclaimer Bar:** Fixed slim bar (`h-7`, 28px, `#111827`, text `#9CA3AF`, dismissible per session).
2. **Sticky Top App Bar (`h-14`, 56px):** 
   - Left: Wordmark `DealRoom` + property icon.
   - Center-Right: Floating Role Switcher Pill (`Previewing as: Agent ▾`).
   - Far Right: Notification Bell with unread counter chip (44x44px touch target).
3. **Scrollable Page Viewport:** Primary workspace area (`flex-1 overflow-y-auto`).
4. **Ergonomic Floating Controls (Thumb-Zone Protection):**
   - **Role Switcher Placement:** Integrated directly into the top bar or pinned top-right (`top-14 right-3`). This completely frees up the bottom of the screen.
   - **Chat Composer Clearance:** On `/deals/:id`, the chat input dock is pinned to the bottom. To prevent occlusion:
     - The floating "Give feedback" button is positioned at `bottom-20 right-3` on the dashboard, but automatically pins to the top header on the deal room view, ensuring zero overlap with the message composer.
5. **Toast Notification Anchor:** Fixed top-center (`top-16 left-4 right-4 z-50`), slides downward, auto-dismisses after 4 seconds.

### Desktop Scaling (`lg:` Breakpoints)
- Layout centers on a responsive canvas (`max-w-5xl mx-auto`).
- Top app bar expands to full horizontal width; Role Switcher transforms into an inline top-bar dropdown.
- Drawers (mobile bottom sheets) adapt into right-side slide-overs or side panel tabs.

---

## 7. Component Inventory & States

All interactive elements enforce a **minimum 44x44px touch target**.

### Primitives
1. **Button:**
   - Variants: `primary` (solid `#0F172A`), `secondary` (white with `#D1D5DB` border), `ghost` (transparent), `danger` (red-50 with red-700 text).
   - States: default, hover (`bg-neutral-800`), active (`scale-[0.98]`), focus-visible (`ring-2 ring-neutral-900 ring-offset-2`), disabled (`opacity-50 cursor-not-allowed`), loading (inline spinner).
2. **Badge:**
   - Variants: `neutral`, `emerald` (Agent), `blue` (Buyer), `amber` (Seller), `purple` (Lender), `red` (Urgent).
   - Anatomy: Role/status label + optional dot indicator.
3. **Avatar & AvatarStack:**
   - High-contrast role-colored background with bold 2-letter uppercase initials (`SC`, `DK`, `ER`, `MV`).
   - Border ring for stack overlap (`-space-x-1.5`).
4. **Modal:**
   - Centered dialog, backdrop blur, Escape key listener, outside-click close, focus trap, title bar, body, and action footer.
5. **Drawer:**
   - Mobile: Slide-up bottom sheet with swipe drag-indicator bar, rounded-t-2xl.
   - Desktop: Slide-over right panel.
6. **Toast:**
   - Non-blocking notification banner with Lucide status glyph and dismiss trigger.

### Shell Modules
- **RoleSwitcher:** Compact pill button with caret. Opens menu showing current active persona, 4-way switcher with checkmark, and a Dev Actions divider ("Simulate new lead", "Reset demo", "Feedback log").
- **NotificationDrawer:** Slide-out drawer listing deal alerts with relative timestamps, priority pills, and "Mark as read" action.
- **FeedbackModal:** Category selector chips (Idea / Problem / Question), textarea (4 rows), submit button, and a link to view past feedback items.
- **FeedbackLogDrawer:** Inspects local feedback submissions with role attribution, category badge, and "Copy all feedback" button.

---

## 8. Exact Files to Create/Modify in Phase 3b & Debug Panel Fate

### Files to Create in `src/components/common/`
1. `src/components/common/Button.jsx`
2. `src/components/common/Badge.jsx`
3. `src/components/common/Avatar.jsx`
4. `src/components/common/Modal.jsx`
5. `src/components/common/Drawer.jsx`
6. `src/components/common/Toast.jsx`

### Files to Create in `src/components/layout/`
7. `src/components/layout/AppLayout.jsx` (Shell layout wrapper with prototype banner and top bar)
8. `src/components/layout/RoleSwitcher.jsx` (Floating role pill + dev actions menu)
9. `src/components/layout/NotificationDrawer.jsx` (Deal alerts feed)
10. `src/components/layout/FeedbackModal.jsx` (Feedback capture modal)
11. `src/components/layout/FeedbackLogDrawer.jsx` (Feedback review & copy log)

### Files to Modify
12. `src/App.jsx` (Integrate `AppLayout`, `RoleSwitcher`, `NotificationDrawer`, `FeedbackModal`, and `Toast`)
13. `src/features/dashboard/DealDashboardView.jsx` (Retire the temporary debug panel)

### Fate of the Temporary Debug Panel
The temporary debug panel on `/deals` will be completely retired in Phase 3b. Its functions migrate into the production shell:
- Role switcher buttons ➔ `RoleSwitcher` pill dropdown.
- Lead simulation & Demo reset ➔ `RoleSwitcher` dev actions menu.
- Unread alert count ➔ Notification bell in `TopBar` + `NotificationDrawer`.
- Toast banner ➔ Floating `Toast` component.

---

## 9. Three Risks / Decisions for Review

1. **Role Switcher Placement vs Chat Composer:** On mobile (390px), placing the Role Switcher pill in the top app bar keeps the bottom composer 100% unobstructed. Should the Role Switcher stay anchored in the top bar, or do you prefer a bottom floating pill that auto-hides when focusing the chat input? *(Recommendation: Anchor in the top bar).*
2. **Auto-Trigger Lead Alert UX:** When the simulated lead inquiry fires at ~25 seconds for the Agent, should it automatically slide open the `NotificationDrawer`, or should it display an urgent top banner with one-tap "Spawn Deal Room" and "View Showing Slots" actions? *(Recommendation: High-priority top toast/banner with one-tap action).*
3. **Avatar Silhouette vs Typographic Initials:** Currently, avatars use high-contrast uppercase initials with role color backgrounds (`SC`, `DK`, `ER`, `MV`). Would you like custom SVG illustrated silhouettes, or do the role-tinted initials best preserve the bank-grade financial feel? *(Recommendation: Role-tinted typographic initials).*
