import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  Timestamp,
  doc,
  updateDoc,
  getDoc,
  orderBy,
} from "firebase/firestore";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "returned";

export type PaymentStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "refunded";

export interface OrderItem {
  id?: string;
  productId?: string;
  name?: string; // For compatibility with existing code
  productName?: string; // For new order system
  image?: string;
  productImage?: string; // For compatibility
  price: number;
  quantity: number;
  size?: string;
  color?: string;
}

export interface Order {
  id?: string;
  orderNumber: string; // Format: OMU-XXXXXX
  userId: string;
  customerEmail?: string;
  customerName?: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingAddress?: {
    firstName: string;
    lastName: string;
    digitalAddress: string;
    apartment: string;
    country: string;
  };
  contactInfo?: {
    email: string;
    phone: string;
  };
  paymentMethod?: "paystack" | "card" | "mobile_money";
  paymentDetails?: {
    provider?: string; // MTN, Telecel, AirtelTigo for mobile money, or Paystack
    cardLast4?: string; // Last 4 digits for card
    transactionId?: string; // Paystack reference or other transaction ID
    paystackReference?: string; // Paystack transaction reference
    channel?: string; // Payment channel used (card, mobile_money, bank, etc.)
  };
  trackingNumber?: string;
  estimatedDelivery?: Timestamp;
  deliveredAt?: Timestamp;
  notes?: string;
  adminNotes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface OrderStatusHistory {
  id?: string;
  orderId: string;
  status: OrderStatus;
  timestamp: Timestamp;
  updatedBy: string; // User ID of admin who updated
  notes?: string;
}

export class OrderService {
  private static readonly COLLECTION_NAME = "orders";
  private static readonly STATUS_HISTORY_COLLECTION = "order_status_history";

  // Generate unique order number
  private static generateOrderNumber(): string {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `OMU-${timestamp}${random}`;
  }

