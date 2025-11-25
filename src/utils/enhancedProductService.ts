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
  where,
  limit as firestoreLimit,
  startAfter,
  Timestamp,
  DocumentSnapshot,
  QueryConstraint,
} from "firebase/firestore";
import { ProductSchema, type ProductData } from "./validationSchemas";
import { Product } from "./databaseSchema";
import ErrorService from "./errorService";
import CacheService from "./cacheService";
import { ImageStorageService } from "./imageStorageService";
import MockProductService from "./mockProductService";

export interface ProductFilter {
  category?: string;
  subcategory?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  isActive?: boolean;
  tags?: string[];
}

export interface ProductSort {
  field: "name" | "price" | "createdAt" | "updatedAt";
  direction: "asc" | "desc";
}

export interface PaginationOptions {
  pageSize: number;
  lastDoc?: DocumentSnapshot;
}

export interface ProductsResponse {
  products: Product[];
  hasMore: boolean;
  lastDoc?: DocumentSnapshot;
  total?: number;
}

export class EnhancedProductService {
  private static readonly COLLECTION_NAME = "products";
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private static readonly DEFAULT_PAGE_SIZE = 50;

  // Check if Firebase is properly configured
  private static isFirebaseAvailable(): boolean {
    try {
      console.log("🔍 Checking Firebase availability...");

      // First check if environment variables are properly configured
      const isConfigured = MockProductService.isFirebaseConfigured();
      console.log("🔧 Firebase config check:", isConfigured);

      if (!isConfigured) {
        console.log(
          "❌ Firebase environment variables not configured, using mock service"
        );
        return false;
      }

      // Check if db is available
      console.log("db:", db);
      if (!db) {
        console.log("❌ db is null/undefined, Firebase not available");
        return false;
      }

      console.log("✅ Firebase is configured and db object exists");
      return true;
    } catch (error: any) {
      console.warn(
        "❌ Firebase connection test failed, using mock service:",
        error
      );
      if (error?.code) {
        console.log("Error code:", error.code);
      }
      return false;
    }
  }

  // Upload images with compression and multiple sizes
  static async uploadProductImages(images: File[]): Promise<string[]> {
    // Use mock service if Firebase isn't available
    if (!this.isFirebaseAvailable()) {
      console.log("🔄 Using mock image upload service");
      return MockProductService.uploadProductImages(images);
    }

    return ErrorService.handleServiceError(
      async () => {
        if (!images || images.length === 0) {
          throw new Error("No images provided");
        }

        if (images.length > 10) {
          throw new Error("Maximum 10 images allowed per product");
        }

        // Validate image files
        for (const image of images) {
          if (!image.type.startsWith("image/")) {
            throw new Error(`File ${image.name} is not a valid image`);
          }
          if (image.size > 5 * 1024 * 1024) {
            // 5MB limit
            throw new Error(
              `Image ${image.name} is too large. Maximum size is 5MB`
            );
          }
        }

        const uploadResults = await ImageStorageService.uploadImages(images);
        return uploadResults.map((result) => result.url);
      },
      { action: "Upload product images" },
      "medium"
    );
  }

  // Add new product with validation
  static async addProduct(
    productData: Omit<ProductData, "id" | "createdAt" | "updatedAt">,
    userId: string
  ): Promise<string> {
    // Use mock service if Firebase isn't available
    if (!this.isFirebaseAvailable()) {
      console.log("🔄 Using mock product creation service");
      return MockProductService.addProduct(productData, userId);
    }

    return ErrorService.handleServiceError(
      async () => {
        // Validate product data
        const validatedData = ProductSchema.parse(productData);

        const product: Omit<Product, "id"> = {
          ...validatedData,
          tags: validatedData.tags || [],
          seo: validatedData.seo || {},
          variants: validatedData.variants || [],
          featured: validatedData.featured || false,
          isActive: true, // Always set to true for new products
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          createdBy: userId,
        };

        console.log("Creating product with data:", {
          name: product.name,
          category: product.category,
          price: product.price,
          isActive: product.isActive,
          imagesCount: product.images.length,
        });

        const docRef = await addDoc(
          collection(db, this.COLLECTION_NAME),
          product
        );

        console.log("Product created successfully with ID:", docRef.id);

        // Invalidate relevant caches
        this.invalidateProductCaches();

        return docRef.id;
      },
      { action: "Add product", userId },
      "medium"
    );
  }

