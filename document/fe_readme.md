# OHS Remote Frontend

React app for purchasing Occupational Health & Safety manuals online. Users walk through a 5-step wizard — pick a plan, upload a logo, enter company/industry details, preview and sign the document, and pay via Stripe — then download the generated DOCX from a protected user dashboard. An admin surface at `/admin` covers order review, SJP content editing, customers, email logs, and settings.

This repo is the frontend only. It expects a companion backend (`ohs_remote`) running on `http://localhost:8000`.

---

## First-run checklist

If you have never run this repo before, do these in order:

1. Install **Node 20 LTS** and **npm** → see [`GETTING_STARTED.md`](./GETTING_STARTED.md) §1.
2. Start the backend (`ohs_remote`) on `:8000` → backend repo README.
3. `npm install` in this repo.
4. `npm run dev` and open http://localhost:8080 (the dev server runs on **8080**, not 5173).
5. Verify the setup → [`GETTING_STARTED.md`](./GETTING_STARTED.md) §6.

If anything goes wrong, jump straight to [`docs/TROUBLESHOOTING.md`](./docs/TROUBLESHOOTING.md).

---

## Documentation index

Organised by what you are trying to do.

### Setting up

- [`GETTING_STARTED.md`](./GETTING_STARTED.md) — the canonical first-run walkthrough. Prerequisites, install, backend dependency, verification checklist, values you need.
- [`docs/TROUBLESHOOTING.md`](./docs/TROUBLESHOOTING.md) — symptom-first fixes for the dev server, auth loops, CORS, Stripe, and backend pointing.

### Understanding the system

- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — routing shells, state model, data flow, folder conventions, and what is deliberately not in the codebase.
- [`docs/API_INTEGRATION.md`](./docs/API_INTEGRATION.md) — how the frontend talks to the backend (`authFetch` / `handleResponse` / `ApiError`, cookie auth, 401 flow).
- [`CHANGELOG.md`](./CHANGELOG.md) — what has shipped and what is pending.

### Building features

- [`docs/DEVELOPMENT_GUIDE.md`](./docs/DEVELOPMENT_GUIDE.md) — cookbook. Add a page, add an API call, add a component, add a wizard step, add an env var.
- [`docs/STYLING_GUIDE.md`](./docs/STYLING_GUIDE.md) — the two themes, tokens, typography, cards, buttons, forms, motion, and behavioral UI rules. **Read this before touching any markup.**
- [`docs/TESTING_GUIDE.md`](./docs/TESTING_GUIDE.md) — Vitest setup, file conventions, mocking policy. Honest about the current (empty) coverage.

### Backend contracts

- [`docs/API_DOCUMENTATION.md`](./docs/API_DOCUMENTATION.md) — user wizard and order-flow endpoints.
- [`docs/API_USER_DASHBOARD_DOCS.md`](./docs/API_USER_DASHBOARD_DOCS.md) — user dashboard endpoints (auth, orders list, order detail, payment retry, known gaps).
- [`docs/ADMIN_API.md`](./docs/ADMIN_API.md) — admin surface.
- [`docs/SJP_FRONTEND_GUIDE.md`](./docs/SJP_FRONTEND_GUIDE.md) — SJP purchase paths, admin review workflow, polling behavior.

### Claude Code context

- [`CLAUDE.md`](./CLAUDE.md) — loaded automatically by Claude Code. Architecture pointers + link to the styling guide.

---

## Tech stack

| Area | Choice | Notes |
|---|---|---|
| Build | Vite 5 (`@vitejs/plugin-react-swc`) | Dev server on port 8080. |
| UI | React 18 + TypeScript (lax) | `@` → `src/`. |
| Router | `react-router-dom` v6 | Three layout shells: wizard, dashboard, admin. |
| Server state | `@tanstack/react-query` v5 | Dashboard + admin. Wizard uses imperative calls. |
| Forms | `react-hook-form` + `zod` | Via `@hookform/resolvers`. |
| Styling | Tailwind 3 + CSS variables | Two themes (dark + light/wizard). shadcn/ui in `src/components/ui/`. |
| Animation | `framer-motion` | Every card/section has an entrance animation. |
| Toasts | `sonner` | `position="bottom-right"`. |
| Icons | `lucide-react` | No other icon libraries. |
| Testing | Vitest + jsdom + Testing Library | Infrastructure only — no real suite yet. |

Full list in [`package.json`](./package.json).

---

## Useful commands

All defined in `package.json:scripts`.

| Command | What it does |
|---|---|
| `npm run dev` | Start Vite dev server on `:8080`. |
| `npm run build` | Production build to `dist/`. |
| `npm run build:dev` | Development-mode build (source maps, no minification). |
| `npm run preview` | Serve the last build locally. |
| `npm run lint` | Run ESLint. |
| `npm run test` | Run Vitest once. |
| `npm run test:watch` | Run Vitest in watch mode. |

There is no typecheck script; use `npx tsc --noEmit`.

---

## Repo layout

```
.
├── src/                  # App source — see docs/ARCHITECTURE.md §2
│   ├── pages/            # Route-level components (wizard/, dashboard/, admin/)
│   ├── components/       # ui/ (shadcn), layout/, landing/, dashboard/, admin/, auth/
│   ├── context/          # WizardContext, AuthContext, AdminAuthContext
│   ├── services/         # api.ts (user) + adminApi.ts (admin)
│   ├── hooks/            # useOrders, useOrderDetail, useSjpStatus, admin/…
│   ├── lib/              # Pure helpers (utils, downloadDocument, statusMaps, …)
│   ├── data/             # Static seed data (mockData.ts)
│   └── test/             # Vitest setup + one placeholder
├── docs/                 # See documentation index above
├── public/               # Static assets served by Vite
├── index.html            # Vite entry HTML
├── vite.config.ts        # Dev server port, plugins, path alias
├── tailwind.config.ts    # Theme tokens (referenced by src/index.css)
├── tsconfig*.json        # TypeScript config
├── vitest.config.ts      # Test runner config
├── GETTING_STARTED.md    # First-run walkthrough
├── CHANGELOG.md          # Release history
├── CLAUDE.md             # Claude Code context
└── README.md             # You are here
```

---

## Known limitations

Short version — see [`CHANGELOG.md`](./CHANGELOG.md) §"Known limitations" for the full list.

- **API base URL is hardcoded** in `src/services/api.ts:1` and `src/services/adminApi.ts:3`. No `VITE_API_URL` yet.
- **No client-side Stripe.js.** The frontend redirects to the Stripe-hosted checkout URL.
- **No real test suite.** Infrastructure is wired up; tests are not written.
- **No CI.** Lint and tests run locally only.

---

## Companion backend

`ohs_remote` — expected to be running at `http://localhost:8000` during development. Follow its README for setup and for the seeded admin credentials.

---

## Contact

Questions, corrections, missing docs → open an issue against this repo or ask in the team channel.
