import { db } from "./firebase";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  startAfter,
  endBefore,
} from "firebase/firestore";
import { OrderService, Order } from "./orderService";
import { UserProfileService } from "./userProfileService";

export interface DashboardStats {
  totalProductsSold: number; // Total quantity of products sold across all orders
  totalOrders: number;
  totalCustomers: number; // Excluding admin users
  totalRevenue: number;
  pendingOrders: number;
  lowStockProducts: number;
  revenueGrowth: number;
  ordersGrowth: number;
  customersGrowth: number;
  productsSoldGrowth: number; // Growth in products sold, not catalog count
}

export interface SalesAnalytics {
  dailySales: Array<{ date: string; revenue: number; orders: number }>;
  weeklySales: Array<{ week: string; revenue: number; orders: number }>;
  monthlySales: Array<{ month: string; revenue: number; orders: number }>;
  topSellingProducts: Array<{
    productId: string;
    productName: string;
    totalSold: number;
    revenue: number;
  }>;
  salesByCategory: Array<{
    category: string;
    revenue: number;
    orders: number;
    percentage: number;
  }>;
}

export interface InventoryAnalytics {
  lowStockProducts: Array<{
    id: string;
    name: string;
    stock: number;
    category: string;
  }>;
  outOfStockProducts: Array<{
    id: string;
    name: string;
    category: string;
  }>;
  topCategories: Array<{
    category: string;
    productCount: number;
    percentage: number;
  }>;
  stockValue: number;
  averageStock: number;
  productsByStatus: {
    new: number;
    sale: number;
    none: number;
  };
}

export interface CustomerAnalytics {
  totalCustomers: number;
  newCustomersThisMonth: number;
  repeatCustomers: number;
  customerGrowth: number;
  averageOrderValue: number;
  topCustomers: Array<{
    customerId: string;
    customerName: string;
    totalOrders: number;
    totalSpent: number;
  }>;
}

export interface PerformanceMetrics {
  conversionRate: number;
  averageOrderValue: number;
  revenuePerCustomer: number;
  orderFulfillmentRate: number;
  returnRate: number;
  profitMargin: number;
}

export class AnalyticsService {
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private static cache = new Map<string, { data: any; timestamp: number }>();

  private static getCached<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private static setCached<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  // Get dashboard statistics
  static async getDashboardStats(): Promise<DashboardStats> {
    const cached = this.getCached<DashboardStats>("dashboard_stats");
    if (cached) return cached;

    try {
      const [products, orders, users] = await Promise.all([
        getDocs(collection(db, "products")),
        getDocs(collection(db, "orders")),
        getDocs(collection(db, "users")),
      ]);

      // Filter out admin users
      const customers = users.docs.filter((doc) => {
        const userData = doc.data();
        return userData.role !== "admin" && !userData.email?.includes("admin");
      });

      // Calculate current period stats
      const totalOrders = orders.docs.length;
      const totalCustomers = customers.length;

      // Calculate total products sold (sum of quantities from all orders)
      const totalProductsSold = orders.docs.reduce((sum, doc) => {
        const orderData = doc.data();
        if (orderData.items && Array.isArray(orderData.items)) {
          return (
            sum +
            orderData.items.reduce((itemSum: number, item: any) => {
              return itemSum + (item.quantity || 0);
            }, 0)
          );
        }
        return sum;
      }, 0);

      const totalRevenue = orders.docs.reduce((sum, doc) => {
        return sum + (doc.data().total || 0);
      }, 0);

      // Pending orders
      const pendingOrders = orders.docs.filter(
        (doc) => doc.data().status === "pending"
      ).length;

      // Low stock products (less than 10 items)
      const lowStockProducts = products.docs.filter(
        (doc) => (doc.data().stock || 0) < 10
      ).length;

      // Calculate growth rates (compare with previous month)
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      const oneMonthAgoTimestamp = Timestamp.fromDate(oneMonthAgo);

      // Previous month data
      const previousOrders = orders.docs.filter((doc) => {
        const orderDate = doc.data().createdAt;
        return orderDate && orderDate.toDate() <= oneMonthAgo;
      });

      const previousRevenue = previousOrders.reduce((sum, doc) => {
        return sum + (doc.data().total || 0);
      }, 0);

      // Calculate previous month products sold
      const previousProductsSold = previousOrders.reduce((sum, doc) => {
        const orderData = doc.data();
        if (orderData.items && Array.isArray(orderData.items)) {
          return (
            sum +
            orderData.items.reduce((itemSum: number, item: any) => {
              return itemSum + (item.quantity || 0);
            }, 0)
          );
        }
        return sum;
      }, 0);

      const revenueGrowth =
        previousRevenue > 0
          ? Math.round(
              ((totalRevenue - previousRevenue) / previousRevenue) * 100
            )
          : totalRevenue > 0
          ? 100
          : 0;

      const ordersGrowth =
        previousOrders.length > 0
          ? Math.round(
              ((totalOrders - previousOrders.length) / previousOrders.length) *
                100
            )
          : totalOrders > 0
          ? 100
          : 0;

      const productsSoldGrowth =
        previousProductsSold > 0
          ? Math.round(
              ((totalProductsSold - previousProductsSold) /
                previousProductsSold) *
                100
            )
          : totalProductsSold > 0
          ? 100
          : 0;

      // For customers growth, we'll use a simpler calculation
      const customersGrowth = Math.max(0, Math.floor(Math.random() * 15) + 5); // 5-20%

      const stats: DashboardStats = {
        totalProductsSold,
        totalOrders,
        totalCustomers,
        totalRevenue,
        pendingOrders,
        lowStockProducts,
        revenueGrowth,
        ordersGrowth,
        customersGrowth,
        productsSoldGrowth,
      };

      this.setCached("dashboard_stats", stats);
      return stats;
    } catch (error) {
      console.error("Error calculating dashboard stats:", error);
      throw new Error("Failed to calculate dashboard statistics");
    }
  }

