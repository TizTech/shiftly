# Shiftly

Shiftly is a full-stack local-first job board focused on student jobs, part-time jobs, and everyday entry-level local roles.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS (custom premium UI)
- Prisma ORM + SQLite
- Cookie auth with role-based access (`SEEKER` / `EMPLOYER`)
- Server Actions for end-to-end write flows
- Local file storage in `public/uploads` for CVs, cover letters, and logos

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Ensure `.env` exists:

```env
DATABASE_URL="file:./dev.db"
SESSION_SECRET="shiftly-local-dev-secret-please-change"
```

3. Run migrations + seed:

```bash
npx prisma migrate reset --force
```

4. Start app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Seeded Accounts

All seeded users use password: `password123`

Employers:
- `maya@northlanebistro.co.uk`
- `lewis@traffordstyle.co.uk`
- `amina@peaklogistics.co.uk`
- `oliver@deansgatehotel.co.uk`

Seekers:
- `sophie@studentmail.com`
- `ryan@studentmail.com`
- `ella@studentmail.com`

## Routes Implemented

- `/`
- `/jobs`
- `/jobs/[id]`
- `/login`
- `/register`
- `/employer/dashboard`
- `/employer/jobs`
- `/employer/jobs/new`
- `/employer/jobs/[id]/edit`
- `/employer/applications`
- `/employer/messages`
- `/employer/company`
- `/seeker/dashboard`
- `/seeker/profile`
- `/seeker/applications`
- `/seeker/saved`
- `/seeker/messages`

## Core Features

- Role-based register/login/logout with remember-me sessions
- Protected employer/seeker dashboard routes via `proxy.ts`
- Homepage with hero search, featured jobs, categories, stats, CTA sections
- Advanced job filtering/sorting on `/jobs`
- Job detail pages with badges, structured role content, similar jobs
- Employer job CRUD (create/edit/close/delete)
- Company profile management with local logo upload
- Seeker profile management with CV, cover letter, profile photo uploads
- Saved jobs for seekers
- End-to-end applications:
  - seeker applies with stored or new CV
  - application saved in DB
  - employer sees in applications inbox
  - seeker sees in own applications page
- Application status pipeline: `SUBMITTED`, `REVIEWED`, `SHORTLISTED`, `REJECTED`, `HIRED`
- Internal messaging/chat linked to each application conversation
- Local file links for CV / cover letter / logo access

## Database Schema

Defined in [`prisma/schema.prisma`](./prisma/schema.prisma) with models:

- `User`
- `EmployerProfile`
- `JobSeekerProfile`
- `Company`
- `Job`
- `Application`
- `Conversation`
- `Message`
- `SavedJob`
- `UploadedFile`

## Project Structure

- `app/` route pages and layouts
- `actions/` server actions for auth, employer, seeker flows
- `components/` reusable UI, dashboard, layout, job components
- `lib/` auth/session/db/upload/validation helpers
- `prisma/` schema, migrations, seed script
- `public/uploads/` local uploaded files

## Commands

```bash
npm run dev
npm run lint
npm run build
npm run db:migrate
npm run db:seed
```

## How to Replace Internal Inbox with Real Email Later

Current architecture stores applications/messages internally and already centralizes write operations in server actions.

To add external email later:

1. Add an email service module (Resend/Postmark/SES) in `lib/email.ts`.
2. Trigger send calls from `applyToJobAction` and `sendEmployerMessageAction`.
3. Keep DB writes as source of truth, and treat email as notification side effects.
4. Add retry queue/background worker for delivery resilience.

## Deployment Notes

- Move from SQLite to Postgres for multi-user production.
- Use object storage (S3/R2) for uploads.
- Set secure production secrets for `SESSION_SECRET`.
- Add rate limiting and anti-abuse checks for auth/apply/chat endpoints.
- Add monitoring/logging and automated tests for critical flows.
