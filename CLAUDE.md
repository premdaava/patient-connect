# CLAUDE.md — Patient Connect (UI-first MVP)

Read this file fully before every task. It is the source of truth for structure, stack, design and rules.

## 1. Goal
A multi-tenant patient engagement platform (Solutionreach-style) for **Patient Connect sites**.
Each Patient Connect site = one tenant (a practice/clinic).

**This MVP is a polished, clickable, demo-ready product.** UI quality and smooth page-to-page flow matter MORE than backend depth.
- Login, registration, onboarding, patients, appointments, messages, campaigns, reviews etc. run on **predefined seed data** in local Postgres.
- Anything external (SMS, email, review sites) is **simulated** with mock providers. No real Twilio/Resend/pg-boss in the MVP.
- Every screen must look finished: realistic data, empty/loading/error states, toasts, responsive layout.

## 2. Stack (do not substitute without asking)
- Next.js (latest stable, App Router), TypeScript strict, **pnpm** only
- Postgres local: `postgresql://premkumark:<password>@localhost:5432/patient_engagement`
- Drizzle ORM + drizzle-kit migrations (postgres-js)
- Tailwind CSS + shadcn/ui + lucide-react + sonner (toasts) + recharts (charts) + framer-motion (subtle only)
- react-hook-form + Zod for forms
- Session: simple signed cookie via `jose`; passwords hashed with `bcryptjs`. No Auth.js for MVP.
- date-fns for dates; libphonenumber-js for phones
- Vitest for a few unit tests; ESLint + Prettier

## 3. Environment
`.env.local` (never committed); commit `.env.example` only.
```
DATABASE_URL=postgresql://premkumark:CHANGE_ME@localhost:5432/patient_engagement
SESSION_SECRET=change-me-32-chars-minimum
APP_URL=http://localhost:3000
```
Validate env with Zod in `src/lib/env.ts`.

## 4. Demo data and credentials
- Seeded sites: **Bright Smiles Dental** (main demo, rich data), **Lakeside Family Clinic**, **Peak Physio**.
- Demo login (prefilled on the login page, plus a "Continue as demo user" button):
  `demo@patientconnect.com` / `Demo@1234` → owner of Bright Smiles Dental.
- Registration is a **3-step wizard** (Account → Practice → Preferences). A "Fill sample data" button prefills it. Submit creates a real user + site, copies a starter dataset (templates, ~25 sample patients, appointments) so the new account never looks empty, then goes to onboarding.
- Seed (`pnpm db:seed`) is idempotent: wipes and recreates demo data. Main demo site has ~60 patients, 14 days of appointments (past + future), 8 inbox threads, 6 templates, 3 campaigns, 20 review requests, 30 days of message stats for charts.
- Use realistic names, varied avatars (initials with colored backgrounds), realistic appointment types (cleaning, exam, whitening, consult).

## 5. Page flow (must all work with working links, no dead ends)
```
/  (marketing landing: hero, features, CTA)
 ├─ /login ──────────────► /dashboard
 │    └─ "Continue as demo user"
 └─ /register (wizard) ──► /onboarding (checklist: import patients, set review link, enable reminders, share booking link) ──► /dashboard

/dashboard ─► quick actions: Add patient, New appointment, Send broadcast, Open inbox
/patients ─► /patients/[id] (tabs: Overview, Appointments, Messages, Consent) ; import CSV dialog
/appointments (calendar week/day + list toggle) ─► appointment drawer ─► send reminder / mark confirmed / no-show / complete
/inbox (thread list + chat panel + patient sidebar) ─► reply, quick templates, simulate inbound reply
/campaigns ─► /campaigns/new (stepper: Audience → Message → Schedule → Review) ─► /campaigns/[id] stats
/reviews (requests table, rating summary, send request) 
/templates (list + editor with live phone preview + merge fields)
/settings (tabs: Practice, Reminders, Booking, Embed, Team, Notifications)
/book/[siteSlug] (public booking, 4-step) ─► confirmation page
/logout ─► /login
```
Sidebar highlights the active page. Breadcrumbs on detail pages. Avoid dead ends: every empty state has a CTA.

## 6. MVP features (UI-first)
1. Login / registration / onboarding (predefined data, see §4)
2. Dashboard: KPI cards, messages-per-day chart, upcoming appointments, recent replies, onboarding progress
3. Patients: table (search, filters, bulk select), detail page, add/edit, CSV import (upload → map → preview → import), consent status badges
4. Appointments: calendar (week/day) + list, create/edit drawer, status chips, reminder timeline per appointment
5. Messaging: templates with merge fields + phone-style live preview; inbox with threads, unread badges, reply; mock send writes to DB; "simulate patient reply" dev button (STOP/C/R keywords update consent / appointment status)
6. Reminders: schedule rows created per appointment; a "Run due reminders now" button (and `pnpm reminders:run`) sends them through the mock provider. No background worker in MVP.
7. Campaigns: audience builder, preview count and rendered sample, schedule, results page with funnel stats
8. Reviews: request log, rating summary, send request, tracked link `/r/[token]`
9. Public booking page + embeddable `public/widget.js` (button + iframe modal) with sample embed snippet in Settings → Embed
10. Settings: practice profile, reminder timings, booking hours/services, team list, notifications

