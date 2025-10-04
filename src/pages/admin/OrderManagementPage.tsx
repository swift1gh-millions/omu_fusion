import React, { useState, useEffect } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../../utils/firebase";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { Button } from "../../components/ui/Button";
import {
  Search,
  Filter,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
} from "lucide-react";

interface Order {
  id: string;
  userId: string;
  items: Array<{
    productId: string;
    productName: string;
    productImage: string;
    price: number;
    quantity: number;
  }>;
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: any;
  shippingAddress?: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    zipCode: string;
    phone: string;
  };
}

const statusOptions = [
  {
    value: "pending",
    label: "Pending",
    icon: Clock,
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    value: "processing",
    label: "Processing",
    icon: Package,
    color: "bg-blue-100 text-blue-800",
  },
  {
    value: "shipped",
    label: "Shipped",
    icon: Truck,
    color: "bg-purple-100 text-purple-800",
  },
  {
    value: "delivered",
    label: "Delivered",
    icon: CheckCircle,
    color: "bg-green-100 text-green-800",
  },
  {
    value: "cancelled",
    label: "Cancelled",
    icon: XCircle,
    color: "bg-red-100 text-red-800",
  },
];

export const OrderManagementPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, selectedStatus]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const ordersSnapshot = await getDocs(collection(db, "orders"));
      const ordersData = ordersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[];

      // Sort by creation date (newest first)
      ordersData.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });

      setOrders(ordersData);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.items.some((item) =>
            item.productName.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    if (selectedStatus) {
      filtered = filtered.filter((order) => order.status === selectedStatus);
    }

    setFilteredOrders(filtered);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingStatus(orderId);
      await updateDoc(doc(db, "orders", orderId), {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });

      setOrders(
        orders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus as any } : order
        )
      );
    } catch (error) {
      console.error("Error updating order status:", error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = statusOptions.find((s) => s.value === status);
    if (!statusConfig) return null;

    const Icon = statusConfig.icon;
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {statusConfig.label}
      </span>
    );
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-96">
          <LoadingSpinner />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-5 rounded-lg">
        <div className="space-y-6 lg:space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Order Management
            </h1>
            <p className="text-gray-300 text-sm sm:text-base">
              Track and manage customer orders
            </p>
          </div>

          {/* Filters */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-4 lg:p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
                  <input
                    type="text"
                    placeholder="Search orders by ID, customer, or product..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 sm:pl-10 pr-4 py-2 sm:py-3 w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                  />
                </div>
              </div>
              <div className="w-full sm:w-56">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-4 py-2 sm:py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 text-sm sm:text-base">
                  <option value="" className="bg-slate-800 text-white">
                    All Statuses
                  </option>
                  {statusOptions.map((status) => (
                    <option
                      key={status.value}
                      value={status.value}
                      className="bg-slate-800 text-white">
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-xl overflow-hidden">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12 lg:py-16 px-4">
                <Package className="mx-auto h-12 w-12 lg:h-16 lg:w-16 text-gray-400 mb-4" />
                <h3 className="text-lg lg:text-xl font-semibold text-white mb-2">
                  No orders found
                </h3>
                <p className="text-gray-300 text-sm lg:text-base">
                  {orders.length === 0
                    ? "No orders have been placed yet."
                    : "Try adjusting your search or filter criteria."}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 lg:p-6 hover:bg-white/5 transition-all duration-200">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 flex-1">
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Order ID</p>
                          <p className="text-base font-semibold text-white">
                            #{order.id.slice(0, 8)}
                          </p>
                          <p className="text-sm text-gray-400">
                            {order.createdAt
                              ?.toDate?.()
                              ?.toLocaleDateString() || "N/A"}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-400 mb-1">Customer</p>
                          <p className="text-base font-semibold text-white">
                            {order.userId.slice(0, 8)}...
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-400 mb-1">Total</p>
                          <p className="text-lg font-bold text-white">
                            GH₵{order.total.toLocaleString()}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-400 mb-1">Items</p>
                          <p className="text-base font-semibold text-white">
                            {order.items.reduce(
                              (sum, item) => sum + item.quantity,
                              0
                            )}{" "}
                            items
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                        <div className="flex items-center space-x-3">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              statusOptions
                                .find((s) => s.value === order.status)
                                ?.color.replace("bg-", "bg-")
                                .replace("text-", "text-") ||
                              "bg-gray-500/20 text-gray-300"
                            } border ${
                              order.status === "pending"
                                ? "border-yellow-500/30"
                                : order.status === "processing"
                                ? "border-blue-500/30"
                                : order.status === "shipped"
                                ? "border-purple-500/30"
                                : order.status === "delivered"
                                ? "border-green-500/30"
                                : order.status === "cancelled"
                                ? "border-red-500/30"
                                : "border-gray-500/30"
                            }`}>
                            {React.createElement(
                              statusOptions.find(
                                (s) => s.value === order.status
                              )?.icon || Clock,
                              {
                                className: "w-3 h-3 mr-1",
                              }
                            )}
                            {statusOptions.find((s) => s.value === order.status)
                              ?.label || order.status}
                          </span>

                          <select
                            value={order.status}
                            onChange={(e) =>
                              updateOrderStatus(order.id, e.target.value)
                            }
                            disabled={updatingStatus === order.id}
                            className="text-sm bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200">
                            {statusOptions.map((status) => (
                              <option
                                key={status.value}
                                value={status.value}
                                className="bg-slate-800 text-white">
                                {status.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <Button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowOrderModal(true);
                          }}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center px-4 py-2">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>

                    {/* Order Items Preview */}
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <p className="text-sm text-gray-400 mb-2">Order Items:</p>
                      <div className="flex flex-wrap gap-2">
                        {order.items.slice(0, 3).map((item, index) => (
                          <div
                            key={index}
                            className="text-xs bg-white/10 backdrop-blur-sm border border-white/20 text-gray-300 rounded-lg px-3 py-1">
                            {item.productName} × {item.quantity}
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="text-xs text-gray-400 px-3 py-1">
                            +{order.items.length - 3} more items
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order Details Modal */}
          {showOrderModal && selectedOrder && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-2xl w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-white">
                      Order Details - #{selectedOrder.id.slice(0, 8)}
                    </h3>
                    <button
                      onClick={() => setShowOrderModal(false)}
                      className="text-gray-400 hover:text-white transition-colors duration-200">
                      <XCircle className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Order Info */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6">
                      <h4 className="font-semibold text-white text-lg mb-4">
                        Order Information
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">Order ID:</span>
                          <span className="font-semibold text-white">
                            {selectedOrder.id}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">Customer ID:</span>
                          <span className="font-semibold text-white">
                            {selectedOrder.userId}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">Status:</span>
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              statusOptions.find(
                                (s) => s.value === selectedOrder.status
                              )?.color || "bg-gray-500/20 text-gray-300"
                            } border ${
                              selectedOrder.status === "pending"
                                ? "border-yellow-500/30"
                                : selectedOrder.status === "processing"
                                ? "border-blue-500/30"
                                : selectedOrder.status === "shipped"
                                ? "border-purple-500/30"
                                : selectedOrder.status === "delivered"
                                ? "border-green-500/30"
                                : selectedOrder.status === "cancelled"
                                ? "border-red-500/30"
                                : "border-gray-500/30"
                            }`}>
                            {React.createElement(
                              statusOptions.find(
                                (s) => s.value === selectedOrder.status
                              )?.icon || Clock,
                              {
                                className: "w-3 h-3 mr-1",
                              }
                            )}
                            {statusOptions.find(
                              (s) => s.value === selectedOrder.status
                            )?.label || selectedOrder.status}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">Total:</span>
                          <span className="font-bold text-white text-xl">
                            GH₵{selectedOrder.total.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">Date:</span>
                          <span className="font-semibold text-white">
                            {selectedOrder.createdAt
                              ?.toDate?.()
                              ?.toLocaleDateString() || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Shipping Address */}
                    {selectedOrder.shippingAddress && (
                      <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6">
                        <h4 className="font-semibold text-white text-lg mb-4">
                          Shipping Address
                        </h4>
                        <div className="text-gray-300 space-y-1">
                          <p className="font-semibold text-white">
                            {selectedOrder.shippingAddress.firstName}{" "}
                            {selectedOrder.shippingAddress.lastName}
                          </p>
                          <p>{selectedOrder.shippingAddress.address}</p>
                          <p>
                            {selectedOrder.shippingAddress.city},{" "}
                            {selectedOrder.shippingAddress.zipCode}
                          </p>
                          <p className="font-medium text-blue-300">
                            {selectedOrder.shippingAddress.phone}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Order Items */}
                  <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6">
                    <h4 className="font-semibold text-white text-lg mb-4">
                      Order Items
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">
                              Product
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">
                              Price
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">
                              Quantity
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">
                              Subtotal
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                          {selectedOrder.items.map((item, index) => (
                            <tr
                              key={index}
                              className="hover:bg-white/5 transition-colors duration-200">
                              <td className="px-4 py-4">
                                <div className="flex items-center">
                                  <img
                                    src={
                                      item.productImage ||
                                      "/placeholder-image.jpg"
                                    }
                                    alt={item.productName}
                                    className="h-12 w-12 rounded-lg object-cover border border-white/20"
                                  />
                                  <div className="ml-4">
                                    <div className="text-sm font-semibold text-white">
                                      {item.productName}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4 text-sm font-semibold text-white">
                                GH₵{item.price.toLocaleString()}
                              </td>
                              <td className="px-4 py-4 text-sm font-semibold text-white">
                                {item.quantity}
                              </td>
                              <td className="px-4 py-4 text-sm font-bold text-white">
                                GH₵
                                {(item.price * item.quantity).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Button
                      onClick={() => setShowOrderModal(false)}
                      className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all duration-200 px-6 py-3">
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};
