# Testing Guide

## Current state — read this first

There is **no real test suite** in this repo today. What exists:

- `vitest.config.ts` — wired up for jsdom + globals + `src/**/*.{test,spec}.{ts,tsx}`.
- `src/test/setup.ts` — `@testing-library/jest-dom` matchers and a `window.matchMedia` polyfill.
- `src/test/example.test.ts` — a single placeholder test that asserts `1 + 1 === 2`.

No component tests, no hook tests, no integration tests. No coverage threshold is enforced. CI does not run tests (there is no CI).

This document explains how to run what exists, how to add real tests in the style the repo is configured for, and what policy decisions still need to be made. Be honest about this when you onboard someone: we have the infrastructure, not the tests.

---

## Running tests

From the repo root:

```bash
npm run test         # single run, headless
npm run test:watch   # watch mode (re-runs on file changes)
```

Both are defined in `package.json:scripts`. They resolve to `vitest run` and `vitest`.

There is no `test:coverage` script today. If you want coverage, run:

```bash
npx vitest run --coverage
```

You will need to install `@vitest/coverage-v8` the first time (`npm install -D @vitest/coverage-v8`).

---

## Stack

| Piece | Version | Role |
|---|---|---|
| `vitest` | ^3.2.4 | Test runner. |
| `jsdom` | ^20.0.3 | DOM environment for React components. |
| `@testing-library/react` | ^16.0.0 | Render + query helpers. |
| `@testing-library/jest-dom` | ^6.6.0 | DOM matchers (`toBeInTheDocument`, etc.). |

The Vitest config enables `globals: true`, so `describe`, `it`, `expect`, `vi`, etc. are available without imports. The `@` path alias works in tests — the config mirrors `vite.config.ts`.

---

## File naming and location

Follow the `vitest.config.ts` include glob: `src/**/*.{test,spec}.{ts,tsx}`.

- **Colocate** the test next to the unit under test. A test for `src/lib/provinceMapping.ts` lives at `src/lib/provinceMapping.test.ts`. A test for `src/components/dashboard/OrdersTable.tsx` lives at `src/components/dashboard/OrdersTable.test.tsx`.
- Do not put tests under `src/test/` — that directory is reserved for global setup (`setup.ts`) and examples.
- Prefer `.test.ts(x)` over `.spec.ts(x)` for consistency; both are accepted.

---

## Writing a logic test (pure function)

```ts
// src/lib/provinceMapping.test.ts
import { describe, it, expect } from 'vitest';
import { provinceNameToCode, provinceCodeToName } from './provinceMapping';

describe('provinceMapping', () => {
  it('maps a full name to its two-letter code', () => {
    expect(provinceNameToCode('Ontario')).toBe('ON');
  });

  it('round-trips code → name → code', () => {
    expect(provinceNameToCode(provinceCodeToName('ON'))).toBe('ON');
  });
});
```

Pure helpers in `src/lib/` are the easiest thing to test — start there if you are adding the first real tests to the repo.

---

## Writing a component test

```tsx
// src/components/dashboard/StatusBadge.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from './StatusBadge';

describe('<StatusBadge />', () => {
  it('renders the "paid" label for a paid status', () => {
    render(<StatusBadge status="paid" />);
    expect(screen.getByText(/paid/i)).toBeInTheDocument();
  });
});
```

For components that consume context (`useAuth`, `useWizard`, etc.), wrap them in the same provider tree the real app uses. Do not mock the context — the providers are cheap to render.

---

## Mocking policy

**Mock at the `src/services/api.ts` boundary, not at `fetch`.**

Use `vi.mock('@/services/api', ...)` to replace `api.createOrder` (or any other method) with a mock. This keeps your test ignorant of the transport (cookies, `authFetch`, `ApiError`) and focused on component behavior.

```tsx
import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@/services/api', () => ({
  api: {
    createOrder: vi.fn().mockResolvedValue({ order_id: 42 }),
  },
}));
```

What **not** to mock:

- `fetch` directly — mock the api module instead.
- React contexts — render the real provider.
- `react-router-dom` — wrap in `<MemoryRouter>`.
- `framer-motion` — tests should work against the real motion components; if they do not, the component under test is doing something unusual.

---

## What to test (priority order)

When you start filling in the suite, aim for this order:

1. **Pure helpers in `src/lib/`** — `provinceMapping`, `downloadDocument`, `statusMaps`, `adminStatusMaps`. High value, low effort.
2. **`WizardContext` reducer-like helpers** — `getTotalPrice`, `isSjpOnlyPlan`, `isLogoOptional`, `resetWizard`.
3. **Form validation** — the zod schemas inside the wizard steps.
4. **Critical components** — `StatusBadge`, `OrdersTable`, `NaicsChipInput`.
5. **Hooks** — `useOrders`, `useOrderDetail`, `useSjpStatus`. Wrap in a `QueryClientProvider` for each test.
6. **End-to-end wizard flow** — requires heavy mocking of `api`. Consider deferring until Playwright is introduced.

The coverage bar is **not currently enforced**. When the team decides to enforce one, update this section.

---

## Known gaps and TODOs

- **No CI.** Tests are only run locally. Adding a GitHub Actions workflow that runs `npm run lint && npm run test` on PR is a trivial first improvement.
- **No coverage threshold.** When the suite grows, decide a minimum (e.g. 70% on `src/lib/` and `src/services/`).
- **No end-to-end tool.** The repo has no Playwright or Cypress setup. If you need to test full user journeys, choose one and document it here.
- **`src/test/example.test.ts` is a placeholder.** Delete it as soon as the first real test lands.