Out of scope: real SMS/email, payments, insurance, telehealth, EHR/PMS integrations, background workers (design provider interfaces only), role permissions beyond owner/staff display.

## 7. Design system
- Look: modern healthcare SaaS, clean, airy, trustworthy. Light theme first, dark mode optional at the end.
- Palette (CSS variables in globals.css): primary teal `#0D9488`, primary-dark `#0F766E`, accent indigo `#6366F1`, bg `#F8FAFC`, surface white, border `#E2E8F0`, text `#0F172A`/`#64748B`, success `#16A34A`, warning `#F59E0B`, danger `#DC2626`.
- Font: Inter (next/font). Radius 12px cards, 8px inputs. Subtle shadows. 8px spacing grid.
- Layout: left sidebar (collapsible, icons + labels), top bar (site switcher, search, notifications bell, user menu). Content max-width 1280px.
- Reusable components in `src/components/shared/`: `PageHeader`, `StatCard`, `DataTable`, `EmptyState`, `StatusBadge`, `Avatar`, `PhonePreview`, `Stepper`, `ConfirmDialog`, `SearchInput`, `Skeletons`.
- Every list/page has: loading skeleton, empty state with CTA, error state. Every mutation shows a sonner toast.
- Responsive: usable at 375px (sidebar becomes a sheet, tables become cards), looks best at 1280px+.
- Accessibility: labels, focus rings, keyboard-friendly dialogs, color contrast AA.
- Use realistic microcopy (no "Lorem ipsum", no "Test 1").

## 8. File structure
```
.
├── CLAUDE.md
├── .clinerules/00-project.md
├── .env.example
├── drizzle.config.ts
├── drizzle/
├── scripts/            # seed.ts, run-reminders.ts
├── public/widget.js
├── src/
│   ├── app/
│   │   ├── (marketing)/page.tsx
│   │   ├── (auth)/login, register, onboarding
│   │   ├── (app)/layout.tsx          # sidebar + topbar shell
│   │   │   ├── dashboard/ patients/ appointments/ inbox/
│   │   │   ├── campaigns/ reviews/ templates/ settings/
│   │   ├── book/[siteSlug]/
│   │   ├── r/[token]/route.ts
│   │   └── api/health, api/dev/simulate-reply
│   ├── components/ui/                # shadcn
│   ├── components/shared/            # design-system components
│   ├── components/<feature>/
│   ├── db/index.ts, db/schema/
│   ├── features/<feature>/           # actions.ts, queries.ts, schemas.ts, service.ts
│   ├── lib/                          # env, session, tenant, phone, merge-fields, utils
│   └── lib/providers/                # sms.mock.ts, email.mock.ts (+ interfaces)
└── tests/
```

## 9. Data model (core tables)
`sites`, `users`, `memberships`, `patients`, `consents`, `templates`, `appointments`, `reminders`, `threads`, `messages`, `campaigns`, `campaign_recipients`, `review_requests`, `booking_requests`, `site_settings`.
All business tables: `id uuid pk`, `site_id` (indexed), `created_at`, `updated_at` (timestamptz, UTC; display in the site's timezone).

## 10. Hard rules
1. Every query is scoped by `site_id` from the session (`lib/tenant.ts`). Never trust a client-sent site id.
2. Respect consent even in demo: the mock sender refuses opted-out patients and shows a clear error toast.
3. Validate all input with Zod. Business logic in `features/*/service.ts`, not in components.
4. External services only through `lib/providers` interfaces (mock implementations for MVP).
5. Schema changes only via Drizzle + generated migrations.
6. Prefer server components and server actions; client components only for interactivity.
7. No secrets in code. No `any` without a comment.
8. Do not add features outside the current step. Do not install new major libraries without asking.

## 11. Commands
```
pnpm dev | build | lint | typecheck | test
pnpm db:generate | db:migrate | db:studio | db:seed
pnpm reminders:run
```

## 12. Workflow for every task
1. Re-read this file. State a short plan (pages/components/files).
2. Implement only the current step.
3. Run `pnpm typecheck && pnpm lint`. Fix before continuing. For UI steps, open the page in the browser tool, check desktop and ~375px mobile widths, and fix visual issues (spacing, overflow, contrast).
4. Commit with Conventional Commits, one commit per step, branch `step/<nn>-<name>`, merge to `main` when green.
5. End with: what was built, URLs to click through, what's next.

## 13. Definition of done
- `pnpm i && pnpm db:migrate && pnpm db:seed && pnpm dev` → open `/login` → click "Continue as demo user" → every sidebar page works with rich data
- Registration wizard → onboarding → dashboard works end to end and the new account is not empty
- Public booking page and widget embed work
- No dead links, no console errors, no layout break at 375px / 768px / 1280px
- README with setup, demo credentials, page map and screenshots checklist