# Crestview Properties Staff Workspace

A Slack-style staff messaging web prototype for a Nigerian real estate company with offices in Lagos and Abuja. Front-end only, sample data, nothing is sent anywhere.

## Running Locally

1. Install dependencies: `npm install`
2. Start the development server: `npm run dev`
3. Open `http://localhost:5173` in your browser.

Production deployments on Vercel update automatically when changes are pushed to main.

## Demo Logins

Use any 6-digit verification code to sign in with any seeded phone number.

| Name | Role | Office | Phone Number |
| :--- | :--- | :--- | :--- |
| Adaeze Okonkwo | Admin | Lagos & Abuja | +234 803 000 0101 |
| Ibrahim Musa | Manager | Abuja | +234 803 000 0102 |
| Funmilayo Adeyemi | Manager | Lagos | +234 803 000 0103 |
| Hauwa Sani | Agent | Abuja | +234 803 000 0106 |
| Chidi Eze | Agent | Lagos | +234 803 000 0104 |
| Ngozi Nwosu | Support staff | Lagos | +234 803 000 0108 |

You can also switch personas at any point: open Demo tools, then View as. To reset the prototype, open Demo tools, then Reset demo. To log out, tap your avatar, then Log out.

Text size: tap your avatar, then Text size (or Aa on the login screen) to switch between Standard, Large and Extra large.

## 5-Minute Click-Through Walkthrough

Follow these steps in order to tour the core workspace features:

1. Log in as Adaeze Okonkwo (admin has visibility across both Lagos and Abuja branches).
2. Open #announcements to review broadcast notices and tap Seen by to inspect read receipts.
3. Open Demo tools, then View as to switch to Hauwa Sani and inspect Abuja branch channels.
4. Claim a lead in #abuja-leads by tapping "I've got this" on an unclaimed lead card.
5. Open #maitama-duplex, review the pinned listing card, open Files & Media, and preview a photo.
6. Open a PDF document attachment in chat or from the files tab to test the multi-page viewer.
7. Send a message in #abuja-sales mentioning @Ibrahim and watch the scripted colleague reply appear.
8. Add an emoji reaction to a message and post a reply inside a message thread.
9. Open Demo tools, then View as to switch to Chidi Eze (Lagos only) and compare his visible channel list with Hauwa's.
10. Open Demo tools, toggle Simulate offline, and send a message to observe offline queueing.
11. Open Demo tools, then View as to switch back to Adaeze Okonkwo, open Admin from the top bar, and add a new staff member. To finish, tap your avatar, then Log out.
12. On the login screen choose Request access, submit a request, log in as Adaeze, open Admin, then Requests, and approve it.

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
