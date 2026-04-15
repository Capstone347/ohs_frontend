# Development Guide

A cookbook for adding things to the frontend without breaking existing flows. Each recipe lists the files you touch in order and ends with a verification step.

Prerequisites:

- You have read `docs/ARCHITECTURE.md` (at least sections 2–4).
- You have the dev server running per `GETTING_STARTED.md`.
- The backend is running.

---

## Add a new page

Use when: you need a new URL that renders a component.

1. **Decide which shell.** Options:
   - Dark public page → no shell; register at the top level in `src/App.tsx`.
   - User-authenticated wizard step → nest under `/app` in `WizardShell`.
   - User dashboard view → nest under `/dashboard` in `DashboardShell` (wrapped in `ProtectedRoute`).
   - Admin tool → nest under `/admin` in `AdminShell` (wrapped in `AdminProtectedRoute`).
2. **Create the page file.** Pages live in `src/pages/<area>/`. File name matches the component (`src/pages/dashboard/BillingHistory.tsx`).
3. **Write the component.** Start with the theme wrapper that matches the shell. See `docs/STYLING_GUIDE.md` for the exact class strings — do not invent your own colors.
4. **Register the route.** Add an `import` line at the top of `src/App.tsx` and a `<Route path="…" element={<MyPage />} />` inside the correct shell.
5. **Link to it.** If users need to reach the page from existing UI, add a link using `<Link>` from `react-router-dom` or the `NavLink` wrapper in `src/components/NavLink.tsx`.

**Verify:**

```bash
npm run dev
```

Navigate to the new URL. Check:

- The layout matches the shell's theme (light vs dark).
- Hot module reloading picks up edits without a full page refresh.
- ProtectedRoute-wrapped pages redirect to `/login` when signed out.

---

## Add a new API call

Use when: you need to hit a new backend endpoint.

1. **Decide which client.** User-facing calls → `src/services/api.ts`. Admin calls → `src/services/adminApi.ts`. Do not mix.
2. **Add the types.** Define typed request and response interfaces at the top of the file, next to the existing ones (`OrderDetail`, `OrderSummary`, etc.).
3. **Add the method.** Mirror the surrounding style — use `authFetch` + `handleResponse`:
   ```ts
   async myNewCall(orderId: number, body: MyRequest): Promise<MyResponse> {
     const res = await authFetch(`${API_BASE_URL}/orders/${orderId}/thing`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(body),
     });
     return handleResponse<MyResponse>(res);
   }
   ```
   Do not call `fetch` directly. `authFetch` handles `credentials: 'include'` and `handleResponse` handles 401/`ApiError` consistently.
4. **Consume it.**
   - **From the wizard:** call `api.myNewCall(...)` inside a `try/catch` in the step component. On success, write to `WizardContext`. On `ApiError`, show a `toast.error(err.message)`.
   - **From the dashboard/admin:** wrap it in a `useQuery` or `useMutation` hook under `src/hooks/`. Follow the pattern in `useOrders.ts` or `useOrderDetail.ts`.
5. **Document the contract.** If the endpoint is new on the backend too, add it to `docs/API_DOCUMENTATION.md` or `docs/ADMIN_API.md` so the two sides stay in sync.

**Verify:**

- Open the browser devtools Network tab.
- Trigger the flow. Confirm the request goes to `http://localhost:8000/api/v1/...` with `credentials: include` and returns 200.
- Kill the backend and retry. The UI should show a clean error toast, not a raw stack trace.
- Log out (clear the cookie) and retry. The call should 401 and the user should land on `/login` — proving the global 401 handler still works.

For the full error-handling contract see `docs/API_INTEGRATION.md`.

---

## Add a new shared component

Use when: two or more pages need the same visual or behavior.

1. **First check shadcn/ui.** Open `src/components/ui/` — there are 50+ primitives already (button, card, dialog, sheet, dropdown-menu, table, …). If one fits, use it directly. If a shadcn component exists upstream but not in the repo, add it:
   ```bash
   npx shadcn-ui@latest add <component>
   ```
2. **If you need something custom**, put it in a feature folder, not in `src/components/ui/`. `ui/` is reserved for shadcn primitives.
   - Reusable across features → `src/components/<most-relevant-area>/MyComponent.tsx`.
   - One-off → keep it in the page file.
3. **Match the existing theme.** Use tokens from `docs/STYLING_GUIDE.md`. Do not hardcode hex/rgb/hsl.
4. **Add a framer-motion entrance animation** if it is a card or a section. See `docs/STYLING_GUIDE.md` §"Animations" for the exact durations and delays.
5. **Icons:** `lucide-react` only. Do not add another icon library.

