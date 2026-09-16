# Mindscaping — Feature Walkthrough

This document provides a step-by-step walkthrough of every feature in the Mindscaping website. Follow the instructions in order to see the full flow from a patient's and clinician's perspective.

---

## Prerequisites

The site runs at **http://localhost:3004** in Docker. No database setup needed — SQLite auto-initialises on first run.

---

## Part A: Patient Journey

### Step 1 — Browse the Homepage
1. Open http://localhost:3004
2. You'll see the hero section with "Mindscaping — Mindful Healing"
3. Scroll down to see the **About** section, **Values**, **Approach**, **Process**, **Team** profiles, **Testimonials**, **Gallery**, and **FAQ**
4. The navigation bar stays fixed at the top as you scroll
5. Click "Sign In" and "Register" links in the nav

**What this demonstrates:** The site's public-facing content — everything a visitor sees before logging in. The team members come from `content/team.json` (the CMS data).

---

### Step 2 — Register as a Patient
1. Click **Register** in the navigation bar
2. Fill in the form:
   - Name: `Rahul Sharma`
   - Email: `rahul@example.com`
   - Phone: `9876543210`
   - Password: `password123`
   - Role: Select **Patient** (should be default)
3. Click **Register**

**What this demonstrates:** Account creation. The password is hashed with bcrypt (12 rounds) and stored in the database. You're redirected to the patient dashboard automatically.

---

### Step 3 — Book a Therapy Session
1. Click **Book** in the navigation bar
2. Fill in the booking form:
   - Name: `Rahul Sharma`
   - Email: `rahul@example.com`
   - Phone: `9876543210`
   - Session Type: Select **Individual Therapy**
   - Date: Pick any future weekday
   - Time: Select an available slot (10:00 - 18:00 on weekdays, 10:00-15:00 on weekends, no Sunday slots)
   - Therapist Preference: Select a therapist or "No preference"
   - Notes: "First session, feeling anxious about work stress"
3. Click **Submit**

**What this demonstrates:** The booking system with validation. The phone field validates Indian 10-digit numbers (starting with 6-9). The date picker rejects past dates. Sunday returns no slots. The booking is saved to the database and a real-time SSE event is published to the admin panel.

---

### Step 4 — View Patient Dashboard
1. Navigate to http://localhost:3004/dashboard
2. You should be redirected to `/dashboard/patient` since you registered as a patient
3. The dashboard shows your upcoming sessions

**What this demonstrates:** Role-based dashboard routing. The dashboard page checks your session cookie and redirects to the appropriate role-based view.

---

