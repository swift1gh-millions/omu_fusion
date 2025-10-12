# Paystack Payment Integration Guide

## Overview

This project now includes **Paystack payment integration** for secure online payments in Ghana. Paystack supports:

- 💳 Credit/Debit Cards (Visa, Mastercard, Verve)
- 📱 Mobile Money (MTN, Vodafone, AirtelTigo)
- 🏦 Bank Transfers
- 💰 USSD

## Setup Instructions

### 1. Get Your Paystack API Keys

1. Go to [Paystack Dashboard](https://dashboard.paystack.com/)
2. Sign up or log in to your account
3. Navigate to **Settings → API Keys & Webhooks**
4. Copy your **Public Key** (starts with `pk_test_` for test mode or `pk_live_` for live mode)

### 2. Configure Environment Variables

Open `.env.local` file and update the Paystack public key:

```bash
# Paystack Integration
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_actual_public_key_here
```

**Important:**

- Never commit your secret key to version control
- Use test keys (`pk_test_...`) during development
- Switch to live keys (`pk_live_...`) only in production

### 3. Test Your Integration

#### Test Cards (provided by Paystack):

```
Card Number: 5531 8866 5214 2950
CVV: 564
Expiry Date: Any future date
PIN: 3310
OTP: 123456
```

#### Test Mobile Money Numbers:

```
MTN: 0551234987
Vodafone: 0201234987
AirtelTigo: 0271234987
```

## Files Created/Modified

### New Files:

1. **`src/utils/paystackService.ts`** - Core Paystack integration service
2. **`src/components/payments/PaystackButton.tsx`** - Reusable payment button component

### Modified Files:

1. **`src/pages/CheckoutPage.tsx`** - Added Paystack payment flow
2. **`src/utils/orderService.ts`** - Added Paystack transaction tracking
3. **`src/utils/firebase.ts`** - Added environment variable types
4. **`.env.local`** - Added Paystack configuration

## How It Works

### Payment Flow:

1. **Customer adds items to cart** → Proceeds to checkout
2. **Fills shipping information** → Step 1: Contact & Shipping
3. **Selects "Paystack" as payment method** → Step 2: Payment Method
4. **Reviews order** → Step 3: Review & Pay
5. **Clicks "Pay ₵XX.XX" button** → Paystack popup opens
6. **Completes payment** → Order is created and cart is cleared
7. **Redirected to success page** → Order confirmation displayed

### Payment Methods Supported:

#### 1. Paystack (Recommended) ✅

- **All major cards**: Visa, Mastercard, Verve
- **Mobile Money**: MTN, Vodafone, AirtelTigo
- **Bank Transfer**: Direct bank account transfer
- **Secure**: PCI-DSS compliant, 3D Secure enabled
- **Fast**: Instant payment confirmation

#### 2. Legacy Mobile Money (Optional)

- Direct integration with mobile money providers
- Requires additional API setup

#### 3. Legacy Card Payment (Optional)

- Manual card form
- For custom payment processing

## Code Examples

### Using the PaystackButton Component:

```tsx
import { PaystackButton } from "../components/payments/PaystackButton";

<PaystackButton
  email="customer@example.com"
  amount={150.5} // Amount in GHS
  customerName="John Doe"
  onSuccess={(response) => {
    console.log("Payment successful:", response);
    // Handle successful payment
  }}
  onClose={() => {
    console.log("Payment cancelled");
    // Handle payment cancellation
  }}
  metadata={{
    orderId: "OMU-12345",
    userId: "user-123",
  }}
/>;
```

### Using the Paystack Service Directly:

```tsx
import { paystackService } from "../utils/paystackService";

// Initiate payment
await paystackService.initiatePayment({
  email: "customer@example.com",
  amount: paystackService.convertToPesewas(150.5), // Convert GHS to pesewas
  ref: paystackService.generateReference(),
  metadata: {
    orderId: "OMU-12345",
    customField: "value",
  },
  onSuccess: (response) => {
    console.log("Payment successful:", response);
  },
});
```

## Security Best Practices

### ✅ DO:

- Store only the **public key** in `.env.local`
- Verify payments on the server-side (recommended)
- Use HTTPS in production
- Validate payment amounts before processing
- Log all transactions for audit purposes

### ❌ DON'T:

- Expose your **secret key** in frontend code
- Trust payment amounts from the client
- Skip payment verification
- Store card details (let Paystack handle it)

## Production Deployment

### Before Going Live:

1. **Switch to Live API Keys**:

   ```bash
   VITE_PAYSTACK_PUBLIC_KEY=pk_live_your_live_key_here
   ```

2. **Set Up Webhooks** (Recommended):

   - Go to Paystack Dashboard → Settings → Webhooks
   - Add your webhook URL: `https://yourdomain.com/api/webhooks/paystack`
   - Handle events: `charge.success`, `transfer.success`, etc.

3. **Implement Server-Side Verification**:

   ```javascript
   // Backend endpoint to verify payment
   app.post("/api/verify-payment/:reference", async (req, res) => {
     const response = await fetch(
       `https://api.paystack.co/transaction/verify/${req.params.reference}`,
       {
         headers: {
           Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
         },
       }
     );
     const data = await response.json();
     // Verify amount, status, etc.
     res.json(data);
   });
   ```

4. **Test Thoroughly**:
   - Test all payment methods (card, mobile money, bank)
   - Test payment failures and cancellations
   - Verify order creation and inventory updates
   - Test refund scenarios

## Troubleshooting

### Issue: "Paystack script failed to load"

**Solution**: Check your internet connection and ensure Paystack CDN is accessible

### Issue: "Payment system is not configured"

**Solution**: Ensure `VITE_PAYSTACK_PUBLIC_KEY` is set in `.env.local` and restart dev server

### Issue: Payment succeeds but order not created

**Solution**: Check browser console for errors, verify database permissions

### Issue: Amount mismatch error

**Solution**: Ensure amounts are converted to pesewas (multiply by 100)

## Support & Resources

- 📚 [Paystack Documentation](https://paystack.com/docs/)
- 💬 [Paystack Support](https://paystack.com/contact)
- 🔧 [Paystack API Reference](https://paystack.com/docs/api/)
- 🧪 [Test Cards & Scenarios](https://paystack.com/docs/payments/test-payments/)

## Monitoring & Analytics

Track payment metrics in Paystack Dashboard:

- Transaction volume
- Success/failure rates
- Popular payment methods
- Settlement reports
- Customer insights

## Next Steps

1. ✅ Get your Paystack API keys
2. ✅ Update `.env.local` with your public key
3. ✅ Test with test cards and mobile money
4. ✅ Implement webhook handlers (recommended)
5. ✅ Add server-side payment verification
6. ✅ Go live with production keys

---

**Need Help?** Contact Paystack support or refer to their comprehensive documentation.
