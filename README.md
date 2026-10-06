# College Opportunity & Deadline Aggregator

One place for scholarships, internships, hackathons, exams and other deadlines, personalised for each student.

**Stack:** React + Vite, Express, MongoDB Atlas (Mongoose), JWT, Google OAuth, node-cron, Nodemailer, FullCalendar, Recharts.

## Roles

| Role | Login page | What they can do |
|---|---|---|
| Student | `/login` (email or Google) | Browse, track applications, get reminders |
| Volunteer | `/volunteer/login` | Submit opportunities (admin approval, unless trusted) |
| Admin / Superadmin | `/admin/login` | Approve or reject, add official opportunities, analytics, manage volunteers |

Roles can never be set through the public register API. Everyone who signs up is a student.

## Run it

Needs Node.js 18+ and a MongoDB Atlas cluster.

```powershell
# 1. Backend
cd backend
npm install
# create backend/.env (see "Environment variables" below)
npm run dev                 # http://localhost:5000
npm test                    # unit tests for match score, workload, duplicate detection

# 2. Frontend (new terminal)
cd frontend
npm install
# create frontend/.env with VITE_GOOGLE_CLIENT_ID=<your client id>
npm run dev                 # http://localhost:5173
```

## Environment variables

`backend/.env` (never commit this file):

```
PORT=5000
MONGODB_URI=<your Atlas connection string>
JWT_SECRET=<long random string>
JWT_REFRESH_SECRET=<another long random string>
CLIENT_URL=http://localhost:5173
GOOGLE_CLIENT_ID=<your Google client id>
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<sender gmail address>
SMTP_PASSWORD=<gmail app password>
```

`frontend/.env`:

```
VITE_GOOGLE_CLIENT_ID=<your Google client id>
```

Generate a random secret with:
`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

## Create admin and volunteer accounts

Run from the `backend` folder:

```powershell
node scripts/createAdmin.js "Admin Name" admin@example.com StrongPass123
node scripts/createAdmin.js "Volunteer Name" volunteer@example.com StrongPass123 volunteer
```

Add `superadmin` as the fourth argument for a super admin. Students sign up at `/signup` or use Google.

## Real data

No fake opportunities are used. Load the real ones with:

```powershell
node scripts/seedOpportunities.js
```

or log in as admin, open **Add opportunity** and copy details from official notices, always filling the source URL. Don't do both, or you will get duplicates.

## Google OAuth setup

1. Google Cloud Console, create a project, then APIs & Services, OAuth consent screen (External).
2. Credentials, Create OAuth client ID, Web application. Authorized JavaScript origin: `http://localhost:5173`.
3. Put the Client ID in `backend/.env` (`GOOGLE_CLIENT_ID`) and `frontend/.env` (`VITE_GOOGLE_CLIENT_ID`).

Flow: the Google button returns an ID token, `POST /api/auth/google`, the backend verifies it with Google, creates a student if new, and returns our own JWT.

## Email setup (Gmail)

1. Turn on 2-Step Verification on the sender Gmail account.
2. Create an App Password at https://myaccount.google.com/apppasswords.
3. Put the sender address in `SMTP_USER` and the 16-character password (no spaces) in `SMTP_PASSWORD`.

If `SMTP_HOST` is empty, emails are switched off and only in-app notifications are created.

## Features beyond CRUD

- **Smart Match Score** (`services/match.js`): branch 30 + year 20 + CGPA 20 + interest 20 + urgency 10. Every rule returns a readable reason.
- **Document readiness** (`services/readiness.js`): compares the documents an opportunity needs with the ones the student has ticked.
- **Duplicate detection** (`services/duplicate.js`): Jaccard similarity on title words plus matching link, category, date and organisation. A score of 0.6 or more blocks the submission with a 409.
- **Auto-tracking** (`services/autoTrack.js`): an open opportunity is added to a student's tracker when the student is eligible, the match is 65 or more, and the category is one of their interests. Items the student removes are never added again.
- **Escalating reminders** (`cron/reminders.js`, `services/urgency.js`): runs daily at 08:00 and once on server start. Registered students get a reminder every day until the deadline, with stronger wording as it gets closer (early, soon, urgent, final day, last day). Each email names the documents the student is still missing. Reminders stop when the stage is Application Submitted, Selected, Rejected or Withdrawn. Students who haven't registered but match well are reminded 3 and 1 days before.
- **Registration confirmation**: clicking Add to tracker sends an in-app notification and an email.
- **What-if simulator** (`services/whatIf.js`): shows which single change (a CGPA target or reaching a year) would unlock the most opportunities.
- **Volunteer trust** (`services/reputation.js`): a volunteer whose submissions are published immediately must have 5 admin-approved submissions, a 90% approval rate and no rejection as the latest result. Admins can override per volunteer, and can reject anything that was auto-published.
- **Workload** (`services/workload.js`) and **daily planner** (`services/planner.js`) on the student dashboard.
- **Admin analytics**: aggregated charts for categories, status, months, views and tracker stages.

## Database

- Collections: users, deadlines, applications, accesses, notifications, studentdocuments.
- Indexes: `deadlineDate`, `category+status`, `applicationLink`, `submittedBy`, `Access user+accessedAt`, unique `Application user+deadline`, unique `Notification user+key` (stops duplicate notifications).

## API

Auth: `POST /api/auth/register|login|google|refresh-token|logout`, `GET /api/auth/me`.
Users: `GET/PUT /api/users/me`, `GET /me/submissions`, `/me/recently-accessed`, `/me/dashboard`.
Deadlines: `GET /api/deadlines`, `/feed`, `/calendar`, `/:id`; `POST /api/deadlines` (volunteer); `GET /mine/list`, `/mine/trust` (volunteer).
Applications: `GET/POST/PUT/DELETE /api/applications`.
Notifications: `GET /api/notifications`, `PUT /:id/read`, `PUT /read-all`, `POST /remind`.
Admin (admin and superadmin only, others get 403): `GET /pending`, `/analytics`, `/volunteers`; `POST /deadlines`; `PUT /deadlines/:id`, `/approve`, `/reject`, `/volunteers/:id/trust`; `DELETE /deadlines/:id`. Superadmin: `GET /users`, `PUT /users/:id/role`.

## Manual test plan

1. Create 5 accounts: 1 admin, 1 volunteer, 3 students (set branch, year, CGPA and interests in each student's profile).
2. Log in to each and confirm the right home page opens and that students cannot open `/admin/dashboard`.
3. Admin adds real opportunities. Each student's dashboard shows different match scores.
4. Open two opportunities and check Recently accessed.
5. Volunteer submits an opportunity, then submits a near-copy (duplicate warning). Admin approves it.
6. A student's tracker fills automatically. Click Add to tracker on another item and check the email.
7. Run `node scripts/previewReminders.js` to see the escalating reminder wording.

## Project structure

```
backend/   Express API: routes, models, services (algorithms), cron, scripts, tests
frontend/  React app: pages, services (API client), context (auth), styles
```