# Backend API Contract for Frontend Dashboard Implementation

Base URL: `/api/v1`

All authenticated endpoints require the `auth_session` httpOnly cookie (set automatically by the browser after OTP verification).
On missing/invalid/expired session, authenticated endpoints return `401 { "detail": "Invalid auth session" }`.

---

## Auth Endpoints

### `POST /auth/request-otp`
Request an OTP code sent to email.

**Auth:** None
**Body:** `{ "email": "user@example.com" }`
**Response 200:** `{ "message": "If the email is registered, an OTP has been sent." }`
**Notes:** Response is intentionally generic (no user enumeration). Rate-limited: 5 per email / 6 per IP per 15-min window. Resend cooldown: 60s.

### `POST /auth/verify-otp`
Verify OTP and establish session.

**Auth:** None
**Body:** `{ "email": "user@example.com", "otp": "123456" }`
**Response 200:** `{ "user": { "id": 1, "email": "user@example.com" } }` + sets `auth_session` cookie
**Response 401:** `{ "detail": "Invalid email or OTP" }` (generic — covers expired, wrong code, too many attempts)
**Cookie:** `auth_session`, httpOnly, Secure (prod), SameSite=lax, Max-Age=3600, Path=/

### `GET /auth/me`
Get current authenticated user.

**Auth:** Cookie
**Response 200:** `{ "id": 1, "email": "user@example.com" }`
**Response 401:** `{ "detail": "Invalid auth session" }`

### `POST /auth/logout`
Clear session cookie.

**Auth:** None (idempotent — safe to call anytime)
**Response 200:** `{ "message": "Logged out" }`
**Effect:** Deletes `auth_session` cookie.

---

## Order Endpoints

### `GET /orders`
List authenticated user's orders (paginated, filterable, searchable).

**Auth:** Cookie (user_id extracted from session)
**Query params:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `query` | string? | null | Search by order ID (if numeric) or company name (if text) |
| `order_status` | string? | null | Filter by status enum: `draft`, `processing`, `review_pending`, `available`, `cancelled` |
| `page` | int | 1 | Page number (1-based) |
| `page_size` | int | 20 | Items per page (max 100) |

**Response 200:**
```json
{
  "items": [
    {
      "order_id": 1,
      "created_at": "2026-03-16T10:00:00",
      "order_status": "draft",
      "payment_status": "pending",
      "total_amount": "199.99",
      "currency": "CAD",
      "jurisdiction": "ON",
      "company_name": "Acme Corp",
      "plan_name": "Basic",
      "naics_codes": ["238220", "238210"]
    }
  ],
  "total": 42,
  "page": 1,
  "page_size": 20,
  "total_pages": 3
}
```
**Sorting:** Newest first (`created_at DESC`), not configurable.

### `GET /orders/{order_id}`
Full order detail with timeline and documents.

**Auth:** Cookie (ownership enforced — returns 404 if not your order)
**Response 200:**
```json
{
  "order_id": 1,
  "created_at": "2026-03-16T10:00:00",
  "completed_at": null,
  "jurisdiction": "ON",
  "total_amount": "199.99",
  "is_industry_specific": false,
  "company": {
    "id": 1,
    "name": "Acme Corp",
    "logo_id": null,
    "province": "ON",
    "business_description": null,
    "naics_codes": ["238220"]
  },
  "plan_name": "Basic",
  "order_status": "draft",
  "payment_status": "pending",
  "currency": "CAD",
  "documents": [
    {
      "document_id": 1,
      "access_token": "abc123...64chars",
      "token_expires_at": "2026-03-17T10:00:00",
      "generated_at": "2026-03-16T12:00:00",
      "file_format": "docx"
    }
  ],
  "timeline": [
    { "step": "Order Placed", "status": "completed", "timestamp": "2026-03-16T10:00:00" },
    { "step": "Payment", "status": "pending", "timestamp": null },
    { "step": "Processing", "status": "pending", "timestamp": null },
    { "step": "Completed", "status": "pending", "timestamp": null }
  ],
  "naics_codes": ["238220"]
}
```
**Response 404:** `{ "detail": "Order {order_id} not found" }` (also returned for orders belonging to other users)

### `GET /orders/{order_id}/summary`
Order summary (lighter than detail).

**Auth:** Cookie (ownership enforced by user_id)
**Response 200:** Same as `OrderSummaryResponse` — includes user_email, full_name, company, plan, status, payment_status, documents.

---

## Document Endpoints

### `GET /orders/{order_id}/documents`
List documents for an order.

