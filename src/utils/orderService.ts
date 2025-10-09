import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";

export interface Order {
  id?: string;
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
  createdAt: Timestamp;
}

export class OrderService {
  private static readonly COLLECTION_NAME = "orders";

  static async placeOrder(
    order: Omit<Order, "createdAt" | "id">
  ): Promise<string> {
    const orderWithTimestamp = {
      ...order,
      createdAt: Timestamp.now(),
    };
    const docRef = await addDoc(
      collection(db, this.COLLECTION_NAME),
      orderWithTimestamp
    );
    return docRef.id;
  }

  static async getOrdersByUser(userId: string): Promise<Order[]> {
    const q = query(
      collection(db, this.COLLECTION_NAME),
      where("userId", "==", userId)
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
    const querySnapshot = await getDocs(collection(db, this.COLLECTION_NAME));
    return querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Order)
    );
  }
}
