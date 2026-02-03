# OHS Remote Backend API Documentation

## Table of Contents
1. [Overview](#overview)
2. [Base URL](#base-url)
3. [API Endpoints](#api-endpoints)
   - [Health Check](#health-check)
   - [Create Order](#create-order)
   - [Update Company Details](#update-company-details)
   - [Generate Document Preview](#generate-document-preview)
   - [Download Document Preview](#download-document-preview)
   - [Get Document Details](#get-document-details)
   - [Download Final Document](#download-final-document)
   - [Get Order Summary](#get-order-summary)
   - [Get Available Plans](#get-available-plans)
   - [Accept Legal Terms](#accept-legal-terms)
   - [Create Payment Intent](#create-payment-intent)
   - [Payment Webhook](#payment-webhook)
4. [Complete Order Flow](#complete-order-flow)
5. [Error Handling](#error-handling)
6. [Data Models](#data-models)

---

## Overview

The OHS Remote API provides endpoints for creating occupational health and safety manuals tailored to specific companies and jurisdictions. The typical workflow involves:

1. Creating an order
2. Updating company details
3. Generating a preview document (PDF with watermark)
4. Processing payment
5. Downloading the final document (DOCX)

---

## Base URL

**Development/Local:**
```
http://localhost:8000/api/v1
```

**Production:**
```
https://your-domain.com/api/v1
```

All API endpoints should be prefixed with the base URL.

---

## API Endpoints

### Health Check

Check if the API is running and responsive.

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-02-03T12:00:00Z"
}
```

**Example:**
```bash
curl -X GET http://localhost:8000/api/v1/health
```

---

### Create Order

Create a new order to start the document generation process.

**Endpoint:** `POST /orders`

**Request Body:**
```json
{
  "plan_id": 1,
  "user_email": "customer@example.com",
  "full_name": "John Doe",
  "jurisdiction": "ON"
}
```

**Field Descriptions:**
- `plan_id` (integer, required): The ID of the selected plan (1, 2, or 3)
- `user_email` (string, required): Customer's email address (valid email format)
- `full_name` (string, required): Customer's full name
- `jurisdiction` (string, required): Province code (AB, BC, MB, NB, NL, NS, NT, NU, ON, PE, QC, SK, YT)

**Response (201 Created):**
```json
{
  "order_id": 1,
  "status": "draft",
  "created_at": "2026-02-03T12:00:00Z",
  "message": "Order created successfully"
}
```

**Example:**
```bash
curl -X POST http://localhost:8000/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{
    "plan_id": 1,
    "user_email": "customer@example.com",
    "full_name": "John Doe",
    "jurisdiction": "ON"
  }'
```

**Error Responses:**
- `400 Bad Request`: Invalid input (e.g., invalid email format, invalid province code)
- `422 Unprocessable Entity`: Validation errors

---

### Update Company Details

Update company information and upload logo for an existing order.

**Endpoint:** `PATCH /orders/{order_id}/company-details`

**Request Type:** `multipart/form-data`

**Form Fields:**
- `company_name` (string, required): Company name
- `province` (string, required): Province code (AB, BC, MB, NB, NL, NS, NT, NU, ON, PE, QC, SK, YT)
- `naics_codes` (string, required): Comma-separated NAICS codes (e.g., "111110,111120")
- `logo` (file, optional): Company logo image (PNG, JPG, JPEG, or SVG, max 5MB)

**Response (200 OK):**
```json
{
  "order_id": 1,
  "user_email": "customer@example.com",
  "full_name": "John Doe",
  "jurisdiction": "ON",
  "company_name": "Acme Corp",
  "province": "ON",
  "naics_codes": ["111110", "111120"],
  "status": "draft",
  "payment_status": "pending",
  "created_at": "2026-02-03T12:00:00Z"
}
```

**Example:**
```bash
curl -X PATCH http://localhost:8000/api/v1/orders/1/company-details \
  -F "company_name=Acme Corp" \
  -F "province=ON" \
  -F "naics_codes=111110,111120" \
  -F "logo=@/path/to/logo.png"
```

**JavaScript/Fetch Example:**
```javascript
const formData = new FormData();
formData.append('company_name', 'Acme Corp');
formData.append('province', 'ON');
formData.append('naics_codes', '111110,111120');
formData.append('logo', logoFile); // File object from input

const response = await fetch(`${baseUrl}/orders/${orderId}/company-details`, {
  method: 'PATCH',
  body: formData
});
```

**Error Responses:**
- `400 Bad Request`: Invalid province code or NAICS codes
- `404 Not Found`: Order not found
- `413 Payload Too Large`: Logo file exceeds 5MB

---

### Generate Document Preview

Generate a preview version of the document (PDF with watermark/blur effect).

**Endpoint:** `POST /orders/{order_id}/generate-preview`

**Response (201 Created):**
```json
{
  "document_id": 7,
  "order_id": 1,
  "message": "Document generated successfully",
  "generated_at": "2026-02-03T12:00:00Z"
}
```

**Example:**
```bash
curl -X POST http://localhost:8000/api/v1/orders/1/generate-preview
```

**Error Responses:**
- `400 Bad Request`: Order missing required information
- `404 Not Found`: Order not found
- `500 Internal Server Error`: Document generation failed

---

### Download Document Preview

Download the preview PDF document.

**Endpoint:** `GET /documents/{document_id}/preview`

**Response:**
- Content-Type: `application/pdf`
- Binary PDF file

**Example:**
```bash
curl -X GET http://localhost:8000/api/v1/documents/7/preview \
  --output preview.pdf
```

**JavaScript/Fetch Example:**
```javascript
const response = await fetch(`${baseUrl}/documents/${documentId}/preview`);
const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'preview.pdf';
a.click();
```

**Error Responses:**
- `404 Not Found`: Document or preview file not found

---

### Get Document Details

Retrieve document details including access token for download.

**Endpoint:** `GET /documents/{document_id}`

**Response (200 OK):**
```json
{
  "document_id": 7,
  "order_id": 1,
  "file_format": "docx",
  "file_path": "/app/data/documents/generated/order_1_1234567890.docx",
  "access_token": "a1b2c3d4e5f6g7h8i9j0",
  "token_expires_at": "2026-02-10T12:00:00Z",
  "generated_at": "2026-02-03T12:00:00Z"
}
```

**Example:**
```bash
curl -X GET http://localhost:8000/api/v1/documents/7
```

**Error Responses:**
- `404 Not Found`: Document not found

---

### Download Final Document

Download the final DOCX document using the access token.

**Endpoint:** `GET /documents/{document_id}/download?token={access_token}`

**Query Parameters:**
- `token` (string, required): Access token from document details

**Response:**
- Content-Type: `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- Binary DOCX file

**Example:**
```bash
curl -X GET "http://localhost:8000/api/v1/documents/7/download?token=a1b2c3d4e5f6g7h8i9j0" \
  --output final_document.docx
```

**JavaScript/Fetch Example:**
```javascript
const response = await fetch(
  `${baseUrl}/documents/${documentId}/download?token=${accessToken}`
);
const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'ohs_manual.docx';
a.click();
```

**Error Responses:**
- `400 Bad Request`: Missing or invalid token
- `403 Forbidden`: Token expired or invalid
- `404 Not Found`: Document file not found

---

### Get Order Summary

Retrieve complete order information.

**Endpoint:** `GET /orders/{order_id}/summary`

**Response (200 OK):**
```json
{
  "order_id": 1,
  "user_email": "customer@example.com",
  "full_name": "John Doe",
  "jurisdiction": "ON",
  "company_name": "Acme Corp",
  "province": "ON",
  "naics_codes": ["111110", "111120"],
  "status": "completed",
  "payment_status": "paid",
  "plan": {
    "plan_id": 1,
    "name": "Basic Plan",
    "description": "Essential OHS manual",
    "price": 9900
  },
  "created_at": "2026-02-03T12:00:00Z",
  "updated_at": "2026-02-03T12:30:00Z"
}
```

**Example:**
```bash
curl -X GET http://localhost:8000/api/v1/orders/1/summary
```

**Error Responses:**
- `404 Not Found`: Order not found

---

### Get Available Plans

Retrieve all available subscription plans.

**Endpoint:** `GET /plans`

**Response (200 OK):**
```json
{
  "plans": [
    {
      "plan_id": 1,
      "name": "Basic Plan",
      "slug": "basic",
      "description": "Essential OHS manual for small businesses",
      "price": 9900,
      "features": ["Basic templates", "Email support"]
    },
    {
      "plan_id": 2,
      "name": "Professional Plan",
      "slug": "professional",
      "description": "Comprehensive OHS manual with advanced features",
      "price": 19900,
      "features": ["Advanced templates", "Priority support", "Custom branding"]
    },
    {
      "plan_id": 3,
      "name": "Enterprise Plan",
      "slug": "enterprise",
      "description": "Full-featured OHS manual for large organizations",
      "price": 29900,
      "features": ["All features", "Dedicated support", "Multiple users"]
    }
  ]
}
```

**Note:** Prices are in cents (e.g., 9900 = $99.00 CAD)

**Example:**
```bash
curl -X GET http://localhost:8000/api/v1/plans
```

---

### Accept Legal Terms

Record user acceptance of legal terms and conditions.

**Endpoint:** `POST /legal/acknowledge`

**Request Body:**
```json
{
  "user_email": "customer@example.com",
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0...",
  "terms_accepted": true,
  "privacy_accepted": true
}
```

**Response (201 Created):**
```json
{
  "acknowledgment_id": 1,
  "user_email": "customer@example.com",
  "terms_accepted": true,
  "privacy_accepted": true,
  "acknowledged_at": "2026-02-03T12:00:00Z",
  "message": "Legal terms acknowledged successfully"
}
```

**Example:**
```bash
curl -X POST http://localhost:8000/api/v1/legal/acknowledge \
  -H "Content-Type: application/json" \
  -d '{
    "user_email": "customer@example.com",
    "ip_address": "192.168.1.1",
    "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "terms_accepted": true,
    "privacy_accepted": true
  }'
```

---

### Create Payment Intent

Create a Stripe payment intent for order payment.

**Endpoint:** `POST /payments/create-intent`

**Request Body:**
```json
{
  "order_id": 1
}
```

**Response (200 OK):**
```json
{
  "client_secret": "pi_1234567890_secret_abcdefghijklmnop",
  "payment_intent_id": "pi_1234567890",
  "amount": 9900,
  "currency": "cad"
}
```

**Example:**
```bash
curl -X POST http://localhost:8000/api/v1/payments/create-intent \
  -H "Content-Type: application/json" \
  -d '{"order_id": 1}'
```

**JavaScript/React with Stripe Elements Example:**
```javascript
// 1. Create payment intent
const response = await fetch(`${baseUrl}/payments/create-intent`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ order_id: orderId })
});
const { client_secret } = await response.json();

// 2. Use Stripe.js to handle payment
const stripe = await loadStripe('your_publishable_key');
const { error, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
  payment_method: {
    card: cardElement,
    billing_details: {
      name: customerName,
      email: customerEmail
    }
  }
});

if (error) {
  console.error('Payment failed:', error.message);
} else if (paymentIntent.status === 'succeeded') {
  console.log('Payment successful!');
  // Backend webhook will automatically process the order
}
```

**Error Responses:**
- `400 Bad Request`: Invalid order_id or order already paid
- `404 Not Found`: Order not found

---

### Payment Webhook

**Note:** This endpoint is called automatically by Stripe. Frontend developers typically don't need to call this directly.

**Endpoint:** `POST /webhooks/payment-confirmation`

This webhook handles payment confirmation and triggers:
- Order status update to "paid"
- Final document generation
- Email notification with download link

---

## Complete Order Flow

Here's the recommended sequence for implementing the complete order flow in your frontend:

### Step 1: Display Plans
```javascript
const plans = await fetch(`${baseUrl}/plans`).then(r => r.json());
// Display plans to user
```

### Step 2: Accept Legal Terms
```javascript
await fetch(`${baseUrl}/legal/acknowledge`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user_email: email,
    ip_address: userIp,
    user_agent: navigator.userAgent,
    terms_accepted: true,
    privacy_accepted: true
  })
});
```

### Step 3: Create Order
```javascript
const { order_id } = await fetch(`${baseUrl}/orders`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    plan_id: selectedPlanId,
    user_email: email,
    full_name: fullName,
    jurisdiction: province
  })
}).then(r => r.json());
```

### Step 4: Update Company Details
```javascript
const formData = new FormData();
formData.append('company_name', companyName);
formData.append('province', province);
formData.append('naics_codes', naicsCodes.join(','));
if (logoFile) formData.append('logo', logoFile);

await fetch(`${baseUrl}/orders/${order_id}/company-details`, {
  method: 'PATCH',
  body: formData
});
```

### Step 5: Generate Preview
```javascript
const { document_id } = await fetch(
  `${baseUrl}/orders/${order_id}/generate-preview`,
  { method: 'POST' }
).then(r => r.json());
```

### Step 6: Show Preview to User
```javascript
// Option A: Download preview
const previewBlob = await fetch(
  `${baseUrl}/documents/${document_id}/preview`
).then(r => r.blob());

// Option B: Display in iframe
const previewUrl = `${baseUrl}/documents/${document_id}/preview`;
```

### Step 7: Process Payment
```javascript
// Create payment intent
const { client_secret } = await fetch(`${baseUrl}/payments/create-intent`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ order_id })
}).then(r => r.json());

// Complete payment with Stripe
const stripe = await loadStripe(STRIPE_PUBLISHABLE_KEY);
const result = await stripe.confirmCardPayment(client_secret, {
  payment_method: { card: cardElement }
});

if (result.error) {
  // Handle error
} else {
  // Payment successful - webhook will process automatically
  // Poll order status or wait for email
}
```

### Step 8: Check Payment Status
```javascript
// Poll order status after payment
const checkPaymentStatus = async () => {
  const order = await fetch(
    `${baseUrl}/orders/${order_id}/summary`
  ).then(r => r.json());
  
  return order.payment_status === 'paid';
};

// Poll every 2 seconds for up to 30 seconds
let attempts = 0;
const pollInterval = setInterval(async () => {
  attempts++;
  if (await checkPaymentStatus() || attempts > 15) {
    clearInterval(pollInterval);
    if (attempts <= 15) {
      // Payment confirmed, proceed to download
    }
  }
}, 2000);
```

### Step 9: Download Final Document
```javascript
// Get document details with access token
const docDetails = await fetch(
  `${baseUrl}/documents/${document_id}`
).then(r => r.json());

// Download final document
const finalDocBlob = await fetch(
  `${baseUrl}/documents/${document_id}/download?token=${docDetails.access_token}`
).then(r => r.blob());

// Trigger download
const url = window.URL.createObjectURL(finalDocBlob);
const a = document.createElement('a');
a.href = url;
a.download = 'ohs_manual.docx';
a.click();
```

---

## Error Handling

All API errors follow this structure:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field_name": "Specific validation error"
    }
  }
}
```

### Common Error Codes

| Status Code | Error Code | Description |
|------------|------------|-------------|
| 400 | `VALIDATION_ERROR` | Input validation failed |
| 400 | `INVALIDPROVINCEEXCEPTION` | Invalid province code |
| 403 | `FORBIDDEN` | Access denied (e.g., expired token) |
| 404 | `HTTP_404` | Resource not found |
| 413 | `PAYLOAD_TOO_LARGE` | File upload too large |
| 422 | `UNPROCESSABLE_ENTITY` | Request cannot be processed |
| 500 | `INTERNAL_SERVER_ERROR` | Server error |

### Error Handling Example
```javascript
async function apiCall(url, options) {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error.message || 'Request failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error.message);
    // Show user-friendly error message
    showErrorToast(error.message);
    throw error;
  }
}
```

---

## Data Models

### Province Codes
Valid Canadian province/territory codes:
- `AB` - Alberta
- `BC` - British Columbia
- `MB` - Manitoba
- `NB` - New Brunswick
- `NL` - Newfoundland and Labrador
- `NS` - Nova Scotia
- `NT` - Northwest Territories
- `NU` - Nunavut
- `ON` - Ontario
- `PE` - Prince Edward Island
- `QC` - Quebec
- `SK` - Saskatchewan
- `YT` - Yukon

### Order Status Values
- `draft` - Order created, awaiting company details
- `pending` - Company details added, awaiting payment
- `processing` - Payment received, generating document
- `completed` - Document ready for download
- `failed` - Order processing failed

### Payment Status Values
- `pending` - Payment not yet initiated
- `processing` - Payment being processed
- `paid` - Payment successful
- `failed` - Payment failed
- `refunded` - Payment refunded

### File Format Values
- `pdf` - Preview document format
- `docx` - Final document format

---

## Important Notes

### File Upload Constraints
- **Logo files:** PNG, JPG, JPEG, SVG only
- **Maximum file size:** 5MB
- **Recommended dimensions:** 500x500px or similar aspect ratio

### NAICS Codes
- Must be valid 6-digit NAICS codes
- Multiple codes separated by commas
- Example: `"111110,111120,111130"`
- At least one code required

### Access Tokens
- Document access tokens expire after 7 days
- Store tokens securely if implementing delayed downloads
- Expired tokens will return 403 Forbidden

### Rate Limiting
Currently no rate limiting is implemented, but this may be added in future versions.

### CORS
The API supports CORS for frontend integration. Ensure your frontend origin is properly configured if deploying to production.

### Webhooks
Payment webhooks are handled automatically by the backend. The frontend should poll the order status after payment confirmation to verify completion.

---

## Support

For questions or issues:
- Email: admin@djg-tech.com
- Technical Documentation: See `/docs` folder in repository
- Integration Test: See `tests/integration/test_complete_order_flow.py` for reference implementation

---

## Changelog

### Version 1.0.0 (Current)
- Initial API release
- Complete order flow endpoints
- Document preview and download
- Stripe payment integration
- Email notifications
