import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiX,
  HiClipboardList,
  HiTruck,
  HiCreditCard,
  HiLocationMarker,
  HiPhone,
  HiMail,
  HiCalendar,
  HiCheckCircle,
  HiClock,
  HiExclamationCircle,
} from "react-icons/hi";
import { Button } from "./Button";
import { OptimizedImage } from "./OptimizedImage";
import {
  Order,
  OrderService,
  OrderStatusHistory,
} from "../../utils/orderService";
import { LoadingSpinner } from "./LoadingSpinner";
import { useAuth } from "../../context/EnhancedAppContext";
import toast from "react-hot-toast";

interface OrderDetailsModalProps {
  orderId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  orderId,
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [statusHistory, setStatusHistory] = useState<OrderStatusHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "tracking">("details");

  useEffect(() => {
    if (isOpen && orderId) {
      loadOrderDetails();
    }
  }, [isOpen, orderId, user?.id]);

  const loadOrderDetails = async () => {
    if (!orderId || !user?.id) {
      console.log("Missing orderId or user:", { orderId, userId: user?.id });
      return;
    }

    setIsLoading(true);
    setOrder(null); // Reset order state

    try {
      console.log("Loading order details for:", { orderId, userId: user.id });

      // First try to get the order
      const orderData = await OrderService.getOrderById(orderId);
      console.log("Order data received:", orderData);

      if (!orderData) {
        console.log("Order not found");
        toast.error("Order not found");
        return;
      }

      // Check if the order belongs to the current user
      if (orderData.userId !== user.id) {
        console.log("Order doesn't belong to user:", {
          orderUserId: orderData.userId,
          currentUserId: user.id,
        });
        toast.error("You don't have permission to view this order");
        return;
      }

      setOrder(orderData);

      // Then try to get the status history
      try {
        const historyData = await OrderService.getOrderStatusHistory(orderId);
        console.log("Status history received:", historyData);
        setStatusHistory(historyData);
      } catch (historyError) {
        console.log(
          "Failed to load status history (non-critical):",
          historyError
        );
        setStatusHistory([]); // Continue without status history if it fails
      }
    } catch (error: any) {
      console.error("Error loading order details:", error);

      if (error?.code === "permission-denied") {
        toast.error("You don't have permission to view this order");
      } else if (
        error?.message?.includes("Missing or insufficient permissions")
      ) {
        toast.error("Permission denied. Please make sure you're logged in.");
      } else {
        toast.error("Failed to load order details");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number | undefined) => {
    if (typeof amount !== "number" || isNaN(amount)) {
      return "GH₵0.00";
    }
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
    }).format(amount);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <HiClock className="w-5 h-5 text-yellow-500" />;
      case "confirmed":
      case "processing":
        return <HiClipboardList className="w-5 h-5 text-blue-500" />;
      case "shipped":
      case "out_for_delivery":
        return <HiTruck className="w-5 h-5 text-purple-500" />;
      case "delivered":
        return <HiCheckCircle className="w-5 h-5 text-green-500" />;
      case "cancelled":
      case "returned":
        return <HiExclamationCircle className="w-5 h-5 text-red-500" />;
      default:
        return <HiClock className="w-5 h-5 text-gray-500" />;
    }
  };

  if (!isOpen || !orderId) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-2 sm:p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-5xl max-h-[95vh] overflow-hidden">
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
            <div className="scrollbar-thin max-h-[95vh] overflow-y-auto p-4 sm:p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    Order Details
                  </h2>
                  {order && (
                    <p className="text-sm text-gray-500 mt-1 font-medium">
                      Order #{order.orderNumber}
                    </p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-gray-100 transition-all duration-200 hover:scale-105">
                  <HiX className="w-6 h-6 text-gray-400 hover:text-gray-600" />
                </button>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner size="lg" />
                </div>
              ) : order ? (
                <div className="space-y-6">
                  {/* Status and Payment Overview */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-3 mb-3">
                        {getStatusIcon(order.status)}
                        <span className="font-semibold text-gray-900 text-base">
                          Order Status
                        </span>
                      </div>
                      <div
                        className={`inline-flex px-3 py-1.5 rounded-full text-sm font-semibold ${
                          OrderService.getStatusInfo(order.status).bgColor
                        } ${OrderService.getStatusInfo(order.status).color}`}>
                        {OrderService.getStatusInfo(order.status).label}
                      </div>
                      <p className="text-sm text-gray-700 mt-2 font-medium">
                        {OrderService.getStatusInfo(order.status).description}
                      </p>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-3 mb-3">
                        <HiCreditCard className="w-6 h-6 text-green-600" />
                        <span className="font-semibold text-gray-900 text-base">
                          Payment
                        </span>
                      </div>
                      <div
                        className={`inline-flex px-3 py-1.5 rounded-full text-sm font-semibold ${
                          OrderService.getPaymentStatusInfo(order.paymentStatus)
                            .bgColor
                        } ${
                          OrderService.getPaymentStatusInfo(order.paymentStatus)
                            .color
                        }`}>
                        {
                          OrderService.getPaymentStatusInfo(order.paymentStatus)
                            .label
                        }
                      </div>
                      <p className="text-sm text-gray-700 mt-2 capitalize font-medium">
                        {order.paymentMethod?.replace("_", " ")}
                      </p>
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-3 mb-3">
                        <HiCalendar className="w-6 h-6 text-purple-600" />
                        <span className="font-semibold text-gray-900 text-base">
                          Order Date
                        </span>
                      </div>
                      <p className="text-sm text-gray-800 font-semibold">
                        {formatDate(order.createdAt)}
                      </p>
                      {order.estimatedDelivery && (
                        <p className="text-sm text-gray-600 mt-2">
                          Est. delivery: {formatDate(order.estimatedDelivery)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="border-b border-gray-200">
                    <nav className="flex space-x-8">
                      <button
                        onClick={() => setActiveTab("details")}
                        className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                          activeTab === "details"
                            ? "border-accent-gold text-accent-gold"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}>
                        Order Details
                      </button>
                      <button
                        onClick={() => setActiveTab("tracking")}
                        className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                          activeTab === "tracking"
                            ? "border-accent-gold text-accent-gold"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}>
                        Order Tracking
                      </button>
                    </nav>
                  </div>

                  {/* Tab Content */}
                  <div className="scrollbar-thin max-h-96 overflow-y-auto">
                    {activeTab === "details" ? (
                      <div className="space-y-6">
                        {/* Order Items */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Order Items
                          </h3>
                          <div className="space-y-4">
                            {order.items && Array.isArray(order.items) ? (
                              order.items.map((item, index) => (
                                <div
                                  key={index}
                                  className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                                  <OptimizedImage
                                    src={
                                      item.productImage ||
                                      item.image ||
                                      "/placeholder-image.jpg"
                                    }
                                    alt={
                                      item.productName || item.name || "Product"
                                    }
                                    className="w-16 h-16 object-cover rounded-lg"
                                    width={64}
                                    height={64}
                                  />
                                  <div className="flex-1">
                                    <h4 className="font-medium text-gray-900">
                                      {item.productName ||
                                        item.name ||
                                        "Product"}
                                    </h4>
                                    <div className="text-sm text-gray-600 space-y-1">
                                      <p>Quantity: {item.quantity}</p>
                                      {item.size && <p>Size: {item.size}</p>}
                                      {item.color && <p>Color: {item.color}</p>}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-medium text-gray-900">
                                      {formatCurrency(item.price)}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      Total:{" "}
                                      {formatCurrency(
                                        item.price * item.quantity
                                      )}
                                    </p>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-8">
                                <p className="text-gray-500">
                                  No items found in this order
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Order Summary */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Order Summary
                          </h3>
                          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Subtotal:</span>
                              <span>{formatCurrency(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Shipping:</span>
                              <span>{formatCurrency(order.shipping)}</span>
                            </div>
                            {order.discount > 0 && (
                              <div className="flex justify-between text-sm text-green-600">
                                <span>Discount:</span>
                                <span>-{formatCurrency(order.discount)}</span>
                              </div>
                            )}
                            <div className="border-t pt-2 flex justify-between font-medium">
                              <span>Total:</span>
                              <span>{formatCurrency(order.total)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Shipping Information */}
                        {order.shippingAddress && (
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                              Shipping Information
                            </h3>
                            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                              <div className="flex items-center space-x-2">
                                <HiLocationMarker className="w-4 h-4 text-gray-400" />
                                <span className="font-medium">
                                  {order.shippingAddress.firstName}{" "}
                                  {order.shippingAddress.lastName}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 ml-6">
                                {order.shippingAddress.digitalAddress}
                              </p>
                              {order.shippingAddress.apartment && (
                                <p className="text-sm text-gray-600 ml-6">
                                  {order.shippingAddress.apartment}
                                </p>
                              )}
                              <p className="text-sm text-gray-600 ml-6">
                                {order.shippingAddress.country}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Contact Information */}
                        {order.contactInfo && (
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                              Contact Information
                            </h3>
                            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                              <div className="flex items-center space-x-2">
                                <HiMail className="w-4 h-4 text-gray-400" />
                                <span className="text-sm">
                                  {order.contactInfo.email}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <HiPhone className="w-4 h-4 text-gray-400" />
                                <span className="text-sm">
                                  {order.contactInfo.phone}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order Tracking
                        </h3>
                        {order.trackingNumber && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm font-medium text-blue-900">
                              Tracking Number: {order.trackingNumber}
                            </p>
                          </div>
                        )}
                        <div className="space-y-4">
                          {statusHistory &&
                          Array.isArray(statusHistory) &&
                          statusHistory.length > 0 ? (
                            statusHistory.map((history, index) => (
                              <div
                                key={history.id || index}
                                className="flex items-start space-x-4">
                                <div className="flex-shrink-0">
                                  {getStatusIcon(history.status)}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <p className="font-medium text-gray-900">
                                      {
                                        OrderService.getStatusInfo(
                                          history.status
                                        ).label
                                      }
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      {formatDate(history.timestamp)}
                                    </p>
                                  </div>
                                  <p className="text-sm text-gray-600">
                                    {
                                      OrderService.getStatusInfo(history.status)
                                        .description
                                    }
                                  </p>
                                  {history.notes && (
                                    <p className="text-sm text-gray-500 mt-1">
                                      {history.notes}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8">
                              <p className="text-gray-500">
                                No tracking history available
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                    <Button
                      variant="outline"
                      onClick={onClose}
                      className="flex-1 sm:flex-none">
                      Close
                    </Button>
                    {order.status === "pending" && (
                      <Button
                        variant="danger"
                        className="flex-1 sm:flex-none"
                        onClick={() => {
                          // TODO: Implement order cancellation
                          toast.success("Order cancellation requested");
                        }}>
                        Cancel Order
                      </Button>
                    )}
                    {order.status === "delivered" && (
                      <Button
                        variant="primary"
                        className="flex-1 sm:flex-none"
                        onClick={() => {
                          // TODO: Implement reorder functionality
                          toast.success("Items added to cart");
                        }}>
                        Reorder
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">Order not found</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
