import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { HiLockClosed, HiCreditCard, HiTruck } from "react-icons/hi";
import toast from "react-hot-toast";
import { Button } from "../components/ui/Button";
import { GlassCard } from "../components/ui/GlassCard";
import { useAuth, useCart } from "../context/EnhancedAppContext";
import { orderService } from "../utils/orderService";

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
  paymentMethod: "card" | "mobile_money";
  // Mobile Money fields
  mobileMoneyProvider?: "mtn" | "telecel" | "airteltigo";
  mobileMoneyNumber?: string;
  // Card fields for bank payment
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
  step2: boolean;
  step3: boolean;
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
    paymentMethod: "mobile_money",
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
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderData, setOrderData] = useState<{
    id: string;
    total: number;
  } | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [stepValidation, setStepValidation] = useState<StepValidation>({
    step1: false,
    step2: false,
    step3: false,
  });
  const [isValidating, setIsValidating] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/signin", { state: { from: { pathname: "/checkout" } } });
    }
  }, [isAuthenticated, navigate]);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  // Helper function to navigate to a step and scroll to top
  const navigateToStep = (step: number) => {
    // Validate current step before allowing navigation
    if (step > currentStep && !validateCurrentStep()) {
      return;
    }

    // Smooth scroll to top
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    // Set the step after a brief delay to ensure smooth scrolling
    // This allows the scroll animation to start before the content changes
    setTimeout(() => {
      setCurrentStep(step);
    }, 150);
  };

  // Validation functions for each step
  const validateStep1 = (): boolean => {
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

    setFormErrors(errors);
    setStepValidation((prev) => ({ ...prev, step1: isValid }));
    return isValid;
  };

  const validateStep2 = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;

    if (formData.paymentMethod === "mobile_money") {
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

    setFormErrors(errors);
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
          isValid = validateStep2();
          if (!isValid) {
            toast.error("Please complete the payment information");
          }
          break;
        case 3:
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
  useEffect(() => {
    if (currentStep === 1) {
      const timer = setTimeout(() => {
        validateStep1();
      }, 500);
      return () => clearTimeout(timer);
    } else if (currentStep === 2) {
      const timer = setTimeout(() => {
        validateStep2();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [formData, currentStep]);

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
  const processPayment = async (orderTotal: number): Promise<boolean> => {
    setIsPaymentProcessing(true);

    try {
      // Simulate payment gateway processing
      await new Promise((resolve) => setTimeout(resolve, 3000));

      if (formData.paymentMethod === "mobile_money") {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      // Calculate totals
      const subtotal = cartItems.reduce(
        (sum: number, item) => sum + item.price * item.quantity,
        0
      );
      const shipping = 9.99;
      const tax = subtotal * 0.08;
      const orderTotal = subtotal + shipping + tax;

      // Process payment first
      const paymentSuccess = await processPayment(orderTotal);

      if (!paymentSuccess) {
        setIsProcessing(false);
        return;
      }

      // Prepare order data
      const orderData = {
        userId: user.id,
        customerEmail: user.email,
        customerName: `${user.firstName} ${user.lastName}`,
        items: cartItems.map((item) => ({
          id: item.productId || item.id?.toString() || "",
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.quantity,
        })),
        subtotal: subtotal,
        shipping: shipping,
        tax: tax,
        discount: 0,
        total: orderTotal,
        status: "pending" as const,
        paymentStatus: "pending" as const,
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
      };

      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Save order to database
      const orderId = await orderService.placeOrder(orderData);

      // Clear the cart after successful order placement
      await clearCart();

      // Set order completion data
      setOrderData({ id: orderId, total: orderTotal });
      setOrderComplete(true);

      // Scroll to top to show success message
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      toast.success("Order placed successfully!");

      // Save checkout information to user profile if requested
      if (formData.saveInfo && user) {
        try {
          // TODO: Implement updateUser in EnhancedAppContext
          /*
          await updateUser({
            phone: formData.phone,
            digitalAddress: formData.digitalAddress,
            apartment: formData.apartment,
            country: formData.country,
          });
          */
        } catch (saveError) {
          console.error("Error saving profile:", saveError);
          // Don't show error for this as order was successful
        }
      }
    } catch (error) {
      console.error("Order processing failed:", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const subtotal = cartItems.reduce(
    (sum: number, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  // Don't render checkout if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const steps = [
    { number: 1, title: "Contact", description: "Email and shipping details" },
    { number: 2, title: "Payment", description: "Payment information" },
    { number: 3, title: "Review", description: "Review your order" },
  ];

  if (orderComplete && orderData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pt-32 pb-16">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}>
            <GlassCard className="p-12">
              <div className="text-6xl mb-6">🎉</div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Order Confirmed!
              </h1>
              <p className="text-lg text-gray-600 mb-2">
                Thank you for your purchase. Your order #
                {orderData.id.slice(-8).toUpperCase()} has been confirmed.
              </p>
              <p className="text-xl font-semibold text-accent-gold mb-4">
                Total: ₵{orderData.total.toFixed(2)}
              </p>
              <p className="text-gray-600 mb-8">
                You'll receive a confirmation message shortly with order
                information.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate("/profile?tab=orders")}>
                  View My Orders
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => navigate("/shop")}>
                  Continue Shopping
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    );
  }

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
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
                        ? "Continue to Payment"
                        : "Complete Required Fields"}
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Payment Information */}
              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}>
                  <GlassCard className="p-8 mb-6">
                    <div className="flex items-center mb-6">
                      <HiCreditCard className="h-5 w-5 text-gray-400 mr-2" />
                      <h2 className="text-xl font-semibold text-gray-900">
                        Payment Information
                      </h2>
                    </div>

                    <div className="space-y-6">
                      {/* Payment Method Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Select Payment Method
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <button
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                paymentMethod: "mobile_money",
                              }))
                            }
                            className={`p-4 border-2 rounded-lg transition-all duration-300 ${
                              formData.paymentMethod === "mobile_money"
                                ? "border-accent-gold bg-accent-gold/10 text-accent-gold"
                                : "border-gray-200 hover:border-gray-300 text-gray-700"
                            }`}>
                            <div className="text-center">
                              <h3 className="font-semibold mb-1">
                                Mobile Money
                              </h3>
                              <p className="text-sm opacity-75">
                                MTN, Telecel, AirtelTigo
                              </p>
                            </div>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                paymentMethod: "card",
                              }))
                            }
                            className={`p-4 border-2 rounded-lg transition-all duration-300 ${
                              formData.paymentMethod === "card"
                                ? "border-accent-gold bg-accent-gold/10 text-accent-gold"
                                : "border-gray-200 hover:border-gray-300 text-gray-700"
                            }`}>
                            <div className="text-center">
                              <h3 className="font-semibold mb-1">
                                Card Payment
                              </h3>
                              <p className="text-sm opacity-75">
                                Credit/Debit card
                              </p>
                            </div>
                          </button>
                        </div>
                      </div>

                      {/* Mobile Money Fields */}
                      {formData.paymentMethod === "mobile_money" && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Mobile Money Provider
                            </label>
                            <select
                              name="mobileMoneyProvider"
                              value={formData.mobileMoneyProvider}
                              onChange={handleInputChange}
                              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent-gold focus:border-transparent transition-colors ${
                                formErrors.mobileMoneyProvider
                                  ? "border-red-500 bg-red-50"
                                  : "border-gray-200"
                              }`}>
                              <option value="mtn">MTN MoMo</option>
                              <option value="telecel">Telecel Cash</option>
                              <option value="airteltigo">
                                AirtelTigo Money
                              </option>
                            </select>
                            {formErrors.mobileMoneyProvider && (
                              <p className="mt-1 text-sm text-red-600">
                                {formErrors.mobileMoneyProvider}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Mobile Money Number
                            </label>
                            <input
                              type="tel"
                              name="mobileMoneyNumber"
                              required
                              value={formData.mobileMoneyNumber}
                              onChange={handleInputChange}
                              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent-gold focus:border-transparent transition-colors ${
                                formErrors.mobileMoneyNumber
                                  ? "border-red-500 bg-red-50"
                                  : "border-gray-200"
                              }`}
                              placeholder="0XX XXX XXXX"
                            />
                            {formErrors.mobileMoneyNumber && (
                              <p className="mt-1 text-sm text-red-600">
                                {formErrors.mobileMoneyNumber}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Card Payment Fields */}
                      {formData.paymentMethod === "card" && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Card Number
                            </label>
                            <input
                              type="text"
                              name="cardNumber"
                              required
                              value={formData.cardNumber}
                              onChange={handleInputChange}
                              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent-gold focus:border-transparent transition-colors ${
                                formErrors.cardNumber
                                  ? "border-red-500 bg-red-50"
                                  : "border-gray-200"
                              }`}
                              placeholder="1234 5678 9012 3456"
                            />
                            {formErrors.cardNumber && (
                              <p className="mt-1 text-sm text-red-600">
                                {formErrors.cardNumber}
                              </p>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Expiry Date
                              </label>
                              <input
                                type="text"
                                name="expiryDate"
                                required
                                value={formData.expiryDate}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent-gold focus:border-transparent transition-colors ${
                                  formErrors.expiryDate
                                    ? "border-red-500 bg-red-50"
                                    : "border-gray-200"
                                }`}
                                placeholder="MM/YY"
                              />
                              {formErrors.expiryDate && (
                                <p className="mt-1 text-sm text-red-600">
                                  {formErrors.expiryDate}
                                </p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                CVV
                              </label>
                              <input
                                type="text"
                                name="cvv"
                                required
                                value={formData.cvv}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent-gold focus:border-transparent transition-colors ${
                                  formErrors.cvv
                                    ? "border-red-500 bg-red-50"
                                    : "border-gray-200"
                                }`}
                                placeholder="123"
                              />
                              {formErrors.cvv && (
                                <p className="mt-1 text-sm text-red-600">
                                  {formErrors.cvv}
                                </p>
                              )}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Name on Card
                            </label>
                            <input
                              type="text"
                              name="nameOnCard"
                              required
                              value={formData.nameOnCard}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent-gold focus:border-transparent"
                              placeholder="John Doe"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </GlassCard>

                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigateToStep(1)}
                      className="text-gray-800 border-gray-800 hover:bg-gray-800 hover:text-white">
                      Back
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      onClick={() => navigateToStep(3)}
                      disabled={!stepValidation.step2}
                      className={`transition-all duration-300 ${
                        !stepValidation.step2
                          ? "opacity-60 cursor-not-allowed bg-gray-400 hover:bg-gray-400"
                          : "hover:scale-105"
                      }`}>
                      {stepValidation.step2
                        ? "Review Order"
                        : "Complete Payment Info"}
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Order Review */}
              {currentStep === 3 && (
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
                          {formData.paymentMethod === "mobile_money" ? (
                            <>
                              <p className="font-medium">
                                {formData.mobileMoneyProvider === "mtn" &&
                                  "MTN MoMo"}
                                {formData.mobileMoneyProvider === "telecel" &&
                                  "Telecel Cash"}
                                {formData.mobileMoneyProvider ===
                                  "airteltigo" && "AirtelTigo Money"}
                              </p>
                              <p className="text-sm text-gray-600">
                                {formData.mobileMoneyNumber}
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="font-medium">Card Payment</p>
                              <p className="text-sm text-gray-600">
                                •••• •••• •••• {formData.cardNumber.slice(-4)}
                              </p>
                              <p className="text-sm text-gray-600">
                                {formData.nameOnCard} - Expires{" "}
                                {formData.expiryDate}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </GlassCard>

                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigateToStep(2)}
                      className="text-gray-800 border-gray-800 hover:bg-gray-800 hover:text-white">
                      Back
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={
                        isProcessing ||
                        isPaymentProcessing ||
                        !stepValidation.step1 ||
                        !stepValidation.step2
                      }
                      className={`min-w-[150px] transition-all duration-300 ${
                        !stepValidation.step1 || !stepValidation.step2
                          ? "opacity-60 cursor-not-allowed bg-gray-400 hover:bg-gray-400"
                          : "hover:scale-105"
                      }`}>
                      {isPaymentProcessing
                        ? "Processing Payment..."
                        : isProcessing
                        ? "Completing Order..."
                        : !stepValidation.step1 || !stepValidation.step2
                        ? "Complete All Steps"
                        : "Proceed to Payment"}
                    </Button>
                  </div>
                </motion.div>
              )}
            </form>
          </div>

          {/* Order Summary Sidebar */}
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
                    <div key={item.id} className="flex items-center space-x-4">
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

                <div className="space-y-2 border-t pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span>₵{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span>₵{shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span>₵{tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total</span>
                    <span>₵{total.toFixed(2)}</span>
                  </div>
                </div>
              </GlassCard>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
