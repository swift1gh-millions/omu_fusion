import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { HiLockClosed, HiCreditCard, HiTruck, HiX } from "react-icons/hi";
import toast from "react-hot-toast";
import { Button } from "../components/ui/Button";
import { GlassCard } from "../components/ui/GlassCard";
import {
  FormFieldError,
  formatUserFriendlyError,
} from "../components/ui/FormFieldError";
import { useAuth, useCart } from "../context/EnhancedAppContext";
import { orderService } from "../utils/orderService";
import { paystackService, PaystackResponse } from "../utils/paystackService";
import { PaystackButton } from "../components/payments/PaystackButton";
import { UserProfileService } from "../utils/userProfileService";
import { DiscountService, DiscountCode } from "../utils/discountService";
import { EmailService } from "../utils/emailService";

interface CheckoutFormData {
  // Contact Information
  email: string;
  phone: string;

  // Shipping Address
  firstName: string;
  lastName: string;
  digitalAddress: string;
  apartment: string;
  country: string;

  // Payment Information
  paymentMethod: "paystack" | "card" | "mobile_money";
  // Mobile Money fields (for non-Paystack legacy support)
  mobileMoneyProvider?: "mtn" | "telecel" | "airteltigo";
  mobileMoneyNumber?: string;
  // Card fields for bank payment (for non-Paystack legacy support)
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  nameOnCard: string;

  // Options
  sameAsBilling: boolean;
  saveInfo: boolean;
  newsletter: boolean;
}

interface FormErrors {
  [key: string]: string;
}