**Verify:** render the component in both a wizard step and a dashboard page if it is truly shared, and confirm the theme tokens still look right in both contexts.

---

## Add a new wizard step

Use when: the wizard needs to collect or show one more thing, and it genuinely belongs between existing steps (not inside one of them).

1. **Extend `WizardContext`.** Open `src/context/WizardContext.tsx`. Add state fields and setters for whatever the step needs to remember. Keep them optional unless they are truly required for the order API call.
2. **Create the step page.** `src/pages/wizard/Step6.tsx` (or renumber — see below). Follow the existing pattern:
   - Light-theme wrapper.
   - `h1` + subtitle block at the top.
   - Content card(s) per section.
   - Back / Continue nav buttons at the bottom (`flex justify-between pt-4`).
3. **Register the route** in `src/App.tsx` inside the `/app` nested routes.
4. **Wire the step indicator.** Look for how `Step1`…`Step5` are rendered by `WizardShell` — if the indicator is data-driven, add your step there; if it is hardcoded, update the array.
5. **Update the Continue targets on adjacent steps.** The previous step must navigate to the new one; the new step must navigate to what used to be the next step.
6. **If the step needs to hit the backend,** follow the "Add a new API call" recipe above. Do not invent new context state just to avoid calling the API.

**Verify:** walk the wizard end to end from Step 1 to success. Watch the Network tab to confirm the calls still fire in order and no step silently skips.

See `docs/SJP_FRONTEND_GUIDE.md` for a worked example of a feature that branches the wizard (adds an SJP-only path) and note the backend gap it documents — real features often run ahead of the backend contract, and you need to plan for that.

---

## Add an env var

**Today there are none.** `import.meta.env` is not referenced anywhere in `src/`, there is no `.env`, and there is no `.env.example`. Base URLs and everything else are hardcoded. The recipe below describes the conventions to follow once you (or a later pass) actually migrate the hardcoded values.

1. **Pick a name.** All Vite-exposed env vars must start with `VITE_`. Example: `VITE_API_URL`.
2. **Create `.env.example`** at the repo root if it does not exist yet. Add a row:
   ```
   VITE_API_URL=http://localhost:8000/api/v1
   ```
3. **Create your own `.env.local`** with real values. `.env.local` is in `.gitignore` (it is not in `.gitignore` today — add it if you are the one bootstrapping env vars).
4. **Read it with a fallback.** Use the pattern `import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'` so local dev still works with zero config.
5. **Document it.** Add a row to the "Summary — values you need" table in `GETTING_STARTED.md` explaining what the variable is, where to get its value, and which code file uses it.

**Known TODO — migrate the API base URL.** Today `src/services/api.ts:1` and `src/services/adminApi.ts:3` both hardcode `http://localhost:8000/api/v1`. The documented first migration is to replace those with `VITE_API_URL`. Anyone pointing the frontend at staging or an ngrok tunnel currently has to edit those two constants. If you need this, do it properly (steps above) rather than committing a hardcoded URL change.

---

## Add or update a test

See `docs/TESTING_GUIDE.md` for the full policy. Short version:

1. Create a sibling file: `MyComponent.test.tsx` next to `MyComponent.tsx`, or `myHelper.test.ts` next to `myHelper.ts`.
2. Import `@testing-library/react` for component tests, plain Vitest `describe`/`it`/`expect` for logic tests.
3. Mock at the `api.ts` boundary — do not mock `fetch` or `window`.
4. Run `npm run test` (one-shot) or `npm run test:watch` while working.

---

## Common mistakes to avoid

- **Hardcoding colors.** Tailwind will let you write `text-[#123456]`. Do not. Use semantic tokens.
- **Skipping the shell.** If your page needs the wizard progress bar or the dashboard nav, nest it under the matching shell in `App.tsx`. Do not rebuild the chrome.
- **Calling `fetch` directly.** Always go through `authFetch` so cookies and 401 handling stay consistent.
- **Duplicating state between context and React Query.** Wizard state goes in `WizardContext`. Server data goes in React Query. Pick one per piece of data.
- **Adding a new UI library.** shadcn/ui, `lucide-react`, `framer-motion`, and `sonner` cover everything the current app uses. If you feel the pull to add another, talk to the team first.
- **Committing `.env`** files or hardcoded staging URLs.

---

## Where to read next

- `docs/API_INTEGRATION.md` — deep dive on the `authFetch`/`handleResponse`/`ApiError` contract.
- `docs/STYLING_GUIDE.md` — every class you are allowed to use and when.
- `docs/TROUBLESHOOTING.md` — symptoms and fixes when the recipes above misbehave.
