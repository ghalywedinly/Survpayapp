# SurvPay

**Create surveys. Reward responses. Get insights.**

SurvPay is a bilingual (Arabic/English) SaaS platform for researchers, universities, product and marketing teams across Saudi Arabia and the GCC to create surveys, distribute a single link, automatically reward respondents, and turn responses into analytics and reports.

This is the Phase 1 build: researchers bring their own audience via a shared link. There is no participant marketplace — the codebase is intentionally architected so one can be layered on in a future phase without reshaping the core data model or services (see `prisma/schema.prisma` and "Architecture" below).

## Stack

- **Next.js 14** (App Router) + **TypeScript** + **Tailwind CSS**
- **Prisma** + **SQLite** (swap the `DATABASE_URL` for Postgres/MySQL in production — the schema is provider-agnostic)
- Hand-rolled UI primitives (no component library dependency) styled to a Stripe/Linear/Notion-inspired system
- **Recharts** for analytics, **pdf-lib** + **ExcelJS** for report export, **qrcode** for distribution QR codes
- Cookie-based credentials auth (bcrypt + signed session tokens) — structured so OAuth providers can be added later (`Account` model already present)
- Full custom i18n: `src/lib/i18n` — dictionary-driven, RTL-aware, no hardcoded strings in components

## Getting started

```bash
npm install
cp .env.example .env   # defaults are fine for local dev
npm run db:push        # create the SQLite schema
npm run db:seed        # seed realistic GCC demo data (5 surveys, 2,650+ responses)
npm run dev
```

Visit `http://localhost:3000` — you'll be redirected to `/en` (or `/ar` based on your browser language).

**Demo login:** `demo@survpay.com` / `Demo1234!` (organization: *Al Faisal Research Group*)

### Useful scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run db:push` | Sync the Prisma schema to the database |
| `npm run db:seed` | Seed demo data (safe to re-run — it clears and re-seeds) |
| `npm run db:reset` | Drop, recreate and re-seed in one step |

## Architecture

### Service layer

Business logic lives behind explicit services in `src/lib/services/`, matching the brief's separation:

```
SurveyService · ResponseService · RewardService · PaymentService
AnalyticsService · ReportService · NotificationService · AIService
```

Server Actions (`src/lib/actions/`) are thin — they authorize the request via `requireOrgContext()`, then delegate to a service. Nothing reaches the database directly from a page or component.

### Payment & reward abstraction

```
PaymentProvider  →  PaymentService  →  RewardService  →  SurveyCompletion
```

`PaymentProvider` and `RewardProvider` are interfaces (`src/lib/services/payment/`, `src/lib/services/reward/`) with mock implementations (`MockPaymentProvider`, `CashProvider` / `GiftCardProvider` / `CouponProvider`). No real money moves, no card data is ever collected, and no secret keys exist to leak — the interfaces are what a real Saudi-licensed payment provider would implement to go live. Researcher subscription billing, incentive-budget funding, respondent payouts and refunds are modeled as distinct records (`PaymentTransaction.purpose`, `RewardTransaction.type`) so they're never conflated in reporting.

### AI insights

`AIService` is a template-based ("mock") provider that reasons over real aggregated response data — it never fabricates findings, and returns `hasData: false` under a minimum response threshold. Every insight it produces is labeled as demo-generated in the UI. Swapping in a production LLM means implementing the same `generateSurveyInsights` contract.

### Internationalization

`src/lib/i18n/dictionaries/{en,ar}.ts` are the single source of truth for UI strings (typed against each other, so a missing Arabic key is a compile error). `src/app/[locale]/layout.tsx` sets `dir`/`lang` on `<html>`, loads locale-specific fonts (Inter / IBM Plex Sans Arabic), and RTL layout is handled with CSS logical properties (`ps-`, `pe-`, `text-start`, `border-s`, …) rather than mirrored one-off styles, so components genuinely flip rather than being visually patched.

### Public survey experience

`/s/[code]` is a standalone route tree (its own root layout, outside the researcher app's `[locale]` segment) so respondents get a clean URL and zero dashboard chrome. Response quality controls — duplicate prevention (persistent per-browser id), a lightweight rate limiter, attention-check validation, and a too-fast-to-be-real completion-time heuristic — live in `ResponseService.submit` and run before any reward is issued.

### Database

See `prisma/schema.prisma`. Every survey-scoped table carries `organizationId` (directly or via its parent), and every query in the service layer filters by the caller's organization — cross-tenant access isn't just unstyled, it's unreachable through the service API. `Participant*` models exist at the bottom of the schema for a future participant-network phase; nothing in Phase 1 reads or writes them.

## What's mocked vs. real

- **Real:** auth, sessions, survey CRUD, the question builder (12 types + conditional logic), publishing, response collection, duplicate/attention-check/rate-limit enforcement, budget math, analytics aggregation, PDF/Excel report generation, notifications.
- **Mocked, clearly labeled in the UI:** payment charges/payouts (`MockPaymentProvider`, instant and always-succeeds), AI insight generation (template-based, not an LLM call), email delivery (password reset and email verification show the action directly in the UI instead of sending mail, since no transactional email provider is configured in this environment).

## Repository layout

```
src/app/[locale]/            marketing site + researcher app (route groups: (auth), (app))
src/app/s/[code]/            public survey experience (own layout, no locale prefix)
src/app/api/                 report export + public submission route handlers
src/components/              ui/ (primitives), dashboard/, survey-builder/, survey-runtime/, marketing/
src/lib/services/            business logic
src/lib/actions/             server actions (thin wrappers over services)
src/lib/i18n/                dictionaries + provider
prisma/schema.prisma         data model
prisma/seed.ts               demo data generator
```