**Auth:** Cookie (ownership enforced)
**Response 200:**
```json
[
  {
    "document_id": 1,
    "order_id": 1,
    "file_path": "data/documents/order_1/...",
    "file_format": "docx",
    "access_token": "abc123...64chars",
    "token_expires_at": "2026-03-17T10:00:00",
    "generated_at": "2026-03-16T12:00:00"
  }
]
```

### `GET /documents/{document_id}/download?token={access_token}`
Download document file (DOCX).

**Auth:** None (public, protected by access_token)
**Query:** `token` (required, 64-char string)
**Response 200:** File download (`application/vnd.openxmlformats-officedocument.wordprocessingml.document`)
**Response 403:** Token invalid or expired
**Response 404:** Document not found

### `GET /orders/{order_id}/download?token={access_token}`
Download latest document for order.

**Auth:** Cookie + token
**Same behavior as above** but scoped to order and requires authenticated session.

### `GET /documents/{document_id}/preview`
Get PDF preview of document.

**Auth:** None (public)
**Response 200:** File download (`application/pdf`)

---

## Payment Endpoints

### `GET /payments/stripe/config`
Get Stripe publishable key for client-side Stripe.js.

**Auth:** None
**Response 200:** `{ "publishable_key": "pk_..." }`

### `POST /payments/orders/{order_id}/create-checkout-session`
Create a Stripe Checkout session. **Also used for payment retry** — call this again for orders with failed payment.

**Auth:** None
**Response 200:**
```json
{
  "checkout_session_id": "cs_...",
  "checkout_url": "https://checkout.stripe.com/..."
}
```
**Notes:**
- Redirect user to `checkout_url` for payment.
- On success, Stripe redirects to `{frontend_url}/orders/{order_id}/success`.
- On cancel, Stripe redirects to `{frontend_url}/orders/{order_id}/payment`.
- Stripe webhook handles status transitions automatically (paid/failed/expired).

---

## Status Enums

### Order Status
| Value | Description |
|-------|-------------|
| `draft` | Order created, awaiting payment |
| `processing` | Payment confirmed, documents being generated |
| `review_pending` | Documents under review |
| `available` | Documents ready for download |
| `cancelled` | Order cancelled |

### Payment Status
| Value | Description |
|-------|-------------|
| `pending` | Awaiting payment |
| `paid` | Payment confirmed |
| `failed` | Payment failed or checkout expired |
| `refunded` | Payment refunded |

---

## FE Action → BE Endpoint Mapping

| FE Action | Endpoint | Notes |
|-----------|----------|-------|
| Login (request OTP) | `POST /auth/request-otp` | |
| Verify OTP | `POST /auth/verify-otp` | Sets cookie |
| Hydrate user state | `GET /auth/me` | Call after verify or on app load |
| Logout | `POST /auth/logout` | |
| View orders list | `GET /orders` | Paginated, filterable |
| View order detail | `GET /orders/{id}` | Includes timeline + documents |
| Download document | `GET /documents/{id}/download?token=` | Use `access_token` from order detail |
| Preview document | `GET /documents/{id}/preview` | PDF, no token needed |
| Retry payment | `POST /payments/orders/{id}/create-checkout-session` | Same as initial payment |
| Poll for status updates | `GET /orders/{id}` | Re-fetch order detail |
| Check session validity | `GET /auth/me` | 401 = expired |

---

## Known Gaps (BE work still needed)

### 1. Document Access Token Refresh — MISSING

**Problem:** Document `access_token` has an expiration (`token_expires_at`). Once expired, downloads return 403. There is **no endpoint to regenerate an expired token**.

**FE impact:** The "Link expired → Generate new link" flow in the Document Access UX task has no backend support.

**Needed:** A new endpoint like `POST /documents/{document_id}/refresh-token` (authenticated) that generates a new token + expiry and returns the updated document.

### 2. `GET /auth/me` Missing `full_name` — MINOR

**Problem:** `AuthenticatedUserResponse` only returns `{ id, email }`. The User model has a `full_name` field.

**FE impact:** Dashboard greeting or display name requires a separate call or the FE must parse email.

**Needed:** Add `full_name` to `AuthenticatedUserResponse` schema and the auth service return value.

### 3. `_enforce_order_access` in Documents Uses Email Instead of ID — CLEANUP

**Problem:** `GET /orders/{order_id}/documents` and `GET /orders/{order_id}/download` verify ownership by comparing `order.user.email != current_user["email"]` instead of `order.user_id != current_user["id"]` (inconsistent with order endpoints we just fixed).

**FE impact:** None directly, but email comparison is less robust than id comparison.

**Needed:** Update `_enforce_order_access()` in `app/api/v1/endpoints/documents.py` to use id-based check.