  // Get products with filtering, sorting, and pagination
  static async getProducts(
    filters: ProductFilter = {},
    sort: ProductSort = { field: "createdAt", direction: "desc" },
    pagination: PaginationOptions = { pageSize: this.DEFAULT_PAGE_SIZE }
  ): Promise<ProductsResponse> {
    console.log("🚀 EnhancedProductService.getProducts called");
    console.log("📦 Filters:", filters);
    console.log("📊 Sort:", sort);
    console.log("📄 Pagination:", pagination);

    // Use mock service if Firebase isn't available
    if (!this.isFirebaseAvailable()) {
      console.log("🔄 Using mock product service (Firebase not available)");
      try {
        const result = await MockProductService.getProducts(
          filters,
          sort,
          pagination
        );
        console.log("✅ Mock service returned:", result);
        return result;
      } catch (error) {
        console.error("❌ Mock service error:", error);
        throw error;
      }
    }

    console.log("🔥 Attempting Firebase service");

    try {
      return await ErrorService.handleServiceError(
        async () => {
          const cacheKey = this.generateCacheKey(
            "products",
            filters,
            sort,
            pagination
          );

          return CacheService.getOrFetch(
            cacheKey,
            async () => {
              const constraints: QueryConstraint[] = [];

              // Add filters
              if (filters.category) {
                constraints.push(where("category", "==", filters.category));
              }
              if (filters.subcategory) {
                constraints.push(
                  where("subcategory", "==", filters.subcategory)
                );
              }
              if (filters.brand) {
                constraints.push(where("brand", "==", filters.brand));
              }
              if (filters.featured !== undefined) {
                constraints.push(where("featured", "==", filters.featured));
              }
              if (filters.isActive !== undefined) {
                constraints.push(where("isActive", "==", filters.isActive));
              }
              if (filters.minPrice !== undefined) {
                constraints.push(where("price", ">=", filters.minPrice));
              }
              if (filters.maxPrice !== undefined) {
                constraints.push(where("price", "<=", filters.maxPrice));
              }
              if (filters.tags && filters.tags.length > 0) {
                constraints.push(
                  where("tags", "array-contains-any", filters.tags)
                );
              }

              // Add sorting
              constraints.push(orderBy(sort.field, sort.direction));

              // Add pagination
              constraints.push(firestoreLimit(pagination.pageSize + 1)); // +1 to check if there are more

              if (pagination.lastDoc) {
                constraints.push(startAfter(pagination.lastDoc));
              }

              const q = query(
                collection(db, this.COLLECTION_NAME),
                ...constraints
              );
              const querySnapshot = await getDocs(q);

              const products: Product[] = [];
              const docs = querySnapshot.docs;

              for (
                let i = 0;
                i < Math.min(docs.length, pagination.pageSize);
                i++
              ) {
                const doc = docs[i];
                products.push({
                  id: doc.id,
                  ...doc.data(),
                } as Product);
              }

              return {
                products,
                hasMore: docs.length > pagination.pageSize,
                lastDoc:
                  docs.length > pagination.pageSize
                    ? docs[pagination.pageSize - 1]
                    : undefined,
              };
            },
            this.CACHE_TTL
          );
        },
        { action: "Get products" },
        "low"
      );
    } catch (error: any) {
      console.warn(
        "🔥 Firebase service failed, falling back to mock service:",
        error
      );

      // Log specific error details for debugging
      if (error?.code) {
        console.log("Firebase Error Code:", error.code);
      }
      if (error?.message) {
        console.log("Firebase Error Message:", error.message);
      }

      // Special handling for production environment
      const isProduction =
        import.meta.env.PROD || import.meta.env.MODE === "production";
      if (isProduction) {
        console.log(
          "🌐 Production environment detected - using mock data as fallback"
        );
      }

      console.log("🔄 Using mock product service fallback");

      try {
        const result = await MockProductService.getProducts(
          filters,
          sort,
          pagination
        );
        console.log("✅ Mock service fallback successful:", result);
        return result;
      } catch (mockError) {
        console.error("❌ Mock service fallback also failed:", mockError);

        // Return empty result as last resort
        console.log("⚠️ Returning empty product list as last resort");
        return {
          products: [],
          hasMore: false,
          total: 0,
        };
      }
    }
  }

