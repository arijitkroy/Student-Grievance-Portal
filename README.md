# LastCryy – Student Grievance Portal

LastCryy is a **student grievance tracking portal** that brings students, staff, and administrators onto a single platform. The goal is simple: file a concern in minutes, keep everyone in the loop, and close the loop with clear accountability.

<sub>Built with Next.js 15, React 19, Tailwind CSS 4, Firebase, and Firebase Admin.</sub>

---

## Table of Contents
- [Highlights](#highlights)
- [How It Works](#how-it-works)
- [Feature Tour](#feature-tour)
- [Project Layout](#project-layout)
- [Tech Stack](#tech-stack)
- [Running the Project](#running-the-project)
- [Environment Setup](#environment-setup)
- [Contributing](#contributing)
- [Roadmap & Ideas](#roadmap--ideas)

---

## Highlights
- **Transparent timelines** – every grievance records status changes, assignments, comments, and feedback in `src/components/GrievanceTimeline.js`.
- **Role-aware dashboard** – admins can update statuses, escalate, and assign via `src/pages/dashboard/grievances/[id].js`; students can submit and track their own grievances.
- **Firebase-backed** – persistence, authentication, and notifications run through the Firebase Admin SDK in `src/lib/firebaseAdmin.js` and helpers in `src/lib/grievances.js`.
- **Anonymous mode** – students can file grievances without exposing their identity (`src/pages/api/grievances/index.js`).
- **Feedback loop** – once resolved, reporters can rate the outcome and leave feedback that goes back to admins.

---

## How It Works
1. **Submit** – Students register or log in, head to `dashboard/submit`, and create a grievance. Attachments are stored and a timeline entry is created.
2. **Track** – The dashboard (`src/pages/dashboard/index.js`) lists open items with filters for status, category, or assignee.
3. **Collaborate** – From the detail page (`src/pages/dashboard/grievances/[id].js`), admins can update status, add escalation notes, or leave comments. The timeline keeps everyone informed.
4. **Resolve** – When a grievance is marked `resolved` or `rejected`, it is locked for updates, ensuring a clear end state. Reporters can leave resolution feedback to close the loop.

---

## Feature Tour
- **Dashboard overview** – `src/components/DashboardStats.js` surfaces total, open, and resolved counts for quick scanning.
- **Notifications panel** – `src/components/NotificationsPanel.js` keeps important updates visible.
- **Profile snapshot** – `src/pages/dashboard/profile.js` shows who’s logged in along with quick stats.
- **Escalations & history** – `src/lib/grievances.js` handles status updates, escalations, and logging all history data back into Firestore.

---

## Project Layout
```
src/
  components/        Reusable UI blocks (timelines, badges, cards)
  context/           Auth context wrappers for client-side auth state
  hooks/             React hooks such as `useRequireAuth`
  lib/               Firebase, API client helper, serializers
  pages/
    api/             REST endpoints (submission, stats, notifications)
    dashboard/       Dashboard routes (overview, detail, submit, profile)
    admin/           Admin landing page (if role permits)
    index.js         Marketing/landing experience
```

---

## Tech Stack
- **Next.js 15** with the app router and Turbopack.
- **React 19** for modern client-side interactivity.
- **Tailwind CSS 4** for consistent styling.
- **Firebase** (client + admin SDK) for auth, Firestore, and storage.
- **Formidable** for handling incoming file uploads on the server.
- **Nodemailer** for email notifications (configurable).

Refer to `package.json` for the full dependency list.

---

## Running the Project
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the dev server (Turbopack-enabled):
   ```bash
   npm run dev
   ```
3. Visit `http://localhost:3000` to explore the app.

Turbopack offers faster local rebuilds. Use `npm run build` to create a production build and `npm start` to serve it.

---

## Environment Setup
Create a `.env.local` file with your Firebase credentials:
```
FIREBASE_API_KEY=...
FIREBASE_AUTH_DOMAIN=...
FIREBASE_PROJECT_ID=...
FIREBASE_STORAGE_BUCKET=...
FIREBASE_MESSAGING_SENDER_ID=...
FIREBASE_APP_ID=...

SERVICE_ACCOUNT_KEY={
  "type": "service_account",
  "project_id": "...",
  "private_key": "...",
  "client_email": "..."
}

SMTP_HOST=...
SMTP_PORT=...
SMTP_USER=...
SMTP_PASS=...
```

These environment variables are consumed in `src/lib/firebaseClient.js`, `src/lib/firebaseAdmin.js`, and notification utilities.

---

## Contributing
- Fork the repo and create a feature branch.
- Match the existing formatting and component structure.
- Update the README or add docs when new functionality ships.
- Submit a pull request with context, screenshots, or screen recordings if helpful.

---

## Roadmap & Ideas
- Expand analytics to show resolution times broken down by department.
- Add push/email notifications for commenters and status changes.
- Integrate more granular admin roles (reviewer vs escalator).
- Build automated retention policies for closed grievances.

If you have ideas or need help, please open an issue or reach out to the maintainers.

---

Thanks for using LastCryy! Let’s keep grievance handling transparent, humane, and efficient.
