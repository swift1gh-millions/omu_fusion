import React, { useState, useEffect } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../utils/firebase";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  PieChart,
} from "lucide-react";

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  revenueGrowth: number;
  orderGrowth: number;
  topCategories: Array<{ category: string; count: number; percentage: number }>;
  recentSales: Array<{ date: string; amount: number }>;
}

export const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch all data
      const [productsSnapshot, ordersSnapshot, usersSnapshot] =
        await Promise.all([
          getDocs(collection(db, "products")),
          getDocs(collection(db, "orders")),
          getDocs(collection(db, "users")),
        ]);

      const products = productsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const orders = ordersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const users = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Calculate analytics
      const totalRevenue = orders.reduce(
        (sum: number, order: any) => sum + (order.total || 0),
        0
      );
      const totalOrders = orders.length;
      const totalProducts = products.length;
      const totalUsers = users.length;

      // Calculate category distribution
      const categoryCount: Record<string, number> = {};
      products.forEach((product: any) => {
        const category = product.category || "Uncategorized";
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      });

      const topCategories = Object.entries(categoryCount)
        .map(([category, count]) => ({
          category,
          count,
          percentage: Math.round((count / totalProducts) * 100),
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Mock growth data (in a real app, you'd compare with previous period)
      const revenueGrowth = Math.floor(Math.random() * 30) + 5; // 5-35%
      const orderGrowth = Math.floor(Math.random() * 25) + 10; // 10-35%

      // Mock recent sales data
      const recentSales = Array.from({ length: 7 }, (_, i) => ({
        date: new Date(
          Date.now() - i * 24 * 60 * 60 * 1000
        ).toLocaleDateString(),
        amount: Math.floor(Math.random() * 5000) + 1000,
      })).reverse();

      setAnalytics({
        totalRevenue,
        totalOrders,
        totalProducts,
        totalUsers,
        revenueGrowth,
        orderGrowth,
        topCategories,
        recentSales,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
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

  if (!analytics) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
          <div className="container mx-auto px-6 py-8">
            <div className="text-center py-16">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-12 max-w-md mx-auto">
                <BarChart3 className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  No analytics data
                </h3>
                <p className="text-gray-300">
                  Unable to load analytics data at this time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="space-y-6 lg:space-y-8">
            {/* Header */}
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Analytics
              </h1>
              <p className="text-gray-300 text-sm sm:text-base">
                Track your store's performance and insights
              </p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-lg shadow-lg">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-300">
                      Total Revenue
                    </p>
                    <p className="text-2xl font-bold text-white">
                      GH₵{analytics.totalRevenue.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-green-300 ml-1 font-semibold">
                    +{analytics.revenueGrowth}%
                  </span>
                  <span className="text-sm text-gray-400 ml-1">
                    from last month
                  </span>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-3 rounded-lg shadow-lg">
                    <ShoppingCart className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-300">
                      Total Orders
                    </p>
                    <p className="text-2xl font-bold text-white">
                      {analytics.totalOrders}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-green-300 ml-1 font-semibold">
                    +{analytics.orderGrowth}%
                  </span>
                  <span className="text-sm text-gray-400 ml-1">
                    from last month
                  </span>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center">
                  <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-3 rounded-lg shadow-lg">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-300">
                      Total Products
                    </p>
                    <p className="text-2xl font-bold text-white">
                      {analytics.totalProducts}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <span className="text-sm text-gray-400">
                    Active inventory
                  </span>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center">
                  <div className="bg-gradient-to-r from-orange-500 to-red-600 p-3 rounded-lg shadow-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-300">
                      Total Users
                    </p>
                    <p className="text-2xl font-bold text-white">
                      {analytics.totalUsers}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <span className="text-sm text-gray-400">
                    Registered customers
                  </span>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              {/* Top Categories */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-4 lg:p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4 lg:mb-6">
                  <h3 className="text-lg lg:text-xl font-semibold text-white">
                    Top Categories
                  </h3>
                  <PieChart className="h-5 w-5 lg:h-6 lg:w-6 text-gray-400" />
                </div>
                <div className="space-y-3 lg:space-y-4">
                  {analytics.topCategories.map((category, index) => (
                    <div
                      key={category.category}
                      className="flex items-center justify-between p-2 lg:p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-200">
                      <div className="flex items-center">
                        <div
                          className={`w-3 h-3 lg:w-4 lg:h-4 rounded-full mr-2 lg:mr-3 shadow-lg ${
                            index === 0
                              ? "bg-gradient-to-r from-blue-500 to-cyan-500"
                              : index === 1
                              ? "bg-gradient-to-r from-green-500 to-emerald-500"
                              : index === 2
                              ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                              : index === 3
                              ? "bg-gradient-to-r from-purple-500 to-indigo-500"
                              : "bg-gradient-to-r from-gray-500 to-slate-500"
                          }`}
                        />
                        <span className="text-xs lg:text-sm font-semibold text-white">
                          {category.category}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-xs lg:text-sm text-gray-300 mr-2 lg:mr-3">
                          {category.count} products
                        </span>
                        <span className="text-xs lg:text-sm font-bold text-white bg-white/10 px-1.5 lg:px-2 py-1 rounded">
                          {category.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Sales */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-4 lg:p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4 lg:mb-6">
                  <h3 className="text-lg lg:text-xl font-semibold text-white">
                    Recent Sales
                  </h3>
                  <BarChart3 className="h-5 w-5 lg:h-6 lg:w-6 text-gray-400" />
                </div>
                <div className="space-y-3 lg:space-y-4">
                  {analytics.recentSales.map((sale, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 lg:p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-200">
                      <span className="text-xs lg:text-sm text-gray-300 font-medium">
                        {sale.date}
                      </span>
                      <span className="text-xs lg:text-sm font-bold text-white bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 px-2 lg:px-3 py-1 rounded-lg">
                        GH₵{sale.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Performance Summary */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-4 lg:p-6 shadow-xl">
              <h3 className="text-lg lg:text-xl font-semibold text-white mb-4 lg:mb-6">
                Performance Summary
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                <div className="text-center p-4 lg:p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-200">
                  <div className="text-xl lg:text-3xl font-bold text-green-400 mb-2">
                    GH₵
                    {Math.round(
                      analytics.totalRevenue / analytics.totalOrders || 0
                    ).toLocaleString()}
                  </div>
                  <div className="text-xs lg:text-sm text-gray-300 font-medium">
                    Average Order Value
                  </div>
                </div>
                <div className="text-center p-4 lg:p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-200">
                  <div className="text-xl lg:text-3xl font-bold text-blue-400 mb-2">
                    {Math.round(
                      (analytics.totalOrders / analytics.totalUsers) * 100
                    ) / 100 || 0}
                  </div>
                  <div className="text-xs lg:text-sm text-gray-300 font-medium">
                    Orders per Customer
                  </div>
                </div>
                <div className="text-center p-4 lg:p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-200">
                  <div className="text-xl lg:text-3xl font-bold text-purple-400 mb-2">
                    {analytics.topCategories[0]?.category || "N/A"}
                  </div>
                  <div className="text-xs lg:text-sm text-gray-300 font-medium">
                    Top Category
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
