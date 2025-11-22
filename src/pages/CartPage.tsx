import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { HiX, HiPlus, HiMinus, HiTrash, HiShoppingCart } from "react-icons/hi";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { GlassCard } from "../components/ui/GlassCard";
import { useAuth, useCart } from "../context/EnhancedAppContext";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { DiscountService, DiscountCode } from "../utils/discountService";
import toast from "react-hot-toast";

export const CartPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const {
    cart: cartItems,
    cartTotal,
    removeFromCart,
    updateQuantity,
    clearCart,
  } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountCode | null>(
    null
  );
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [savedForLater, setSavedForLater] = useState<any[]>([]);
  const [isUpdating, setIsUpdating] = useState<{ [key: number]: boolean }>({});

  const handleUpdateQuantity = async (id: number, newQuantity: number) => {
    if (newQuantity === 0) {
      const item = cartItems.find((item) => item.id === id);
      if (item?.productId) {
        await handleRemoveItem(item.productId);
      }
      return;
    }

    setIsUpdating((prev) => ({ ...prev, [id]: true }));
    try {
      await updateQuantity(id, newQuantity);
      toast.success("Quantity updated");
    } catch (error) {
      toast.error("Failed to update quantity");
    } finally {
      setIsUpdating((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      await removeFromCart(productId);
      toast.success("Item removed from cart");
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
      toast.success("Cart cleared");
    } catch (error) {
      toast.error("Failed to clear cart");
    }
  };

  const saveForLater = (id: number) => {
    const item = cartItems.find((item) => item.id === id);
    if (item) {
      setSavedForLater((prev) => [...prev, { ...item, quantity: 1 }]);
      if (item.productId) {
        handleRemoveItem(item.productId);
      }
    }
  };

  const moveToCart = (id: number) => {
    const item = savedForLater.find((item) => item.id === id);
    if (item) {
      setSavedForLater((prev) => prev.filter((item) => item.id !== id));
      // Note: This would need to be implemented as addToCart in a real scenario
    }
  };

  const removeSavedItem = (id: number) => {
    setSavedForLater((prev) => prev.filter((item) => item.id !== id));
  };

  const applyPromoCode = async () => {
    if (!promoCode.trim()) {
      toast.error("Please enter a discount code");
      return;
    }

    if (!user?.id) {
      toast.error("Please log in to use discount codes");
      return;
    }

    if (cartTotal <= 0) {
      toast.error("Your cart is empty");
      return;
    }

    // Check if the same discount code is already applied
    if (
      appliedDiscount &&
      appliedDiscount.code.toUpperCase() === promoCode.trim().toUpperCase()
    ) {
      toast.error("This discount code is already applied");
      return;
    }

    setIsValidatingPromo(true);

    try {
      console.log("🛒 Applying promo code:", {
        code: promoCode.trim(),
        cartTotal,
        userId: user.id,
      });

      const validation = await DiscountService.validateDiscountCode(
        promoCode.trim(),
        cartTotal,
        user.id
      );

      console.log("✅ Validation result:", validation);

      if (validation.valid && validation.discount) {
        setAppliedDiscount(validation.discount);
        setPromoCode("");
        const discountAmount = DiscountService.calculateDiscount(
          validation.discount,
          cartTotal
        );
        toast.success(
          `Discount applied! Save ₵${discountAmount.toFixed(2)} with ${
            validation.discount.code
          }`
        );
      } else {
        toast.error(validation.error || "Invalid discount code");
      }
    } catch (error: any) {
      console.error("💥 Error applying promo code:", error);

      if (error?.code === "permission-denied") {
        toast.error(
          "Permission denied. Please refresh the page and try again."
        );
      } else if (error?.code === "unauthenticated") {
        toast.error("Please log in again to use discount codes.");
      } else {
        toast.error("Failed to apply discount code. Please try again.");
      }
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const removeDiscount = () => {
    setAppliedDiscount(null);
    toast.success("Discount code removed");
  };

  const subtotal = cartTotal;
  const discount = appliedDiscount
    ? DiscountService.calculateDiscount(appliedDiscount, subtotal)
    : 0;
  const total = subtotal - discount;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pt-32 pb-16">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}>
            <GlassCard className="p-12">
              <div className="text-6xl mb-6 text-gray-400">
                <HiShoppingCart className="w-16 h-16 mx-auto" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Your Cart is Empty
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Looks like you haven't added anything to your cart yet.
              </p>
              <Link to="/shop">
                <Button variant="primary" size="lg">
                  Continue Shopping
                </Button>
              </Link>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="scrollbar-animated min-h-screen bg-gradient-to-br from-gray-50 to-white pt-32 pb-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Shopping Cart
          </h1>
          <p className="text-gray-600">
            {cartItems.length} {cartItems.length === 1 ? "item" : "items"} in
            your cart
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <motion.div
            className="lg:col-span-2 space-y-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible">
            {cartItems.map((item) => (
              <motion.div
                key={item.id}
                variants={itemVariants}
                layout
                className="group">
                <GlassCard className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-lg"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {item.name}
                        </h3>
                        <button
                          onClick={() => handleRemoveItem(item.productId!)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-300">
                          <HiTrash className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="space-y-2 mb-4">
                        {item.size && (
                          <p className="text-sm text-gray-600">
                            Size:{" "}
                            <span className="font-medium">{item.size}</span>
                          </p>
                        )}
                        {item.color && (
                          <p className="text-sm text-gray-600">
                            Color:{" "}
                            <span className="font-medium">{item.color}</span>
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                          <button
                            onClick={() =>
                              handleUpdateQuantity(item.id, item.quantity - 1)
                            }
                            disabled={isUpdating[item.id]}
                            className="p-2 hover:bg-gray-100 transition-colors duration-300 disabled:opacity-50">
                            <HiMinus className="h-4 w-4" />
                          </button>
                          <span className="px-4 py-2 font-medium min-w-[3rem] text-center">
                            {isUpdating[item.id] ? "..." : item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleUpdateQuantity(item.id, item.quantity + 1)
                            }
                            disabled={isUpdating[item.id]}
                            className="p-2 hover:bg-gray-100 transition-colors duration-300 disabled:opacity-50">
                            <HiPlus className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="text-xl font-bold text-gray-900">
                            ₵{(item.price * item.quantity).toFixed(2)}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-sm text-gray-500">
                              ₵{item.price.toFixed(2)} each
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>

          {/* Order Summary */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}>
            <div className="sticky top-24 space-y-6">
              {/* Promo Code */}
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Promo Code
                </h3>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          applyPromoCode();
                        }
                      }}
                      placeholder="Enter discount code"
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent-gold focus:border-transparent"
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
                        className="text-green-600 hover:text-green-800">
                        <HiX className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </GlassCard>

              {/* Order Summary */}
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Order Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₵{subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-₵{discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>₵{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <Link
                    to={
                      appliedDiscount
                        ? `/checkout?discount=${appliedDiscount.code}`
                        : "/checkout"
                    }
                    className="block">
                    <Button variant="primary" size="lg" className="w-full">
                      Proceed to Checkout
                    </Button>
                  </Link>
                  <Link to="/shop" className="block">
                    <Button variant="secondary" size="lg" className="w-full">
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              </GlassCard>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
