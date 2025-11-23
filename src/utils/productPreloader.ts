// Product Preloader Service
// Handles background preloading and caching of products for better performance

import {
  EnhancedProductService,
  ProductsResponse,
} from "./enhancedProductService";
import CacheService from "./cacheService";

interface PreloadConfig {
  maxProducts: number;
  cacheDuration: number; // in milliseconds
  preloadDelay: number; // delay before starting background preload
}

class ProductPreloaderService {
  private static instance: ProductPreloaderService;
  private isPreloading = false;
  private preloadedData: ProductsResponse | null = null;
  private preloadPromise: Promise<ProductsResponse> | null = null;

  private config: PreloadConfig = {
    maxProducts: 50, // Preload first 50 products
    cacheDuration: 10 * 60 * 1000, // 10 minutes
    preloadDelay: 2000, // 2 seconds after homepage loads
  };

  private readonly CACHE_KEYS = {
    PRODUCTS: "preloaded_products",
    TIMESTAMP: "products_cache_timestamp",
    IMAGES: "preloaded_images",
  };

  static getInstance(): ProductPreloaderService {
    if (!ProductPreloaderService.instance) {
      ProductPreloaderService.instance = new ProductPreloaderService();
    }
    return ProductPreloaderService.instance;
  }

  // Check if cached data is still valid
  private isCacheValid(): boolean {
    try {
      const timestamp = localStorage.getItem(this.CACHE_KEYS.TIMESTAMP);
      if (!timestamp) return false;

      const age = Date.now() - parseInt(timestamp);
      return age < this.config.cacheDuration;
    } catch {
      return false;
    }
  }

  // Get cached products from localStorage
  private getCachedProducts(): ProductsResponse | null {
    try {
      if (!this.isCacheValid()) {
        this.clearCache();
        return null;
      }

      const cached = localStorage.getItem(this.CACHE_KEYS.PRODUCTS);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.warn("Failed to get cached products:", error);
      return null;
    }
  }

  // Store products in localStorage
  private setCachedProducts(products: ProductsResponse): void {
    try {
      localStorage.setItem(this.CACHE_KEYS.PRODUCTS, JSON.stringify(products));
      localStorage.setItem(this.CACHE_KEYS.TIMESTAMP, Date.now().toString());
      console.log("✅ Products cached successfully");
    } catch (error) {
      console.warn("Failed to cache products:", error);
    }
  }

  // Clear expired cache
  private clearCache(): void {
    try {
      localStorage.removeItem(this.CACHE_KEYS.PRODUCTS);
      localStorage.removeItem(this.CACHE_KEYS.TIMESTAMP);
      localStorage.removeItem(this.CACHE_KEYS.IMAGES);
    } catch (error) {
      console.warn("Failed to clear cache:", error);
    }
  }

  // Preload product images in the background
  private async preloadImages(products: ProductsResponse): Promise<void> {
    const imageUrls = products.products
      .filter((product) => product.images && product.images.length > 0)
      .slice(0, 20) // Only preload first 20 product images
      .flatMap((product) => product.images.slice(0, 2)); // First 2 images per product

    const preloadPromises = imageUrls.map((url) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve(); // Continue even if image fails
        img.src = url;
      });
    });

    try {
      await Promise.allSettled(preloadPromises);
      console.log(`✅ Preloaded ${imageUrls.length} product images`);
    } catch (error) {
      console.warn("Some images failed to preload:", error);
    }
  }

  // Start background preloading after homepage loads
  startBackgroundPreload(): void {
    if (this.isPreloading || this.preloadedData) {
      return; // Already preloading or preloaded
    }

    // Check if we have valid cached data first
    const cached = this.getCachedProducts();
    if (cached) {
      this.preloadedData = cached;
      console.log("✅ Using cached products");
      return;
    }

    // Start preloading after delay
    setTimeout(() => {
      this.preloadProducts();
    }, this.config.preloadDelay);
  }

  // Preload products in the background
  private async preloadProducts(): Promise<void> {
    if (this.isPreloading) return;

    this.isPreloading = true;
    console.log("🔄 Starting background product preload...");

    try {
      this.preloadPromise = EnhancedProductService.getProducts(
        {}, // No filters for initial load
        { field: "name", direction: "asc" }, // Simple sorting
        { pageSize: this.config.maxProducts }
      );

      const products = await this.preloadPromise;

      this.preloadedData = products;
      this.setCachedProducts(products);

      // Preload images in the background
      this.preloadImages(products);

      console.log(`✅ Preloaded ${products.products.length} products`);
    } catch (error) {
      console.warn("Background preload failed:", error);
    } finally {
      this.isPreloading = false;
      this.preloadPromise = null;
    }
  }

  // Get products instantly if preloaded, otherwise load normally
  async getProducts(): Promise<ProductsResponse> {
    // Return cached/preloaded data immediately if available
    if (this.preloadedData) {
      console.log("⚡ Using preloaded products");
      return this.preloadedData;
    }

    // Check localStorage cache
    const cached = this.getCachedProducts();
    if (cached) {
      this.preloadedData = cached;
      console.log("⚡ Using cached products");
      return cached;
    }

    // If currently preloading, wait for it
    if (this.preloadPromise) {
      console.log("⏳ Waiting for background preload...");
      const products = await this.preloadPromise;
      this.preloadedData = products;
      return products;
    }

    // Fall back to normal loading
    console.log("🔄 Loading products normally...");
    return EnhancedProductService.getProducts(
      {},
      { field: "name", direction: "asc" },
      { pageSize: this.config.maxProducts }
    );
  }

  // Check if products are ready (preloaded or cached)
  isReady(): boolean {
    return !!this.preloadedData || !!this.getCachedProducts();
  }

  // Force refresh products (useful for admin updates)
  async refreshProducts(): Promise<void> {
    this.clearCache();
    this.preloadedData = null;
    this.isPreloading = false;
    this.preloadPromise = null;

    await this.preloadProducts();
  }

  // Get cache info for debugging
  getCacheInfo() {
    return {
      isPreloaded: !!this.preloadedData,
      isCached: this.isCacheValid(),
      isPreloading: this.isPreloading,
      cacheAge: this.isCacheValid()
        ? Date.now() -
          parseInt(localStorage.getItem(this.CACHE_KEYS.TIMESTAMP) || "0")
        : 0,
    };
  }
}

export default ProductPreloaderService.getInstance();
