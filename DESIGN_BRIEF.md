# Staff Messaging App Design Brief

## 1. Design Direction

Mode: Operate. This is a task tool for staff, so the interface should be quiet, scannable and familiar. People who have used WhatsApp or Slack should trust it immediately. The existing architectural look carries over: hairline borders, high text contrast, system fonts, restrained colour, and no decoration that does not carry state.

Conversations are the content. Chrome stays light so that channel names, unread counts, mentions and message text carry the hierarchy.

## 2. Colour Tokens

Surfaces, neutrals, brand and status colours are unchanged. Use the existing tokens in `src/index.css`: canvas, surface, surface-raised, line, line-strong, field-line, scrim, ink, ink-soft, ink-muted, brand, and the success, warning, danger and info sets. Never use raw hex in JSX and never use Tailwind palette classes with numeric shades.

### Role palettes (five staff roles)

Reuse the existing hue families under new token names (`--color-role-<name>-solid`, `-bg`, `-line`, `-ink`):
- **Admin:** indigo family (currently `role-lender-*`).
- **Manager:** blue family (currently `role-buyer-*`).
- **Agent:** slate family (currently `role-agent-*`, name unchanged).
- **Support staff:** teal family (currently `role-seller-*`).
- **Intern:** neutral, with solid = ink-muted, bg = surface-raised, line = line-strong, ink = ink-soft.

The solid is used for avatar backgrounds with surface-coloured initials. The bg, line and ink set is used for role badges. Contrast of every text and background pair must be checked in the rendered result and meet 4.5:1 for text.

### Unread and mention colours
- General unread count: brand solid pill with surface text.
- Unread @mention count: danger tokens.
- A message that mentions the current user: row tinted with warning-bg.
- Mention text inside a message: semibold ink on info-bg.

## 3. Typography

System font stack only (existing `--font-sans` and `--font-mono`), with zero external fonts. One family carries everything. Mono is used only for the prototype banner and code-like values.

Fixed rem scale, tight ratio (about 1.125):
- Title 18px semibold: channel name in the chat header, screen titles.
- Heading 15px semibold: section headers, list row names.
- Body 14px regular: message text, descriptions. Medium weight for buttons and active tabs.
- Caption 12px: timestamps, snippets, file sizes, member counts.
- Badge 12px semibold. Nothing below 12px anywhere.

Tabular figures for times, unread counts, file sizes and naira amounts. Message text measure maximum about 65ch on wide screens. No eyebrow or kicker text above headings.

## 4. Spacing, Radius, Borders, Elevation

- 4px grid. Compact gaps 6 to 8px, control padding 8 to 10px, row padding 12 to 16px, section rhythm 16px.
- Radius: full for avatars, count pills and role badges; lg for buttons, inputs and attachment cards; 2xl for bottom sheets and modals.
- Lists are rows separated by hairlines (`divide-line`), never grids of identical cards. No coloured side borders thicker than 1px.
- Elevation: rows, headers and panels sit flush with hairline borders and no shadow. Floating controls use a soft medium shadow. Drawers and modals use a large shadow with the neutral scrim.

## 5. Motion

- Motion conveys state only: a drawer opening, a toast arriving, a message sending, a "typing" indicator while a scripted colleague reply is pending. No decorative or page-load animation.
- Durations: hover and press 150ms; accordions and menus 200ms; toasts 250ms; drawers and modals 300ms. Use the existing keyframes in `src/index.css`.
- Animate transform and opacity only. With `prefers-reduced-motion`, transitions drop to near zero and overlays appear instantly.

## 6. Layout and Responsive Behaviour

The old centred phone frame (`max-w-md` with a rounded desktop border) is retired.

- **Below 1024px, single column.** The home screen is the channel list. Opening a channel shows a full-screen chat with a back button. The composer is pinned at the bottom with safe-area padding. Between 640px and 1023px, content fills the width with the message column capped around `max-w-2xl` and centred.
- **From 1024px, two panes.** A fixed-width sidebar of about 320px holds the company name, search, the channel and direct-message sections, and the current user. The chat fills the remaining width. A thread opens as a right-hand panel on screens wide enough, and as a drawer otherwise.
- Top bar 56px, sticky: company wordmark (from `src/config/market.js`), "View as" switcher, feedback button, notification bell. Slim dismissible prototype banner above it: "Prototype · sample data only".
- Use dvh units and never vh. Minimum touch target 44 by 44px. Hover is an enhancement only: every hover action must have a touch path.
- Test at 360, 390, 768, 1024 and 1280px.

## 7. Messaging Patterns

- **Flat message rows, not chat bubbles.** Each row shows avatar, sender name, role badge, time and text. Own messages are not right-aligned. Consecutive messages from the same sender within five minutes are grouped under one header.
- Day dividers read "Today", "Yesterday", then DD/MM/YYYY. System messages are centred, quiet and use a Lucide icon.
- **Message actions** (react, reply in thread, pin, edit, delete, copy): on desktop a hover toolbar plus a "more" button; on touch, tapping a message opens an action sheet drawer. No action depends on hover alone.
- **Composer:** multiline input, attach, mic, emoji, send. Send is disabled when empty. Mention menu appears on "@". Announcements channel shows a read-only notice to people who cannot post.
- **Offline:** a header toggle simulates offline. Queued messages show a clock icon and "Will send when online".
- **Announcements:** show "Seen by X of Y" with a list on tap.

## 8. Component Inventory

Keep and adapt the primitives: Button, Badge, Avatar and AvatarStack, Modal, Drawer, Toast. Modals are for confirmations only (reset demo, deactivate staff, delete message). Forms and secondary views use drawers or inline controls.

New modules: ChannelRow, channel filter chips, MessageRow, DayDivider, SystemMessage, Composer, MentionMenu, ReactionBar, ThreadPanel, VoiceNoteBubble, AttachmentCard, PinnedBanner, FilesTab, SearchPanel, MemberList, StaffRow and staff table, LoginScreen and OTP screen, LeadAlertCard and ListingCard (version 2 preview).

Every interactive component has default, hover, focus-visible, active, disabled, loading (skeleton, not a spinner in the middle of content), error and empty states. Empty states explain what to do next.

## 9. Content and Copy Rules

- Naira with thousands separators, for example ₦285,000,000. The short form ₦285m is allowed only on listing cards.
- Dates DD/MM/YYYY. Times 12-hour, for example 3:30 PM. All seed timestamps relative to now.
- Phone numbers in +234 format, for example +234 803 000 0101. Use fictional numbers of the form +234 80x 000 01xx.
- Nigerian names and places (Lekki, Victoria Island, Maitama, Wuse 2). Property vocabulary: C of O, Deed of Assignment, Governor's Consent (Lagos), Minister's Consent (Abuja), AGIS search, survey plan, agency fee, caution fee.
- Controls name their action. Errors name the problem and the recovery. No raw identifiers (such as `ch_` or `usr_`) ever appear in the UI.
- No emoji in UI text. Emoji appear only inside staff-written messages and reactions.

## 10. Shell Behaviour

- **View as:** a top-bar menu to switch between seeded staff. It must change what is rendered (permissions, channels, admin screen) with hidden items absent from the DOM. The menu also holds "Simulate new lead", "Feedback log" and "Reset demo".
- **Login:** any six-digit code is accepted. A hint reads "Demo: use any 6 digits". Only seeded staff numbers are accepted; others see "This number hasn't been added by your admin."
- **Notifications and feedback:** the notification bell opens a drawer. The feedback button and log are kept, because the prototype exists to collect feedback.
