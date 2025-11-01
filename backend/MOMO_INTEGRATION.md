# MoMo API Integration Guide

## Where to Add Your MoMo API Integration

### 1. In `backend/server.js` - `/book` endpoint (around line 48-69)

After creating the booking in the database, you'll want to initiate the MoMo payment. Replace the TODO comment with your actual MoMo API call:

```javascript
// Example structure (replace with your actual MoMo SDK/API call):
const momoResponse = await initiateMoMoPayment({
  apiKey: process.env.MOMO_API_KEY,
  apiSecret: process.env.MOMO_API_SECRET,
  amount: 5000, // Amount in your currency (e.g., cents or smallest unit)
  phone: parent_phone,
  booking_id: result.insertId,
  callback_url: `${process.env.BACKEND_URL}/webhook/momo`,
  external_reference: confirmation_code
});

// If MoMo returns a payment URL, include it in the response
res.json({ 
  message: 'Booking created. Please complete payment.', 
  booking_id: result.insertId,
  confirmation_code: confirmation_code,
  payment_url: momoResponse.payment_url // Redirect user to this URL
});
```

### 2. Environment Variables Needed

Add to your `.env` file:
```
MOMO_API_KEY=your_momo_api_key
MOMO_API_SECRET=your_momo_api_secret
BACKEND_URL=http://localhost:5000  # Or your production URL
```

### 3. Webhook Already Set Up

The `/webhook/momo` endpoint (line 74+) is already configured to:
- Receive payment confirmation from MoMo
- Mark booking as paid
- Generate QR code
- Send ticket email with QR code attachment

Just make sure MoMo is configured to call your webhook URL: `${BACKEND_URL}/webhook/momo`

### 4. Testing

For testing without real MoMo integration:
- The booking will be created in the database
- The webhook can be called manually via POST with:
```json
{
  "payment_reference": "test_ref_123",
  "status": "SUCCESS",
  "booking_id": 1
}
```

