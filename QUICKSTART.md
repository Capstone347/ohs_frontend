# Quick Start Guide

## Prerequisites

1. Backend server running on `http://localhost:8000`
2. Node.js/Bun installed
3. All dependencies installed

## Installation

```bash
# Install dependencies
bun install
```

## Running the Application

```bash
# Start development server
bun run dev
```

The application will be available at `http://localhost:5173` (or the port shown in terminal).

## Testing the Integration

### 1. Start the Backend

First, ensure your backend is running:

```bash
cd /path/to/backend
python -m uvicorn main:app --reload --port 8000
```

### 2. Test the Complete Flow

1. **Navigate to the homepage** at `http://localhost:5173`

2. **Click "Get Started"** to begin the wizard

3. **Step 1: Select Plan**
   - Enter your full name (e.g., "John Doe")
   - Enter your email (e.g., "john@example.com")
   - Select a plan (Basic or Comprehensive)
   - Optionally add the Industry-Specific Add-On
   - Click "Continue"
   
   **What happens:** Creates an order in the backend and stores the `order_id`

4. **Step 2: Company Information**
   - Enter company name (e.g., "Acme Corp")
   - Optionally upload your company logo
   - Click "Continue"

5. **Step 3: Document Generation**
   - Select your province
   - Enter NAICS code (e.g., "23" for Construction)
   - Click "Generate Document Preview"
   
   **What happens:** 
   - Sends company details to backend
   - Generates document preview
   - Displays table of contents with blur effect

6. **Step 4: Legal Terms**
   - Review the table of contents
   - Read the legal disclaimer
   - Check "I accept" and enter your name
   - Click "Continue to Payment"
   
   **What happens:** Records legal acceptance in backend

7. **Step 5: Payment**
   - View order summary
   - Enter payment details (currently simulated)
   - Click "Pay"
   
   **What happens:** Creates payment intent (Stripe integration pending)

8. **Success Page**
   - Wait for payment confirmation (polls backend)
   - Click "Download Manual" to get the DOCX file
   
   **What happens:** 
   - Polls order status every 2 seconds
   - Downloads final document when payment is confirmed

## Checking Backend Connectivity

Open your browser console and check for API calls:

1. **On Step 1 load**: Should see `GET /api/v1/plans`
2. **On Step 1 continue**: Should see `POST /api/v1/orders`
3. **On Step 3 generate**: Should see:
   - `PATCH /api/v1/orders/{id}/company-details`
   - `POST /api/v1/orders/{id}/generate-preview`
4. **On Step 4 continue**: Should see `POST /api/v1/legal/acknowledge`
5. **On Step 5 pay**: Should see `POST /api/v1/payments/create-intent`
6. **On Success page**: Should see `GET /api/v1/orders/{id}/summary` (polling)
7. **On download**: Should see:
   - `GET /api/v1/documents/{id}`
   - `GET /api/v1/documents/{id}/download?token=...`

## Troubleshooting

### Backend Not Responding

**Error:** Network errors or "Failed to fetch"

**Solution:**
1. Verify backend is running: `curl http://localhost:8000/api/v1/health`
2. Check CORS is enabled on backend
3. Verify port 8000 is not blocked

### Order Creation Fails

**Error:** "Failed to create order"

**Solution:**
1. Check console for error details
2. Verify all required fields are filled
3. Check backend logs for validation errors

### Document Generation Fails

**Error:** "Failed to generate preview"

**Solution:**
1. Ensure company name is provided in Step 2
2. Verify NAICS code is 2-6 digits
3. Check backend has access to document templates

### Payment Status Not Updating

**Error:** Success page stuck on "Processing"

**Solution:**
1. Check backend webhook is configured
2. Verify order exists: `curl http://localhost:8000/api/v1/orders/{id}/summary`
3. Manually update order status in backend for testing

### Download Fails

**Error:** "Failed to download document"

**Solution:**
1. Verify payment status is "paid"
2. Check document was generated
3. Verify access token is valid (7-day expiration)

## API Base URL

The API base URL is defined in `src/services/api.ts`:

```typescript
const API_BASE_URL = 'http://localhost:8000/api/v1';
```

To change for production:
1. Create `.env` file
2. Add: `VITE_API_URL=https://your-api.com/api/v1`
3. Update api.ts: `const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';`

## Development Notes

### State Management

The app uses `WizardContext` to manage state across steps:
- `orderId`: Backend order ID
- `documentId`: Generated document ID
- `userEmail`, `fullName`: User information
- `companyName`: Company name
- `logoFile`: Uploaded logo
- `naicsCode`: Industry code
- `province`: Selected province

### API Error Handling

All API errors are caught and displayed via toast notifications:

```typescript
try {
  await api.someEndpoint();
} catch (error) {
  if (error instanceof ApiError) {
    toast.error(error.message);
  } else {
    toast.error('An unexpected error occurred');
  }
}
```

## Next Steps

1. **Implement Stripe Payment**: Add Stripe Elements to Step 5
2. **Add Preview Download**: Enable PDF preview download in Step 3
3. **Implement Order History**: Show past orders in Orders page
4. **Add Email Verification**: Verify email before order creation
5. **Improve Error Handling**: Add retry logic and better error messages

## Support

For issues or questions:
- Check `/docs/API_DOCUMENTATION.md` for API details
- Check `/docs/INTEGRATION_GUIDE.md` for integration details
- Review backend logs for API errors
- Check browser console for frontend errors
