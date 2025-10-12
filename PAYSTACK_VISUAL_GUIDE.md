# Paystack Payment Integration - Visual Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         OMU FUSION FRONTEND                         │
│                                                                     │
│  ┌─────────────────┐      ┌──────────────────┐                    │
│  │   CheckoutPage  │─────▶│ PaystackButton   │                    │
│  │   (Step 1-3)    │      │   Component      │                    │
│  └─────────────────┘      └──────────────────┘                    │
│           │                        │                                │
│           │                        │                                │
│           ▼                        ▼                                │
│  ┌─────────────────────────────────────────┐                      │
│  │      PaystackService                    │                      │
│  │  • initiatePayment()                    │                      │
│  │  • generateReference()                  │                      │
│  │  • convertToPesewas()                   │                      │
│  │  • createPaymentMetadata()              │                      │
│  └─────────────────────────────────────────┘                      │
│           │                                                         │
└───────────┼─────────────────────────────────────────────────────────┘
            │
            │ HTTPS
            ▼
┌───────────────────────────────────────────────────────────────────┐
│                      PAYSTACK API                                 │
│                                                                   │
│  ┌──────────────────┐    ┌──────────────────┐                   │
│  │  Payment Popup   │───▶│  Card Processor  │                   │
│  │   (Secure Form)  │    │  (Visa/Master)   │                   │
│  └──────────────────┘    └──────────────────┘                   │
│                                                                   │
│  ┌──────────────────┐    ┌──────────────────┐                   │
│  │ Mobile Money     │───▶│  MoMo Gateway    │                   │
│  │   Interface      │    │  (MTN/Vodafone)  │                   │
│  └──────────────────┘    └──────────────────┘                   │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
            │
            │ Callback
            ▼
┌───────────────────────────────────────────────────────────────────┐
│                         YOUR BACKEND                              │
│                                                                   │
│  ┌──────────────────┐    ┌──────────────────┐                   │
│  │  OrderService    │───▶│    Firebase      │                   │
│  │  • placeOrder()  │    │   (Firestore)    │                   │
│  │  • savePayment() │    │                  │                   │
│  └──────────────────┘    └──────────────────┘                   │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

## Payment Flow Sequence

```
┌─────────┐         ┌──────────┐         ┌──────────┐         ┌─────────┐
│ Customer│         │ Your App │         │ Paystack │         │Firebase │
└────┬────┘         └────┬─────┘         └────┬─────┘         └────┬────┘
     │                   │                     │                    │
     │ Add to Cart       │                     │                    │
     │──────────────────▶│                     │                    │
     │                   │                     │                    │
     │ Proceed to        │                     │                    │
     │ Checkout          │                     │                    │
     │──────────────────▶│                     │                    │
     │                   │                     │                    │
     │ Fill Shipping     │                     │                    │
     │ Information       │                     │                    │
     │──────────────────▶│                     │                    │
     │                   │                     │                    │
     │ Select Paystack   │                     │                    │
     │──────────────────▶│                     │                    │
     │                   │                     │                    │
     │ Click "Pay"       │                     │                    │
     │──────────────────▶│ Initialize Payment  │                    │
     │                   │────────────────────▶│                    │
     │                   │                     │                    │
     │                   │◀────────────────────│                    │
     │                   │ Payment Popup       │                    │
     │◀──────────────────│                     │                    │
     │                   │                     │                    │
     │ Enter Card/MoMo   │                     │                    │
     │ Details           │                     │                    │
     │──────────────────────────────────────▶│                    │
     │                   │                     │                    │
     │                   │                     │ Process Payment    │
     │                   │                     │────┐               │
     │                   │                     │◀───┘               │
     │                   │                     │                    │
     │                   │◀────────────────────│                    │
     │                   │ Payment Success     │                    │
     │                   │                     │                    │
     │                   │ Create Order        │                    │
     │                   │────────────────────────────────────────▶│
     │                   │                     │                    │
     │                   │◀────────────────────────────────────────│
     │                   │ Order ID            │                    │
     │                   │                     │                    │
     │◀──────────────────│                     │                    │
     │ Order Confirmation│                     │                    │
     │                   │                     │                    │
```

## Component Hierarchy

```
CheckoutPage
│
├─ Step 1: Contact Information
│  ├─ Email Input
│  ├─ Phone Input
│  ├─ Name Inputs
│  └─ Address Inputs
│
├─ Step 2: Payment Method
│  ├─ Payment Method Selection
│  │  ├─ [✓] Paystack (Recommended)
│  │  ├─ [ ] Mobile Money (Legacy)
│  │  └─ [ ] Card Payment (Legacy)
│  │
│  └─ Paystack Info Banner
│      └─ "Secure payment via Paystack..."
│
└─ Step 3: Review & Pay
   ├─ Order Summary
   │  ├─ Shipping Address
   │  ├─ Payment Method
   │  └─ Order Items
   │
   └─ Payment Action
      ├─ If Paystack Selected:
      │  └─ PaystackButton
      │     ├─ Props: email, amount, metadata
      │     ├─ onSuccess → handlePaystackSuccess()
      │     └─ onClose → handlePaystackClose()
      │
      └─ If Other Method:
         └─ Standard Submit Button
```

## File Structure & Responsibilities