  // Get single product by ID
  static async getProductById(productId: string): Promise<Product | null> {
    return ErrorService.handleServiceError(
      async () => {
        const cacheKey = `product_${productId}`;

        return CacheService.getOrFetch(
          cacheKey,
          async () => {
            const productDoc = await doc(db, this.COLLECTION_NAME, productId);
            const docSnap = await getDocs(
              query(
                collection(db, this.COLLECTION_NAME),
                where("__name__", "==", productId)
              )
            );

            if (docSnap.empty) {
              return null;
            }

            const productData = docSnap.docs[0];
            return {
              id: productData.id,
              ...productData.data(),
            } as Product;
          },
          this.CACHE_TTL
        );
      },
      { action: "Get product by ID" },
      "low"
    );
  }

  // Update product
  static async updateProduct(
    productId: string,
    updates: Partial<ProductData>,
    userId: string
  ): Promise<void> {
    return ErrorService.handleServiceError(
      async () => {
        // Validate updates if provided
        if (Object.keys(updates).length > 0) {
          const partialSchema = ProductSchema.partial();
          partialSchema.parse(updates);
        }

        const updateData = {
          ...updates,
          updatedAt: Timestamp.now(),
        };

        await updateDoc(doc(db, this.COLLECTION_NAME, productId), updateData);

        // Invalidate caches
        CacheService.invalidate(`product_${productId}`);
        this.invalidateProductCaches();
      },
      { action: "Update product", userId },
      "medium"
    );
  }

  // Update product status specifically
  static async updateProductStatus(
    productId: string,
    status: "none" | "new" | "sale",
    userId: string
  ): Promise<void> {
    return ErrorService.handleServiceError(
      async () => {
        const updateData = {
          status: status,
          updatedAt: Timestamp.now(),
        };

        await updateDoc(doc(db, this.COLLECTION_NAME, productId), updateData);

        // Invalidate caches
        CacheService.invalidate(`product_${productId}`);
        this.invalidateProductCaches();
      },
      { action: "Update product status", userId },
      "low"
    );
  }

  // Delete product
  static async deleteProduct(productId: string, userId: string): Promise<void> {
    return ErrorService.handleServiceError(
      async () => {
        await deleteDoc(doc(db, this.COLLECTION_NAME, productId));

        // Invalidate caches
        CacheService.invalidate(`product_${productId}`);
        this.invalidateProductCaches();
      },
      { action: "Delete product", userId },
      "high"
    );
  }

