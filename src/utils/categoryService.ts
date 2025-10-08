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

export interface Category {
  id?: string;
  name: string;
  description: string;
  isActive?: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export class CategoryService {
  private static readonly COLLECTION_NAME = "categories";

  // Get all categories
  static async getAllCategories(): Promise<Category[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        orderBy("name", "asc")
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Category)
      );
    } catch (error: any) {
      console.error("Failed to fetch categories:", error);
      // Return default categories if database fetch fails
      return this.getDefaultCategories();
    }
  }

  // Get active categories only
  static async getActiveCategories(): Promise<Category[]> {
    try {
      const categories = await this.getAllCategories();
      return categories.filter((category) => category.isActive !== false);
    } catch (error: any) {
      console.error("Failed to fetch active categories:", error);
      return this.getDefaultCategories();
    }
  }

  // Add new category
  static async addCategory(
    categoryData: Omit<Category, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    try {
      const category: Omit<Category, "id"> = {
        ...categoryData,
        isActive: categoryData.isActive !== false, // Default to true
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(
        collection(db, this.COLLECTION_NAME),
        category
      );
      return docRef.id;
    } catch (error: any) {
      throw new Error(`Failed to add category: ${error.message}`);
    }
  }

  // Update category
  static async updateCategory(
    id: string,
    updates: Partial<Category>
  ): Promise<void> {
    try {
      const categoryRef = doc(db, this.COLLECTION_NAME, id);
      await updateDoc(categoryRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (error: any) {
      throw new Error(`Failed to update category: ${error.message}`);
    }
  }

  // Delete category
  static async deleteCategory(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.COLLECTION_NAME, id));
    } catch (error: any) {
      throw new Error(`Failed to delete category: ${error.message}`);
    }
  }

  // Get categories as simple name array (for compatibility)
  static async getCategoryNames(): Promise<string[]> {
    try {
      const categories = await this.getActiveCategories();
      return categories.map((category) => category.name);
    } catch (error: any) {
      console.error("Failed to fetch category names:", error);
      return this.getDefaultCategoryNames();
    }
  }

  // Default categories (fallback)
  private static getDefaultCategories(): Category[] {
    const defaultNames = this.getDefaultCategoryNames();
    return defaultNames.map((name) => ({
      name,
      description: `${name} category`,
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }));
  }

  // Default category names (matches your admin panel)
  private static getDefaultCategoryNames(): string[] {
    return [
      "Sneakers",
      "Pants",
      "Caps",
      "Boots",
      "Hoodies",
      "T-Shirts",
      "Jackets",
      "Sandals",
      "Formal Shoes",
      "Casual Shoes",
      "Athletic Shoes",
      "Accessories",
    ];
  }

  // Initialize default categories in database
  static async initializeDefaultCategories(): Promise<void> {
    try {
      const existingCategories = await this.getAllCategories();

      if (existingCategories.length === 0) {
        const defaultNames = this.getDefaultCategoryNames();

        console.log("Initializing default categories...");

        for (const name of defaultNames) {
          try {
            await this.addCategory({
              name,
              description: `${name} category`,
              isActive: true,
            });
            console.log(`Added category: ${name}`);
          } catch (error) {
            console.error(`Failed to add category ${name}:`, error);
          }
        }

        console.log("Default categories initialization completed");
      } else {
        console.log("Categories already exist, skipping initialization");
      }
    } catch (error: any) {
      console.error("Failed to initialize default categories:", error);
      // Don't throw here, as this is just initialization
    }
  }
}
