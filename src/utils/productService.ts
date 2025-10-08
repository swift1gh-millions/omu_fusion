import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { ImageStorageService, ImageUploadResult } from "./imageStorageService";

export interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images: string[];
  featured?: boolean;
  isActive?: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export class ProductService {
  private static readonly COLLECTION_NAME = "products";

  // Upload images with enhanced error handling
  static async uploadProductImages(images: File[]): Promise<string[]> {
    try {
      // Use the new image storage service
      const uploadResults = await ImageStorageService.uploadImages(images);

      // Return just the URLs for compatibility
      return uploadResults.map((result) => result.url);
    } catch (error: any) {
      throw new Error(`Failed to upload images: ${error.message}`);
    }
  }

  // Add new product
  static async addProduct(
    productData: Omit<Product, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    try {
      const product: Omit<Product, "id"> = {
        ...productData,
        featured: productData.featured || false,
        isActive: productData.isActive !== false, // Default to true
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(
        collection(db, this.COLLECTION_NAME),
        product
      );
      return docRef.id;
    } catch (error: any) {
      throw new Error(`Failed to add product: ${error.message}`);
    }
  }

  // Get all products
  static async getAllProducts(): Promise<Product[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(
        (docSnap) =>
          ({
            id: docSnap.id,
            ...docSnap.data(),
          } as Product)
      );
    } catch (error: any) {
      // Enhanced diagnostics for Firestore rule / indexing issues
      const details: Record<string, any> = {
        originalMessage: error?.message,
        name: error?.name,
        code: error?.code,
      };
      // Surface a clearer hint for common denial scenarios
      if (error?.code === "permission-denied") {
        details.hint =
          "Firestore rules likely prevented reading 'products'. Ensure rules allow public read of active products or you are authenticated.";
      } else if (error?.code === "failed-precondition") {
        details.hint =
          "Missing composite index or invalid query ordering/filter combination. Check Firestore index requirements.";
      } else if (error?.code === "unimplemented") {
        details.hint =
          "A field used in orderBy may not exist on all documents. Consider guarding rule with exists() or providing default value.";
      }
      console.error(
        "[ProductService.getAllProducts] Firestore fetch failed",
        details
      );

      // Development fallback: return empty array with optional mock
      if (import.meta.env.MODE === "development") {
        console.warn(
          "Returning empty product list (development fallback). See console for Firestore error details."
        );
        return [];
      }
      throw new Error(
        `Failed to fetch products. ${details.hint || details.originalMessage}`
      );
    }
  }

  // Update product
  static async updateProduct(
    id: string,
    updates: Partial<Product>
  ): Promise<void> {
    try {
      const productRef = doc(db, this.COLLECTION_NAME, id);
      await updateDoc(productRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (error: any) {
      throw new Error(`Failed to update product: ${error.message}`);
    }
  }

  // Delete product and its images
  static async deleteProduct(id: string, imageUrls: string[]): Promise<void> {
    try {
      // Delete product document
      await deleteDoc(doc(db, this.COLLECTION_NAME, id));

      // For now, we'll just log image deletion since most free services don't support easy deletion
      // In the future, this could be enhanced to work with specific services
      console.log(`Product ${id} deleted. Images to clean up:`, imageUrls);
    } catch (error: any) {
      throw new Error(`Failed to delete product: ${error.message}`);
    }
  }

  // Get products by category
  static async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      const products = await this.getAllProducts();
      return products.filter(
        (product) =>
          product.category.toLowerCase() === category.toLowerCase() &&
          product.isActive !== false
      );
    } catch (error: any) {
      throw new Error(`Failed to fetch products by category: ${error.message}`);
    }
  }

  // Search products
  static async searchProducts(searchTerm: string): Promise<Product[]> {
    try {
      const products = await this.getAllProducts();
      const term = searchTerm.toLowerCase();

      return products.filter(
        (product) =>
          product.isActive !== false &&
          (product.name.toLowerCase().includes(term) ||
            product.description.toLowerCase().includes(term) ||
            product.category.toLowerCase().includes(term))
      );
    } catch (error: any) {
      throw new Error(`Failed to search products: ${error.message}`);
    }
  }
}
