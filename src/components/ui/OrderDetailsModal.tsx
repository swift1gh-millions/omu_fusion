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
import { GlassCard } from "./GlassCard";
import { OptimizedImage } from "./OptimizedImage";
import {
  Order,
  OrderService,
  OrderStatusHistory,
} from "../../utils/orderService";
import { LoadingSpinner } from "./LoadingSpinner";
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
  const [order, setOrder] = useState<Order | null>(null);
  const [statusHistory, setStatusHistory] = useState<OrderStatusHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "tracking">("details");

  useEffect(() => {
    if (isOpen && orderId) {
      loadOrderDetails();
    }
  }, [isOpen, orderId]);

  const loadOrderDetails = async () => {
    if (!orderId) return;

    setIsLoading(true);
    try {
      const [orderData, historyData] = await Promise.all([
        OrderService.getOrderById(orderId),
        OrderService.getOrderStatusHistory(orderId),
      ]);

      setOrder(orderData);
      setStatusHistory(historyData);
    } catch (error) {
      console.error("Error loading order details:", error);
      toast.error("Failed to load order details");
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

  const formatCurrency = (amount: number) => {
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
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-4xl max-h-[95vh] overflow-hidden">
          <GlassCard className="p-4 sm:p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Order Details
                </h2>
                {order && (
                  <p className="text-sm text-gray-600 mt-1">
                    Order #{order.orderNumber}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <HiX className="w-6 h-6 text-gray-500" />
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
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      {getStatusIcon(order.status)}
                      <span className="font-medium text-gray-900">
                        Order Status
                      </span>
                    </div>
                    <div
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        OrderService.getStatusInfo(order.status).bgColor
                      } ${OrderService.getStatusInfo(order.status).color}`}>
                      {OrderService.getStatusInfo(order.status).label}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {OrderService.getStatusInfo(order.status).description}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <HiCreditCard className="w-5 h-5 text-blue-500" />
                      <span className="font-medium text-gray-900">Payment</span>
                    </div>
                    <div
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
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
                    <p className="text-xs text-gray-600 mt-1 capitalize">
                      {order.paymentMethod?.replace("_", " ")}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <HiCalendar className="w-5 h-5 text-green-500" />
                      <span className="font-medium text-gray-900">
                        Order Date
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">
                      {formatDate(order.createdAt)}
                    </p>
                    {order.estimatedDelivery && (
                      <p className="text-xs text-gray-600 mt-1">
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
                <div className="max-h-96 overflow-y-auto">
                  {activeTab === "details" ? (
                    <div className="space-y-6">
                      {/* Order Items */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Order Items
                        </h3>
                        <div className="space-y-4">
                          {order.items.map((item, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                              <OptimizedImage
                                src={
                                  item.productImage ||
                                  item.image ||
                                  "/placeholder-image.jpg"
                                }
                                alt={item.productName || item.name || "Product"}
                                className="w-16 h-16 object-cover rounded-lg"
                                width={64}
                                height={64}
                              />
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">
                                  {item.productName || item.name || "Product"}
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
                                  {formatCurrency(item.price * item.quantity)}
                                </p>
                              </div>
                            </div>
                          ))}
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
                          <div className="flex justify-between text-sm">
                            <span>Tax:</span>
                            <span>{formatCurrency(order.tax)}</span>
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
                        {statusHistory.map((history, index) => (
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
                                    OrderService.getStatusInfo(history.status)
                                      .label
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
                        ))}
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
          </GlassCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
