# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Staff of a Nigerian real estate company with offices in Lagos and Abuja. The role list below is a prototype assumption to be confirmed with the company:
- **Admin (managing director or operations manager):** adds and removes staff, creates and archives channels, controls who can post where, and sees everything.
- **Manager (head of sales, branch manager):** creates channels for their team, posts announcements, pins key messages, and oversees leads.
- **Agent (sales agent, field agent):** takes part in the channels they belong to, sends direct messages, shares photos and documents, claims leads, and coordinates viewings.
- **Support staff (legal officer, accounts or admin officer):** works in the channels relevant to their function, such as legal and accounts, and shares documents.
- **Intern:** limited access to the channels they are added to, and cannot create channels.

Clients (buyers, sellers and tenants) are not users of this product.

## Product Purpose

A private, Slack-style messaging app for a real estate company's own staff. It replaces scattered WhatsApp groups, phone calls and personal-phone records with one organised workspace: channels for teams, branches and individual listings, direct messages, threads, file sharing, announcements and search.

Success means a new lead never goes unnoticed, every listing has one place where its updates and documents live, management can see what is happening without calling around, and company knowledge stays with the company when a staff member leaves.

## Positioning

Unlike WhatsApp groups, the workspace has structure: channels by team and listing, admin-controlled membership, manager-only announcements with read receipts, threads that keep conversations tidy, and searchable files. Unlike generic team-chat tools, it speaks the language of Nigerian property work (C of O, Deed of Assignment, Governor's Consent and Minister's Consent, survey plans, viewings, agency fees, naira pricing) and is built for phones on patchy mobile data.

## Operating Context

- Design mode: Operate. Staff are completing tasks, so scanability, consistency and familiar chat patterns outrank expression.
- Field-first: agents use mid-range Android phones at viewings on patchy mobile data, and also use laptops in the office. Flawless 390px mobile comes first, then tablet and desktop.
- Offices in Lagos and Abuja share one company workspace but work mainly in their branch channels.
- Access differs by role: private channels (for example management, legal and accounts) are visible only to their members, and announcements can be posted only by managers and admins.

## Prototype Scope

Version 1, built in this prototype: phone-number and OTP login (simulated); staff added by an admin; public, private, team and listing channels; channel archiving; direct messages and group chats; text, voice notes (simulated), photos and documents (simulated); mentions; threads; reactions; pinned messages; a short edit and delete window; offline sending (simulated); a files tab per channel; notifications with mute and quiet hours; an announcements channel with read receipts; search; admin controls.

Version 2 preview, shown as a taste only: a lead alert with an "I've got this" claim button, and listing cards.

Out of scope: clients inside the app, payments, escrow, e-signatures, contracts, evidence reports, voice or video calls, a real backend, real push notifications and real SMS.

## Capabilities and Constraints

- **Form factor:** responsive web app. Single-column phone layout below 1024px; two-pane list-and-chat layout from 1024px.
- **Frontend stack:** React 19, Vite 6, Tailwind CSS v4 (`@tailwindcss/vite`), Lucide React icons, React Router DOM.
- **Engineering constraint:** zero additional runtime dependencies without explicit sign-off.
- **Architectural boundary:** pure client-side prototype with no backend, database or auth service. Seeded React context state with browser storage persistence and a one-click demo reset. Everything that would need a server is simulated: OTP accepts any six digits, uploads create local cards, voice notes are fake recordings, colleague replies are scripted, and notifications are in-app only.
- **Data integrity:** currency, locale, company name, offices and sample entities are centralised in `src/config/market.js`. All message times and dates are computed relative to the current date. No hardcoded calendar dates.
- **Role permissions:** hidden capabilities and data must be genuinely absent from the DOM, never merely disabled.
- **Interaction quality:** zero dead buttons or broken links. Every action produces a believable state change, drawer or toast.
- **Nigerian conventions:** naira symbol with thousands separators, DD/MM/YYYY dates, 12-hour times, +234 phone numbers, Nigerian names and places.

## Brand Commitments

- **Tone and voice:** clear, calm, professional, plain English. Uses the company's own property vocabulary. No playful slang in UI copy.
- **Visual aesthetic:** refined light theme with hairline borders, high text contrast, system fonts and restrained colour. Familiar chat patterns are a feature: the tool should disappear into the task.
- **Explicit anti-patterns:**
  - No purple or violet gradients, no gradient text, no glassmorphism.
  - No heavy, muddy dropdown shadows.
  - No emoji in UI chrome (labels, buttons, badges, status text, system events). Lucide icons only. Emoji are allowed only inside staff-written message text and in message reactions.
  - No card grids as list structure. Lists are hairline-separated rows.
  - No modal for a task that a drawer or an inline control can do. Modals are for confirmations only.
  - No kicker or eyebrow text above headings.
  - No hardcoded calendar dates or static counts that cannot change.

## Evidence on Hand

- Existing primitives (Button, Badge, Avatar, Modal, Drawer, Toast), design tokens in `src/index.css`, and the static and unit verification harness (`npm run verify`).
- Sample company, offices, staff, channels and listings to be defined in `src/config/market.js` and `src/mock`.

## Product Principles

1. **One conversation, one place:** every team, branch and listing has its own channel, and nothing important lives only in a personal chat.
2. **Role integrity:** what a role may not see does not render.
3. **Calm clarity:** unread counts, mentions and announcements are unmistakable, and everything else stays quiet.
4. **Built for the field:** thumb-reach controls, large touch targets, tolerance for weak connections, light on data.
5. **No dead ends:** every control does something believable.

## Prototype Purpose

A throwaway, clickable front-end prototype made to show the person who briefed us that we understood what they want built. It is not production code and nothing is sent anywhere. Placeholders in `src/config/market.js` (company name, offices, staff, listings) are easy to swap.