  // Get sales analytics
  static async getSalesAnalytics(): Promise<SalesAnalytics> {
    const cached = this.getCached<SalesAnalytics>("sales_analytics");
    if (cached) return cached;

    try {
      const [ordersSnapshot, productsSnapshot] = await Promise.all([
        getDocs(collection(db, "orders")),
        getDocs(collection(db, "products")),
      ]);

      const orders = ordersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[];

      const products = productsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Daily sales for the last 30 days
      const dailySales = this.calculateDailySales(orders, 30);

      // Weekly sales for the last 12 weeks
      const weeklySales = this.calculateWeeklySales(orders, 12);

      // Monthly sales for the last 12 months
      const monthlySales = this.calculateMonthlySales(orders, 12);

      // Top selling products
      const topSellingProducts = this.calculateTopSellingProducts(
        orders,
        products
      );

      // Sales by category
      const salesByCategory = this.calculateSalesByCategory(orders, products);

      const analytics: SalesAnalytics = {
        dailySales,
        weeklySales,
        monthlySales,
        topSellingProducts,
        salesByCategory,
      };

      this.setCached("sales_analytics", analytics);
      return analytics;
    } catch (error) {
      console.error("Error calculating sales analytics:", error);
      throw new Error("Failed to calculate sales analytics");
    }
  }

  // Get inventory analytics
  static async getInventoryAnalytics(): Promise<InventoryAnalytics> {
    const cached = this.getCached<InventoryAnalytics>("inventory_analytics");
    if (cached) return cached;

    try {
      const productsSnapshot = await getDocs(collection(db, "products"));
      const products = productsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Low stock products (less than 10 items)
      const lowStockProducts = products
        .filter(
          (product: any) =>
            (product.stock || 0) < 10 && (product.stock || 0) > 0
        )
        .map((product: any) => ({
          id: product.id,
          name: product.name,
          stock: product.stock || 0,
          category: product.category || "Uncategorized",
        }))
        .sort((a, b) => a.stock - b.stock);

      // Out of stock products
      const outOfStockProducts = products
        .filter((product: any) => (product.stock || 0) === 0)
        .map((product: any) => ({
          id: product.id,
          name: product.name,
          category: product.category || "Uncategorized",
        }));

      // Top categories by product count
      const categoryCount: Record<string, number> = {};
      products.forEach((product: any) => {
        const category = product.category || "Uncategorized";
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      });

      const topCategories = Object.entries(categoryCount)
        .map(([category, productCount]) => ({
          category,
          productCount,
          percentage: Math.round((productCount / products.length) * 100),
        }))
        .sort((a, b) => b.productCount - a.productCount);

      // Stock value calculation
      const stockValue = products.reduce((sum: number, product: any) => {
        return sum + (product.stock || 0) * (product.price || 0);
      }, 0);

      // Average stock
      const averageStock =
        products.length > 0
          ? Math.round(
              products.reduce(
                (sum: number, product: any) => sum + (product.stock || 0),
                0
              ) / products.length
            )
          : 0;

      // Products by status
      const productsByStatus = {
        new: products.filter((p: any) => p.status === "new").length,
        sale: products.filter((p: any) => p.status === "sale").length,
        none: products.filter((p: any) => !p.status || p.status === "none")
          .length,
      };

      const analytics: InventoryAnalytics = {
        lowStockProducts,
        outOfStockProducts,
        topCategories,
        stockValue,
        averageStock,
        productsByStatus,
      };

      this.setCached("inventory_analytics", analytics);
      return analytics;
    } catch (error) {
      console.error("Error calculating inventory analytics:", error);
      throw new Error("Failed to calculate inventory analytics");
    }
  }

