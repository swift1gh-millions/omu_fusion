import React, { useState, useEffect } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Star,
  Eye,
} from "lucide-react";

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  pendingOrders: number;
  lowStockProducts: number;
}

interface RecentOrder {
  id: string;
  userId: string;
  total: number;
  status: string;
  createdAt: any;
}

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 1,
    totalRevenue: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Mock data for now to avoid Firestore errors
    setStats({
      totalProducts: 0,
      totalOrders: 0,
      totalUsers: 1,
      totalRevenue: 0,
      pendingOrders: 0,
      lowStockProducts: 0,
    });
    setLoading(false);
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800/50 to-indigo-800/50 backdrop-blur-xl rounded-2xl p-4 sm:p-6 lg:p-8 border border-slate-700/50 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">
                Dashboard
              </h1>
              <p className="text-slate-300 text-sm sm:text-base">
                Welcome back! Here's what's happening with your store today.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-left sm:text-right">
                <p className="text-xs sm:text-sm text-slate-400">Today</p>
                <p className="text-sm sm:text-lg font-semibold text-white">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {/* Total Products */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 text-white shadow-2xl shadow-blue-500/25 border border-blue-500/20">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <Package className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-blue-200 mb-2 lg:mb-4" />
                <p className="text-blue-100 text-xs sm:text-sm font-medium">
                  Total Products
                </p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold">
                  {stats.totalProducts}
                </p>
              </div>
              <div className="mt-2 lg:mt-0 lg:text-right">
                <div className="flex items-center text-blue-200">
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span className="text-xs sm:text-sm">+4.75%</span>
                </div>
                <p className="text-xs text-blue-200 hidden sm:block">
                  from last month
                </p>
              </div>
            </div>
          </div>

          {/* Total Orders */}
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 text-white shadow-2xl shadow-emerald-500/25 border border-emerald-500/20">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-emerald-200 mb-2 lg:mb-4" />
                <p className="text-emerald-100 text-xs sm:text-sm font-medium">
                  Total Orders
                </p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold">
                  {stats.totalOrders}
                </p>
              </div>
              <div className="mt-2 lg:mt-0 lg:text-right">
                <div className="flex items-center text-emerald-200">
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span className="text-xs sm:text-sm">+54.02%</span>
                </div>
                <p className="text-xs text-emerald-200 hidden sm:block">
                  from last month
                </p>
              </div>
            </div>
          </div>

          {/* Total Users */}
          <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 text-white shadow-2xl shadow-purple-500/25 border border-purple-500/20">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-purple-200 mb-2 lg:mb-4" />
                <p className="text-purple-100 text-xs sm:text-sm font-medium">
                  Total Users
                </p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold">
                  {stats.totalUsers}
                </p>
              </div>
              <div className="mt-2 lg:mt-0 lg:text-right">
                <div className="flex items-center text-purple-200">
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span className="text-xs sm:text-sm">+14.05%</span>
                </div>
                <p className="text-xs text-purple-200 hidden sm:block">
                  from last month
                </p>
              </div>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-gradient-to-br from-amber-600 to-amber-700 rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 text-white shadow-2xl shadow-amber-500/25 border border-amber-500/20">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-amber-200 mb-2 lg:mb-4" />
                <p className="text-amber-100 text-xs sm:text-sm font-medium">
                  Total Revenue
                </p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold">
                  GH₵{stats.totalRevenue}
                </p>
              </div>
              <div className="mt-2 lg:mt-0 lg:text-right">
                <div className="flex items-center text-amber-200">
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span className="text-xs sm:text-sm">+28.14%</span>
                </div>
                <p className="text-xs text-amber-200 hidden sm:block">
                  from last month
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Alert Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
          {/* Pending Orders */}
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-xl lg:rounded-2xl p-4 sm:p-5 lg:p-6 border border-orange-500/30 shadow-2xl">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-3 lg:p-4 rounded-xl shadow-lg">
                <AlertCircle className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
              </div>
              <div className="ml-4 lg:ml-6">
                <p className="text-slate-300 text-xs sm:text-sm font-medium">
                  Pending Orders
                </p>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                  {stats.pendingOrders}
                </p>
                <p className="text-orange-400 text-xs sm:text-sm mt-1">
                  Orders awaiting processing
                </p>
              </div>
            </div>
          </div>

          {/* Low Stock Products */}
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-xl lg:rounded-2xl p-4 sm:p-5 lg:p-6 border border-red-500/30 shadow-2xl">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-red-500 to-red-600 p-3 lg:p-4 rounded-xl shadow-lg">
                <Package className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
              </div>
              <div className="ml-4 lg:ml-6">
                <p className="text-slate-300 text-xs sm:text-sm font-medium">
                  Low Stock Products
                </p>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                  {stats.lowStockProducts}
                </p>
                <p className="text-red-400 text-xs sm:text-sm mt-1">
                  Products with less than 10 items
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-700/50">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Recent Orders</h3>
              <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg">
                <Eye className="h-4 w-4 mr-2 inline" />
                View All
              </button>
            </div>
          </div>
          <div className="p-8">
            {recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700/30">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                        <ShoppingCart className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          #{order.id.slice(0, 8)}
                        </p>
                        <p className="text-slate-400 text-sm">
                          {order.userId.slice(0, 8)}...
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">
                        GH₵{order.total?.toLocaleString() || "0"}
                      </p>
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                          order.status === "delivered"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : order.status === "processing"
                            ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                            : order.status === "pending"
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : "bg-slate-500/20 text-slate-400 border border-slate-500/30"
                        }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ShoppingCart className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-300 mb-2">
                  No orders yet
                </h3>
                <p className="text-slate-500">
                  When customers place orders, they'll appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
