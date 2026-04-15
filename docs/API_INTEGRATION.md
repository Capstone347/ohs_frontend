# API Integration

How the frontend talks to the backend. Read this before touching `src/services/api.ts` or `src/services/adminApi.ts`, or before writing a component that calls the backend.

For the endpoint contracts themselves (request/response schemas) see:

- `docs/API_DOCUMENTATION.md` — user wizard and order flow.
- `docs/API_USER_DASHBOARD_DOCS.md` — user dashboard flow (auth, orders list, detail, payment retry, known gaps).
- `docs/ADMIN_API.md` — admin surface.
- `docs/SJP_FRONTEND_GUIDE.md` — SJP generation/review specifics.

---

## 1. Base URLs

Both URLs are **hardcoded** today. There is no env var.

| Client | Constant | File:line |
|---|---|---|
| User | `const API_BASE_URL = "http://localhost:8000/api/v1"` | `src/services/api.ts:1` |
| Admin | `const API_BASE_URL = "http://localhost:8000/api/v1/admin"` | `src/services/adminApi.ts:3` |

To point at a different backend, edit those two constants locally and do **not** commit the change. The planned migration to `VITE_API_URL` is documented in `docs/DEVELOPMENT_GUIDE.md` §"Add an env var".

---

## 2. Auth model

Session cookies. End of story — no tokens in memory, no tokens in localStorage.

1. **User login.** `api.requestOtp(email)` → backend emails an OTP → `api.verifyOtp(email, otp)` → backend sets an httpOnly `auth_session` cookie.
2. **Admin login.** `adminApi.login(email, password)` → backend sets an httpOnly admin session cookie.
3. **Every subsequent request** is sent with `credentials: 'include'` via `authFetch`. The browser attaches the cookie automatically.
4. **Hydration on app boot.** `AuthContext` (and `AdminAuthContext`) calls `api.getMe()` / `adminApi.getMe()` when the provider mounts. If the cookie is still valid, the user lands in an authenticated state without re-logging in.

The frontend never reads the cookie. You cannot and should not try to inspect `auth_session` from JS.

---

## 3. The `authFetch` / `handleResponse` / `ApiError` contract

Defined in `src/services/api.ts` around lines 257–292. Every REST call in the repo goes through these three pieces.

### `authFetch(url, options)`

Thin wrapper over `fetch` that forces `credentials: 'include'`. Always use it instead of raw `fetch`. Never call `fetch` directly from a component.

```ts
function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  return fetch(url, { ...options, credentials: 'include' });
}
```

### `handleResponse<T>(response)`

Unwraps a `Response` into a typed `T`, handling errors uniformly.

- **2xx** → returns `response.json() as Promise<T>`.
- **401** → dispatches a `window` event `auth:unauthorized`, then throws an `ApiError`. The event is what drives the global "kick the user to `/login`" behavior in `AuthContext`.
- **Any other non-2xx** → throws an `ApiError` with `status`, `message`, and optional `details` parsed from the backend's error envelope (`{ error: { message, details } }` or `{ detail }`).

```ts
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    if (response.status === 401) {
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    const error = await response
      .json()
      .catch(() => ({ error: { message: 'Request failed' } }));
    throw new ApiError(
      response.status,
      error.error?.message || error.detail || 'Request failed',
      error.error?.details,
    );
  }
  return response.json();
}
```

### `ApiError`

```ts
class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: any,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
```

Components should catch this specifically when they want to render a targeted error message. Anything else (network error, parse error) bubbles up as a plain `Error` and the top-level `try/catch` should fall back to a generic toast.

### The admin client mirrors this pattern

`src/services/adminApi.ts` defines its own `ApiError` and `handleResponse` with one difference: the 401 event is `admin-auth:unauthorized`, so user and admin surfaces can be logged out independently.

---

## 4. The 401 flow end-to-end

```
component
  └─ await api.getOrderDetail(42)
       └─ authFetch → fetch(…, credentials: 'include')
            └─ backend returns 401 {"detail": "Invalid auth session"}
       └─ handleResponse
            ├─ window.dispatchEvent(new Event('auth:unauthorized'))
            └─ throws ApiError(401, "Invalid auth session")
component catches ApiError
  └─ (optional) toast.error(err.message)
AuthContext's window listener (registered in useEffect)
  └─ clears user state
  └─ react-router navigate('/login', { replace: true })
```

