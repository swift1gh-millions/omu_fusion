// Production-specific product loading utilities
// This provides reliable product loading in production environments

import { EnhancedProductService } from "./enhancedProductService";
import { MockProductService } from "./mockProductService";
import { ProductsResponse } from "./enhancedProductService";

class ProductionProductService {
  private static cache: ProductsResponse | null = null;
  private static cacheTimestamp: number = 0;
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Check if cache is still valid
  private static isCacheValid(): boolean {
    return (
      this.cache !== null &&
      Date.now() - this.cacheTimestamp < this.CACHE_DURATION
    );
  }

  // Reliable product loading for production
  static async getProducts(): Promise<ProductsResponse> {
    console.log("🏭 ProductionProductService: Loading products...");
    console.log("🔍 DEBUG: Environment details:", {
      MODE: import.meta.env.MODE,
      PROD: import.meta.env.PROD,
      NODE_ENV: import.meta.env.NODE_ENV,
      hasApiKey: !!import.meta.env.VITE_FIREBASE_API_KEY,
      hasProjectId: !!import.meta.env.VITE_FIREBASE_PROJECT_ID,
      apiKeyLength: import.meta.env.VITE_FIREBASE_API_KEY?.length || 0,
      timestamp: new Date().toISOString(),
    });

    // Return cached data if valid
    if (this.isCacheValid() && this.cache) {
      console.log("⚡ Using cached products:", {
        productCount: this.cache.products.length,
        cacheAge: Date.now() - this.cacheTimestamp,
        hasMore: this.cache.hasMore,
      });
      return this.cache;
    }

    console.log("🔄 Cache miss or invalid, loading fresh data...");

    try {
      // Check if Firebase environment variables are available
      if (!import.meta.env.VITE_FIREBASE_API_KEY || !import.meta.env.VITE_FIREBASE_PROJECT_ID) {
        console.warn("⚠️ Firebase environment variables missing, using mock data immediately");
        const mockProducts = await MockProductService.getProducts({}, {}, {});
        this.cache = mockProducts;
        this.cacheTimestamp = Date.now();
        return mockProducts;
      }

      // Try Firebase first
      console.log("🔥 Attempting Firebase load...");
      console.log("🔍 DEBUG: About to call EnhancedProductService.getProducts");

      const startTime = Date.now();
      const products = await EnhancedProductService.getProducts(
        {},
        { field: "name", direction: "asc" },
        { pageSize: 50 }
      );
      const loadTime = Date.now() - startTime;

      // Cache successful result
      this.cache = products;
      this.cacheTimestamp = Date.now();

      console.log("✅ Firebase load successful:", {
        productCount: products.products.length,
        loadTime: `${loadTime}ms`,
        hasMore: products.hasMore,
        total: products.total,
        sampleProducts: products.products
          .slice(0, 3)
          .map((p) => ({ id: p.id, name: p.name, category: p.category })),
      });
      return products;
    } catch (firebaseError) {
      console.warn("⚠️ Firebase failed, analyzing error...");
      console.log("🔍 DEBUG: Firebase error details:", {
        name: (firebaseError as any)?.name,
        message: (firebaseError as any)?.message,
        code: (firebaseError as any)?.code,
        stack: (firebaseError as any)?.stack?.split("\n").slice(0, 3),
        fullError: firebaseError,
      });

      try {
        console.log("🔄 Attempting mock service fallback...");
        const startTime = Date.now();
        const mockProducts = await MockProductService.getProducts({}, {}, {});
        const loadTime = Date.now() - startTime;

        // Cache mock result too
        this.cache = mockProducts;
        this.cacheTimestamp = Date.now();

        console.log("✅ Mock service fallback successful:", {
          productCount: mockProducts.products.length,
          loadTime: `${loadTime}ms`,
          hasMore: mockProducts.hasMore,
          total: mockProducts.total,
          sampleProducts: mockProducts.products
            .slice(0, 3)
            .map((p) => ({ id: p.id, name: p.name, category: p.category })),
        });
        return mockProducts;
      } catch (mockError) {
        console.error("❌ Both Firebase and mock services failed");
        console.log("🔍 DEBUG: Mock service error:", {
          name: (mockError as any)?.name,
          message: (mockError as any)?.message,
          stack: (mockError as any)?.stack?.split("\n").slice(0, 3),
          fullError: mockError,
        });

        // Last resort: return empty result
        const emptyResult: ProductsResponse = {
          products: [],
          hasMore: false,
          total: 0,
        };

        console.log("⚠️ Returning empty product list as last resort");
        return emptyResult;
      }
    }
  }

  // Clear cache to force fresh load
  static clearCache(): void {
    this.cache = null;
    this.cacheTimestamp = 0;
    console.log("🧹 Production product cache cleared");
  }

  // Check if products are available
  static hasProducts(): boolean {
    return (
      this.isCacheValid() &&
      this.cache !== null &&
      this.cache.products.length > 0
    );
  }
}

export default ProductionProductService;