  // Get featured products
  static async getFeaturedProducts(limitCount: number = 8): Promise<Product[]> {
    return ErrorService.handleServiceError(
      async () => {
        const cacheKey = `featured_products_${limitCount}`;

        return CacheService.getOrFetch(
          cacheKey,
          async () => {
            const q = query(
              collection(db, this.COLLECTION_NAME),
              where("featured", "==", true),
              where("isActive", "==", true),
              orderBy("createdAt", "desc"),
              firestoreLimit(limitCount)
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(
              (doc) =>
                ({
                  id: doc.id,
                  ...doc.data(),
                } as Product)
            );
          },
          this.CACHE_TTL
        );
      },
      { action: "Get featured products" },
      "low"
    );
  }

  // Search products
  static async searchProducts(
    searchTerm: string,
    filters: ProductFilter = {},
    pagination: PaginationOptions = { pageSize: this.DEFAULT_PAGE_SIZE }
  ): Promise<ProductsResponse> {
    return ErrorService.handleServiceError(
      async () => {
        const cacheKey = this.generateCacheKey(
          "search",
          { searchTerm, ...filters },
          undefined,
          pagination
        );

        return CacheService.getOrFetch(
          cacheKey,
          async () => {
            // For full-text search, we would typically use a search service like Algolia
            // For now, we'll do a simple text-based search on name and description
            const constraints: QueryConstraint[] = [
              where("isActive", "==", true),
            ];

            // Add other filters
            Object.entries(filters).forEach(([key, value]) => {
              if (value !== undefined && key !== "searchTerm") {
                constraints.push(where(key, "==", value));
              }
            });

            constraints.push(orderBy("name"));
            constraints.push(firestoreLimit(pagination.pageSize + 1));

            if (pagination.lastDoc) {
              constraints.push(startAfter(pagination.lastDoc));
            }

            const q = query(
              collection(db, this.COLLECTION_NAME),
              ...constraints
            );
            const querySnapshot = await getDocs(q);

            // Filter results by search term (client-side filtering)
            const allProducts = querySnapshot.docs.map(
              (doc) =>
                ({
                  id: doc.id,
                  ...doc.data(),
                } as Product)
            );

            const searchTermLower = searchTerm.toLowerCase();
            const filteredProducts = allProducts.filter(
              (product) =>
                product.name.toLowerCase().includes(searchTermLower) ||
                product.description.toLowerCase().includes(searchTermLower) ||
                product.tags?.some((tag) =>
                  tag.toLowerCase().includes(searchTermLower)
                )
            );

            const products = filteredProducts.slice(0, pagination.pageSize);

            return {
              products,
              hasMore: filteredProducts.length > pagination.pageSize,
              lastDoc:
                products.length > 0
                  ? querySnapshot.docs[products.length - 1]
                  : undefined,
            };
          },
          this.CACHE_TTL
        );
      },
      { action: "Search products" },
      "low"
    );
  }

  // Get products by category
  static async getProductsByCategory(
    category: string,
    pagination: PaginationOptions = { pageSize: this.DEFAULT_PAGE_SIZE }
  ): Promise<ProductsResponse> {
    return this.getProducts(
      { category, isActive: true },
      { field: "createdAt", direction: "desc" },
      pagination
    );
  }

  // Get product analytics
  static async getProductAnalytics(productId: string): Promise<any> {
    return ErrorService.handleServiceError(
      async () => {
        // This would typically connect to analytics service
        // For now, return basic product info
        const product = await this.getProductById(productId);
        if (!product) {
          throw new Error("Product not found");
        }

        return {
          productId,
          name: product.name,
          views: 0, // Would come from analytics
          sales: 0, // Would come from orders
          revenue: 0, // Would come from orders
          conversionRate: 0, // Would be calculated
        };
      },
      { action: "Get product analytics" },
      "low"
    );
  }

  // Helper methods
  private static generateCacheKey(
    operation: string,
    filters?: any,
    sort?: ProductSort,
    pagination?: PaginationOptions
  ): string {
    const parts = [operation];

    if (filters) {
      parts.push(JSON.stringify(filters));
    }
    if (sort) {
      parts.push(`${sort.field}_${sort.direction}`);
    }
    if (pagination) {
      parts.push(`page_${pagination.pageSize}`);
    }

    return parts.join("_");
  }

  private static invalidateProductCaches(): void {
    // Clear all product-related caches
    CacheService.invalidatePattern("products.*");
    CacheService.invalidatePattern("featured_products.*");
    CacheService.invalidatePattern("search.*");
    // Also clear the main products cache key used by shop page
    CacheService.invalidate("products_{}_name_asc_50");
    // Force clear all cache to ensure fresh data
    CacheService.clearAll();
  }

  // Bulk operations
  static async bulkUpdateProducts(
    updates: Array<{ id: string; data: Partial<ProductData> }>,
    userId: string
  ): Promise<void> {
    return ErrorService.handleServiceError(
      async () => {
        const updatePromises = updates.map(({ id, data }) =>
          this.updateProduct(id, data, userId)
        );

        await Promise.all(updatePromises);
      },
      { action: "Bulk update products", userId },
      "high"
    );
  }

  static async bulkDeleteProducts(
    productIds: string[],
    userId: string
  ): Promise<void> {
    return ErrorService.handleServiceError(
      async () => {
        const deletePromises = productIds.map((id) =>
          this.deleteProduct(id, userId)
        );
        await Promise.all(deletePromises);
      },
      { action: "Bulk delete products", userId },
      "high"
    );
  }
}

export default EnhancedProductService;
