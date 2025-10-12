import React, { useState } from "react";
import { motion } from "framer-motion";
import { HiLockClosed } from "react-icons/hi";
import {
  paystackService,
  PaystackConfig,
  PaystackResponse,
} from "../../utils/paystackService";
import { Button } from "../ui/Button";
import toast from "react-hot-toast";

interface PaystackButtonProps {
  email: string;
  amount: number; // Amount in Ghana Cedis (will be converted to pesewas)
  customerName: string;
  onSuccess: (response: PaystackResponse) => void;
  onClose?: () => void;
  disabled?: boolean;
  metadata?: PaystackConfig["metadata"];
  className?: string;
  buttonText?: string;
  loadingText?: string;
  channels?: PaystackConfig["channels"];
}

/**
 * Reusable Paystack Payment Button Component
 *
 * Usage:
 * ```tsx
 * <PaystackButton
 *   email="customer@example.com"
 *   amount={100.50}
 *   customerName="John Doe"
 *   onSuccess={(response) => console.log('Payment successful:', response)}
 *   onClose={() => console.log('Payment cancelled')}
 * />
 * ```
 */
export const PaystackButton: React.FC<PaystackButtonProps> = ({
  email,
  amount,
  customerName,
  onSuccess,
  onClose,
  disabled = false,
  metadata,
  className = "",
  buttonText = "Pay Now",
  loadingText = "Processing...",
  channels,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    // Validate configuration
    if (!paystackService.isConfigured()) {
      toast.error("Payment system is not configured. Please contact support.");
      console.error(
        "Paystack public key is not set. Add VITE_PAYSTACK_PUBLIC_KEY to your .env file."
      );
      return;
    }

    // Validate inputs
    if (!email || !amount || amount <= 0) {
      toast.error("Invalid payment details");
      return;
    }

    setIsProcessing(true);

    try {
      const reference = paystackService.generateReference();
      const amountInPesewas = paystackService.convertToPesewas(amount);

      const config: PaystackConfig = {
        key: "", // Will be set by the service
        email,
        amount: amountInPesewas,
        currency: "GHS",
        ref: reference,
        metadata: metadata || {
          custom_fields: [
            {
              display_name: "Customer Name",
              variable_name: "customer_name",
              value: customerName,
            },
          ],
        },
        channels: channels || paystackService.getGhanaPaymentChannels(),
        onSuccess: (response) => {
          setIsProcessing(false);
          toast.success("Payment successful!");
          onSuccess(response);
        },
        onClose: () => {
          setIsProcessing(false);
          toast.error("Payment cancelled");
          onClose?.();
        },
      };

      await paystackService.initiatePayment(config);
    } catch (error) {
      setIsProcessing(false);
      console.error("Payment error:", error);
      toast.error("Failed to initialize payment. Please try again.");
    }
  };

  return (
    <motion.div
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={className}>
      <Button
        variant="primary"
        size="lg"
        onClick={handlePayment}
        disabled={disabled || isProcessing}
        className={`w-full flex items-center justify-center space-x-2 ${
          disabled || isProcessing ? "opacity-60 cursor-not-allowed" : ""
        }`}>
        <HiLockClosed className="h-5 w-5" />
        <span>{isProcessing ? loadingText : buttonText}</span>
      </Button>
    </motion.div>
  );
};

export default PaystackButton;
