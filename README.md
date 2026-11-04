# Da Ace Cribs Staff Workspace

Staff names are real people, used with the company's permission for this demo. Conversations are invented. Sites and properties are invented sample data.

A Slack-style staff messaging web prototype for Da Ace Cribs with offices in Head Quarters, Lugbe, and Port Harcourt. Front-end only, sample data, nothing is sent anywhere.

## Running Locally

1. Install dependencies: `npm install`
2. Start the development server: `npm run dev`
3. Open `http://localhost:5173` in your browser.

Production deployments on Vercel update automatically when changes are pushed to main.

## Demo Logins

Use any 6-digit verification code to sign in with any seeded phone number.

| Name | Role | Office | Phone Number |
| :--- | :--- | :--- | :--- |
| Ruth Obasanjo | Admin | All offices | +234 000 000 0001 |
| Fortune Mfoniso Idaboh | Manager | All offices | +234 000 000 0006 |
| Alechenu Ahubi Micheal | Manager | Port Harcourt office | +234 000 000 0005 |
| Kolawole Taiye | Agent | Lugbe office | +234 000 000 0024 |

You can also switch personas at any point: open Demo tools, then View as. To reset the prototype, open Demo tools, then Reset demo. To log out, tap your avatar, then Log out. Managers and admins can post a lead or share a property from the paperclip menu in the message box. In a channel's Info, channel admins can switch on Only admins can send messages and make other members channel admins. Photos and documents open a preview where you can add a caption before sending; tap More on a photo, or open it, to delete it within 15 minutes of sending.

Text size: tap your avatar, then Text size (or Aa on the login screen) to switch between Standard, Large and Extra large.

## 5-Minute Click-Through Walkthrough

Follow these steps in order to tour the core workspace features:

1. Log in as Ruth Obasanjo (admin has visibility across announcements and all offices).
2. Open #announcements to review broadcast notices and tap Seen by to inspect read receipts.
3. Open a site from the sidebar to view overview details, unit availability, and recent activity.
4. Open a property within that site to view its room, status, and details.
5. Open Demo tools, then View as to switch to Fortune (manager), and add a property to a site via + in the properties tab.
6. Share a property into a channel from the paperclip attachment menu.
7. Open Demo tools, then View as to switch to Taiye (Lugbe only).
8. Claim a lead in #sales by tapping "I've got this" on an unclaimed lead card.
9. Open a PDF document attachment in chat or from the files tab to test the multi-page viewer.
10. Send a message with a mention.
11. Add an emoji reaction to a message and post a reply inside a message thread.
12. Open Demo tools, switch to Micheal (Port Harcourt), toggle Simulate offline, and send a message to observe offline queueing.
13. Open Demo tools, switch back to Ruth, open Admin from the top bar, and add a staff member. To finish, tap your avatar, then Log out.
14. On the login screen choose Request access, submit a request, log in as Ruth, open Admin, then Requests, and approve it.

## What is Simulated

- Login code verification (any 6-digit OTP accepted).
- Phone verification (a real app would send a code by SMS).
- Colleague replies (scripted responses triggered by @mentions).
- File and photo uploads (local in-memory cards with SVG placeholders).
- Voice notes (in-browser mock recorder and playback timer).
- Offline mode (local message queueing with flush upon reconnection).
- In-app push notifications and unread counters.
- Client-side search index across channels, messages, files, and staff.

## Not in Version 1

- External client or buyer accounts (workspace is for company staff only).
- Financial transactions, escrow, or fee collection.
- Legally binding electronic signatures.
- Real backend server, cloud database, or SMS gateway.