You do **not** need to handle 401 in every caller. The global listener handles redirects. Component-level catches only need to care about 400/404/500-style errors.

---

## 5. How to add a new endpoint call

1. Decide which client: `api` (user) or `adminApi` (admin).
2. Add typed request and response interfaces at the top of the file next to the existing ones.
3. Add a method on the `api` / `adminApi` object. Use `authFetch` for anything authenticated; plain `fetch` is acceptable for the handful of truly-public endpoints (`requestOtp`, `verifyOtp`, `getStripeConfig`) — follow the existing style.
4. Return `handleResponse<TResponse>(response)`.
5. Consume it:
   - **Wizard steps**: call `api.myMethod(...)` imperatively inside `try/catch`. On success, write to `WizardContext`. On `ApiError`, show `toast.error`.
   - **Dashboard / admin**: wrap in a React Query hook under `src/hooks/`. Pattern:
     ```ts
     export function useMyThing(id: number) {
       return useQuery({
         queryKey: ['my-thing', id],
         queryFn: () => api.myMethod(id),
       });
     }
     ```
6. If the endpoint is new on the backend too, add it to `docs/API_DOCUMENTATION.md` or `docs/ADMIN_API.md`.

Full recipe with examples: `docs/DEVELOPMENT_GUIDE.md` §"Add a new API call".

---

## 6. File uploads

Some endpoints accept multipart bodies (logo upload in `updateCompanyDetails`, for example). The rules:

- Use `FormData`, not a JSON body.
- **Do not** set `Content-Type` yourself — the browser will set `multipart/form-data; boundary=…` automatically. Setting it manually breaks the boundary.
- Still go through `authFetch` so the session cookie is attached.

Example usage already exists in `src/services/api.ts:updateCompanyDetails` — match that pattern.

---

## 7. File downloads

Document downloads return a `Blob`, not JSON. `handleResponse` cannot parse a blob, so the download methods (`downloadPreview`, `downloadFinalDocument`, `downloadOrderDocument`) call `fetch` + check `res.ok` inline and return `res.blob()`. Match this pattern for any new download endpoint.

The `src/lib/downloadDocument.ts` helper is the canonical way to turn a `Blob` into a save-to-disk interaction — use it rather than rolling your own `URL.createObjectURL` dance.

---

## 8. Running against a different backend

Today:

- **Local backend** (default): `http://localhost:8000/api/v1`. Start the backend on port 8000, then `npm run dev`.
- **Shared dev backend / ngrok / teammate's machine**: edit `src/services/api.ts:1` and `src/services/adminApi.ts:3` locally. Do not commit the edit.
- **Production**: not supported by the frontend today. Production deployment requires the `VITE_API_URL` migration to land first.

If you find yourself editing those constants often, that is the signal to do the env-var migration properly. See `docs/DEVELOPMENT_GUIDE.md` §"Add an env var".

---

## 9. CORS requirements on the backend

Because the frontend uses cookie-based auth with `credentials: 'include'`, the backend **must**:

- Send `Access-Control-Allow-Origin: http://localhost:8080` (your exact origin — not `*`).
- Send `Access-Control-Allow-Credentials: true`.
- Echo the request's `Access-Control-Allow-Headers` on preflights.
- Set cookies with `SameSite=Lax` (or `None; Secure` if the frontend and backend are on different sites in production).

If any of these are wrong you will see a CORS error in the console. See `docs/TROUBLESHOOTING.md` §"CORS policy".

---

## 10. What is intentionally not in this layer

- **No retry logic.** A failed call throws and the caller decides what to do.
- **No offline mode.** Failed requests show a toast; there is no request queue.
- **No global loading spinner.** Components manage their own loading state via React Query or local `useState`.
- **No request cancellation.** We do not currently pass an `AbortController` anywhere.

If any of these become real requirements, implement them in `authFetch` / `handleResponse` so every call benefits consistently — do not scatter the logic across components.
