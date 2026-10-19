# PrimeTurf

**A modern turf and sports facility booking platform** built to make discovering, scheduling, and managing sports sessions simpler for players and facility administrators.

PrimeTurf brings the customer booking journey and day-to-day venue operations into one responsive web application. Players can choose a sport, select available time slots, submit a booking with UPI payment details, and track its status. Administrators can manage bookings and cancellations alongside venue availability, pricing, maintenance, equipment, and gallery content.

> **Project status:** This repository contains a React/Vite frontend integrated with Supabase. UPI payments are submitted for manual administrator verification; this is not an automated payment-gateway integration.

## Contents

- [What PrimeTurf Does](#what-primeturf-does)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Application Structure](#application-structure)
- [Getting Started](#getting-started)
- [Supabase Configuration](#supabase-configuration)
- [Booking Lifecycle](#booking-lifecycle)
- [Available Scripts](#available-scripts)
- [Security and Deployment Notes](#security-and-deployment-notes)
- [Roadmap Ideas](#roadmap-ideas)

## What PrimeTurf Does

Finding a convenient sports slot should not require back-and-forth calls or manual tracking. PrimeTurf provides a single interface for players to explore the venue, view sport-specific rates, select a date and time, and follow their bookings. A separate admin experience helps the venue team handle reservations and operational changes from the same application.

The codebase currently models **Football, Cricket, and Pool** booking options. Football and Cricket share one physical court in the booking logic, so a confirmed reservation for either sport blocks the corresponding court slot.

## Features

### For players

- **Venue discovery:** A home page featuring venue categories, facilities, equipment, and highlights.
- **Date and time selection:** Browse bookable dates and select one or more available slots.
- **Sport-aware pricing:** View rates by time of day, with configurable weekend surcharges.
- **UPI payment handoff:** Display a UPI QR code for the booking total and submit the booking for admin verification.
- **Booking status and receipts:** View bookings and open a booking receipt page.
- **Booking cancellation requests:** Submit a reason for cancellation and wait for an administrator's decision.
- **Waitlists:** Join a waitlist when a slot is already booked.
- **Loyalty tiers:** Booking-count-based Bronze, Silver, and Gold tiers are represented in the app, with discounts calculated from the user's tier.
- **Photo gallery:** Explore venue and sports-facility images.
- **Account access:** Sign up or sign in with email/password, with Google sign-in support configured through Supabase Auth.
- **Theme preference:** Switch between light and dark themes; the selected theme is saved locally.
- **Venue announcements:** See an administrator-controlled broadcast or closure notice.

### For administrators

- **Booking overview:** Review bookings and filter the list by relevant booking attributes.
- **Booking status management:** Update booking states after reviewing payment.
- **Cancellation review:** Approve or reject cancellation requests.
- **Pricing management:** Update morning, afternoon, and evening prices, including the weekend surcharge setting.
- **Venue status controls:** Mark the venue open or closed and display a reason or reopening date.
- **Maintenance scheduling:** Block specific dates and hours when the facility is unavailable.
- **Facility configuration:** Manage listed features and available equipment.
- **Gallery management:** Upload images to Supabase Storage and manage their gallery records.
- **Broadcast messaging:** Publish a venue notice through the shared status/banner experience.
- **Live booking refresh:** Supabase Realtime subscriptions refresh booking data when booking records change.

> Feature availability depends on a correctly configured Supabase project, database schema, Storage bucket, Auth providers, and access policies.

## Technology Stack

| Technology | Role |
| --- | --- |
| React 19 | Component-based user interface |
| Vite 8 | Local development server and production bundler |
| React Router 7 | Client-side navigation using a hash router |
| Tailwind CSS 4 | Utility-first styling and responsive layouts |
| Supabase | Authentication, Postgres data access, Storage, and Realtime |
| `lucide-react` | Interface icons |
| ESLint | Code linting |

The project is written in JavaScript with JSX. It does not currently use a separate Node/Express API in this repository; the frontend communicates with Supabase through the Supabase JavaScript client.

## Application Structure

```text
PrimeTurf/
├── public/                  # Static images, icons, and venue gallery assets
├── src/
│   ├── components/          # Shared UI and booking components
│   │   ├── BookingSummary.jsx
│   │   ├── BroadcastBanner.jsx
│   │   ├── Footer.jsx
│   │   ├── Navbar.jsx
│   │   ├── PhotoGallery.jsx
│   │   ├── ReceiptCard.jsx
│   │   └── SlotGrid.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Book.jsx
│   │   ├── Login.jsx
│   │   ├── MyBookings.jsx
│   │   ├── Receipt.jsx
│   │   ├── Gallery.jsx
│   │   ├── Admin.jsx
│   │   └── AdminLogin.jsx
│   ├── App.jsx              # Routes and shared page layout
│   ├── AppContext.jsx       # Shared booking, pricing, venue, and UI state
│   ├── AuthContext.jsx      # Supabase session and profile state
│   ├── supabaseClient.js    # Supabase client initialization
│   ├── index.css            # Global styles and Tailwind integration
│   └── main.jsx             # React entry point and providers
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Getting Started

### Prerequisites

- Node.js compatible with the installed Vite version
- npm
- A Supabase project configured for the tables and services used by the application

### 1. Clone the repository

```bash
git clone https://github.com/hemantsureshrathod-dev/PrimeTurf.git
cd PrimeTurf
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Supabase

The app initializes the Supabase client in `src/supabaseClient.js`. Before running your own deployment, configure the project URL and publishable/anonymous client key for your Supabase project. See [Supabase Configuration](#supabase-configuration).

For a production-ready setup, move these values to Vite environment variables rather than hard-coding them in source.

### 4. Run the development server

```bash
npm run dev
```

Vite will print the local URL in the terminal (typically `http://localhost:5173`).

### 5. Build and preview

```bash
npm run build
npm run preview
```

## Supabase Configuration

PrimeTurf uses Supabase Auth and queries several Postgres tables directly from the client. The current code references the following tables:

| Table | Purpose |
| --- | --- |
| `profiles` | User profile details and the `is_admin` role flag |
| `bookings` | Booked dates, slots, amounts, status, and associated user |
| `pricing` | Sport-specific time-of-day rates and weekend surcharge percentage |
| `turf_status` | Venue open/closed state, closure reason, reopening date, and announcement text |
| `maintenance_blocks` | Date/time ranges unavailable for maintenance |
| `features` | Facility features and their enabled state |
| `equipment` | Equipment listed for the venue |
| `gallery_photos` | Gallery image URLs, captions, and upload metadata |
| `waitlist` | Users waiting for a booked slot |
| `notifications` | Booking and account activity notifications |
| `cancellation_requests` | Cancellation requests and administrator decisions |

The admin gallery flow also expects a Supabase Storage bucket named `gallery`.

### Authentication setup

1. Enable the authentication providers you intend to use in Supabase Auth (email/password and Google are referenced in the UI).
2. Ensure user profile records are created and associated with authenticated user IDs.
3. Grant administrator access only to trusted accounts by setting `profiles.is_admin = true` for the relevant user.
4. Configure appropriate Row Level Security (RLS) policies for every table and Storage bucket before exposing the app publicly.

**Important:** The table list above is derived from the application code; this repository does not include a complete SQL schema or a verified RLS policy set. You must create and validate those in your Supabase project before expecting every workflow to function correctly.

### Recommended environment-variable setup

For local development, you can replace the hard-coded client initialization with environment variables.

Create a `.env.local` file in the project root:

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
```

Then update `src/supabaseClient.js` to read them:

```js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
```

Restart the Vite server after changing environment variables. Do not put a Supabase **service-role key** or any other privileged secret in frontend code. Client-side Vite variables are bundled into the browser and are not secret.

## Booking Lifecycle

The current user flow is designed around manual UPI verification:

1. The player signs in and opens the booking page.
2. The player chooses a sport, date, and available time slot(s).
3. PrimeTurf calculates the amount using the configured time-of-day rate, any weekend surcharge, and applicable loyalty discount.
4. The app displays a UPI QR code with the booking amount.
5. After paying externally, the player selects **I Have Paid**. The app creates a booking with a pending-payment status.
6. The administrator reviews the payment and updates the booking status.
7. The player can check the status in **My Bookings** or view the booking receipt.

The application also supports cancellation requests and a waitlist for booked slots.

**Payment limitation:** Pressing **I Have Paid** records the user's submission; it does not independently verify that money reached the venue's bank account. A proper payment-provider integration with server-side verification and signed webhooks would be needed for automated payment confirmation.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local Vite development server |
| `npm run build` | Build the production frontend into `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint checks |

## Security and Deployment Notes

Before using PrimeTurf with real customers:

- **Add and verify RLS policies.** Client-side role checks are not a substitute for database authorization. Protect bookings, profile records, cancellations, notifications, pricing, and admin-managed tables at the database level.
- **Move configuration to environment variables.** Keep deployment-specific values out of source control. The Supabase browser key is intended for client use only when paired with correctly configured RLS; never expose service-role credentials.
- **Enforce slot integrity server-side.** Client-side availability can become stale when multiple users book simultaneously. Use database constraints or a transactional server-side function to prevent overlapping bookings.
- **Verify UPI payments independently.** A user-entered payment confirmation should remain pending until an administrator or trusted payment provider confirms it.
- **Review authorization paths.** Make sure admin operations are secured by database policies or trusted server-side checks, not only by hiding UI controls.
- **Test before deployment.** Run the production build, lint the code, and validate authentication, booking, cancellation, uploads, and admin operations against a non-production Supabase project.

## Roadmap Ideas

Potential next steps for the project include:

- Add a documented SQL migration and RLS policies for a repeatable Supabase setup.
- Move slot availability checks and booking creation into a transactional server-side operation.
- Integrate a payment provider for verified payment status and webhook handling.
- Add automated tests for pricing calculations, slot conflicts, and booking state transitions.
- Add a deployment guide and screenshots of the player and admin experiences.

## Contributing

Issues and pull requests are welcome. For substantial changes, open an issue first to discuss the proposed improvement. Keep pull requests focused and include steps to reproduce or verify user-facing changes.

## License

No license file is currently included in this repository. Unless a license is added, the code should not be assumed to be available for reuse, redistribution, or modification under an open-source license.