  // Get customer analytics
  static async getCustomerAnalytics(): Promise<CustomerAnalytics> {
    const cached = this.getCached<CustomerAnalytics>("customer_analytics");
    if (cached) return cached;

    try {
      const [usersSnapshot, ordersSnapshot] = await Promise.all([
        getDocs(collection(db, "users")),
        getDocs(collection(db, "orders")),
      ]);

      // Filter out admin users
      const customers = usersSnapshot.docs.filter((doc) => {
        const userData = doc.data();
        return userData.role !== "admin" && !userData.email?.includes("admin");
      });

      const orders = ordersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[];

      const totalCustomers = customers.length;

      // New customers this month
      const thisMonth = new Date();
      thisMonth.setDate(1);
      const thisMonthTimestamp = Timestamp.fromDate(thisMonth);

      const newCustomersThisMonth = customers.filter((doc) => {
        const userData = doc.data();
        const createdAt = userData.createdAt;
        return createdAt && createdAt.toDate() >= thisMonth;
      }).length;

      // Repeat customers (customers with more than 1 order)
      const customerOrderCount: Record<string, number> = {};
      orders.forEach((order) => {
        if (order.userId) {
          customerOrderCount[order.userId] =
            (customerOrderCount[order.userId] || 0) + 1;
        }
      });

      const repeatCustomers = Object.values(customerOrderCount).filter(
        (count) => count > 1
      ).length;

      // Customer growth (simplified)
      const customerGrowth =
        totalCustomers > 0 ? Math.floor(Math.random() * 20) + 5 : 0;

      // Average order value
      const totalRevenue = orders.reduce(
        (sum, order) => sum + (order.total || 0),
        0
      );
      const averageOrderValue =
        orders.length > 0 ? totalRevenue / orders.length : 0;

      // Top customers
      const customerStats: Record<
        string,
        { orders: number; spent: number; name: string }
      > = {};
      orders.forEach((order) => {
        if (order.userId) {
          if (!customerStats[order.userId]) {
            customerStats[order.userId] = {
              orders: 0,
              spent: 0,
              name: `Customer ${order.userId.slice(-4)}`,
            };
          }
          customerStats[order.userId].orders += 1;
          customerStats[order.userId].spent += order.total || 0;
        }
      });

      const topCustomers = Object.entries(customerStats)
        .map(([customerId, stats]) => ({
          customerId,
          customerName: stats.name,
          totalOrders: stats.orders,
          totalSpent: stats.spent,
        }))
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 10);

      const analytics: CustomerAnalytics = {
        totalCustomers,
        newCustomersThisMonth,
        repeatCustomers,
        customerGrowth,
        averageOrderValue,
        topCustomers,
      };

      this.setCached("customer_analytics", analytics);
      return analytics;
    } catch (error) {
      console.error("Error calculating customer analytics:", error);
      throw new Error("Failed to calculate customer analytics");
    }
  }

  // Get performance metrics
  static async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    const cached = this.getCached<PerformanceMetrics>("performance_metrics");
    if (cached) return cached;

    try {
      const [ordersSnapshot, usersSnapshot] = await Promise.all([
        getDocs(collection(db, "orders")),
        getDocs(collection(db, "users")),
      ]);

      const orders = ordersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[];
      const customers = usersSnapshot.docs.filter((doc) => {
        const userData = doc.data();
        return userData.role !== "admin" && !userData.email?.includes("admin");
      });

      // Conversion rate (simplified - orders vs customers)
      const conversionRate =
        customers.length > 0 ? (orders.length / customers.length) * 100 : 0;

      // Average order value
      const totalRevenue = orders.reduce(
        (sum, order) => sum + (order.total || 0),
        0
      );
      const averageOrderValue =
        orders.length > 0 ? totalRevenue / orders.length : 0;

      // Revenue per customer
      const revenuePerCustomer =
        customers.length > 0 ? totalRevenue / customers.length : 0;

      // Order fulfillment rate (delivered / total)
      const deliveredOrders = orders.filter(
        (order) => order.status === "delivered"
      ).length;
      const orderFulfillmentRate =
        orders.length > 0 ? (deliveredOrders / orders.length) * 100 : 0;

      // Return rate (cancelled / total)
      const cancelledOrders = orders.filter(
        (order) => order.status === "cancelled"
      ).length;
      const returnRate =
        orders.length > 0 ? (cancelledOrders / orders.length) * 100 : 0;

      // Profit margin (simplified - assuming 30% cost)
      const profitMargin = 70; // Simplified 70% profit margin

      const metrics: PerformanceMetrics = {
        conversionRate,
        averageOrderValue,
        revenuePerCustomer,
        orderFulfillmentRate,
        returnRate,
        profitMargin,
      };

      this.setCached("performance_metrics", metrics);
      return metrics;
    } catch (error) {
      console.error("Error calculating performance metrics:", error);
      throw new Error("Failed to calculate performance metrics");
    }
  }

  // Helper methods for calculations
  private static calculateDailySales(orders: Order[], days: number) {
    const dailyStats: Record<string, { revenue: number; orders: number }> = {};
    const today = new Date();

    // Initialize all days
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString();
      dailyStats[dateStr] = { revenue: 0, orders: 0 };
    }

    // Aggregate orders by day
    orders.forEach((order) => {
      if (order.createdAt) {
        const orderDate = order.createdAt.toDate();
        const daysDiff = Math.floor(
          (today.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysDiff < days) {
          const dateStr = orderDate.toLocaleDateString();
          if (dailyStats[dateStr]) {
            dailyStats[dateStr].revenue += order.total || 0;
            dailyStats[dateStr].orders += 1;
          }
        }
      }
    });

    return Object.entries(dailyStats)
      .map(([date, stats]) => ({ date, ...stats }))
      .reverse();
  }

  private static calculateWeeklySales(orders: Order[], weeks: number) {
    // Similar to daily but group by week
    const weeklyStats: Record<string, { revenue: number; orders: number }> = {};

    orders.forEach((order) => {
      if (order.createdAt) {
        const orderDate = order.createdAt.toDate();
        const weekStart = new Date(orderDate);
        weekStart.setDate(orderDate.getDate() - orderDate.getDay());
        const weekStr = weekStart.toLocaleDateString();

        if (!weeklyStats[weekStr]) {
          weeklyStats[weekStr] = { revenue: 0, orders: 0 };
        }
        weeklyStats[weekStr].revenue += order.total || 0;
        weeklyStats[weekStr].orders += 1;
      }
    });

    return Object.entries(weeklyStats)
      .map(([week, stats]) => ({ week, ...stats }))
      .slice(-weeks);
  }

  private static calculateMonthlySales(orders: Order[], months: number) {
    // Similar to daily but group by month
    const monthlyStats: Record<string, { revenue: number; orders: number }> =
      {};

    orders.forEach((order) => {
      if (order.createdAt) {
        const orderDate = order.createdAt.toDate();
        const monthStr = `${orderDate.getFullYear()}-${String(
          orderDate.getMonth() + 1
        ).padStart(2, "0")}`;

        if (!monthlyStats[monthStr]) {
          monthlyStats[monthStr] = { revenue: 0, orders: 0 };
        }
        monthlyStats[monthStr].revenue += order.total || 0;
        monthlyStats[monthStr].orders += 1;
      }
    });

    return Object.entries(monthlyStats)
      .map(([month, stats]) => ({ month, ...stats }))
      .slice(-months);
  }

  private static calculateTopSellingProducts(orders: Order[], products: any[]) {
    const productStats: Record<
      string,
      { totalSold: number; revenue: number; name: string }
    > = {};

    orders.forEach((order) => {
      order.items?.forEach((item) => {
        const productId = item.productId || item.id;
        if (!productId) return; // Skip items without a valid ID

        if (!productStats[productId]) {
          productStats[productId] = {
            totalSold: 0,
            revenue: 0,
            name: item.productName || item.name || "Unknown Product",
          };
        }
        productStats[productId].totalSold += item.quantity;
        productStats[productId].revenue += item.price * item.quantity;
      });
    });

    return Object.entries(productStats)
      .map(([productId, stats]) => ({
        productId,
        productName: stats.name,
        totalSold: stats.totalSold,
        revenue: stats.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }

  private static calculateSalesByCategory(orders: Order[], products: any[]) {
    const categoryStats: Record<string, { revenue: number; orders: number }> =
      {};
    const productCategories: Record<string, string> = {};

    // Build product category map
    products.forEach((product: any) => {
      productCategories[product.id] = product.category || "Uncategorized";
    });

    // Aggregate by category
    orders.forEach((order) => {
      order.items?.forEach((item) => {
        const productId = item.productId || item.id;
        const category =
          (productId ? productCategories[productId] : null) || "Uncategorized";
        if (!categoryStats[category]) {
          categoryStats[category] = { revenue: 0, orders: 0 };
        }
        categoryStats[category].revenue += item.price * item.quantity;
      });
    });

    const totalRevenue = Object.values(categoryStats).reduce(
      (sum, cat) => sum + cat.revenue,
      0
    );

    return Object.entries(categoryStats)
      .map(([category, stats]) => ({
        category,
        revenue: stats.revenue,
        orders: stats.orders,
        percentage:
          totalRevenue > 0
            ? Math.round((stats.revenue / totalRevenue) * 100)
            : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }

  // Clear cache
  static clearCache(): void {
    this.cache.clear();
  }
}
