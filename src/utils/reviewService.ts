import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";

export interface Review {
  id?: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: Timestamp;
}

export class ReviewService {
  private static readonly COLLECTION_NAME = "reviews";

  static async addReview(
    review: Omit<Review, "createdAt" | "id">
  ): Promise<string> {
    const reviewWithTimestamp = {
      ...review,
      createdAt: Timestamp.now(),
    };
    const docRef = await addDoc(
      collection(db, this.COLLECTION_NAME),
      reviewWithTimestamp
    );
    return docRef.id;
  }

  static async getReviewsForProduct(productId: string): Promise<Review[]> {
    const q = query(
      collection(db, this.COLLECTION_NAME),
      where("productId", "==", productId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Review)
    );
  }

  static async getReviewsByUser(userId: string): Promise<Review[]> {
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
        } as Review)
    );
  }
}
