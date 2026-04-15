# Troubleshooting

Symptom-first. Match on the error message or the visible behavior, then read the cause and the fix.

If your problem is not listed here, check `docs/GETTING_STARTED.md` §8 ("values you need") first — most first-run issues are caused by a missing piece of setup, not a bug in the code.

---

## Dev server will not start

### `Error: listen EADDRINUSE: address already in use 0.0.0.0:8080`

**Cause.** Something else is already bound to port 8080. `vite.config.ts:10` hardcodes the Vite dev server to 8080 — there is no CLI flag today that will override it cleanly.

**Fix.**

```bash
lsof -i :8080      # find the offender
kill -9 <pid>      # free the port
npm run dev        # retry
```

If you need to run the dev server on a different port temporarily, edit `vite.config.ts:10` locally but **do not commit** the change.

### "Old docs told me the server runs on port 5173. It does not."

**Cause.** `QUICKSTART.md` (now deleted) incorrectly said 5173. The actual port is **8080** per `vite.config.ts:10`.

**Fix.** Open http://localhost:8080. If you see any other doc still referencing 5173, it is stale — please fix it.

### `npm install` fails with peer-dependency errors

**Cause.** A stale `node_modules` from a different package-manager run (often because someone ran `bun install` earlier and the bun lockfile confused things).

**Fix.**

```bash
rm -rf node_modules package-lock.json
npm install
```

The `bun.lockb` file in the repo is stale and should be ignored. Do **not** run `bun install` — the canonical package manager is npm. See `GETTING_STARTED.md` §1.2.

---

## Authentication problems

### Every API call 401s and I get bounced to `/login`

**Cause.** `src/services/api.ts:handleResponse` dispatches an `auth:unauthorized` event on 401. `AuthContext` listens for it and clears the session, which redirects to `/login`.

The 401 itself has four common causes:

1. **The backend is not running.** Hit `http://localhost:8000/api/v1/health` in your browser — if that fails, start the backend.
2. **The session cookie was never set.** Check your browser's devtools → Application → Cookies for `http://localhost:8080`. You should see an `auth_session` cookie after OTP verification. If not, your browser is blocking third-party cookies, or the backend is not setting the cookie for your origin.
3. **The backend thinks the cookie is for a different origin.** Most commonly a CORS mismatch — see the next section.
4. **The session expired.** The backend defaults `auth_session` to a 1-hour Max-Age. Log in again.

### `Access to fetch at 'http://localhost:8000/...' has been blocked by CORS policy`

**Cause.** The backend must explicitly allow origin `http://localhost:8080` **and** `Access-Control-Allow-Credentials: true` (required because the frontend sets `credentials: 'include'`).

**Fix.** This is a backend configuration issue. Open the backend repo and add `http://localhost:8080` to its CORS allow list. The frontend cannot work around this — you cannot use a wildcard `*` origin when credentials are included.

### Admin login fails with credentials I know are correct

**Cause.** Admin auth is a separate surface from user auth. It posts to `/api/v1/admin/auth/login` and expects a seeded admin user to exist in the backend database.

**Fix.** Confirm the seeded admin exists in the backend (see the backend repo's README for the seeded credentials or the seed script). Admin auth uses a password, not an OTP — if you are trying to request an OTP for an admin account you are on the wrong login page (`/admin/login` vs `/login`).

---

## Wizard / order flow problems

### Stripe checkout button does nothing / takes me nowhere

**Cause.** The frontend does not embed Stripe Elements. It calls `api.createCheckoutSession(orderId)` and then `window.location.href = checkout_url`. If nothing happens, one of:

1. The call failed (check the Network tab — was the `POST` successful?).
2. The backend did not return a `checkout_url` (check the response payload).
3. The backend's Stripe integration is not wired up for your environment (test keys missing, webhook not configured).

**Fix.** The client side of this is intentionally thin. Fix the backend or its Stripe configuration. Adding client-side Stripe.js is a documented follow-up — see `CHANGELOG.md` and the SJP guide.

### I uploaded a logo and the wizard lost it after a refresh

**Cause.** `WizardContext` state is in-memory only. A page refresh wipes everything except fields that were already persisted on the backend (`orderId`, `documentId`).

**Fix.** Do not refresh mid-wizard. If persistence matters for your use case, you would need to add localStorage hydration to `WizardContext` — that is not currently implemented.

### Step 3 "Generate preview" hangs forever

**Cause.** Preview generation is a synchronous backend call that renders a DOCX and returns a PDF. For large orders this takes 10+ seconds. If it hangs longer than 60s, the backend almost certainly errored and the frontend is still waiting.

**Fix.** Check the backend logs and the browser's Network tab. If the request failed, a `toast.error` should appear — if it does not, check the browser console.

---

## Backend-pointing problems

### I want to point the frontend at a non-local backend (staging, ngrok, a teammate's machine)

**Cause.** The backend base URL is hardcoded at `src/services/api.ts:1` and `src/services/adminApi.ts:3`. There is no env var today.

**Fix.** Edit both constants locally. Do **not** commit the edit. The planned migration is `VITE_API_URL` — see `docs/DEVELOPMENT_GUIDE.md` §"Add an env var".

### I changed the base URL but the old URL is still being hit

**Cause.** Browser or Vite caching. Vite normally picks up changes to `src/services/*.ts` instantly, but an active service-worker or a stale browser cache can still serve old JS.

**Fix.**

1. Stop the dev server (`Ctrl+C`).
2. Restart with `npm run dev`.
3. Hard-reload the browser tab (`Cmd+Shift+R` / `Ctrl+Shift+R`).
4. If it still happens, clear `dist/` and `.vite/` caches: `rm -rf dist node_modules/.vite && npm run dev`.

---

## Build / TypeScript problems

### `npm run build` fails with type errors I do not see in the editor

**Cause.** The editor (TS language server) may be using a different TS config than the build. The repo's `tsconfig.json` is intentionally lax (`strictNullChecks: false`, `noImplicitAny: false`), so most errors that survive a build are real.

**Fix.** Run `npx tsc --noEmit` from the repo root. This is what the build effectively does. Fix the errors it prints. There is no `npm run typecheck` script today — if you use this a lot, add one.

### Tests fail with `ReferenceError: matchMedia is not defined`

**Cause.** A component under test calls `window.matchMedia` in jsdom, and the polyfill in `src/test/setup.ts` did not register.

**Fix.** Make sure `vitest.config.ts` still references `setupFiles: ['./src/test/setup.ts']`. If a new test creates its own `setupFiles` override, merge the existing polyfill in.

---

## Linting / IDE noise

### ESLint yells about unused vars

**Cause.** The repo intentionally disables `no-unused-vars` at the ESLint level (`eslint.config.js`), but editor integrations sometimes re-enable it from the default TS rules.

**Fix.** Trust `npm run lint` as the source of truth. If `npm run lint` passes but your editor still flags unused vars, check your editor's own ESLint / TS settings.

### `lovable-tagger` warnings in the console

**Cause.** `vite.config.ts:15` enables `lovable-tagger` in development mode only. It annotates React components for the Lovable editor. It is harmless.

**Fix.** Ignore the warning, or remove `lovable-tagger` from the plugin list if you do not use Lovable. Do not commit the removal without checking with the team — someone may still rely on it.

---

## Something else

If the symptom you are seeing is not in this file, the playbook is:

1. Open the browser devtools → Console + Network. Most frontend issues announce themselves there.
2. Check the backend logs for the same request.
3. Read `docs/API_INTEGRATION.md` to understand what the frontend expects from each endpoint.
4. If you find a reproducible issue worth remembering, add it to this file under the right heading.
