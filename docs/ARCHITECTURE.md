# Architecture

This document explains the shape of the codebase: how routing, state, data fetching, and folder conventions fit together. It is not a line-by-line walkthrough — read the code for that. The goal is to give you enough mental model that when you open any file you roughly know what it is and where it should live.

Prerequisite: the app is running per `GETTING_STARTED.md`.

---

## 1. Tech stack

| Area | Choice |
|---|---|
| Build tool | Vite 5 (`@vitejs/plugin-react-swc`) |
| Framework | React 18 |
| Language | TypeScript (lax config — see `tsconfig.json`) |
| Router | `react-router-dom` v6 |
| Server state | `@tanstack/react-query` v5 |
| Forms | `react-hook-form` + `zod` via `@hookform/resolvers` |
| Styling | Tailwind CSS + CSS variables, theme primitives in `src/index.css` |
| UI primitives | shadcn/ui (Radix under the hood), all in `src/components/ui/` |
| Animation | `framer-motion` |
| Toasts | `sonner` |
| Testing | Vitest + jsdom + Testing Library |

Path alias `@` → `src/` is set in both `vite.config.ts` and `tsconfig.json`. Prefer `@/components/ui/button` over relative paths.

---

## 2. `src/` layout

```
src/
├── main.tsx              # Vite entry; mounts <App />
├── App.tsx               # Provider tree + all routes
├── index.css             # Tailwind layers + CSS variables + custom utilities
├── pages/                # Route-level components. One file per URL.
│   ├── Index.tsx         # Landing
│   ├── Login.tsx         # User OTP login
│   ├── Success.tsx       # Post-wizard confirmation
│   ├── OrderPayment.tsx  # Stripe redirect target (pre-payment)
│   ├── OrderSuccess.tsx  # Stripe redirect target (post-payment)
│   ├── NotFound.tsx      # 404
│   ├── wizard/           # Step1.tsx – Step5.tsx
│   ├── dashboard/        # DashboardOrders, OrderDetail
│   └── admin/            # Admin*.tsx pages
├── components/
│   ├── ui/               # shadcn primitives (button, card, dialog, …)
│   ├── layout/           # WizardShell, DashboardShell, header/footer
│   ├── landing/          # Marketing sections (hero, features, pricing, …)
│   ├── dashboard/        # User dashboard widgets, order tables
│   ├── admin/            # AdminShell, AdminProtectedRoute, sjp/ panel
│   ├── auth/             # ProtectedRoute
│   ├── NavLink.tsx
│   └── PaymentMethodBadges.tsx
├── context/
│   ├── WizardContext.tsx      # Wizard flow state (useWizard)
│   ├── AuthContext.tsx        # User session (useAuth)
│   └── AdminAuthContext.tsx   # Admin session
├── services/
│   ├── api.ts            # User-facing REST client + ApiError + authFetch
│   └── adminApi.ts       # Admin REST client (same patterns, /admin path)
├── hooks/                # Reusable hooks (useOrders, useOrderDetail, useSjpStatus, admin/)
├── lib/                  # Pure helpers (utils, downloadDocument, ipUtils, *StatusMaps, provinceMapping)
├── data/                 # Static client-side data (mockData.ts — plans, provinces, mock orders)
└── test/                 # Vitest setup + one placeholder test
```

---

## 3. Routing

Routes are declared centrally in `src/App.tsx`. There is no file-based routing. Three shells give three surfaces:

### Public / unauthenticated

| Path | Component | Notes |
|---|---|---|
| `/` | `Index` | Dark-themed marketing landing. |
| `/login` | `Login` | User OTP login. |
| `/admin/login` | `AdminLogin` | Admin password login. |
| `*` | `NotFound` | Catch-all 404. |

### Wizard (`WizardShell`, light theme)

| Path | Component |
|---|---|
| `/app/step-1` … `/app/step-5` | `Step1` … `Step5` |
| `/app/success` | `Success` |

`/app/orders` redirects to `/dashboard/orders` for backwards compatibility.

### User dashboard (`DashboardShell`, wrapped in `ProtectedRoute`)

| Path | Component |
|---|---|
| `/dashboard/orders` | `DashboardOrders` |
| `/dashboard/orders/:orderId` | `OrderDetail` |

