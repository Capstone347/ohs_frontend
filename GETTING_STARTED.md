# Getting Started

This is the canonical first-run walkthrough for the OHS Remote frontend. If you follow it end to end you will have a running dev build of the app talking to a local backend.

Read this **before** `docs/ARCHITECTURE.md` or `docs/DEVELOPMENT_GUIDE.md` — those assume the setup below has been done.

---

## 1. Prerequisites

You need three things installed on your machine. If you already have them, skip to section 2.

### 1.1 Node.js 20 LTS

We target Node 20 LTS. The repo does not ship an `.nvmrc`, so you are responsible for installing it yourself.

**Recommended: install via `nvm`.**

- macOS / Linux: https://github.com/nvm-sh/nvm#installing-and-updating
- Windows: https://github.com/coreybutler/nvm-windows#installation--upgrades

Then:

```bash
nvm install 20
nvm use 20
node --version   # should print v20.x.x
```

If you do not want nvm, install Node 20 directly from https://nodejs.org/en/download.

### 1.2 npm

Ships with Node. Verify:

```bash
npm --version
```

**Important:** the repo contains both `package-lock.json` and a leftover `bun.lockb`. **Use npm.** The bun lockfile is stale and should be ignored. Do not run `bun install`.

### 1.3 Git

https://git-scm.com/downloads — any recent version.

---

## 2. Clone the repo

```bash
git clone <your-fork-or-upstream-url> ohs_frontend
cd ohs_frontend
```

---

## 3. Install dependencies

```bash
npm install
```

This installs everything listed in `package.json`. First install is slow (~2–3 min). You can ignore any peer-dependency warnings as long as the command exits with code 0.

---

## 4. Run the backend

The frontend is not useful on its own — it expects a REST API at `http://localhost:8000/api/v1`. Get the backend running first.

- **Backend repo:** `ohs_remote` (companion repository).
- **Expected base URL:** `http://localhost:8000/api/v1`.
- **Expected admin base URL:** `http://localhost:8000/api/v1/admin`.

Follow the backend's own README to start it. A healthy backend should respond with 200 to:

```bash
curl http://localhost:8000/api/v1/health
```

If that command fails, stop here and fix the backend before continuing. None of the frontend flows will work without it.

### 4.1 Pointing at a different backend

The base URL is **hardcoded today**. There is no `VITE_API_URL` or `.env` file. If you need to point at a non-local backend (staging, ngrok tunnel, a teammate's machine), you currently must edit two files:

- `src/services/api.ts` — line 1 (`API_BASE_URL`)
- `src/services/adminApi.ts` — line 3 (`API_BASE_URL`)

This is a known limitation. Do **not** commit those edits. A future pass will move these into an env var — see `docs/DEVELOPMENT_GUIDE.md` §"Add an env var" for the planned convention.

---

## 5. Start the dev server

```bash
npm run dev
```

Vite will print something like:

```
  VITE v5.4.x  ready in ### ms

  ➜  Local:   http://localhost:8080/
  ➜  Network: http://<your-lan-ip>:8080/
```

Open http://localhost:8080 in your browser.

> The dev server runs on **port 8080**, not 5173. Older docs may say 5173 — that is wrong. See `vite.config.ts`.

---

## 6. Verify the setup

Run through this checklist. Every step should work before you consider the setup done.

1. Landing page loads at http://localhost:8080 — you see the dark-themed marketing hero.
2. Click "Sign In" (or navigate to `/login`). Enter an email. Click the OTP button.
3. Check your backend logs — the OTP is printed there in dev. Copy it into the frontend form.
4. You land on the user dashboard at `/dashboard/orders`. This confirms cookie-session auth is working.
5. Click "Start a new order" (or navigate to `/app/step-1`). You should see the wizard shell with a light theme and a step indicator.
6. Open the browser devtools Network tab. Each step should issue calls to `http://localhost:8000/api/v1/...` and receive 200 responses.
7. For admin, navigate to `/admin/login` and sign in with credentials seeded by the backend. You should land on the admin dashboard.

If any step fails, go to `docs/TROUBLESHOOTING.md`. It is organised by symptom, not by cause.

---

## 7. Useful commands

All defined in `package.json:scripts`.

| Command | What it does |
|---|---|
| `npm run dev` | Start Vite dev server on :8080. |
| `npm run build` | Production build to `dist/`. |
| `npm run build:dev` | Development-mode build (source maps, no minification). |
| `npm run preview` | Serve the last `build` output locally. |
| `npm run lint` | Run ESLint across the repo. |
| `npm run test` | Run Vitest once (headless). |
| `npm run test:watch` | Run Vitest in watch mode. |

There is no `typecheck` script today. If you want to run the TS compiler, use `npx tsc --noEmit`.

---

## 8. Summary — values you need

Everything the frontend talks to, and where the value lives today. This is the first table to consult when your setup misbehaves.

| What | Where it comes from | Where it lives in the frontend |
|---|---|---|
| Backend base URL (user) | Running `ohs_remote` backend on port 8000 | Hardcoded at `src/services/api.ts:1` |
| Backend base URL (admin) | Same backend, `/admin` path prefix | Hardcoded at `src/services/adminApi.ts:3` |
| User session cookie | Set by backend after OTP verification | Sent automatically by `authFetch` via `credentials: 'include'` |
| Admin session cookie | Set by backend after password login | Same as above |
| Stripe publishable key | Returned by `GET /payments/stripe/config` from the backend | Fetched at runtime via `api.getStripeConfig()` — **no frontend env var needed** |
| Admin test credentials | Seeded by the backend | See the backend repo's README |
| OTP codes for test logins | Printed in backend logs during dev | Copy from backend stdout |

No `.env` file is required today. Nothing needs to be created on your machine beyond the repo clone.

---

## 9. What to read next

- New to the codebase? → `docs/ARCHITECTURE.md`.
- About to build a feature? → `docs/DEVELOPMENT_GUIDE.md`.
- Want to match the visual style? → `docs/STYLING_GUIDE.md`.
- Hit an error? → `docs/TROUBLESHOOTING.md`.
- Need to understand how the frontend talks to the backend? → `docs/API_INTEGRATION.md`.
