# Mindscaping — UX Issues & Feature Inventory

**Date:** 2026-09-16
**Status:** Pre-production audit

---

## Part 1: Identified UX Issues

### CRITICAL — Booking Journey Broken

| # | Issue | Impact | Where |
|---|-------|--------|-------|
| 1 | **Booking → Session Disconnect** — Bookings save to `Booking` table, dashboard shows `Session` table. After submitting a booking, the patient's dashboard shows "No upcoming sessions." The booking exists in the database but is invisible to both patient and clinician. | Patient and clinician both lose track of bookings | `lib/booking.ts`, `app/dashboard/patient/page.tsx`, `app/dashboard/clinician/page.tsx` |
| 2 | **No booking status tracking** — No "My Bookings" section in patient dashboard. No way to see pending/confirmed/cancelled status after submission. | Patient has zero visibility into their booking after submitting | `app/dashboard/patient/page.tsx` |
| 3 | **Booking confirmation is a dead end** — Success screen shows "Booking Request Received" but has no "Go to Dashboard" or "Book Another" button. User must manually navigate. | Confused user stuck on confirmation page | `components/sections/BookingForm.tsx` |
| 4 | **Booking form doesn't pre-fill logged-in user data** — Even when authenticated, the form asks for name, email, phone from scratch instead of pulling from the user's session. | Unnecessary friction for returning users | `components/sections/BookingForm.tsx` |
| 5 | **Clinician can't see booking requests** — Clinician dashboard has Patients, Sessions, Notes, Chat tabs but zero visibility into incoming bookings. No "Bookings" tab. | Clinician has no way to review/accept/reject bookings | `app/dashboard/clinician/page.tsx` |

### HIGH — Navigation & Auth Gaps

| # | Issue | Impact | Where |
|---|-------|--------|-------|
| 6 | **No "Contact" link in nav** — Nav shows: Our Approach, Team, Gallery, Blog, FAQ, Book, Research. The `/contact` page exists but is unreachable from the nav. Only accessible from the ContactSection at the bottom of the homepage. | Users can't easily find contact information | `components/layout/Nav.tsx` |
| 7 | **Login/Register don't redirect if already authenticated** — Visiting `/login` or `/register` while logged in shows the form instead of redirecting to the dashboard. | Confusing — logged-in user sees login form | `app/login/page.tsx`, `app/register/page.tsx` |
| 8 | **Dashboard redirect shows "Redirecting..." text** — The `/dashboard` page renders a visible "Redirecting..." paragraph before the client-side redirect fires. Users see a blank page with that text briefly. | Flash of unstyled/meaningless content | `app/dashboard/page.tsx` |

### HIGH — Messaging Broken for Patients

| # | Issue | Impact | Where |
|---|-------|--------|-------|
| 9 | **Patient can't initiate conversations** — Messages page shows empty conversation list. The only way to start a conversation is from the clinician dashboard's patient list. Patients have no "New Message" button, no clinician directory, no way to reach out. | Patients are locked out of the messaging feature | `app/messages/MessagesContent.tsx` |
| 10 | **Messages empty state has no guidance** — "No conversations yet" with no hint about who to message or how to start. | New user has no idea what to do | `app/messages/MessagesContent.tsx` |

### MEDIUM — Payment & Data Issues

| # | Issue | Impact | Where |
|---|-------|--------|-------|
| 11 | **Razorpay key is placeholder** — `NEXT_PUBLIC_RAZORPAY_KEY_ID` is set to `your-razorpay-key-id`. The "Pay ₹500" button will open a broken Razorpay checkout. | Payment feature completely non-functional | `.env`, `app/dashboard/patient/page.tsx` |
| 12 | **Team page doesn't use merged clinician+CMS data** — `/team` page calls `getTeamMembers()` from `lib/content.ts` which reads `content/team.json` directly. It doesn't use `getMergedTeamData()` from `lib/team-sync.ts`, so the "has active account" indicator never shows. | Wasted sync feature, stale team data | `app/team/page.tsx` |

### LOW — UX Polish

| # | Issue | Impact | Where |
|---|-------|--------|-------|
| 13 | **No password recovery** — No "Forgot Password?" link on login page. Users who forget their password have no way to recover. | Locked-out users with no self-service recovery | `app/login/page.tsx` |
| 14 | **Password minimum length not communicated** — Register form has `minLength={8}` but doesn't tell the user until after submission error. | Frustrating validation surprise | `app/register/page.tsx` |
| 15 | **Registration error is generic** — API returns "Email already registered" but UI shows "Registration failed" instead of guiding to log in. | Missed opportunity to redirect users | `app/register/page.tsx` |

