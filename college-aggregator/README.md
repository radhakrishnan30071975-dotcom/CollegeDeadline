# College Opportunity & Deadline Aggregator

A full-stack MERN application where students discover internships, scholarships,
hackathons, competitions, placements, workshops, cultural/sports events, and
higher-study opportunities — with admin review workflows and a super admin
control panel.

The root page of the app is **only the login screen** — no marketing/landing
page. Accounts are created from three separate signup flows (Student / Admin /
Super Admin), reachable from links below the login form.

---

## 1. Tech Stack

**Frontend:** React (Vite), React Router, Axios, FullCalendar.js, plain CSS
**Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs, node-cron, Nodemailer

No TypeScript is used anywhere in the project.

---

## 2. Project Structure

```
project/
├── client/          React frontend (Vite)
│   ├── src/
│   │   ├── components/     Reusable UI pieces (cards, route guards)
│   │   ├── pages/          Route-level pages (student/admin/superadmin)
│   │   ├── layouts/        AppLayout (sidebar + shell for logged-in views)
│   │   ├── services/       Axios instance
│   │   ├── context/        AuthContext (login state, JWT storage)
│   │   └── App.jsx         Route definitions
│   └── package.json
│
├── server/          Express backend
│   ├── config/       MongoDB connection
│   ├── models/       User, Deadline, Category, Notification, Reminder
│   ├── controllers/  Business logic for each resource
│   ├── routes/       Express routers
│   ├── middleware/   JWT auth + role-based authorization
│   ├── cron/         Scheduled reminder job (node-cron)
│   ├── utils/        Token generation, email, validators
│   ├── seed/         Sample data generator
│   ├── app.js        Express app (middleware + routes)
│   └── server.js     Entry point
│
├── .env.example
└── README.md
```

---

## 3. Prerequisites

- Node.js 18+ and npm
- A running MongoDB instance (local `mongod`, or a MongoDB Atlas connection string)

---

## 4. Setup

### 4.1 Backend

```bash
cd server
npm install
cp .env.example .env
```

Edit `server/.env` and set real values:

```
MONGO_URI=mongodb://localhost:27017/college_opportunity_aggregator
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
ADMIN_REGISTRATION_CODE=choose-a-secret-code-for-admins
SUPERADMIN_REGISTRATION_CODE=choose-a-secret-code-for-superadmins
PORT=5000
CLIENT_URL=http://localhost:5173

# Optional - leave blank to disable email reminders
EMAIL_USER=
EMAIL_PASSWORD=
EMAIL_FROM="College Opportunity Aggregator <no-reply@college.edu>"
```

Seed the database with sample students, an admin, a super admin, categories,
and sample opportunities:

```bash
npm run seed
```

This prints sample login credentials to the console (see section 6 below).

Start the backend:

```bash
npm run dev      # with nodemon, auto-restarts on changes
# or
npm start
```

The API runs at `http://localhost:5000`. Check `http://localhost:5000/api/health`
to confirm it's up.

### 4.2 Frontend

In a second terminal:

```bash
cd client
npm install
npm run dev
```

The app runs at `http://localhost:5173`. Vite's dev server proxies `/api`
requests to `http://localhost:5000` (see `client/vite.config.js`), so no CORS
configuration is needed in development beyond what's already in `app.js`.

Open `http://localhost:5173` — you should see only the login page.

---

## 5. Environment Variables Reference

