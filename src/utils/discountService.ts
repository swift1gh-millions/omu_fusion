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
  deleteDoc,
  getDoc,
} from "firebase/firestore";

export type DiscountType = "percentage" | "fixed";

export interface DiscountCode {
  id: string;
  code: string;
  type: DiscountType;
  value: number; // Percentage (0-100) or fixed amount
  description: string;
  minOrderAmount?: number;
  maxUses?: number;
  currentUses: number;
  expiryDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface DiscountApplication {
  id: string;
  codeId: string;
  userId: string;
  orderId?: string;
  discountAmount: number;
  appliedAt: Date;
}

export class DiscountService {
  private static readonly CODES_COLLECTION = "discounts";
  private static readonly APPLICATIONS_COLLECTION = "discountApplications";

  // Admin functions
  static async createDiscountCode(
    codeData: Omit<
      DiscountCode,
      "id" | "createdAt" | "updatedAt" | "currentUses"
    >,
    adminId: string
  ): Promise<string> {
    try {
      console.log("🏪 DiscountService.createDiscountCode called");
      console.log("📝 Input code data:", codeData);
      console.log("👤 Admin ID:", adminId);

      const now = new Date();
      const discountCode: Omit<DiscountCode, "id"> = {
        ...codeData,
        currentUses: 0,
        createdAt: now,
        updatedAt: now,
        createdBy: adminId,
      };

      console.log("🔧 Processed discount code:", discountCode);

      // Create base document without undefined values
      const docToSave: any = {
        code: discountCode.code,
        type: discountCode.type,
        value: discountCode.value,
        description: discountCode.description,
        currentUses: discountCode.currentUses,
        isActive: discountCode.isActive,
        createdBy: discountCode.createdBy,
        createdAt: Timestamp.fromDate(discountCode.createdAt),
        updatedAt: Timestamp.fromDate(discountCode.updatedAt),
      };

      // Only add optional fields if they have values
      if (
        discountCode.minOrderAmount !== undefined &&
        discountCode.minOrderAmount !== null
      ) {
        docToSave.minOrderAmount = discountCode.minOrderAmount;
      }

      if (discountCode.maxUses !== undefined && discountCode.maxUses !== null) {
        docToSave.maxUses = discountCode.maxUses;
      }

      if (discountCode.expiryDate) {
        docToSave.expiryDate = Timestamp.fromDate(discountCode.expiryDate);
      }

      console.log("💾 Document to save:", docToSave);
      console.log("📂 Collection:", this.CODES_COLLECTION);

      const docRef = await addDoc(
        collection(db, this.CODES_COLLECTION),
        docToSave
      );

      console.log("✅ Document saved with ID:", docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("💥 Error in createDiscountCode:", error);
      throw error;
    }
  }

  static async updateDiscountCode(
    codeId: string,
    updates: Partial<Omit<DiscountCode, "id" | "createdAt" | "createdBy">>
  ): Promise<void> {
    const docRef = doc(db, this.CODES_COLLECTION, codeId);
    const updateData = {
      ...updates,
      updatedAt: Timestamp.now(),
      ...(updates.expiryDate && {
        expiryDate: Timestamp.fromDate(updates.expiryDate),
      }),
    };
    await updateDoc(docRef, updateData);
  }

  static async deleteDiscountCode(codeId: string): Promise<void> {
    const docRef = doc(db, this.CODES_COLLECTION, codeId);
    await deleteDoc(docRef);
  }

  static async getAllDiscountCodes(): Promise<DiscountCode[]> {
    const querySnapshot = await getDocs(collection(db, this.CODES_COLLECTION));
    return querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
          expiryDate: doc.data().expiryDate?.toDate(),
        } as DiscountCode)
    );
  }

  // Customer functions
  static async validateDiscountCode(
    code: string,
    orderAmount: number,
    userId: string
  ): Promise<{ valid: boolean; discount?: DiscountCode; error?: string }> {
    try {
      console.log("🔍 Validating discount code:", {
        code: code.toUpperCase(),
        orderAmount,
        userId,
      });

      if (!code || !code.trim()) {
        return { valid: false, error: "Please enter a discount code" };
      }

      if (!userId) {
        return { valid: false, error: "User authentication required" };
      }

      if (orderAmount <= 0) {
        return { valid: false, error: "Invalid order amount" };
      }

      const normalizedCode = code.trim().toUpperCase();
      console.log("🔎 Searching for code:", normalizedCode);

      const q = query(
        collection(db, this.CODES_COLLECTION),
        where("code", "==", normalizedCode),
        where("isActive", "==", true)
      );

      const querySnapshot = await getDocs(q);
      console.log("📊 Query results:", {
        empty: querySnapshot.empty,
        size: querySnapshot.size,
      });

      if (querySnapshot.empty) {
        return { valid: false, error: "Invalid discount code" };
      }

      const discountDoc = querySnapshot.docs[0];
      const docData = discountDoc.data();
      console.log("📄 Discount document data:", docData);

      const discount = {
        id: discountDoc.id,
        ...docData,
        createdAt: docData.createdAt?.toDate() || new Date(),
        updatedAt: docData.updatedAt?.toDate() || new Date(),
        expiryDate: docData.expiryDate?.toDate(),
      } as DiscountCode;

      console.log("✅ Parsed discount:", discount);

      // Check expiry date
      if (discount.expiryDate && new Date() > discount.expiryDate) {
        console.log("❌ Code expired:", discount.expiryDate);
        return { valid: false, error: "Discount code has expired" };
      }

      // Check minimum order amount
      if (discount.minOrderAmount && orderAmount < discount.minOrderAmount) {
        console.log("❌ Order amount too low:", {
          required: discount.minOrderAmount,
          current: orderAmount,
        });
        return {
          valid: false,
          error: `Minimum order amount of ₵${discount.minOrderAmount} required`,
        };
      }

      // Check maximum uses
      if (discount.maxUses && discount.currentUses >= discount.maxUses) {
        console.log("❌ Usage limit reached:", {
          current: discount.currentUses,
          max: discount.maxUses,
        });
        return { valid: false, error: "Discount code usage limit reached" };
      }

      console.log("✅ Discount code is valid");
      return { valid: true, discount };
    } catch (error: any) {
      console.error("💥 Error validating discount code:", error);

      // Handle specific Firebase errors
      if (error?.code === "permission-denied") {
        return {
          valid: false,
          error: "Permission denied. Please try logging in again.",
        };
      } else if (error?.code === "unavailable") {
        return {
          valid: false,
          error: "Service temporarily unavailable. Please try again.",
        };
      } else if (error?.code === "unauthenticated") {
        return { valid: false, error: "Please log in to use discount codes." };
      }

      return {
        valid: false,
        error: "Failed to validate discount code. Please try again.",
      };
    }
  }

  static calculateDiscount(
    discount: DiscountCode,
    orderAmount: number
  ): number {
    if (discount.type === "percentage") {
      return Math.min((orderAmount * discount.value) / 100, orderAmount);
    } else {
      return Math.min(discount.value, orderAmount);
    }
  }

  static async applyDiscountCode(
    codeId: string,
    userId: string,
    orderId: string,
    discountAmount: number
  ): Promise<void> {
    // Record the application
    await addDoc(collection(db, this.APPLICATIONS_COLLECTION), {
      codeId,
      userId,
      orderId,
      discountAmount,
      appliedAt: Timestamp.now(),
    });

    // Increment usage count
    const codeRef = doc(db, this.CODES_COLLECTION, codeId);
    const codeDoc = await getDoc(codeRef);
    if (codeDoc.exists()) {
      const currentUses = codeDoc.data().currentUses || 0;
      await updateDoc(codeRef, {
        currentUses: currentUses + 1,
        updatedAt: Timestamp.now(),
      });
    }
  }

  static async getUserDiscountHistory(
    userId: string
  ): Promise<DiscountApplication[]> {
    const q = query(
      collection(db, this.APPLICATIONS_COLLECTION),
      where("userId", "==", userId)
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
          appliedAt: doc.data().appliedAt?.toDate(),
        } as DiscountApplication)
    );
  }
}
