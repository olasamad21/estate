# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Real estate transaction participants across four core roles:
- **Listing & Buyer Agents (Sarah):** Coordinate the transaction, manage communications between all stakeholders, maintain private transaction notes, share disclosures, upload contracts, track contingency deadlines, and initiate signature requests.
- **Buyers (David):** Review offer details, track inspection and escrow countdowns, submit counter inquiries, and sign purchase documents.
- **Sellers (Elena):** Monitor offer amounts, verify commission breakdowns, sign disclosures and agreements, and track transaction closing timelines.
- **Mortgage Lenders (Marcus):** Monitor financing contingency deadlines and upload loan estimates, approvals, and closing disclosures (strictly scoped to financing documents).

## Product Purpose

A dedicated "Deal Room" collaboration application designed for real estate property transactions. It replaces disorganized, fragmented WhatsApp chats, multi-thread email chains, and offline phone calls with a unified, high-integrity transaction hub for each property. 

Success means every party has immediate visibility into the deal state, critical contingency milestones are never missed, documents are organized in an attached vault, and multi-party communication remains transparent yet strictly role-gated.

## Positioning

Unlike generic communication tools (Slack, WhatsApp, Microsoft Teams) that treat conversations as unstructured message streams, DealRoom pins the real estate asset (property photo, listing price, accepted offer, contingency countdown, and escrow timeline) directly to the transaction workspace. It enforces role-specific data boundaries (private agent notes, commission visibility, loan-doc-only upload permissions) within a single unified deal space.

## Operating Context

- High-stakes real estate transactions with contractual legal timelines (inspection periods, loan commitments, appraisal deadlines, title clearance).
- Field-first usage: Agents and clients frequently access the application on mobile devices while at property showings or on the go; requires flawless 390px–430px mobile UX before scaling to tablet and desktop.
- Multi-party collaboration requiring asymmetric information access: buyers must not see agent commission or private notes; lenders only access loan-related documents.

## Capabilities and Constraints

- **Form Factor:** Mobile-first responsive web application (primary viewport: 390px–430px base width).
- **Frontend Stack:** React 19, Vite 6, Tailwind CSS v4 (`@tailwindcss/vite`), Lucide React icons, React Router DOM.
- **Engineering Constraint:** Zero additional runtime dependencies without explicit sign-off.
- **Architectural Boundary:** Pure client-side prototype. No backend, database, or external auth service; seeded React context/state with local storage persistence across sessions and a one-click demo reset.
- **Data Integrity:** Currency, locale, and neutral real-world addresses centralized exclusively in `src/config/market.js`. All transaction countdowns and escrow days are dynamically computed relative to the current session date.
- **Role Permissions:** Hidden capabilities and data must be genuinely absent from the DOM, never merely disabled.
- **Interaction Quality:** Zero dead buttons or broken links; all actions trigger realistic modals, bottom sheets, drawers, or contextual toasts.

## Brand Commitments

- **Tone & Voice:** Trustworthy, calm, professional, modern, precise, fiduciary. Zero playful slang or casual conversational noise.
- **Visual Aesthetic:** Refined light theme with architectural clarity, subtle borders, high text contrast, and crisp micro-interactions.
- **Explicit Anti-Patterns:**
  - No generic purple/violet gradient soup.
  - No glassmorphism clutter or translucent blurs.
  - No heavy, muddy dropdown shadows.
  - No emojis in UI text, status tags, or system events (Lucide icons in structured badges only).
  - No hardcoded calendar dates or static countdown numbers.

## Evidence on Hand

- Neutral property configurations and plausible entities located in `src/config/market.js`.
- Scaffolding, SPA rewrites (`vercel.json`, `public/_redirects`), and core route layout established in Phase 1.

## Product Principles

1. **Transaction Entity Above the Stream:** Chat serves the property deal. The listing details, contract terms, and contingency countdown remain anchored and visible at all times.
2. **Absolute Role Integrity:** What a role is not permitted to see (commissions, private agent notes, cross-party disclosures) does not render in their DOM.
3. **Fiduciary Restraint:** The visual language projects bank-grade confidence and calm clarity rather than consumer tech gimmickry.
4. **Frictionless Mobile Ergonomics:** Bottom-sheet drawers, touch-friendly composer actions, and instant thumb-reach navigation define every screen.
5. **No Dead Ends:** Every clickable control yields a concrete, realistic transactional state or explanatory feedback.