interface StepValidation {
  step1: boolean;
  step2: boolean; // Review step
  step3: boolean; // Order placed step
}

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { cart: cartItems, cartTotal, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CheckoutFormData>({
    email: user?.email || "",
    phone: user?.phone || "",
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    digitalAddress: "", // Not available in EnhancedAuthService AuthUser
    apartment: "", // Not available in EnhancedAuthService AuthUser
    country: "Ghana",
    paymentMethod: "paystack", // Default to Paystack for modern payment processing
    mobileMoneyProvider: "mtn",
    mobileMoneyNumber: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    nameOnCard: "",
    sameAsBilling: true,
    saveInfo: false,
    newsletter: false,
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [orderData, setOrderData] = useState<{
    id: string;
    total: number;
  } | null>(null);
  const [paystackReference, setPaystackReference] = useState<string | null>(
    null
  );
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [stepValidation, setStepValidation] = useState<StepValidation>({
    step1: false,
    step2: true, // Review step is always valid (no validation needed)
    step3: true, // Order placed step is always valid (no validation needed)
  });
  const [isValidating, setIsValidating] = useState(false);
  const [hasAttemptedStep1, setHasAttemptedStep1] = useState(false);

  // Discount-related state
  const [promoCode, setPromoCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountCode | null>(
    null
  );
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/signin", { state: { from: { pathname: "/checkout" } } });
    }
  }, [isAuthenticated, navigate]);

  // Check for discount code from URL parameters (if navigating from cart with applied discount)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const discountCode = urlParams.get("discount");
    if (discountCode && user?.id && !appliedDiscount) {
      // Auto-apply discount if passed from cart
      setPromoCode(discountCode);
      // We'll trigger the application after the promoCode is set
    }
  }, [user?.id]);

  // Auto-apply promo code when it's set from URL params
  useEffect(() => {
    if (promoCode && user?.id && !appliedDiscount && promoCode.length > 3) {
      const autoApply = async () => {
        setIsValidatingPromo(true);
        try {
          const validation = await DiscountService.validateDiscountCode(
            promoCode,
            cartTotal,
            user.id
          );

          if (validation.valid && validation.discount) {
            setAppliedDiscount(validation.discount);
            toast.success(
              `Discount code applied! ${validation.discount.description}`
            );
          }
        } catch (error) {
          console.error("Error auto-applying discount:", error);
        } finally {
          setIsValidatingPromo(false);
        }
      };
      autoApply();
    }
  }, [promoCode, user?.id, cartTotal]);

  // Load saved checkout information on mount
  useEffect(() => {
    const loadSavedCheckoutInfo = async () => {
      if (user?.id) {
        try {
          const userProfile = await UserProfileService.getUserProfile(user.id);
          if (userProfile?.addresses && userProfile.addresses.length > 0) {
            // Find default address or use the first one
            const defaultAddress =
              userProfile.addresses.find((addr) => addr.isDefault) ||
              userProfile.addresses[0];

            if (defaultAddress) {
              setFormData((prev) => ({
                ...prev,
                firstName: defaultAddress.firstName || prev.firstName,
                lastName: defaultAddress.lastName || prev.lastName,
                digitalAddress: defaultAddress.address || prev.digitalAddress,
                apartment: defaultAddress.apartment || prev.apartment,
                country: defaultAddress.country || prev.country,
              }));
            }
          }

          // Load preferences for newsletter
          if (userProfile?.preferences) {
            setFormData((prev) => ({
              ...prev,
              newsletter: userProfile.preferences.newsletter,
            }));
          }
        } catch (error) {
          console.error("Error loading saved checkout info:", error);
          // Don't show error to user, just use defaults
        }
      }
    };

    loadSavedCheckoutInfo();
  }, [user?.id]);

  // Scroll to top when component mounts and do initial silent validation
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    // Silent validation on mount (updates step validation without showing errors)
    validateStep1(false);
  }, []);

  // Helper function to navigate to a step and scroll to top
  const navigateToStep = (step: number) => {
    // Mark that user has attempted to proceed from current step (only when going forward)
    if (step > currentStep) {
      if (currentStep === 1) {
        setHasAttemptedStep1(true);
      }

      // Validate current step before allowing navigation forward
      if (!validateCurrentStep()) {
        return;
      }
    }

    // Clear errors when going back to allow re-entry
    if (step < currentStep) {
      setFormErrors({});
    }

    // Smooth scroll to top - use multiple methods for better compatibility
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    // Also try to scroll the document element
    document.documentElement.scrollTop = 0;

    // Set the step after a brief delay to ensure smooth scrolling
    // This allows the scroll animation to start before the content changes
    setTimeout(() => {
      setCurrentStep(step);
    }, 100);
  };

  // Validation functions for each step
  const validateStep1 = (showErrors: boolean = true): boolean => {
    const errors: FormErrors = {};
    let isValid = true;

    // Email validation
    if (!formData.email.trim()) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Phone validation
    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required";
      isValid = false;
    } else if (formData.phone.trim().length < 10) {
      errors.phone = "Phone number must be at least 10 digits";
      isValid = false;
    }

    // Name validation
    if (!formData.firstName.trim()) {
      errors.firstName = "First name is required";
      isValid = false;
    }
    if (!formData.lastName.trim()) {
      errors.lastName = "Last name is required";
      isValid = false;
    }

    // Address validation
    if (!formData.digitalAddress.trim()) {
      errors.digitalAddress = "Digital address is required";
      isValid = false;
    }

    // Only set errors if we should show them (user has attempted to proceed)
    if (showErrors) {
      setFormErrors(errors);
    }
    setStepValidation((prev) => ({ ...prev, step1: isValid }));
    return isValid;
  };

  const validateStep2 = (showErrors: boolean = true): boolean => {
    const errors: FormErrors = {};
    let isValid = true;

    // Paystack payment method requires no additional validation
    // as it handles everything through its own secure interface
    if (formData.paymentMethod === "paystack") {
      isValid = true;
    } else if (formData.paymentMethod === "mobile_money") {
      if (!formData.mobileMoneyProvider) {
        errors.mobileMoneyProvider = "Please select a mobile money provider";
        isValid = false;
      }
      if (!formData.mobileMoneyNumber?.trim()) {
        errors.mobileMoneyNumber = "Mobile money number is required";
        isValid = false;
      } else if (formData.mobileMoneyNumber.trim().length < 10) {
        errors.mobileMoneyNumber = "Please enter a valid mobile money number";
        isValid = false;
      }
    } else if (formData.paymentMethod === "card") {
      if (!formData.cardNumber.trim()) {
        errors.cardNumber = "Card number is required";
        isValid = false;
      } else if (formData.cardNumber.replace(/\s/g, "").length < 16) {
        errors.cardNumber = "Please enter a valid card number";
        isValid = false;
      }

      if (!formData.expiryDate.trim()) {
        errors.expiryDate = "Expiry date is required";
        isValid = false;
      }

      if (!formData.cvv.trim()) {
        errors.cvv = "CVV is required";
        isValid = false;
      } else if (formData.cvv.length < 3) {
        errors.cvv = "CVV must be at least 3 digits";
        isValid = false;
      }

      if (!formData.nameOnCard.trim()) {
        errors.nameOnCard = "Name on card is required";
        isValid = false;
      }
    }

    // Only set errors if we should show them (user has attempted to proceed)
    if (showErrors) {
      setFormErrors(errors);
    }
    setStepValidation((prev) => ({ ...prev, step2: isValid }));
    return isValid;
  };

  const validateCurrentStep = (): boolean => {
    setIsValidating(true);
    let isValid = false;

    try {
      switch (currentStep) {
        case 1:
          isValid = validateStep1();
          if (!isValid) {
            toast.error("Please fill in all required fields before continuing");
          }
          break;
        case 2:
          isValid = true; // Review step doesn't need validation
          break;
        default:
          isValid = false;
      }
    } finally {
      setIsValidating(false);
    }

    return isValid;
  };

  // Auto-validation when form data changes
  // Always validate to update button state, but only show errors if user has attempted
  useEffect(() => {
    if (currentStep === 1) {
      const timer = setTimeout(() => {
        validateStep1(hasAttemptedStep1); // Show errors only if attempted
      }, 500);
      return () => clearTimeout(timer);
    }
    // No validation needed for step 2 (Review step)
  }, [formData, currentStep, hasAttemptedStep1]);

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [currentStep]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  // Payment processing function
  const processPayment = async (
    orderTotal: number,
    paystackReference?: string
  ): Promise<boolean> => {
    setIsPaymentProcessing(true);

    try {
      if (formData.paymentMethod === "paystack") {
        // Paystack payment - verification happens in the callback
        // Just ensure we have a valid reference
        if (!paystackReference) {
          throw new Error("Payment reference is required");
        }
        toast.success("Payment successful via Paystack");
        setPaymentComplete(true);
        return true;
      } else if (formData.paymentMethod === "mobile_money") {
        // Simulate payment gateway processing
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Simulate mobile money payment
        const provider = formData.mobileMoneyProvider;
        const number = formData.mobileMoneyNumber;

        // In a real app, you would integrate with actual mobile money APIs
        // like MTN MoMo, Telecel Cash, etc.
        toast.loading(`Processing ${provider?.toUpperCase()} payment...`, {
          duration: 2000,
        });

        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Simulate successful payment
        toast.success(`Payment successful via ${provider?.toUpperCase()}`);
      } else if (formData.paymentMethod === "card") {
        // Simulate card payment processing
        await new Promise((resolve) => setTimeout(resolve, 3000));

        toast.loading("Processing card payment...", {
          duration: 2000,
        });

        await new Promise((resolve) => setTimeout(resolve, 2000));

        // In a real app, you would integrate with payment processors
        // like Stripe, Paystack, or Flutterwave
        toast.success("Card payment successful");
      }

      setPaymentComplete(true);
      return true;
    } catch (error) {
      console.error("Payment processing error:", error);
      toast.error("Payment failed. Please try again.");
      return false;
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  // Handle Paystack payment success
  const handlePaystackSuccess = async (response: PaystackResponse) => {
    console.log("Paystack payment successful:", response);
    setPaystackReference(response.reference);

    // Process the payment and complete the order
    await completeOrder(response.reference);
  };

  // Handle Paystack payment close/cancel
  const handlePaystackClose = () => {
    toast.error("Payment cancelled. Please try again.");
    setIsProcessing(false);
  };

  // Complete order after successful payment
  const completeOrder = async (paymentRef?: string) => {
    setIsProcessing(true);

    try {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      // Calculate totals including discount
      const subtotal = cartItems.reduce(
        (sum: number, item) => sum + item.price * item.quantity,
        0
      );
      const discount = appliedDiscount
        ? DiscountService.calculateDiscount(appliedDiscount, subtotal)
        : 0;
      const orderTotal = subtotal - discount;

      // Process payment first (for non-Paystack methods)
      if (formData.paymentMethod !== "paystack") {
        const paymentSuccess = await processPayment(orderTotal);
        if (!paymentSuccess) {
          setIsProcessing(false);
          return;
        }
      } else {
        // For Paystack, verify the payment was successful
        if (!paymentRef) {
          throw new Error("Payment reference is required");
        }
      }

      // Prepare order data
      const orderData = {
        userId: user.id,
        customerEmail: user.email,
        customerName: `${user.firstName} ${user.lastName}`,
        items: cartItems.map((item) => ({
          productId: item.productId || item.id?.toString() || "",
          productName: item.name,
          productImage: item.image,
          price: item.price,
          quantity: item.quantity,
          // Also include compatible fields for backward compatibility
          id: item.productId || item.id?.toString() || "",
          name: item.name,
          image: item.image,
        })),
        subtotal: subtotal,
        shipping: 0,
        discount: discount,
        total: orderTotal,
        ...(appliedDiscount && {
          discountCode: appliedDiscount.code,
          discountType: appliedDiscount.type,
          discountValue: appliedDiscount.value,
        }),
        status: "pending" as const,
        paymentStatus:
          formData.paymentMethod === "paystack"
            ? ("completed" as const)
            : ("pending" as const),
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          digitalAddress: formData.digitalAddress,
          apartment: formData.apartment,
          country: formData.country,
        },
        contactInfo: {
          email: formData.email,
          phone: formData.phone,
        },
        paymentMethod: formData.paymentMethod,
        ...(formData.paymentMethod === "paystack" && paymentRef
          ? {
              paymentDetails: {
                provider: "Paystack",
                transactionId: paymentRef,
                paystackReference: paymentRef,
              },
            }
          : {}),
      };

      // Save order to database
      console.log("🛒 CheckoutPage: Placing order...", {
        userId: user.id,
        email: user.email,
        itemCount: cartItems.length,
        total: orderTotal,
        discount: discount,
        appliedDiscount: appliedDiscount?.code,
      });

      const orderId = await orderService.placeOrder(orderData);
      console.log("🛒 CheckoutPage: Order placed successfully:", orderId);

      // Apply discount code if one was used
      if (appliedDiscount && discount > 0) {
        try {
          await DiscountService.applyDiscountCode(
            appliedDiscount.id,
            user.id,
            orderId,
            discount
          );
          console.log("🛒 CheckoutPage: Discount applied successfully");
        } catch (error) {
          console.error("🛒 CheckoutPage: Error applying discount:", error);
          // Don't fail the order if discount application fails
        }
      }

      // Clear the cart after successful order placement
      await clearCart();
      console.log("🛒 CheckoutPage: Cart cleared");

      // Send order confirmation email
      try {
        const emailSuccess = await EmailService.sendOrderConfirmation({
          customerName: `${formData.firstName} ${formData.lastName}`,
          customerEmail: formData.email,
          orderNumber: `OMU-${orderId.slice(-6).toUpperCase()}`,
          orderDate: new Date().toLocaleDateString(),
          items: cartItems.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            image: item.image,
          })),
          subtotal: subtotal,
          discount: discount,
          total: orderTotal,
          shippingAddress: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            digitalAddress: formData.digitalAddress,
            apartment: formData.apartment,
            country: formData.country,
          },
          paymentMethod: "Paystack Payment",
        });

        if (emailSuccess) {
          console.log("🛒 CheckoutPage: Order confirmation email sent");
        } else {
          console.warn(
            "🛒 CheckoutPage: Order confirmation email failed (order still completed)"
          );
        }
      } catch (emailError) {
        console.error("🛒 CheckoutPage: Email service error:", emailError);
        // Don't fail the order if email fails
      }

      // Set order completion data and move to step 3
      setOrderData({ id: orderId, total: orderTotal });
      setCurrentStep(3);

      // Scroll to top to show success message
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      toast.success("Order placed successfully!");

      // Save checkout information to user profile if requested
      if (formData.saveInfo && user?.id) {
        try {
          // Get existing user profile
          const userProfile = await UserProfileService.getUserProfile(user.id);

          if (userProfile) {
            // Check if this address already exists (match by address field)
            const existingAddress = userProfile.addresses.find(
              (addr) => addr.address === formData.digitalAddress
            );

            if (existingAddress) {
              // Update existing address
              await UserProfileService.updateAddress(
                user.id,
                existingAddress.id,
                {
                  firstName: formData.firstName,
                  lastName: formData.lastName,
                  apartment: formData.apartment,
                  country: formData.country,
                }
              );
            } else {
              // Add new address
              await UserProfileService.addAddress(user.id, {
                type: "home",
                firstName: formData.firstName,
                lastName: formData.lastName,
                address: formData.digitalAddress,
                apartment: formData.apartment,
                city: "", // Ghana digital addresses don't use traditional city
                state: "", // Ghana digital addresses don't use traditional state
                zipCode: "", // Ghana digital addresses don't use traditional zip
                country: formData.country,
                isDefault: userProfile.addresses.length === 0, // Make default if first address
              });
            }

            // Update preferences (newsletter)
            await UserProfileService.updatePreferences(user.id, {
              newsletter: formData.newsletter,
            });

            // Update phone number in profile
            await UserProfileService.updateUserProfile(user.id, {
              phoneNumber: formData.phone,
            });

            toast.success("Checkout information saved for next time!", {
              duration: 2000,
            });
          }
        } catch (saveError) {
          console.error("Error saving profile:", saveError);
          // Don't show error to user as order was successful
          // Just log it for debugging
        }
      }
    } catch (error) {
      console.error("Order processing failed:", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // For Paystack, don't process order here - wait for payment callback
    if (formData.paymentMethod === "paystack") {
      // The PaystackButton will handle the payment flow
      // and call handlePaystackSuccess when complete
      return;
    }

    // For other payment methods, proceed with the normal flow
    await completeOrder();
  };

  // Discount functions
  const applyPromoCode = async () => {
    if (!promoCode.trim() || !user?.id) return;

    setIsValidatingPromo(true);

    try {
      const validation = await DiscountService.validateDiscountCode(
        promoCode.trim(),
        cartTotal,
        user.id
      );

      if (validation.valid && validation.discount) {
        setAppliedDiscount(validation.discount);
        setPromoCode("");
        toast.success(
          `Discount code applied! ${validation.discount.description}`
        );
      } else {
        toast.error(validation.error || "Invalid discount code");
      }
    } catch (error) {
      console.error("Error applying promo code:", error);
      toast.error("Failed to apply discount code");
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const removeDiscount = () => {
    setAppliedDiscount(null);
    toast.success("Discount code removed");
  };

  // Calculate totals including discount
  const subtotal = cartItems.reduce(
    (sum: number, item) => sum + item.price * item.quantity,
    0
  );
  const discount = appliedDiscount
    ? DiscountService.calculateDiscount(appliedDiscount, subtotal)
    : 0;
  const total = subtotal - discount;

  // Don't render checkout if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const steps = [
    { number: 1, title: "Contact", description: "Email and shipping details" },
    { number: 2, title: "Review", description: "Review your order" },
    { number: 3, title: "Order Placed", description: "Order confirmation" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pt-32 pb-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Checkout
          </h1>
          <p className="text-gray-600">
            Complete your order securely and safely
          </p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}>
          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <React.Fragment key={step.number}>
                  <div className="flex items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-300 ${
                        currentStep > step.number
                          ? (step.number === 1 && stepValidation.step1) ||
                            (step.number === 2 && stepValidation.step2)
                            ? "bg-green-500 text-white"
                            : "bg-red-500 text-white"
                          : currentStep === step.number
                          ? "bg-accent-gold text-black"
                          : "bg-gray-200 text-gray-600"
                      }`}>
                      {currentStep > step.number
                        ? (step.number === 1 && stepValidation.step1) ||
                          (step.number === 2 && stepValidation.step2)
                          ? "✓"
                          : "!"
                        : step.number}
                    </div>
                    <div className="ml-3 hidden sm:block">
                      <p className="text-sm font-medium text-gray-900">
                        {step.title}
                      </p>
                      <p
                        className={`text-xs transition-colors duration-300 ${
                          currentStep > step.number
                            ? (step.number === 1 && stepValidation.step1) ||
                              (step.number === 2 && stepValidation.step2)
                              ? "text-green-600"
                              : "text-red-600"
                            : "text-gray-500"
                        }`}>
                        {currentStep > step.number
                          ? (step.number === 1 && stepValidation.step1) ||
                            (step.number === 2 && stepValidation.step2)
                            ? "Complete"
                            : "Needs attention"
                          : step.description}
                      </p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-4 rounded transition-colors duration-300 ${
                        currentStep > step.number
                          ? (step.number === 1 && stepValidation.step1) ||
                            (step.number === 2 && stepValidation.step2)
                            ? "bg-green-500"
                            : "bg-red-500"
                          : "bg-gray-200"
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        <div
          className={`grid grid-cols-1 gap-6 sm:gap-8 ${
            currentStep <= 2
              ? "md:grid-cols-2 lg:grid-cols-3"
              : "place-items-center"
          }`}>
          {/* Main Form */}
          <div
            className={currentStep <= 2 ? "lg:col-span-2" : "w-full max-w-4xl"}>
            <form onSubmit={handleSubmit}>
              {/* Contact Information */}
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}>
                  <GlassCard className="p-8 mb-6">
                    <div className="flex items-center mb-6">
                      <HiLockClosed className="h-5 w-5 text-gray-400 mr-2" />
                      <h2 className="text-xl font-semibold text-gray-900">
                        Contact Information
                      </h2>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent-gold focus:border-transparent transition-colors ${
                            formErrors.email
                              ? "border-red-500 bg-red-50"
                              : "border-gray-200"
                          }`}
                          placeholder="your@email.com"
                        />
                        {formErrors.email && (
                          <p className="mt-1 text-sm text-red-600">
                            {formErrors.email}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          required
                          value={formData.phone}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent-gold focus:border-transparent transition-colors ${
                            formErrors.phone
                              ? "border-red-500 bg-red-50"
                              : "border-gray-200"
                          }`}
                          placeholder="+233 XX XXX XXXX"
                        />
                        {formErrors.phone && (
                          <p className="mt-1 text-sm text-red-600">
                            {formErrors.phone}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            First Name
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            required
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent-gold focus:border-transparent transition-colors ${
                              formErrors.firstName
                                ? "border-red-500 bg-red-50"
                                : "border-gray-200"
                            }`}
                          />
                          {formErrors.firstName && (
                            <p className="mt-1 text-sm text-red-600">
                              {formErrors.firstName}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Last Name
                          </label>
                          <input
                            type="text"
                            name="lastName"
                            required
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent-gold focus:border-transparent transition-colors ${
                              formErrors.lastName
                                ? "border-red-500 bg-red-50"
                                : "border-gray-200"
                            }`}
                          />
                          {formErrors.lastName && (
                            <p className="mt-1 text-sm text-red-600">
                              {formErrors.lastName}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Digital Address
                        </label>
                        <input
                          type="text"
                          name="digitalAddress"
                          required
                          value={formData.digitalAddress}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent-gold focus:border-transparent transition-colors ${
                            formErrors.digitalAddress
                              ? "border-red-500 bg-red-50"
                              : "border-gray-200"
                          }`}
                          placeholder="e.g. GA-123-4567 or GE-456-7890"
                        />
                        {formErrors.digitalAddress && (
                          <p className="mt-1 text-sm text-red-600">
                            {formErrors.digitalAddress}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Apartment, suite, etc. (optional)
                        </label>
                        <input
                          type="text"
                          name="apartment"
                          value={formData.apartment}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent-gold focus:border-transparent"
                        />
                      </div>

                      {/* Save Information Checkbox */}
                      <div className="flex items-center space-x-3 p-4 bg-accent-gold/5 rounded-lg border border-accent-gold/20">
                        <input
                          type="checkbox"
                          id="saveInfo"
                          name="saveInfo"
                          checked={formData.saveInfo}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-accent-gold focus:ring-accent-gold border-gray-300 rounded"
                        />
                        <label
                          htmlFor="saveInfo"
                          className="text-sm text-gray-700 cursor-pointer">
                          Save this information for faster checkout next time
                        </label>
                      </div>
                    </div>
                  </GlassCard>

                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="primary"
                      onClick={() => navigateToStep(2)}
                      disabled={!stepValidation.step1}
                      className={`transition-all duration-300 ${
                        !stepValidation.step1
                          ? "opacity-60 cursor-not-allowed bg-gray-400 hover:bg-gray-400"
                          : "hover:scale-105"
                      }`}>
                      {stepValidation.step1
                        ? "Review Order"
                        : "Complete Required Fields"}
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Order Review - Step 2 (Payment step removed, Paystack is auto-selected) */}
              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}>
                  <GlassCard className="p-8 mb-6">
                    <div className="flex items-center mb-6">
                      <HiTruck className="h-5 w-5 text-gray-400 mr-2" />
                      <h2 className="text-xl font-semibold text-gray-900">
                        Review Your Order
                      </h2>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-3">
                          Shipping Address
                        </h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="font-medium">
                            {formData.firstName} {formData.lastName}
                          </p>
                          <p>{formData.digitalAddress}</p>
                          {formData.apartment && <p>{formData.apartment}</p>}
                          <p className="text-sm text-gray-600">
                            Phone: {formData.phone}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-3">
                          Payment Method
                        </h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="font-medium">Paystack Payment</p>
                          <p className="text-sm text-gray-600">
                            Secure payment via Paystack - Supports all major
                            cards and mobile money
                          </p>
                        </div>
                      </div>
                    </div>
                  </GlassCard>

                  <div className="flex justify-between items-center">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigateToStep(1)}
                      className="text-gray-800 border-gray-800 hover:bg-gray-800 hover:text-white">
                      Back
                    </Button>

                    <PaystackButton
                      email={formData.email}
                      amount={total}
                      customerName={`${formData.firstName} ${formData.lastName}`}
                      onSuccess={handlePaystackSuccess}
                      onClose={handlePaystackClose}
                      disabled={
                        isProcessing ||
                        isPaymentProcessing ||
                        !stepValidation.step1
                      }
                      metadata={paystackService.createPaymentMetadata({
                        userId: user?.id || "",
                        customerName: `${formData.firstName} ${formData.lastName}`,
                        items: cartItems.map((item) => ({
                          name: item.name,
                          quantity: item.quantity,
                          price: item.price,
                        })),
                        shippingAddress: `${formData.digitalAddress}, ${
                          formData.apartment || ""
                        }`,
                      })}
                      buttonText={
                        isProcessing
                          ? "Processing..."
                          : !stepValidation.step1
                          ? "Complete Contact Info"
                          : `Pay ₵${total.toFixed(2)}`
                      }
                      className="min-w-[200px]"
                    />
                  </div>
                </motion.div>
              )}

              {/* Order Placed Confirmation - Step 3 */}
              {currentStep === 3 && orderData && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6 }}>
                  <div className="text-center py-16">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        delay: 0.3,
                        type: "spring",
                        stiffness: 200,
                      }}
                      className="mx-auto h-24 w-24 bg-green-100 rounded-full flex items-center justify-center mb-8">
                      <svg
                        className="h-12 w-12 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </motion.div>

                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                      Order Placed Successfully!
                    </h1>

                    <p className="text-xl text-gray-600 mb-8">
                      Thank you for your purchase. Your order has been
                      confirmed.
                    </p>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8 max-w-md mx-auto">
                      <p className="text-sm text-green-700 font-medium mb-2">
                        Order Details
                      </p>
                      <p className="text-2xl font-bold text-green-800">
                        #{orderData.id}
                      </p>
                      <p className="text-lg text-green-700">
                        ₵{orderData.total.toFixed(2)}
                      </p>
                    </div>

                    <p className="text-gray-600 mb-8">
                      A confirmation email has been sent to {formData.email}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button
                        onClick={() => navigate("/shop")}
                        variant="outline"
                        className="px-8 py-3">
                        Continue Shopping
                      </Button>
                      <Button
                        onClick={() => navigate("/profile")}
                        variant="primary"
                        className="px-8 py-3">
                        View Orders
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </form>
          </div>

          {/* Order Summary Sidebar - Only show on steps 1 and 2 */}
          {currentStep <= 2 && (
            <motion.div
              className="lg:col-span-1"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}>
              <div className="sticky top-24">
                <GlassCard className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Order Summary
                  </h3>

                  <div className="space-y-4 mb-6">
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center space-x-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-medium">
                          ₵{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Promo Code Section */}
                  <div className="border-t pt-4 mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      Promo Code
                    </h4>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          placeholder="Enter discount code"
                          className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent-gold focus:border-transparent"
                          disabled={isValidatingPromo}
                        />
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={applyPromoCode}
                          disabled={!promoCode.trim() || isValidatingPromo}>
                          {isValidatingPromo ? "..." : "Apply"}
                        </Button>
                      </div>
                      {appliedDiscount && (
                        <div className="flex items-center justify-between text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                          <div>
                            <span className="text-sm font-medium">
                              {appliedDiscount.code} applied
                            </span>
                            <p className="text-xs text-green-700">
                              {appliedDiscount.description}
                            </p>
                          </div>
                          <button
                            onClick={removeDiscount}
                            className="text-green-600 hover:text-green-800 cursor-pointer">
                            <HiX className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 border-t pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span>₵{subtotal.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount</span>
                        <span>-₵{discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Total</span>
                      <span>₵{total.toFixed(2)}</span>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