  static async placeOrder(
    order: Omit<Order, "createdAt" | "updatedAt" | "id" | "orderNumber">
  ): Promise<string> {
    try {
      console.log("📦 OrderService: Starting order placement...", {
        userId: order.userId,
        itemCount: order.items?.length || 0,
        total: order.total,
      });

      const now = Timestamp.now();
      const orderWithTimestamp = {
        ...order,
        orderNumber: this.generateOrderNumber(),
        createdAt: now,
        updatedAt: now,
        // Preserve the status and paymentStatus from the order data
        status: order.status || ("pending" as OrderStatus),
        paymentStatus: order.paymentStatus || ("pending" as PaymentStatus),
      };

      console.log("📦 OrderService: Order data prepared:", {
        orderNumber: orderWithTimestamp.orderNumber,
        status: orderWithTimestamp.status,
        paymentStatus: orderWithTimestamp.paymentStatus,
      });

      const docRef = await addDoc(
        collection(db, this.COLLECTION_NAME),
        orderWithTimestamp
      );

      console.log("📦 OrderService: Order document created:", docRef.id);

      // Add initial status history
      await this.addStatusHistory(
        docRef.id,
        orderWithTimestamp.status,
        order.userId,
        `Order placed${
          orderWithTimestamp.paymentStatus === "completed"
            ? " with payment confirmed"
            : ""
        }`
      );

      console.log("📦 OrderService: Order placement successful:", docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("❌ OrderService: Order placement failed:", error);
      throw new Error(
        `Failed to place order: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  static async getOrderById(orderId: string): Promise<Order | null> {
    try {
      console.log("OrderService.getOrderById - orderId:", orderId);
      const docRef = doc(db, this.COLLECTION_NAME, orderId);
      const docSnap = await getDoc(docRef);
      console.log(
        "OrderService.getOrderById - docSnap exists:",
        docSnap.exists()
      );

      if (docSnap.exists()) {
        const orderData = {
          id: docSnap.id,
          ...docSnap.data(),
        } as Order;
        console.log("OrderService.getOrderById - returning order:", orderData);
        return orderData;
      }

      console.log("OrderService.getOrderById - order not found");
      return null;
    } catch (error) {
      console.error("OrderService.getOrderById - error:", error);
      throw error;
    }
  }

  static async getOrdersByUser(userId: string): Promise<Order[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Order)
      );
    } catch (error: any) {
      // Handle index building errors gracefully
      if (
        error?.code === "failed-precondition" &&
        error?.message?.includes("index is currently building")
      ) {
        console.warn(
          "OrderService: User orders index is still building, returning empty array"
        );
        return [];
      }

      console.error("Error fetching orders for user:", userId, error);
      return [];
    }
  }

  static async getAllOrders(): Promise<Order[]> {
    const q = query(
      collection(db, this.COLLECTION_NAME),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Order)
    );
  }

  static async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    updatedBy: string,
    notes?: string,
    additionalData?: Partial<Order>
  ): Promise<void> {
    const orderRef = doc(db, this.COLLECTION_NAME, orderId);
    const updateData: Partial<Order> = {
      status,
      updatedAt: Timestamp.now(),
      ...additionalData,
    };

    // Set delivered timestamp if status is delivered
    if (status === "delivered") {
      updateData.deliveredAt = Timestamp.now();
    }

    await updateDoc(orderRef, updateData);
    await this.addStatusHistory(orderId, status, updatedBy, notes);
  }

  static async updatePaymentStatus(
    orderId: string,
    paymentStatus: PaymentStatus,
    updatedBy: string,
    transactionId?: string
  ): Promise<void> {
    const orderRef = doc(db, this.COLLECTION_NAME, orderId);
    const updateData: Partial<Order> = {
      paymentStatus,
      updatedAt: Timestamp.now(),
    };

    if (transactionId) {
      updateData.paymentDetails = {
        ...updateData.paymentDetails,
        transactionId,
      };
    }

    await updateDoc(orderRef, updateData);
  }

  static async addStatusHistory(
    orderId: string,
    status: OrderStatus,
    updatedBy: string,
    notes?: string
  ): Promise<void> {
    try {
      console.log("📝 OrderService: Adding status history...", {
        orderId,
        status,
        updatedBy,
        notes,
      });

      const statusHistory: Omit<OrderStatusHistory, "id"> = {
        orderId,
        status,
        timestamp: Timestamp.now(),
        updatedBy,
        notes,
      };

      await addDoc(
        collection(db, this.STATUS_HISTORY_COLLECTION),
        statusHistory
      );
      console.log("📝 OrderService: Status history added successfully");
    } catch (error) {
      console.error("❌ OrderService: Failed to add status history:", error);
      // Don't throw error here as it's not critical for order placement
    }
  }

  static async getOrderStatusHistory(
    orderId: string
  ): Promise<OrderStatusHistory[]> {
    try {
      const q = query(
        collection(db, this.STATUS_HISTORY_COLLECTION),
        where("orderId", "==", orderId),
        orderBy("timestamp", "desc")
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as OrderStatusHistory)
      );
    } catch (error: any) {
      // Handle index building errors gracefully
      if (
        error?.code === "failed-precondition" &&
        error?.message?.includes("index is currently building")
      ) {
        console.warn(
          "OrderService: Order status history index is still building, returning empty array"
        );
        return [];
      }

      console.error(
        "Error fetching order status history for order:",
        orderId,
        error
      );
      return [];
    }
  }

  // Helper method to get order status display info
  static getStatusInfo(status: OrderStatus): {
    label: string;
    color: string;
    bgColor: string;
    description: string;
  } {
    const statusMap = {
      pending: {
        label: "Pending",
        color: "text-yellow-600",
        bgColor: "bg-yellow-100",
        description: "Order is waiting for confirmation",
      },
      confirmed: {
        label: "Confirmed",
        color: "text-blue-600",
        bgColor: "bg-blue-100",
        description: "Order has been confirmed",
      },
      processing: {
        label: "Processing",
        color: "text-indigo-600",
        bgColor: "bg-indigo-100",
        description: "Order is being prepared",
      },
      shipped: {
        label: "Shipped",
        color: "text-purple-600",
        bgColor: "bg-purple-100",
        description: "Order has been shipped",
      },
      out_for_delivery: {
        label: "Out for Delivery",
        color: "text-orange-600",
        bgColor: "bg-orange-100",
        description: "Order is out for delivery",
      },
      delivered: {
        label: "Delivered",
        color: "text-green-600",
        bgColor: "bg-green-100",
        description: "Order has been delivered",
      },
      cancelled: {
        label: "Cancelled",
        color: "text-red-600",
        bgColor: "bg-red-100",
        description: "Order has been cancelled",
      },
      returned: {
        label: "Returned",
        color: "text-gray-600",
        bgColor: "bg-gray-100",
        description: "Order has been returned",
      },
    };

    return statusMap[status];
  }

  // Helper method to get payment status display info
  static getPaymentStatusInfo(paymentStatus: PaymentStatus): {
    label: string;
    color: string;
    bgColor: string;
  } {
    const statusMap = {
      pending: {
        label: "Pending",
        color: "text-yellow-600",
        bgColor: "bg-yellow-100",
      },
      processing: {
        label: "Processing",
        color: "text-blue-600",
        bgColor: "bg-blue-100",
      },
      completed: {
        label: "Completed",
        color: "text-green-600",
        bgColor: "bg-green-100",
      },
      failed: {
        label: "Failed",
        color: "text-red-600",
        bgColor: "bg-red-100",
      },
      refunded: {
        label: "Refunded",
        color: "text-purple-600",
        bgColor: "bg-purple-100",
      },
    };

    return statusMap[paymentStatus];
  }
}

// Export an instance for easier use
export const orderService = OrderService;