---

## Part 2: Feature Inventory (Layman's Guide)

### What is Mindscaping?

Mindscaping is a therapy practice website for a mental health clinic in Mumbai. It handles everything from showing the clinic's information to letting patients book sessions, chat with therapists, and make payments — all from one website.

### Who Uses It?

There are three types of people:
- **Visitors** — Anyone who visits the website to learn about the clinic
- **Patients** — People who register and book therapy sessions
- **Clinicians** — Therapists who manage patients, sessions, notes, and messages

---

### Feature Set 1: Public Website (No Login Required)

These pages are visible to anyone who visits the site.

**Homepage** — The main landing page. Shows a hero banner, the clinic's approach to therapy, their values, how the therapy process works (step by step), the team of therapists, client testimonials, a photo gallery, frequently asked questions, and contact information. Everything a potential patient needs to decide if this clinic is right for them.

**Team Page** (/team) — Lists all therapists with their photos, qualifications, specializations, and bios. This is where patients decide which therapist they'd like to see.

**Blog** (/blog) — Articles and posts about mental health topics. Managed through a content management system (Decap CMS) so the clinic can write new posts without touching code.

**Gallery** (/gallery) — A photo grid showing the clinic space. Clicking any photo opens it in a larger view (lightbox). Helps patients feel comfortable about the environment before visiting.

**FAQ** (/faq) — Common questions about therapy sessions, pricing, what to expect, etc. Expandable accordion style — click a question to reveal the answer.

**Contact** (/contact) — Shows phone number, WhatsApp link, working hours, and session timings. Two buttons: "WhatsApp Us" for instant messaging and "Book Online" to start the booking process.

**Privacy Policy** (/privacy) — Legal page explaining how patient data is collected, stored, and protected. Important for a healthcare practice.

**Booking Page** (/book) — Anyone can fill out a booking request form (name, email, phone, session type, preferred date/time, therapist preference). No account needed to submit a request.

---

### Feature Set 2: Patient Account

These features require creating an account and logging in as a patient.

**Registration** (/register) — Create an account with name, email, phone, and password. The system hashes the password (never stores plain text) and creates a secure session cookie that lasts 7 days.

**Login** (/login) — Email and password login. The system checks the password against the stored hash and issues a secure session cookie. Redirects to the patient dashboard on success.

**Patient Dashboard** (/dashboard/patient) — The patient's home base after login. Shows:
- A count of upcoming sessions, completed sessions, and total money spent
- List of upcoming therapy sessions with date, time, therapist name, and session type
- A "Pay" button next to each unpaid session (integrates with Razorpay for online payments)
- Payment history with amounts and statuses (paid, pending, failed)
- Links to Messages and a Sign Out button

**Booking a Session** (/book) — Same form as the public page, but now the patient is logged in. They select a session type (Individual, Couples, Family, Group, Corporate, or School therapy), pick a date and time from available slots, choose a therapist, and add notes about what they'd like to discuss.

**Messages** (/messages) — A chat interface between patients and clinicians. Shows a list of conversations with the most recent message and unread count. Clicking a conversation opens a real-time chat window that refreshes every 3 seconds. Messages appear as speech bubbles — your messages on the right, their messages on the left.

**Payments** — When a clinician creates a session for a patient, the patient sees a "Pay ₹500" button on their dashboard. Clicking it opens Razorpay (an Indian payment gateway) where they can pay by card, UPI, net banking, or wallet. The payment status updates automatically.

---

### Feature Set 3: Clinician Account

These features are for therapists who work at the clinic.

**Clinician Dashboard** (/dashboard/clinician) — A tabbed interface with four sections:

**Patients Tab** — Lists all registered patients with their name, email, and phone number. Click a patient to highlight them. Each patient has a "Message" link to start a conversation. This is the clinician's patient directory.

**Sessions Tab** — Two parts:
- A form to schedule new sessions: select a patient, pick a date/time, choose session type (Individual/Couples/Family/Group), and click "Schedule"
- A list of all existing sessions showing patient name, date, type, and status (scheduled/completed/cancelled)

