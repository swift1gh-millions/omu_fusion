import React, { useState, useEffect } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { CategoryService } from "../../utils/categoryService";
import { AnalyticsService, DashboardStats } from "../../utils/analyticsService";
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Star,
  Eye,
} from "lucide-react";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import adminBg from "../../assets/backgrounds/dark11.avif";

interface RecentOrder {
  id: string;
  userId: string;
  total: number;
  status: string;
  createdAt: any;
}

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Initialize categories in the background
      await CategoryService.initializeDefaultCategories();

      // Fetch real analytics data
      const dashboardStats = await AnalyticsService.getDashboardStats();
      setStats(dashboardStats);

      // TODO: Implement recent orders fetching
      setRecentOrders([]);
    } catch (error) {
      console.error("Failed to initialize admin data:", error);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
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

  if (error || !stats) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-5">
          <div className="text-center py-16">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-12 max-w-md mx-auto">
              <AlertCircle className="mx-auto h-16 w-16 text-red-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Error Loading Dashboard
              </h3>
              <p className="text-gray-300 mb-6">
                {error || "Unable to load dashboard data at this time."}
              </p>
              <button
                onClick={initializeData}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Try Again
              </button>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Background overlay with glass effect */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-10 pointer-events-none"
        style={{ backgroundImage: `url(${adminBg})` }}
      />
      <div className="relative z-10">
        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
          {/* Header */}
          <div className="bg-white/5 backdrop-blur-2xl rounded-2xl p-4 sm:p-6 lg:p-8 border border-white/10 shadow-2xl shadow-black/20 relative overflow-hidden">
            {/* Glass shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-[-100%] animate-[shimmer_3s_ease-in-out_infinite]" />
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
            {/* Total Products Sold */}
            <div className="relative bg-white/10 backdrop-blur-2xl rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 border border-white/20 shadow-2xl shadow-blue-500/10 overflow-hidden group hover:bg-white/15 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent opacity-50" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000" />
              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <Package className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-blue-300 mb-2 lg:mb-4" />
                  <p className="text-blue-100 text-xs sm:text-sm font-medium">
                    Total Products Sold
                  </p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
                    {stats.totalProductsSold}
                  </p>
                </div>
                <div className="mt-2 lg:mt-0 lg:text-right">
                  <div className="flex items-center text-blue-200">
                    {stats.productsSoldGrowth >= 0 ? (
                      <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    )}
                    <span className="text-xs sm:text-sm">
                      {stats.productsSoldGrowth >= 0 ? "+" : ""}
                      {stats.productsSoldGrowth}%
                    </span>
                  </div>
                  <p className="text-xs text-blue-200 hidden sm:block">
                    from last month
                  </p>
                </div>
              </div>
            </div>

            {/* Total Orders */}
            <div className="relative bg-white/10 backdrop-blur-2xl rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 border border-white/20 shadow-2xl shadow-emerald-500/10 overflow-hidden group hover:bg-white/15 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent opacity-50" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000" />
              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-emerald-300 mb-2 lg:mb-4" />
                  <p className="text-emerald-100 text-xs sm:text-sm font-medium">
                    Total Orders
                  </p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
                    {stats.totalOrders}
                  </p>
                </div>
                <div className="mt-2 lg:mt-0 lg:text-right">
                  <div className="flex items-center text-emerald-200">
                    {stats.ordersGrowth >= 0 ? (
                      <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    )}
                    <span className="text-xs sm:text-sm">
                      {stats.ordersGrowth >= 0 ? "+" : ""}
                      {stats.ordersGrowth}%
                    </span>
                  </div>
                  <p className="text-xs text-emerald-200 hidden sm:block">
                    from last month
                  </p>
                </div>
              </div>
            </div>

            {/* Total Customers */}
            <div className="relative bg-white/10 backdrop-blur-2xl rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 border border-white/20 shadow-2xl shadow-purple-500/10 overflow-hidden group hover:bg-white/15 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent opacity-50" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000" />
              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-purple-300 mb-2 lg:mb-4" />
                  <p className="text-purple-100 text-xs sm:text-sm font-medium">
                    Total Customers
                  </p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
                    {stats.totalCustomers}
                  </p>
                </div>
                <div className="mt-2 lg:mt-0 lg:text-right">
                  <div className="flex items-center text-purple-200">
                    {stats.customersGrowth >= 0 ? (
                      <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    )}
                    <span className="text-xs sm:text-sm">
                      {stats.customersGrowth >= 0 ? "+" : ""}
                      {stats.customersGrowth}%
                    </span>
                  </div>
                  <p className="text-xs text-purple-200 hidden sm:block">
                    from last month
                  </p>
                </div>
              </div>
            </div>

            {/* Total Revenue */}
            <div className="relative bg-white/10 backdrop-blur-2xl rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 border border-white/20 shadow-2xl shadow-amber-500/10 overflow-hidden group hover:bg-white/15 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-transparent opacity-50" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000" />
              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-amber-300 mb-2 lg:mb-4" />
                  <p className="text-amber-100 text-xs sm:text-sm font-medium">
                    Total Revenue
                  </p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
                    GH₵{stats.totalRevenue.toLocaleString()}
                  </p>
                </div>
                <div className="mt-2 lg:mt-0 lg:text-right">
                  <div className="flex items-center text-amber-200">
                    {stats.revenueGrowth >= 0 ? (
                      <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    )}
                    <span className="text-xs sm:text-sm">
                      {stats.revenueGrowth >= 0 ? "+" : ""}
                      {stats.revenueGrowth}%
                    </span>
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
            <div className="relative bg-white/5 backdrop-blur-2xl rounded-xl lg:rounded-2xl p-4 sm:p-5 lg:p-6 border border-orange-500/20 shadow-2xl overflow-hidden group hover:bg-white/10 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000" />
              <div className="relative z-10 flex items-center">
                <div className="bg-gradient-to-r from-orange-500/80 to-orange-600/80 backdrop-blur-sm p-3 lg:p-4 rounded-xl shadow-lg border border-orange-400/30">
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
            <div className="relative bg-white/5 backdrop-blur-2xl rounded-xl lg:rounded-2xl p-4 sm:p-5 lg:p-6 border border-red-500/20 shadow-2xl overflow-hidden group hover:bg-white/10 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000" />
              <div className="relative z-10 flex items-center">
                <div className="bg-gradient-to-r from-red-500/80 to-red-600/80 backdrop-blur-sm p-3 lg:p-4 rounded-xl shadow-lg border border-red-400/30">
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
          <div className="relative bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl shadow-black/20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-500/5 to-transparent" />
            <div className="px-8 py-6 border-b border-white/10 relative">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Recent Orders</h3>
                <button className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/20 transition-all duration-200 shadow-lg">
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
                      className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-200">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500/80 to-indigo-500/80 backdrop-blur-sm rounded-lg flex items-center justify-center border border-blue-400/30">
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
      </div>
    </AdminLayout>
  );
};