`ProtectedRoute` (`src/components/auth/ProtectedRoute.tsx`) reads `AuthContext` and redirects to `/login` if the user is not authenticated.

### Stripe redirects (standalone)

| Path | Component | Purpose |
|---|---|---|
| `/orders/:orderId/payment` | `OrderPayment` | Where Stripe sends the user back on cancel. |
| `/orders/:orderId/success` | `OrderSuccess` | Where Stripe sends the user back on success. |

### Admin (`AdminShell`, wrapped in `AdminAuthProvider` + `AdminProtectedRoute`)

| Path | Component |
|---|---|
| `/admin` (index) | `AdminDashboard` |
| `/admin/orders` | `AdminOrders` |
| `/admin/orders/:orderId` | `AdminOrderDetail` |
| `/admin/pending-review` | `AdminPendingReview` |
| `/admin/customers` | `AdminCustomers` |
| `/admin/customers/:customerId` | `AdminCustomerDetail` |
| `/admin/email-logs` | `AdminEmailLogs` |
| `/admin/settings` | `AdminSettings` |

Admin has its own auth context so it can be mounted independently and does not share session state with the user auth flow.

### Provider tree (top to bottom in `App.tsx`)

```
QueryClientProvider
  TooltipProvider
    WizardProvider
      <Sonner />
      BrowserRouter
        AuthProvider
          Routes…
            (/admin branch wraps in AdminAuthProvider)
```

`WizardProvider` wraps everything because the wizard state needs to survive navigation into/out of `/dashboard` (e.g. "continue last order"). Auth providers sit inside the router so they can call `navigate`.

---

## 4. State model

Three concerns, three places.

### 4.1 Wizard flow state → `WizardContext`

`src/context/WizardContext.tsx` exposes `useWizard()`. It is a plain React Context, not Zustand/Redux. It tracks everything the 5-step flow needs to remember as the user moves between steps:

- Plan selection: `selectedPlan`, `hasIndustryAddOn`, `apiPlans` (fetched from the backend on Step 1)
- Branding: `logoFile`, `logoPreview`
- Company: `province`, `naicsCodes` (array), `businessDescription`, `companyName`
- User: `userEmail`, `fullName`
- Legal: `tocGenerated`, `disclaimerAccepted`, `signatureName`, `signatureDate`
- IDs from the backend: `orderId`, `documentId`

Helpers: `resetWizard()`, `getTotalPrice()`, `isSjpOnlyPlan()`, `isLogoOptional()`.

The context is intentionally dumb — it does not call the API. Each step calls `api.*` directly and writes the result back through the setters. If you need to persist wizard state across page reloads, that is currently **not** implemented.

### 4.2 Session state → `AuthContext` and `AdminAuthContext`

Both contexts follow the same pattern:

1. On mount, call `api.getMe()` / `adminApi.getMe()` to hydrate from the session cookie.
2. Expose `user` / `admin`, `isAuthenticated`, `login(…)`, `logout()`.
3. Listen for a custom `auth:unauthorized` / `admin-auth:unauthorized` window event (dispatched by `handleResponse` on 401) and clear state + redirect to login.

This is how 401s propagate from the API layer back to the UI without every component having to care.

### 4.3 Server state → TanStack Query

The dashboard and admin surfaces use `@tanstack/react-query` via a shared `QueryClient` in `App.tsx`. Lookups live in `src/hooks/` (`useOrders`, `useOrderDetail`, `useSjpStatus`, `admin/…`) and call the `api` / `adminApi` clients. The wizard itself does **not** use React Query — it uses imperative `api.*` calls because each step writes to `WizardContext` as a side effect.

Rule of thumb: if the caller just needs to read data, wrap it in a query hook under `src/hooks/`. If the caller is part of the wizard flow, call `api.*` directly from the step and update `WizardContext`.

---

## 5. Data flow: component → backend → component

Every request goes through `authFetch` in `src/services/api.ts` (or `adminApi.ts`). The pipeline:

