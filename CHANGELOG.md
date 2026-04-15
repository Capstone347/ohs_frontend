# Changelog

All notable changes to the OHS Remote frontend are recorded here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) once releases are tagged.

There are **no tagged releases yet**. Everything up to and including the demo cut is grouped under the single historical `0.1.0 — project demo` entry; ongoing work since then sits under `Unreleased`.

---

## [Unreleased]

### Added

- **Admin dashboard surface.** New admin-only routes under `/admin` (dashboard, orders, pending review, customers, email logs, settings), an `AdminShell` layout, `AdminAuthProvider` / `AdminProtectedRoute`, and a dedicated `src/services/adminApi.ts` client using the same `authFetch` / `handleResponse` / `ApiError` pattern as the user API. Admin surface has independent session state and its own `admin-auth:unauthorized` 401 event.
- **Multi-NAICS input in Step 3.** `NaicsChipInput` replaces the single-code input. Wizard context now tracks `naicsCodes: string[]` and sends them to the backend as `naics_codes`. Sidebar summary shows the first two codes with a `+N more` affordance. Each code must be 6 digits.
- **Industry add-on flag and business description wired into order creation.** `hasIndustryAddOn` and `businessDescription` from the wizard now flow through `api.createOrder` / `api.updateCompanyDetails` instead of being local-only state.
- **SJP-only purchase path.** Step 1 now exposes an `industry_specific` plan that skips the generic manual flow and goes straight to SJP generation. `WizardContext` helpers `isSjpOnlyPlan()` and `isLogoOptional()` branch the rest of the wizard accordingly. See `docs/SJP_FRONTEND_GUIDE.md`.
- **User dashboard and OTP login.** New `/login` (OTP flow), `/dashboard/orders`, and `/dashboard/orders/:orderId` routes. `AuthContext` hydrates the session on mount via `api.getMe()` and listens for a global `auth:unauthorized` event dispatched by the API layer on 401. `DashboardShell` uses TanStack Query hooks (`useOrders`, `useOrderDetail`, `useSjpStatus`) for all server state.
- **Optional business description field** in the Industry section of the wizard.

### Changed

- **Stripe integration.** Switched from a client-side payment intent flow to the backend-driven Stripe Checkout Session flow. The frontend now fetches the publishable key via `api.getStripeConfig()` and redirects to the `checkout_url` returned by `api.createCheckoutSession(orderId)`. Success and cancel redirects land on `/orders/:orderId/success` and `/orders/:orderId/payment` respectively. Client-side Stripe Elements is deliberately **not** installed — see "Known limitations".
- **Icons.** Replaced all remaining emoji placeholders with `lucide-react` icons to match the design system.
- **Network reliability on Windows.** Fixed an issue where certain local backend URLs resolved inconsistently during the wizard flow.

### Documentation

- **Documentation overhaul (this pass).** Rewrote `README.md` as a lean router. Added `GETTING_STARTED.md`, `docs/ARCHITECTURE.md`, `docs/DEVELOPMENT_GUIDE.md`, `docs/STYLING_GUIDE.md`, `docs/TESTING_GUIDE.md`, `docs/TROUBLESHOOTING.md`, and `docs/API_INTEGRATION.md`. Moved the UI style guide out of `CLAUDE.md` into `docs/STYLING_GUIDE.md` (CLAUDE.md retains a pointer). Migrated `CHANGES.md` into this file and deleted the stale `QUICKSTART.md` (its content was wrong about the dev-server port and package manager).

### Known limitations

- **API base URL is hardcoded.** `src/services/api.ts:1` and `src/services/adminApi.ts:3` both hardcode `http://localhost:8000/api/v1`. A follow-up should introduce `VITE_API_URL`. See `docs/DEVELOPMENT_GUIDE.md` §"Add an env var".
- **No client-side Stripe.js.** `@stripe/stripe-js` is not installed. The checkout flow is redirect-only. Embedding Stripe Elements is a follow-up.
- **Document access-token refresh is missing on the backend.** Download links expire after a fixed window and there is no endpoint to regenerate them. Tracked in `docs/API_USER_DASHBOARD_DOCS.md` §"Known Gaps".
- **No real test suite.** `src/test/example.test.ts` is a placeholder. See `docs/TESTING_GUIDE.md`.
- **No CI.** Lint and tests run locally only.

---

## [0.1.0] — project demo

Initial public cut for the project demo. Captures the end-to-end wizard → preview → payment → download flow and the accompanying backend integration work. The original per-file notes from this period are preserved below for context; file-level line counts in this entry are historical and are no longer kept current.

### Added — API service layer

- `src/services/api.ts` — typed REST client covering plans, orders, company details (with file upload), document preview generation and download, legal acknowledgment, and payment intent creation. Custom `ApiError` class.
- `src/lib/provinceMapping.ts` — bidirectional province name ↔ code helpers.
- `src/lib/ipUtils.ts` — IP lookup for legal acknowledgment records.

### Added — wizard integration

- **Step 1** fetches plans on mount (`GET /plans`), collects user info, and creates the order (`POST /orders`). `orderId` is stored in `WizardContext`.
- **Step 2** collects the company name and optional logo into context for later submission.
- **Step 3** submits company details plus logo (`PATCH /orders/{id}/company-details`) and generates the preview document (`POST /orders/{id}/generate-preview`). `documentId` is stored in context.
- **Step 4** records legal acceptance including IP and user agent (`POST /legal/acknowledge`).
- **Step 5** creates the initial payment intent (`POST /payments/create-intent`). Full Stripe Elements integration intentionally deferred — superseded by the Checkout Session flow in `Unreleased`.
- **Success page** polls `GET /orders/{id}/summary` every 2 seconds (max 30 attempts) until `payment_status === 'paid'`, then downloads the final DOCX via the document access token.

### Added — supporting state and UX

- `WizardContext` extended with `orderId`, `documentId`, `userEmail`, `fullName`, `companyName`, and `apiPlans`, with corresponding setters.
- Type-safe request/response interfaces throughout the API layer.
- Loading indicators and disabled-button states on every step that hits the API.
- Client-side validation: email format, NAICS 2–6 digit bounds (at the time; the current multi-code version enforces 6 digits), required field checks.
- Toast-based error surfacing via `sonner`, backed by `ApiError` catches in each step.
- Status polling with a hard cap and graceful timeout on the success page.

### Known limitations at the time of the demo

- **Stripe**: payment intent created but checkout flow not completed on the client. (Superseded in `Unreleased`.)
- **Environment configuration**: API URL hardcoded; plan was `import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'`. (Still hardcoded in `Unreleased`.)
- **Preview download button** in Step 3 not wired up.
- **Payment webhook** was simulated on the frontend side pending real webhook handling.

### Security and CORS notes

- Legal acknowledgment records the user's IP and user agent.
- Document download tokens originally expired after 7 days.
- CORS must be enabled on the backend for the frontend origin.

---

## Maintenance notes

- When cutting the first tagged release, rename `Unreleased` to the version number and open a fresh `Unreleased` section above it.
- Group entries under the standard Keep-a-Changelog headings (`Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, `Security`, `Documentation`).
- Keep entries user-visible. Internal refactors and doc-only changes can go under `Documentation` or be omitted entirely.
- Do not re-number historical entries. If something in `0.1.0` turns out to be wrong, correct it in place and note the correction.
