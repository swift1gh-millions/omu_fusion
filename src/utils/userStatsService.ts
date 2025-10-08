import { db } from "./firebase";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import { OrderService, Order } from "./orderService";
import { WishlistService } from "./wishlistService";

export interface UserStatistics {
  totalOrders: number;
  totalSpent: number;
  wishlistItems: number;
  ordersByStatus: {
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  recentOrdersCount: number;
}

export class UserStatsService {
  /**
   * Get comprehensive user statistics from Firestore
   */
  static async getUserStatistics(userId: string): Promise<UserStatistics> {
    console.log("UserStatsService: Getting statistics for user ID:", userId);
    try {
      // For demo purposes, return mock data if no real data exists
      // Fetch user's orders
      const orders = await OrderService.getOrdersByUser(userId);

      // If no orders exist, return demo data for admin user
      if (orders.length === 0 && userId === "admin") {
        return {
          totalOrders: 3,
          totalSpent: 259.97,
          wishlistItems: 2,
          ordersByStatus: {
            pending: 0,
            processing: 1,
            shipped: 1,
            delivered: 1,
            cancelled: 0,
          },
          recentOrdersCount: 2,
        };
      }

      // Fetch user's wishlist
      const wishlist = await WishlistService.getUserWishlist(userId);

      // Calculate total orders
      const totalOrders = orders.length;

      // Calculate total spent (only from delivered orders)
      const totalSpent = orders
        .filter((order) => order.status === "delivered")
        .reduce((sum, order) => sum + order.total, 0);

      // Count wishlist items
      const wishlistItems = wishlist?.items?.length || 0;

      // Group orders by status
      const ordersByStatus = {
        pending: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
      };

      orders.forEach((order) => {
        if (ordersByStatus.hasOwnProperty(order.status)) {
          ordersByStatus[order.status as keyof typeof ordersByStatus]++;
        }
      });

      // Count recent orders (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentOrdersCount = orders.filter((order) => {
        const orderDate = order.createdAt.toDate();
        return orderDate >= thirtyDaysAgo;
      }).length;

      return {
        totalOrders,
        totalSpent,
        wishlistItems,
        ordersByStatus,
        recentOrdersCount,
      };
    } catch (error) {
      console.error("Error fetching user statistics:", error);
      // Return demo data for admin user in case of error (checking for actual Firebase UID or email)
      if (userId === "admin" || userId.includes("admin")) {
        return {
          totalOrders: 3,
          totalSpent: 259.97,
          wishlistItems: 2,
          ordersByStatus: {
            pending: 0,
            processing: 1,
            shipped: 1,
            delivered: 1,
            cancelled: 0,
          },
          recentOrdersCount: 2,
        };
      }
      // Return default stats in case of error
      return {
        totalOrders: 0,
        totalSpent: 0,
        wishlistItems: 0,
        ordersByStatus: {
          pending: 0,
          processing: 0,
          shipped: 0,
          delivered: 0,
          cancelled: 0,
        },
        recentOrdersCount: 0,
      };
    }
  }

  /**
   * Get order history for a specific user with proper formatting
   */
  static async getUserOrderHistory(userId: string): Promise<Order[]> {
    console.log("UserStatsService: Getting order history for user ID:", userId);
    try {
      const orders = await OrderService.getOrdersByUser(userId);

      // If no orders exist, return demo data for admin user (checking for actual Firebase UID or email)
      if (
        orders.length === 0 &&
        (userId === "admin" || userId.includes("admin"))
      ) {
        const { Timestamp } = await import("firebase/firestore");
        return [
          {
            id: "demo-order-1",
            userId: userId,
            items: [
              {
                productId: "cap-1",
                productName: "Premium Baseball Cap",
                productImage:
                  "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400",
                price: 29.99,
                quantity: 2,
              },
            ],
            total: 59.98,
            status: "delivered",
            createdAt: Timestamp.fromDate(new Date("2024-09-15")),
          },
          {
            id: "demo-order-2",
            userId: userId,
            items: [
              {
                productId: "hoodie-1",
                productName: "Cozy Hoodie",
                productImage:
                  "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400",
                price: 79.99,
                quantity: 1,
              },
            ],
            total: 79.99,
            status: "delivered",
            createdAt: Timestamp.fromDate(new Date("2024-09-20")),
          },
          {
            id: "demo-order-3",
            userId: userId,
            items: [
              {
                productId: "cap-2",
                productName: "Classic Snapback",
                productImage:
                  "https://images.unsplash.com/photo-1575428652377-a0d1c006b9da?w=400",
                price: 39.99,
                quantity: 1,
              },
            ],
            total: 39.99,
            status: "shipped",
            createdAt: Timestamp.fromDate(new Date("2024-10-01")),
          },
        ] as Order[];
      }

      // Sort orders by creation date (newest first)
      return orders.sort((a, b) => {
        const dateA = a.createdAt.toDate();
        const dateB = b.createdAt.toDate();
        return dateB.getTime() - dateA.getTime();
      });
    } catch (error) {
      console.error("Error fetching user order history:", error);
      return [];
    }
  }

  /**
   * Format order data for the profile page display
   */
  static formatOrderForDisplay(order: Order) {
    return {
      id: order.id || `order-${Date.now()}`,
      orderId: `OMU-${(order.id || `${Date.now()}`).slice(-6).toUpperCase()}`,
      date: order.createdAt.toDate().toISOString().split("T")[0],
      status: order.status,
      total: order.total,
      items: order.items.map((item) => ({
        id: item.productId,
        name: item.productName,
        image: item.productImage,
        price: item.price,
        quantity: item.quantity,
      })),
    };
  }
}
