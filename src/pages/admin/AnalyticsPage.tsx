import React, { useState, useEffect } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import {
  AnalyticsService,
  SalesAnalytics,
  InventoryAnalytics,
  CustomerAnalytics,
  PerformanceMetrics,
} from "../../utils/analyticsService";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  PieChart,
  AlertTriangle,
  Target,
  Activity,
  Percent,
} from "lucide-react";

interface AnalyticsData {
  salesAnalytics: SalesAnalytics;
  inventoryAnalytics: InventoryAnalytics;
  customerAnalytics: CustomerAnalytics;
  performanceMetrics: PerformanceMetrics;
}

export const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "sales" | "inventory" | "customers"
  >("overview");

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all analytics data
      const [
        salesAnalytics,
        inventoryAnalytics,
        customerAnalytics,
        performanceMetrics,
      ] = await Promise.all([
        AnalyticsService.getSalesAnalytics(),
        AnalyticsService.getInventoryAnalytics(),
        AnalyticsService.getCustomerAnalytics(),
        AnalyticsService.getPerformanceMetrics(),
      ]);

      setAnalytics({
        salesAnalytics,
        inventoryAnalytics,
        customerAnalytics,
        performanceMetrics,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setError("Failed to load analytics data. Please try again.");
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

  if (error || !analytics) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
          <div className="container mx-auto px-6 py-8">
            <div className="text-center py-16">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-12 max-w-md mx-auto">
                <BarChart3 className="mx-auto h-16 w-16 text-red-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Error Loading Analytics
                </h3>
                <p className="text-gray-300 mb-6">
                  {error || "Unable to load analytics data at this time."}
                </p>
                <button
                  onClick={fetchAnalytics}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-5 rounded-lg">
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

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 bg-white/10 backdrop-blur-lg rounded-xl p-2 border border-white/20">
            {[
              { id: "overview", label: "Overview", icon: BarChart3 },
              { id: "sales", label: "Sales", icon: DollarSign },
              { id: "inventory", label: "Inventory", icon: Package },
              { id: "customers", label: "Customers", icon: Users },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}>
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Performance Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6 shadow-xl">
                  <div className="flex items-center">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-lg">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-300">
                        Conversion Rate
                      </p>
                      <p className="text-2xl font-bold text-white">
                        {analytics.performanceMetrics.conversionRate.toFixed(1)}
                        %
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6 shadow-xl">
                  <div className="flex items-center">
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-3 rounded-lg">
                      <Activity className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-300">
                        Avg Order Value
                      </p>
                      <p className="text-2xl font-bold text-white">
                        GH₵
                        {analytics.performanceMetrics.averageOrderValue.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6 shadow-xl">
                  <div className="flex items-center">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-3 rounded-lg">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-300">
                        Revenue/Customer
                      </p>
                      <p className="text-2xl font-bold text-white">
                        GH₵
                        {analytics.performanceMetrics.revenuePerCustomer.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6 shadow-xl">
                  <div className="flex items-center">
                    <div className="bg-gradient-to-r from-orange-500 to-red-600 p-3 rounded-lg">
                      <Percent className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-300">
                        Fulfillment Rate
                      </p>
                      <p className="text-2xl font-bold text-white">
                        {analytics.performanceMetrics.orderFulfillmentRate.toFixed(
                          1
                        )}
                        %
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Top Categories */}
                <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Top Categories
                  </h3>
                  <div className="space-y-3">
                    {analytics.inventoryAnalytics.topCategories
                      .slice(0, 5)
                      .map((category) => (
                        <div
                          key={category.category}
                          className="flex items-center justify-between">
                          <span className="text-gray-300">
                            {category.category}
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className="text-white font-medium">
                              {category.productCount}
                            </span>
                            <span className="text-sm text-gray-400">
                              ({category.percentage}%)
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Low Stock Alert */}
                <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <AlertTriangle className="h-5 w-5 text-orange-400 mr-2" />
                    Low Stock Alert
                  </h3>
                  <div className="space-y-3">
                    {analytics.inventoryAnalytics.lowStockProducts
                      .slice(0, 5)
                      .map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center justify-between">
                          <span className="text-gray-300 truncate flex-1">
                            {product.name}
                          </span>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              product.stock <= 3
                                ? "bg-red-500/20 text-red-400"
                                : "bg-orange-500/20 text-orange-400"
                            }`}>
                            {product.stock} left
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Top Customers */}
                <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Top Customers
                  </h3>
                  <div className="space-y-3">
                    {analytics.customerAnalytics.topCustomers
                      .slice(0, 5)
                      .map((customer) => (
                        <div
                          key={customer.customerId}
                          className="flex items-center justify-between">
                          <span className="text-gray-300">
                            {customer.customerName}
                          </span>
                          <div className="text-right">
                            <div className="text-white font-medium">
                              GH₵{customer.totalSpent.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-400">
                              {customer.totalOrders} orders
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sales Tab */}
          {activeTab === "sales" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Top Selling Products */}
                <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Top Selling Products
                  </h3>
                  <div className="space-y-3">
                    {analytics.salesAnalytics.topSellingProducts
                      .slice(0, 8)
                      .map((product) => (
                        <div
                          key={product.productId}
                          className="flex items-center justify-between">
                          <span className="text-gray-300 truncate flex-1">
                            {product.productName}
                          </span>
                          <div className="text-right">
                            <div className="text-white font-medium">
                              GH₵{product.revenue.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-400">
                              {product.totalSold} sold
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Sales by Category */}
                <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Sales by Category
                  </h3>
                  <div className="space-y-3">
                    {analytics.salesAnalytics.salesByCategory.map(
                      (category) => (
                        <div
                          key={category.category}
                          className="flex items-center justify-between">
                          <span className="text-gray-300">
                            {category.category}
                          </span>
                          <div className="text-right">
                            <div className="text-white font-medium">
                              GH₵{category.revenue.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-400">
                              {category.percentage}% of total
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Recent Sales Trend */}
                <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Daily Sales (Last 7 Days)
                  </h3>
                  <div className="space-y-3">
                    {analytics.salesAnalytics.dailySales
                      .slice(-7)
                      .map((sale) => (
                        <div
                          key={sale.date}
                          className="flex items-center justify-between">
                          <span className="text-gray-300">{sale.date}</span>
                          <div className="text-right">
                            <div className="text-white font-medium">
                              GH₵{sale.revenue.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-400">
                              {sale.orders} orders
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Inventory Tab */}
          {activeTab === "inventory" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                  <div className="flex items-center">
                    <Package className="h-8 w-8 text-blue-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-300">Stock Value</p>
                      <p className="text-xl font-bold text-white">
                        GH₵
                        {analytics.inventoryAnalytics.stockValue.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                  <div className="flex items-center">
                    <AlertTriangle className="h-8 w-8 text-orange-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-300">Low Stock Items</p>
                      <p className="text-xl font-bold text-white">
                        {analytics.inventoryAnalytics.lowStockProducts.length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                  <div className="flex items-center">
                    <Package className="h-8 w-8 text-red-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-300">Out of Stock</p>
                      <p className="text-xl font-bold text-white">
                        {analytics.inventoryAnalytics.outOfStockProducts.length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                  <div className="flex items-center">
                    <BarChart3 className="h-8 w-8 text-green-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-300">Avg Stock Level</p>
                      <p className="text-xl font-bold text-white">
                        {analytics.inventoryAnalytics.averageStock}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Status Distribution */}
                <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Product Status Distribution
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">New Products</span>
                      <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full">
                        {analytics.inventoryAnalytics.productsByStatus.new}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Sale Products</span>
                      <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full">
                        {analytics.inventoryAnalytics.productsByStatus.sale}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Regular Products</span>
                      <span className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full">
                        {analytics.inventoryAnalytics.productsByStatus.none}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Critical Inventory Alert */}
                <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Critical Inventory Alert
                  </h3>
                  <div className="space-y-3">
                    {analytics.inventoryAnalytics.outOfStockProducts
                      .slice(0, 5)
                      .map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                          <span className="text-gray-300">{product.name}</span>
                          <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
                            Out of Stock
                          </span>
                        </div>
                      ))}
                    {analytics.inventoryAnalytics.outOfStockProducts.length ===
                      0 && (
                      <p className="text-gray-400 text-center py-4">
                        All products are in stock!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Customers Tab */}
          {activeTab === "customers" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-blue-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-300">Total Customers</p>
                      <p className="text-xl font-bold text-white">
                        {analytics.customerAnalytics.totalCustomers}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-green-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-300">New This Month</p>
                      <p className="text-xl font-bold text-white">
                        {analytics.customerAnalytics.newCustomersThisMonth}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                  <div className="flex items-center">
                    <Activity className="h-8 w-8 text-purple-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-300">Repeat Customers</p>
                      <p className="text-xl font-bold text-white">
                        {analytics.customerAnalytics.repeatCustomers}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-yellow-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-300">Avg Order Value</p>
                      <p className="text-xl font-bold text-white">
                        GH₵
                        {analytics.customerAnalytics.averageOrderValue.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Details */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Top Customers by Revenue
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left text-gray-300 py-3">
                          Customer
                        </th>
                        <th className="text-right text-gray-300 py-3">
                          Orders
                        </th>
                        <th className="text-right text-gray-300 py-3">
                          Total Spent
                        </th>
                        <th className="text-right text-gray-300 py-3">
                          Avg Order
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.customerAnalytics.topCustomers.map(
                        (customer) => (
                          <tr
                            key={customer.customerId}
                            className="border-b border-white/5">
                            <td className="py-3 text-white">
                              {customer.customerName}
                            </td>
                            <td className="py-3 text-right text-gray-300">
                              {customer.totalOrders}
                            </td>
                            <td className="py-3 text-right text-white font-medium">
                              GH₵{customer.totalSpent.toLocaleString()}
                            </td>
                            <td className="py-3 text-right text-gray-300">
                              GH₵
                              {(
                                customer.totalSpent / customer.totalOrders
                              ).toLocaleString()}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};
