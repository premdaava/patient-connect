# Patient Connect

A multi-tenant patient engagement and practice management platform built with Next.js (App Router), TypeScript, Tailwind CSS, shadcn UI, Drizzle ORM, and PostgreSQL.

---

## 🚀 Features

- **Multi-Tenant Architecture**: Isolate multiple medical/dental practices with independent branding, timezones, and settings.
- **Patient Management & CRM**: Comprehensive patient records, appointment history, consent preferences (SMS/Email opt-in/opt-out), and CSV bulk import.
- **Appointments & Reminders**: Interactive calendar, scheduling, booking requests queue, and automated/manual reminder dispatching.
- **Two-Way Unified Inbox**: Real-time messaging simulator, thread management, and SMS/Email chat panels.
- **Campaign & Broadcast Engine**: Targeted campaign builder with audience preview, CSV/tag filters, and delivery analytics.
- **Review & Reputation Management**: Automated review request generation, feedback collection, ratings breakdown, and public review submission flow (`/r/[token]`).
- **Embeddable Widget & Online Booking**: Widget snippet (`/widget.js`), floating booking button preview, and public booking wizard (`/book/[siteSlug]`).
- **Fully Persistent Practice Settings**: Six modular tabs (Practice, Reminders, Booking, Embed, Team, and Notifications) backed by database server actions and toast feedback.
- **Team Management**: Invite team members, assign roles (Owner, Admin, Staff), and manage access.
- **Dark Mode**: Built-in light/dark theme toggle support.

---

## 📋 Page Map

```mermaid
graph TD
    A[Landing / Login / Register] --> B[Onboarding Setup Wizard]
    B --> C[Dashboard /dashboard]
    C --> D[Patients /patients]
    C --> E[Appointments /appointments]
    C --> F[Inbox /inbox]
    C --> G[Campaigns /campaigns]
    C --> H[Reviews /reviews]
    C --> I[Templates /templates]
    C --> J[Settings /settings]
    
    J --> J1[Practice Tab]
    J --> J2[Reminders Tab]
    J --> J3[Booking Tab]
    J --> J4[Embed Tab]
    J --> J5[Team Tab]
    J --> J6[Notifications Tab]

    C --> K[Public Booking /book/:siteSlug]
    C --> L[Review Feedback /r/:token]
```

---

## 🔑 Demo Credentials

After seeding the database, you can log in with:
- **Email**: `demo@patientconnect.com`
- **Password**: `Demo@1234`
- **Practice**: Bright Smiles Dental (Default)

---

## 🛠️ Setup & Installation

### 1. Prerequisites
- Node.js 18+ (`pnpm` recommended)
- PostgreSQL database

### 2. Environment Variables
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgres://username:password@localhost:5432/dag_patient_connect"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
JWT_SECRET="your-super-secret-jwt-key"
```

### 3. Install Dependencies & Run Database Migrations/Seed
```bash
pnpm install
pnpm db:push
pnpm db:seed
```

### 4. Run Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔌 Extending with Real Twilio & Resend

Currently, SMS and Email messaging runs through an internal mock dispatcher. To integrate real providers (Twilio for SMS and Resend for Email):

1. **Install SDKs**:
   ```bash
   pnpm add twilio resend
   ```

2. **Add API Keys to `.env`**:
   ```env
   TWILIO_ACCOUNT_SID="your_twilio_sid"
   TWILIO_AUTH_TOKEN="your_twilio_token"
   TWILIO_PHONE_NUMBER="your_twilio_phone"
   RESEND_API_KEY="your_resend_api_key"
   RESEND_FROM_EMAIL="notifications@yourdomain.com"
   ```

3. **Update Dispatcher Logic (`src/features/messaging/`)**:
   - Replace mock `fetch` / log statements in `actions.ts` with calls to `twilioClient.messages.create(...)` and `resend.emails.send(...)`.

---

## 🧪 Testing & Building

- **Type Check & Build**:
  ```bash
  pnpm build
  ```
- **Linting**:
  ```bash
  pnpm lint
  ```
