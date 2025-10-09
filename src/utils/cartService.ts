import { db } from "./firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  Timestamp,
} from "firebase/firestore";

export interface CartItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  addedAt: Timestamp;
}

export interface UserCart {
  userId: string;
  items: CartItem[];
  updatedAt: Timestamp;
}

export class CartService {
  private static readonly COLLECTION_NAME = "carts";

  static async getUserCart(userId: string): Promise<UserCart | null> {
    const cartRef = doc(db, this.COLLECTION_NAME, userId);
    const cartDoc = await getDoc(cartRef);
    if (cartDoc.exists()) {
      const data = cartDoc.data();
      return {
        ...data,
        updatedAt: data.updatedAt,
        items: data.items || [],
      } as UserCart;
    }
    return null;
  }

  static async addToCart(
    userId: string,
    item: Omit<CartItem, "addedAt">
  ): Promise<void> {
    const cartRef = doc(db, this.COLLECTION_NAME, userId);
    const cartDoc = await getDoc(cartRef);
    const cartItem: CartItem = {
      ...item,
      addedAt: Timestamp.now(),
    };
    if (cartDoc.exists()) {
      await updateDoc(cartRef, {
        items: arrayUnion(cartItem),
        updatedAt: Timestamp.now(),
      });
    } else {
      const newCart: UserCart = {
        userId,
        items: [cartItem],
        updatedAt: Timestamp.now(),
      };
      await setDoc(cartRef, newCart);
    }
  }

  static async removeFromCart(
    userId: string,
    productId: string
  ): Promise<void> {
    const cartRef = doc(db, this.COLLECTION_NAME, userId);
    const cartDoc = await getDoc(cartRef);
    if (cartDoc.exists()) {
      const cartData = cartDoc.data() as UserCart;
      const updatedItems = cartData.items.filter(
        (item) => item.productId !== productId
      );
      await updateDoc(cartRef, {
        items: updatedItems,
        updatedAt: Timestamp.now(),
      });
    }
  }

  static async updateQuantity(
    userId: string,
    productId: string,
    newQuantity: number
  ): Promise<void> {
    if (newQuantity <= 0) {
      await this.removeFromCart(userId, productId);
      return;
    }

    const cartRef = doc(db, this.COLLECTION_NAME, userId);
    const cartDoc = await getDoc(cartRef);
    if (cartDoc.exists()) {
      const cartData = cartDoc.data() as UserCart;
      const updatedItems = cartData.items.map((item) =>
        item.productId === productId ? { ...item, quantity: newQuantity } : item
      );
      await updateDoc(cartRef, {
        items: updatedItems,
        updatedAt: Timestamp.now(),
      });
    }
  }

  static async getCartItemCount(userId: string): Promise<number> {
    const cart = await this.getUserCart(userId);
    if (!cart) return 0;
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  }

  static async getCartTotal(userId: string): Promise<number> {
    const cart = await this.getUserCart(userId);
    if (!cart) return 0;
    return cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }

  static async clearCart(userId: string): Promise<void> {
    const cartRef = doc(db, this.COLLECTION_NAME, userId);
    const emptyCart: UserCart = {
      userId,
      items: [],
      updatedAt: Timestamp.now(),
    };
    await setDoc(cartRef, emptyCart);
  }
}