**Notes Tab** — Clinical note-taking system:
- Write a new note by selecting a patient, choosing note type (Session Note or Patient Note), optionally linking it to a specific session, and writing the content
- View all recent notes with patient name, note type, date, and content
- Session Notes are tied to a specific therapy session (e.g., "Patient discussed anxiety about work")
- Patient Notes are general observations (e.g., "Patient responds well to CBT techniques")

**Messages Tab** — Shows the same patient list with messaging links. Acts as a shortcut to the messaging system.

---

### Feature Set 4: Authentication & Security

**JWT Authentication** — Uses JSON Web Tokens stored in HTTP-only cookies. This means the login token is invisible to JavaScript (preventing XSS attacks) and automatically expires after 7 days.

**Role-Based Access** — The system enforces who can do what:
- Patients can only see their own sessions, notes, and payments
- Clinicians can see all patients, create sessions, write notes, and access the patient list
- Some API endpoints check the role before allowing access (e.g., only clinicians can create sessions)

**Password Hashing** — Passwords are hashed with bcrypt (12 rounds of salting). Even if the database is compromised, passwords cannot be recovered.

**Secure Cookies** — Session cookies use `httpOnly` (no JavaScript access), `secure` flag in production (HTTPS only), and `sameSite: lax` (prevents CSRF attacks).

---

### Feature Set 5: Real-Time Notifications

**SSE (Server-Sent Events)** — When a patient submits a booking, a real-time notification pops up in the bottom-right corner of the clinician's screen. This uses a persistent HTTP connection that pushes events from server to client without the client having to refresh.

**LiveNotifications Component** — A floating notification panel that shows booking alerts with the patient's name and session type. Can be dismissed individually. Shows a connection error if the SSE connection drops.

---

### Feature Set 6: Content Management

**Decap CMS** (/admin) — A Git-based content management system. The clinic can edit team profiles, blog posts, FAQ answers, gallery images, and testimonials directly from a browser-based editor. Changes are committed to the Git repository automatically.

**Content Files** — All CMS content lives in JSON files:
- `content/team.json` — Therapist profiles (name, role, photo, bio, credentials)
- `content/faq.json` — FAQ questions and answers
- `content/gallery.json` — Gallery images with captions
- `content/testimonials.json` — Client testimonials

**Team Sync** — The team page merges CMS data (from `team.json`) with database data (from registered clinician accounts). If a therapist has both a CMS profile and a registered account, the team page shows them as having an active account.

---

### Feature Set 7: API Backend

The website has 18 API endpoints that power all the features above:

| What It Does | Endpoint | Who Can Use It |
|---|---|---|
| Create account | POST /api/auth/register | Anyone |
| Log in | POST /api/auth/login | Anyone |
| Log out | POST /api/auth/logout | Anyone |
| Get current user | GET /api/auth/me | Logged-in users |
| Submit booking | POST /api/bookings | Anyone |
| List sessions | GET /api/sessions | Logged-in users |
| Create session | POST /api/sessions | Clinicians only |
| List notes | GET /api/notes | Logged-in users |
| Create note | POST /api/notes | Clinicians only |
| Update note | PUT /api/notes | Clinicians only |
| List conversations | GET /api/messages | Logged-in users |
| Send message | POST /api/messages | Logged-in users |
| List patients | GET /api/patients | Clinicians only |
| Create payment order | POST /api/payments | Patients only |
| List payments | GET /api/payments | Logged-in users |
| Payment webhook | POST /api/payments/webhook | Razorpay |
| Get team data | GET /api/team | Anyone |
| SSE event stream | GET /api/events | Anyone |

---

### Feature Set 8: Testing & Quality

**192 Tests** — Automated tests covering every component, hook, lib function, and accessibility check. Runs with Vitest and achieves 97%+ code coverage across all metrics.

**Accessibility Testing** — Uses axe-core to automatically scan every component for WCAG compliance issues (screen reader support, color contrast, keyboard navigation, ARIA labels).

**Docker Deployment** — The app runs in a Docker container with Prisma (database), SQLite (dev database), and Next.js production server. The container auto-creates the database schema on first run.

**Vercel Deployment** — Connected to Vercel for automatic deployments. Pushing to `main` triggers production deployment, pushing to `develop` triggers preview deployment.

---

### What's NOT Working Yet (From Part 1)

The booking system has a disconnect between the "Booking" and "Session" models — bookings are saved but not visible in either dashboard. Patients can't start conversations with clinicians. The payment button uses placeholder API keys. The team page doesn't use the merged data feature. And several navigation/auth flow polish items need fixing.