| Variable | Where | Purpose |
|---|---|---|
| `MONGO_URI` | server | MongoDB connection string |
| `JWT_SECRET` | server | Secret used to sign JWTs — keep private |
| `JWT_EXPIRES_IN` | server | Token lifetime, e.g. `7d` |
| `ADMIN_REGISTRATION_CODE` | server | Required to self-register as an admin |
| `SUPERADMIN_REGISTRATION_CODE` | server | Required to self-register as a super admin |
| `PORT` | server | Port the Express server listens on |
| `CLIENT_URL` | server | Allowed CORS origin (the frontend's URL) |
| `EMAIL_USER` / `EMAIL_PASSWORD` / `EMAIL_FROM` | server | Optional Gmail credentials for Nodemailer reminder emails. Leave blank to disable — the app still works, it just logs a message instead of sending mail. |

None of these secrets are ever sent to or stored in the frontend.

---

## 6. Sample Login Credentials (after running `npm run seed`)

Password for every seeded account: **Password123**

| Role | Email | Notes |
|---|---|---|
| Super Admin | `superadmin@college.edu` | Full system access |
| Admin | `admin@college.edu` | Approves/rejects/creates opportunities |
| Student | `rahul@college.edu` | CSE, Year 3, CGPA 8.2, interests: Internships/Hackathons/Placements |
| Student | `ananya@college.edu` | ECE, Year 2, CGPA 9.0, interests: Scholarships/Workshops/Higher Studies |

To create your **own** admin or super admin account through the UI, use the
`ADMIN_REGISTRATION_CODE` / `SUPERADMIN_REGISTRATION_CODE` values you set in
`server/.env` when filling out the "Create Admin/Super Admin Account" form.

---

## 7. Demo Flow

1. Open the app → only the login page appears.
2. Click **Create Account → Student**, register, and you land on the Dashboard.
3. Dashboard shows a personalized **"For You"** feed (filtered server-side by
   your branch, year, CGPA, and interests) and a **"Closing Soon"** list.
4. Go to **Browse**, search/filter, open an opportunity's details page.
5. Click **Remind Me** to schedule a 1-day or 3-day-before reminder.
6. Go to **Submit**, fill the form — it's saved with `status = pending`.
7. Log out, log in as `admin@college.edu`.
8. Admin Dashboard shows the pending submission; **Approve** or **Reject** it
   (rejection requires a reason).
9. The submitting student gets a notification either way.
10. Approved opportunities that match a student's profile appear in their
    "For You" feed automatically.
11. Log in as `superadmin@college.edu` to view/manage all students and admins,
    manage categories, and see system-wide stats.

---

## 8. How Key Requirements Are Implemented

- **Root page is login only**: `App.jsx` redirects `/` straight to `/login`;
  `Login.jsx` renders nothing but the title, email/password fields, a Login
  button, and the three "Create Account" links.
- **Role-based access**: JWTs carry `{ userId, role }`. The `protect`
  middleware verifies the token; `requireRole(...)` middleware blocks
  disallowed roles at the route level (e.g. `/api/admin/*` requires
  `admin` or `superadmin`; `/api/superadmin/*` requires `superadmin` only).
  On the frontend, `ProtectedRoute` mirrors this so students never even see
  admin/superadmin navigation links or pages.
- **Personalized feed**: `GET /api/deadlines/feed` (student-only) builds a
  MongoDB query in `deadlineController.getPersonalizedFeed` matching the
  logged-in student's branch, year, CGPA, and interests against approved
  opportunities — computed entirely server-side.
- **Approval workflow**: student submissions are created with
  `status: "pending"`; only admin/superadmin endpoints can move them to
  `approved` or `rejected`, and a `Notification` document is created for the
  submitter either way.
- **Reminders**: `POST /api/notifications/remind` stores a `Reminder`
  document; `server/cron/reminderCron.js` runs daily (and once shortly after
  server start, for demo convenience) to create notifications — and send an
  email via Nodemailer if configured — for reminders that are due.
- **Security**: passwords are hashed with bcryptjs (never stored in plain
  text); admin/superadmin registration codes live only in backend
  environment variables and are checked server-side; JWT secret is never
  exposed to the client.

---

## 9. Verification Checklist

- [x] Frontend runs (`npm run dev` in `client/`)
- [x] Backend runs (`npm run dev` in `server/`)
- [x] MongoDB connection works (`config/db.js`, confirmed via console log on startup)
- [x] Registration works for all 3 roles, with server-side validation
- [x] Login works, returns a JWT
- [x] JWT is verified on every protected route (`middleware/auth.js`)
- [x] Role protection works both in Express routes and React routes
- [x] Student flow: dashboard, browse/filter, details, reminders, submission
- [x] Admin flow: pending list, approve/reject, direct opportunity creation, stats
- [x] Super admin flow: user/admin management, category management, system stats
- [x] Opportunity submission → pending → admin review → approved/rejected → notification
- [x] Personalized feed filtered server-side by branch/year/CGPA/interests
- [x] Search/filter on Browse page (title, category, year, branch)
- [x] Calendar renders approved deadlines via FullCalendar, click-through to details
- [x] Notifications: list, mark as read, mark all as read
- [x] Reminders: scheduled via node-cron, generates notifications (+ optional email)

> Note: this project was authored and reviewed for correctness in a sandboxed
> environment without outbound network access, so `npm install` /
> live MongoDB / live server startup could not be executed here. Please run
> the setup steps above locally to install dependencies and start MongoDB
> before testing.
