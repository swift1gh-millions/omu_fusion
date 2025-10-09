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
  tax: number;
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
  paymentMethod?: "card" | "mobile_money";
  paymentDetails?: {
    provider?: string; // MTN, Telecel, AirtelTigo for mobile money
    cardLast4?: string; // Last 4 digits for card
    transactionId?: string;
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
    const now = Timestamp.now();
    const orderWithTimestamp = {
      ...order,
      orderNumber: this.generateOrderNumber(),
      createdAt: now,
      updatedAt: now,
      status: "pending" as OrderStatus,
      paymentStatus: "pending" as PaymentStatus,
    };

    const docRef = await addDoc(
      collection(db, this.COLLECTION_NAME),
      orderWithTimestamp
    );

    // Add initial status history
    await this.addStatusHistory(
      docRef.id,
      "pending",
      order.userId,
      "Order placed"
    );

    return docRef.id;
  }

  static async getOrderById(orderId: string): Promise<Order | null> {
    const docRef = doc(db, this.COLLECTION_NAME, orderId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as Order;
    }
    return null;
  }

  static async getOrdersByUser(userId: string): Promise<Order[]> {
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
    const statusHistory: Omit<OrderStatusHistory, "id"> = {
      orderId,
      status,
      timestamp: Timestamp.now(),
      updatedBy,
      notes,
    };

    await addDoc(collection(db, this.STATUS_HISTORY_COLLECTION), statusHistory);
  }

  static async getOrderStatusHistory(
    orderId: string
  ): Promise<OrderStatusHistory[]> {
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
