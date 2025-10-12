/**
 * Paystack Payment Service
 * Handles Paystack payment integration for the application
 */

export interface PaystackConfig {
  key: string;
  email: string;
  amount: number; // Amount in kobo (smallest currency unit)
  currency?: string;
  ref?: string;
  metadata?: {
    custom_fields?: Array<{
      display_name: string;
      variable_name: string;
      value: string | number;
    }>;
    [key: string]: any;
  };
  channels?: Array<
    "card" | "bank" | "ussd" | "qr" | "mobile_money" | "bank_transfer"
  >;
  onSuccess?: (response: PaystackResponse) => void;
  onClose?: () => void;
  callback?: (response: PaystackResponse) => void;
}

export interface PaystackResponse {
  reference: string;
  status: "success" | "failed" | "pending";
  trans?: string;
  transaction?: string;
  message?: string;
  trxref?: string;
}

export interface PaystackVerificationResponse {
  status: boolean;
  message: string;
  data?: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    message: string | null;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    metadata: any;
    log: any;
    fees: number;
    fees_split: any;
    authorization: {
      authorization_code: string;
      bin: string;
      last4: string;
      exp_month: string;
      exp_year: string;
      channel: string;
      card_type: string;
      bank: string;
      country_code: string;
      brand: string;
      reusable: boolean;
      signature: string;
      account_name: string | null;
    };
    customer: {
      id: number;
      first_name: string | null;
      last_name: string | null;
      email: string;
      customer_code: string;
      phone: string | null;
      metadata: any;
      risk_action: string;
    };
    plan: any;
    order_id: any;
    paidAt: string;
    createdAt: string;
    requested_amount: number;
    pos_transaction_data: any;
  };
}

declare global {
  interface Window {
    PaystackPop?: {
      setup: (config: PaystackConfig) => {
        openIframe: () => void;
      };
    };
  }
}

class PaystackService {
  private publicKey: string;
  private scriptLoaded: boolean = false;

  constructor() {
    this.publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "";
    this.loadPaystackScript();
  }

  /**
   * Load Paystack inline script
   */
  private loadPaystackScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.scriptLoaded && window.PaystackPop) {
        resolve();
        return;
      }

      // Check if script already exists
      const existingScript = document.querySelector('script[src*="paystack"]');
      if (existingScript) {
        existingScript.addEventListener("load", () => {
          this.scriptLoaded = true;
          resolve();
        });
        return;
      }

      // Create and load the script
      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.async = true;
      script.onload = () => {
        this.scriptLoaded = true;
        resolve();
      };
      script.onerror = () => {
        reject(new Error("Failed to load Paystack script"));
      };
      document.body.appendChild(script);
    });
  }

  /**
   * Generate a unique transaction reference
   */
  generateReference(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);
    return `OMU-${timestamp}-${random}`;
  }

  /**
   * Convert amount from Ghana Cedis to pesewas (smallest unit)
   * Paystack uses pesewas for GHS (1 GHS = 100 pesewas)
   */
  convertToPesewas(amount: number): number {
    return Math.round(amount * 100);
  }

  /**
   * Convert amount from pesewas to Ghana Cedis
   */
  convertFromPesewas(amount: number): number {
    return amount / 100;
  }

  /**
   * Initiate Paystack payment
   */
  async initiatePayment(config: PaystackConfig): Promise<void> {
    if (!this.publicKey) {
      throw new Error(
        "Paystack public key is not configured. Please add VITE_PAYSTACK_PUBLIC_KEY to your .env file."
      );
    }

    try {
      await this.loadPaystackScript();

      if (!window.PaystackPop) {
        throw new Error("Paystack script failed to load");
      }

      const handler = window.PaystackPop.setup({
        key: this.publicKey,
        email: config.email,
        amount: config.amount,
        currency: config.currency || "GHS",
        ref: config.ref || this.generateReference(),
        metadata: config.metadata,
        channels: config.channels,
        onClose: () => {
          console.log("Payment window closed");
          config.onClose?.();
        },
        callback: (response: PaystackResponse) => {
          console.log("Payment successful", response);
          config.onSuccess?.(response);
        },
      });

      handler.openIframe();
    } catch (error) {
      console.error("Error initiating Paystack payment:", error);
      throw error;
    }
  }

  /**
   * Verify payment transaction
   * Note: This should ideally be done on the server-side for security
   * For production, create a backend endpoint to verify transactions
   */
  async verifyPayment(
    reference: string
  ): Promise<PaystackVerificationResponse> {
    try {
      // In production, this should call your backend endpoint
      // which then calls Paystack's verification endpoint with your secret key
      const response = await fetch(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${
              import.meta.env.VITE_PAYSTACK_SECRET_KEY || ""
            }`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to verify payment");
      }

      const data: PaystackVerificationResponse = await response.json();
      return data;
    } catch (error) {
      console.error("Error verifying payment:", error);
      throw error;
    }
  }

  /**
   * Get supported payment channels for Ghana
   */
  getGhanaPaymentChannels(): Array<"card" | "bank" | "mobile_money"> {
    return ["card", "mobile_money", "bank"];
  }

  /**
   * Create payment metadata for better transaction tracking
   */
  createPaymentMetadata(orderData: {
    orderId?: string;
    userId: string;
    customerName: string;
    items: Array<{ name: string; quantity: number; price: number }>;
    shippingAddress?: string;
  }): PaystackConfig["metadata"] {
    return {
      orderId: orderData.orderId,
      userId: orderData.userId,
      customerName: orderData.customerName,
      itemsCount: orderData.items.length,
      custom_fields: [
        {
          display_name: "Customer Name",
          variable_name: "customer_name",
          value: orderData.customerName,
        },
        {
          display_name: "Items",
          variable_name: "items_count",
          value: orderData.items.length,
        },
        ...(orderData.orderId
          ? [
              {
                display_name: "Order ID",
                variable_name: "order_id",
                value: orderData.orderId,
              },
            ]
          : []),
      ],
    };
  }

  /**
   * Format amount for display (GHS)
   */
  formatAmount(amount: number, currency: string = "GHS"): string {
    const symbols: { [key: string]: string } = {
      GHS: "₵",
      NGN: "₦",
      USD: "$",
      ZAR: "R",
    };

    const symbol = symbols[currency] || currency;
    return `${symbol}${amount.toFixed(2)}`;
  }

  /**
   * Check if Paystack is properly configured
   */
  isConfigured(): boolean {
    return (
      !!this.publicKey && this.publicKey !== "pk_test_your_public_key_here"
    );
  }
}

// Export singleton instance
export const paystackService = new PaystackService();

// Export class for testing or custom instances
export default PaystackService;
