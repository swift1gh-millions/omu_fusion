import { db } from "./firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";

export interface WishlistItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  addedAt: Timestamp;
}

export interface UserWishlist {
  userId: string;
  items: WishlistItem[];
  updatedAt: Timestamp;
}

export class WishlistService {
  private static readonly COLLECTION_NAME = "wishlists";

  static async getUserWishlist(userId: string): Promise<UserWishlist | null> {
    const wishlistRef = doc(db, this.COLLECTION_NAME, userId);
    const wishlistDoc = await getDoc(wishlistRef);
    if (wishlistDoc.exists()) {
      const data = wishlistDoc.data();
      return {
        ...data,
        updatedAt: data.updatedAt,
        items: data.items || [],
      } as UserWishlist;
    }
    return null;
  }

  static async addToWishlist(
    userId: string,
    item: Omit<WishlistItem, "addedAt">
  ): Promise<void> {
    const wishlistRef = doc(db, this.COLLECTION_NAME, userId);
    const wishlistDoc = await getDoc(wishlistRef);
    const wishlistItem: WishlistItem = {
      ...item,
      addedAt: Timestamp.now(),
    };
    if (wishlistDoc.exists()) {
      await updateDoc(wishlistRef, {
        items: arrayUnion(wishlistItem),
        updatedAt: Timestamp.now(),
      });
    } else {
      const newWishlist: UserWishlist = {
        userId,
        items: [wishlistItem],
        updatedAt: Timestamp.now(),
      };
      await setDoc(wishlistRef, newWishlist);
    }
  }

  static async removeFromWishlist(
    userId: string,
    productId: string
  ): Promise<void> {
    const wishlistRef = doc(db, this.COLLECTION_NAME, userId);
    const wishlistDoc = await getDoc(wishlistRef);
    if (wishlistDoc.exists()) {
      const wishlistData = wishlistDoc.data() as UserWishlist;
      const updatedItems = wishlistData.items.filter(
        (item) => item.productId !== productId
      );
      await updateDoc(wishlistRef, {
        items: updatedItems,
        updatedAt: Timestamp.now(),
      });
    }
  }

  static async clearWishlist(userId: string): Promise<void> {
    const wishlistRef = doc(db, this.COLLECTION_NAME, userId);
    const emptyWishlist: UserWishlist = {
      userId,
      items: [],
      updatedAt: Timestamp.now(),
    };
    await setDoc(wishlistRef, emptyWishlist);
  }

  static subscribeToWishlist(
    userId: string,
    callback: (wishlist: UserWishlist | null) => void
  ): () => void {
    const wishlistRef = doc(db, this.COLLECTION_NAME, userId);
    return onSnapshot(wishlistRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        callback({
          ...data,
          updatedAt: data.updatedAt,
          items: data.items || [],
        } as UserWishlist);
      } else {
        callback(null);
      }
    });
  }
}