```
src/
│
├─ components/
│  └─ payments/
│     └─ PaystackButton.tsx
│        │
│        ├─ Renders: Payment button with loading states
│        ├─ Validates: Email, amount, configuration
│        ├─ Calls: paystackService.initiatePayment()
│        └─ Handles: Success/failure callbacks
│
├─ utils/
│  ├─ paystackService.ts
│  │  │
│  │  ├─ loadPaystackScript()      → Load Paystack JS SDK
│  │  ├─ initiatePayment()         → Open payment popup
│  │  ├─ generateReference()       → Create unique ref
│  │  ├─ convertToPesewas()        → GHS → Pesewas
│  │  ├─ convertFromPesewas()      → Pesewas → GHS
│  │  ├─ createPaymentMetadata()   → Build metadata object
│  │  ├─ formatAmount()            → Format for display
│  │  └─ isConfigured()            → Check if keys set
│  │
│  ├─ paystackTypes.ts
│  │  │
│  │  ├─ PaystackConfig            → Configuration interface
│  │  ├─ PaystackResponse          → Payment response
│  │  ├─ PaystackVerificationResponse → Verification data
│  │  └─ PAYSTACK_TEST_DATA        → Test cards/numbers
│  │
│  └─ orderService.ts
│     │
│     ├─ placeOrder()              → Create order in DB
│     ├─ Order interface           → Updated with Paystack fields
│     └─ paymentDetails            → Includes paystackReference
│
└─ pages/
   └─ CheckoutPage.tsx
      │
      ├─ State Management:
      │  ├─ formData                → Form values
      │  ├─ currentStep             → 1, 2, or 3
      │  ├─ isProcessing            → Order processing
      │  └─ paystackReference       → Transaction ref
      │
      ├─ Validation:
      │  ├─ validateStep1()         → Contact info
      │  ├─ validateStep2()         → Payment method
      │  └─ validateCurrentStep()   → Current validation
      │
      ├─ Payment Handlers:
      │  ├─ handlePaystackSuccess() → Process payment
      │  ├─ handlePaystackClose()   → Handle cancellation
      │  ├─ processPayment()        → Legacy payments
      │  └─ completeOrder()         → Create order
      │
      └─ Rendering:
         ├─ Step 1: Contact Form
         ├─ Step 2: Payment Selection
         └─ Step 3: Review & PaystackButton
```

## Data Flow

```
User Input
    │
    ▼
FormData State
    │
    ├─ email: string
    ├─ phone: string
    ├─ firstName: string
    ├─ lastName: string
    ├─ digitalAddress: string
    ├─ paymentMethod: "paystack"
    └─ ...
    │
    ▼
PaystackButton Component
    │
    ├─ email: formData.email
    ├─ amount: total (in GHS)
    ├─ customerName: firstName + lastName
    └─ metadata: { orderId, userId, items }
    │
    ▼
PaystackService
    │
    ├─ Convert: GHS → Pesewas (x100)
    ├─ Generate: Reference (OMU-...)
    └─ Initialize: Paystack popup
    │
    ▼
Paystack API
    │
    ├─ Display: Payment form
    ├─ Process: Card/MoMo payment
    └─ Return: Payment response
    │
    ▼
handlePaystackSuccess()
    │
    ├─ Store: paystackReference
    └─ Call: completeOrder()
    │
    ▼
OrderService
    │
    ├─ Create: Order document
    ├─ Include: Payment details
    └─ Save: To Firestore
    │
    ▼
Success Page
    │
    └─ Display: Order confirmation
```

## Environment Configuration

```
.env.local
    │
    ├─ VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxxxx
    │  │
    │  └─ Used by: paystackService
    │     │
    │     └─ Passed to: Paystack API
    │
    └─ VITE_FIREBASE_* (existing)
       │
       └─ Used by: firebase.ts, orderService
```

## Error Handling Flow

```
┌─────────────────────────────────────┐
│  Error Scenarios                    │
└─────────────────────────────────────┘
           │
           ├─ Public Key Not Set
           │  └─ Show: "Payment system not configured"
           │
           ├─ Invalid Email/Amount
           │  └─ Show: "Invalid payment details"
           │
           ├─ Payment Cancelled
           │  └─ Call: onClose() → Show "Payment cancelled"
           │
           ├─ Payment Failed
           │  └─ Paystack shows error → User retries
           │
           ├─ Network Error
           │  └─ Show: "Failed to initialize payment"
           │
           └─ Order Creation Failed
              └─ Show: "Failed to place order"
```

## Security Layers

```
┌──────────────────────────────────────────────┐
│  Security Implementation                     │
└──────────────────────────────────────────────┘
           │
           ├─ Frontend (Public Key Only)
           │  ├─ No sensitive data stored
           │  ├─ Public key in .env.local
           │  └─ Amount validation
           │
           ├─ Paystack (Payment Processing)
           │  ├─ PCI-DSS compliant
           │  ├─ 3D Secure authentication
           │  ├─ Encrypted transmission
           │  └─ Fraud detection
           │
           └─ Backend (Future: Verification)
              ├─ Secret key (server-only)
              ├─ Webhook signature validation
              ├─ Amount verification
              └─ Transaction verification
```

---

This visual guide helps understand how all pieces fit together!