```
component
  └─ calls api.someMethod(args)
       └─ authFetch(url, { credentials: 'include', … })
            └─ fetch(…)
                 └─ handleResponse(res)
                      ├─ 2xx → res.json() as typed T
                      ├─ 401 → dispatch 'auth:unauthorized' event, throw ApiError
                      └─ 4xx/5xx → throw new ApiError(status, message, details)
component (caller)
  └─ try/catch: on success, update context or React Query cache
                on ApiError, show toast (sonner) + maybe set local error state
```

Key properties:

- **Cookies carry auth.** The backend sets an `auth_session` httpOnly cookie; the frontend never reads or sends a token manually. Every API call uses `credentials: 'include'`.
- **401 is a global event.** `handleResponse` dispatches `auth:unauthorized` on 401 so `AuthContext` can clear state and kick the user to `/login`. You do not need to handle 401 locally unless you want a custom UX.
- **`ApiError` is the canonical error type.** It carries `status`, `message`, and optional `details`. Components catch it to show specific messages.

For an end-to-end example of adding a new endpoint, see `docs/DEVELOPMENT_GUIDE.md` §"Add a new API call". For the endpoint contracts themselves, see `docs/API_DOCUMENTATION.md` (user) and `docs/ADMIN_API.md` (admin).

---

## 6. Folder conventions

When you are about to create a new file, use this table to decide where it goes:

| It is… | Put it in | Example |
|---|---|---|
| A full URL destination | `src/pages/<area>/` | `src/pages/dashboard/OrderDetail.tsx` |
| A layout shared by several pages | `src/components/layout/` | `WizardShell.tsx` |
| A shadcn/ui primitive | `src/components/ui/` | `button.tsx` — only via `npx shadcn-ui@latest add` |
| A feature-specific component reused within one area | `src/components/<area>/` | `src/components/dashboard/OrdersTable.tsx` |
| A landing-page section | `src/components/landing/` | `Hero.tsx`, `Pricing.tsx` |
| A REST call | `src/services/api.ts` (user) or `adminApi.ts` (admin) | `createOrder(data)` |
| A React Query wrapper around a REST call | `src/hooks/` | `useOrders.ts` |
| Pure helper / formatter / mapper | `src/lib/` | `provinceMapping.ts` |
| App-wide state | `src/context/` | `WizardContext.tsx` |
| Static seed data | `src/data/` | `mockData.ts` |
| Test file | Colocated next to the unit under test, `.test.ts(x)` suffix | — |

Rules that apply everywhere:

- **Use the `@` alias.** Do not write `../../components/ui/button`.
- **Do not hardcode colors.** Use semantic tokens from `tailwind.config.ts` / `src/index.css`. See `docs/STYLING_GUIDE.md`.
- **Pick one theme per page.** Dark (`bg-bg-dark`) or light/wizard (`bg-wizard-bg`). Do not mix within a page.
- **shadcn/ui is the component library.** Do not install MUI, Chakra, or another component kit.

---

## 7. Styling (50-foot view)

Two themes:

- **Dark** — landing, login, admin login, footer. Token prefix `bg-bg-…`, `text-text-light`, `border-border-dark`.
- **Light / wizard** — wizard steps, dashboard, admin, success pages. Token prefix `bg-wizard-…`, `text-wizard-text`, `border-wizard-border`.

The full token reference, typography rules, card patterns, button variants, form input spec, and motion conventions live in `docs/STYLING_GUIDE.md`. Do not duplicate them here.

---

## 8. What is not in the codebase (yet)

These are things a reader might look for and not find. Documented so you do not waste time searching:

- **No env vars.** `import.meta.env` is not used anywhere. Base URLs are hardcoded in `src/services/api.ts:1` and `src/services/adminApi.ts:3`. Migrating to `VITE_API_URL` is a known TODO.
- **No `@stripe/stripe-js`.** The frontend redirects to the Stripe-hosted checkout URL returned by the backend. There is no embedded Elements UI yet.
- **No real test suite.** `src/test/example.test.ts` is a placeholder. See `docs/TESTING_GUIDE.md` for how to add real coverage.
- **No CI.** There is no `.github/workflows/` directory. Lint and tests are run locally.
- **No Dockerfile.** The supported dev path is native Node 20 + npm.
- **No wizard persistence.** Refreshing the page mid-wizard loses in-memory state (except for `orderId` which is already on the backend).