### Step 5 — Access Messages
1. Click **Messages** in the navigation bar (or go to http://localhost:3004/messages)
2. The messages page loads with an empty conversation list

**What this demonstrates:** The messaging interface. Once a clinician sends you a message, it will appear here with read/unread status tracking.

---

## Part B: Clinician Journey

### Step 6 — Register as a Clinician
1. Navigate to http://localhost:3004/register
2. Fill in the form:
   - Name: `Dr. Priya Menon`
   - Email: `priya@mindscaping.in`
   - Phone: `9123456789`
   - Password: `password123`
   - Role: Select **Clinician**
3. Click **Register**

**What this demonstrates:** Clinician registration with a different role. You'll be redirected to the clinician dashboard.

---

### Step 7 — Clinician Dashboard
1. After registration, you land on `/dashboard/clinician`
2. The dashboard shows clinician-specific views

**What this demonstrates:** Role-based routing. Clinicians see a different dashboard than patients.

---

### Step 8 — View Patients
1. The clinician dashboard should show patient management
2. Patients who registered appear in the patient list

**What this demonstrates:** The `/api/patients` endpoint returns all patients (clinician-only access).

---

### Step 9 — Create a Session for a Patient
1. From the clinician dashboard, create a new therapy session
2. Select a patient (e.g., Rahul Sharma)
3. Set the date and session type

**What this demonstrates:** The `/api/sessions` endpoint allows clinicians to create and manage therapy sessions.

---

### Step 10 — Write Clinical Notes
1. From the clinician dashboard, navigate to notes
2. Write a session note for Rahul's session
3. You can also write patient-level notes (observations, treatment plans)

**What this demonstrates:** The notes system supports two types:
- **Session notes** — tied to a specific therapy session
- **Patient notes** — general observations about a patient

Clinicians can create, read, and update notes. Patients can only read their own notes.

---

### Step 11 — Send a Message to Patient
1. Go to http://localhost:3004/messages
2. Start a conversation with Rahul Sharma
3. Send a message: "Welcome to Mindscaping! I look forward to our first session."
4. Check the unread indicator and read status

**What this demonstrates:** The messaging system tracks:
- Who sent each message
- Read/unread status (unread count per conversation)
- Conversation history with timestamps

---

### Step 12 — Accept and Process Payment
1. When Rahul books a session, a payment is created via Razorpay
2. As a clinician, you can view payment status in the dashboard

**What this demonstrates:** The payment flow:
1. Patient's booking creates a Session
2. Patient calls `/api/payments` to create a Razorpay order
3. Razorpay webhook at `/api/payments/webhook` confirms payment
4. Payment status updates from "created" → "captured" or "failed"

Note: Razorpay integration requires real API keys. In development, the webhook handler processes mock callbacks.

---

## Part C: Admin Features

### Step 13 — Team Management
1. Navigate to http://localhost:3004/team
2. The team page shows all clinicians from `content/team.json`
3. The `/api/team` endpoint merges CMS data with database clinician accounts

**What this demonstrates:** The clinician-CMS sync:
- Team profiles are stored in `content/team.json` (CMS content)
- When a clinician registers in the app, the team page shows them as having an active account
- The "View Profile" link connects CMS bio/credentials to the live account

---

### Step 14 — Real-time Notifications (LiveNotifications)
1. As a clinician, keep the dashboard open
2. When a patient submits a booking, you'll see a real-time notification appear
3. The notification shows the booking details

**What this demonstrates:** Server-Sent Events (SSE) for real-time updates:
- `/api/events` streams notifications to connected clients
- `/api/events/push` publishes new events
- Used for booking notifications in the admin panel

---

## Part D: Public Pages

### Step 15 — Blog
1. Navigate to http://localhost:3004/blog
2. Blog posts are managed via Decap CMS at `/admin`

**What this demonstrates:** Content management through Decap CMS (Git-based).

---

### Step 16 — Contact
1. Navigate to http://localhost:3004/contact
2. The contact form allows visitors to send inquiries

**What this demonstrates:** Lead capture for potential clients.

---

### Step 17 — FAQ
1. Navigate to http://localhost:3004/faq
2. Common questions about therapy, pricing, and approach

**What this demonstrates:** Information architecture for self-service support.

---

### Step 18 — Gallery
1. Navigate to http://localhost:3004/gallery
2. Photo gallery with lightbox viewer

**What this demonstrates:** Visual content showcase with a lightbox modal.

---

### Step 19 — Privacy Policy
1. Navigate to http://localhost:3004/privacy
2. GDPR-compliant privacy policy for therapy practice

**What this demonstrates:** Legal compliance page.

---

## Part E: Authentication Flow

### Step 20 — Login/Logout
1. Navigate to http://localhost:3004/login
2. Enter credentials for either the patient or clinician account you created
3. After login, the nav bar changes to show "Dashboard" and "Sign Out"
4. Click "Sign Out" to log out

**What this demonstrates:**
- JWT-based authentication (7-day cookie expiry)
- HTTP-only cookies for security
- Role-based redirection after login
- Session persistence across page loads

---

### Step 21 — Admin CMS
1. Navigate to http://localhost:3004/admin
2. Decap CMS login (requires GitHub OAuth setup)

**What this demonstrates:** Git-based content management for blog posts and team profiles.

---

## API Reference

| Endpoint              | Method | Auth Required  | Description                    |
| --------------------- | ------ | -------------- | ------------------------------ |
| `/api/auth/register`  | POST   | No             | Create account                 |
| `/api/auth/login`     | POST   | No             | Login, set session cookie      |
| `/api/auth/logout`    | POST   | No             | Clear session cookie           |
| `/api/auth/me`        | GET    | Yes            | Get current user               |
| `/api/bookings`       | POST   | No             | Submit a booking request       |
| `/api/sessions`       | GET    | Yes            | List sessions                  |
| `/api/sessions`       | POST   | Yes (clinician)| Create a session               |
| `/api/notes`          | GET    | Yes            | List notes                     |
| `/api/notes`          | POST   | Yes (clinician)| Create a note                  |
| `/api/notes`          | PUT    | Yes (clinician)| Update a note                  |
| `/api/messages`       | GET    | Yes            | List conversations             |
| `/api/messages`       | POST   | Yes            | Send a message                 |
| `/api/patients`       | GET    | Yes (clinician)| List all patients              |
| `/api/payments`       | POST   | Yes (patient)  | Create Razorpay order          |
| `/api/payments`       | GET    | Yes            | List payments                  |
| `/api/payments/webhook`| POST | No             | Razorpay webhook handler       |
| `/api/team`           | GET    | No             | Get merged clinician+CMS team  |
| `/api/events`         | GET    | No             | SSE event stream               |
| `/api/events/push`    | POST   | No             | Publish SSE event              |

---

## Test Accounts

After running through Steps 2-6, you'll have:
- **Patient:** rahul@example.com / password123
- **Clinician:** priya@mindscaping.in / password123

---

## Key Design Decisions

1. **SQLite for dev** — zero config, auto-creates on first request. Swap to PostgreSQL/Cloudflare D1 for production.
2. **JWT in HTTP-only cookies** — no token storage in localStorage, immune to XSS.
3. **Role-based access** — `requireAuth("clinician")` middleware on sensitive endpoints.
4. **In-memory events** — SSE pub/sub works for single-instance. Add Redis for multi-instance production.
5. **CMS + DB merge** — Team page pulls from `content/team.json` (CMS) and enriches with database clinician accounts.
