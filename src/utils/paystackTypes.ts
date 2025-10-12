/**
 * Paystack Payment Types & Interfaces
 * Quick reference for working with Paystack in the application
 */

// ==========================================
// PAYMENT CONFIGURATION
// ==========================================

export interface PaystackConfig {
  key: string; // Your Paystack public key
  email: string; // Customer's email
  amount: number; // Amount in pesewas (GHS * 100)
  currency?: string; // Default: 'GHS'
  ref?: string; // Transaction reference
  metadata?: PaystackMetadata; // Additional transaction data
  channels?: PaymentChannel[]; // Allowed payment methods
  callback?: (response: PaystackResponse) => void;
  onSuccess?: (response: PaystackResponse) => void;
  onClose?: () => void;
}

export type PaymentChannel =
  | "card"
  | "bank"
  | "ussd"
  | "qr"
  | "mobile_money"
  | "bank_transfer";

export interface PaystackMetadata {
  custom_fields?: CustomField[];
  orderId?: string;
  userId?: string;
  customerName?: string;
  [key: string]: any;
}

export interface CustomField {
  display_name: string;
  variable_name: string;
  value: string | number;
}

// ==========================================
// PAYMENT RESPONSE
// ==========================================

export interface PaystackResponse {
  reference: string; // Transaction reference
  status: "success" | "failed" | "pending";
  trans?: string; // Transaction ID
  transaction?: string; // Alternative transaction ID
  message?: string; // Response message
  trxref?: string; // Transaction reference (alternative)
}

// ==========================================
// VERIFICATION RESPONSE
// ==========================================

export interface PaystackVerificationResponse {
  status: boolean;
  message: string;
  data?: VerificationData;
}

export interface VerificationData {
  id: number;
  status: string; // 'success', 'failed', 'abandoned'
  reference: string;
  amount: number; // Amount in kobo/pesewas
  gateway_response: string;
  paid_at: string;
  created_at: string;
  channel: string; // 'card', 'mobile_money', etc.
  currency: string;
  authorization: AuthorizationData;
  customer: CustomerData;
}

export interface AuthorizationData {
  authorization_code: string;
  bin: string; // First 6 digits of card
  last4: string; // Last 4 digits of card
  exp_month: string;
  exp_year: string;
  channel: string;
  card_type: string;
  bank: string;
  country_code: string;
  brand: string; // 'visa', 'mastercard', etc.
}

export interface CustomerData {
  id: number;
  email: string;
  customer_code: string;
}

// ==========================================
// ORDER PAYMENT DETAILS
// ==========================================

export interface OrderPaymentDetails {
  provider?: string; // 'Paystack', 'MTN', 'Telecel', etc.
  cardLast4?: string; // Last 4 digits for card
  transactionId?: string; // Transaction ID
  paystackReference?: string; // Paystack reference
  channel?: string; // Payment channel used
}

// ==========================================
// USAGE EXAMPLES
// ==========================================

/*

1. BASIC PAYMENT:
------------------
import { paystackService } from './paystackService';

await paystackService.initiatePayment({
  email: 'customer@example.com',
  amount: paystackService.convertToPesewas(100.50),
  ref: paystackService.generateReference(),
  onSuccess: (response) => {
    console.log('Payment successful:', response.reference);
  }
});


2. PAYMENT WITH METADATA:
-------------------------
const metadata = paystackService.createPaymentMetadata({
  orderId: 'OMU-12345',
  userId: 'user-123',
  customerName: 'John Doe',
  items: [
    { name: 'Product 1', quantity: 2, price: 50 },
    { name: 'Product 2', quantity: 1, price: 100 }
  ]
});

await paystackService.initiatePayment({
  email: 'customer@example.com',
  amount: paystackService.convertToPesewas(200),
  metadata: metadata,
  onSuccess: handlePaymentSuccess
});


3. RESTRICT PAYMENT CHANNELS:
-----------------------------
await paystackService.initiatePayment({
  email: 'customer@example.com',
  amount: paystackService.convertToPesewas(100),
  channels: ['card', 'mobile_money'], // Only card and mobile money
  onSuccess: handlePaymentSuccess
});


4. VERIFY PAYMENT (Server-side recommended):
--------------------------------------------
const verification = await paystackService.verifyPayment(reference);
if (verification.status && verification.data?.status === 'success') {
  // Payment verified successfully
  console.log('Amount paid:', verification.data.amount / 100);
}


5. CONVERT AMOUNTS:
------------------
const amountInGHS = 150.50;
const amountInPesewas = paystackService.convertToPesewas(amountInGHS); // 15050

const amountInPesewas = 15050;
const amountInGHS = paystackService.convertFromPesewas(amountInPesewas); // 150.50


6. FORMAT AMOUNTS FOR DISPLAY:
------------------------------
const formatted = paystackService.formatAmount(150.50, 'GHS'); // "₵150.50"


7. CHECK CONFIGURATION:
----------------------
if (paystackService.isConfigured()) {
  // Paystack is properly set up
} else {
  console.error('Paystack not configured. Add VITE_PAYSTACK_PUBLIC_KEY to .env');
}

*/

// ==========================================
// TEST DATA
// ==========================================

export const PAYSTACK_TEST_DATA = {
  cards: {
    successful: {
      number: "5531886652142950",
      cvv: "564",
      expiryMonth: "09",
      expiryYear: "32",
      pin: "3310",
      otp: "123456",
    },
    insufficientFunds: {
      number: "5060990580000217",
      cvv: "828",
      expiryMonth: "09",
      expiryYear: "32",
    },
    declined: {
      number: "5143010522339965",
      cvv: "011",
      expiryMonth: "09",
      expiryYear: "32",
    },
  },
  mobileMoney: {
    mtn: "0551234987",
    vodafone: "0201234987",
    airtelTigo: "0271234987",
  },
};

// ==========================================
// WEBHOOK EVENTS
// ==========================================

export type PaystackWebhookEvent =
  | "charge.success" // Successful charge
  | "charge.failed" // Failed charge
  | "transfer.success" // Successful transfer
  | "transfer.failed" // Failed transfer
  | "transfer.reversed" // Transfer reversed
  | "subscription.create" // Subscription created
  | "subscription.disable" // Subscription disabled
  | "invoice.create" // Invoice created
  | "invoice.update" // Invoice updated
  | "invoice.payment_failed"; // Invoice payment failed

/*

WEBHOOK HANDLER EXAMPLE:
------------------------
app.post('/api/webhooks/paystack', (req, res) => {
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (hash === req.headers['x-paystack-signature']) {
    const event = req.body;
    
    switch (event.event) {
      case 'charge.success':
        // Handle successful payment
        break;
      case 'charge.failed':
        // Handle failed payment
        break;
      default:
        console.log('Unhandled event:', event.event);
    }
  }
  
  res.sendStatus(200);
});

*/
