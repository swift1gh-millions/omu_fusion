// Production-specific product loading utilities
// This provides reliable product loading in production environments

import { EnhancedProductService } from './enhancedProductService';
import { MockProductService } from './mockProductService';
import { ProductsResponse } from './enhancedProductService';

class ProductionProductService {
  private static cache: ProductsResponse | null = null;
  private static cacheTimestamp: number = 0;
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Check if cache is still valid
  private static isCacheValid(): boolean {
    return this.cache && (Date.now() - this.cacheTimestamp) < this.CACHE_DURATION;
  }

  // Reliable product loading for production
  static async getProducts(): Promise<ProductsResponse> {
    console.log('🏭 ProductionProductService: Loading products...');
    
    // Return cached data if valid
    if (this.isCacheValid() && this.cache) {
      console.log('⚡ Using cached products');
      return this.cache;
    }

    try {
      // Try Firebase first
      console.log('🔥 Attempting Firebase load...');
      const products = await EnhancedProductService.getProducts(
        {},
        { field: 'name', direction: 'asc' },
        { pageSize: 50 }
      );
      
      // Cache successful result
      this.cache = products;
      this.cacheTimestamp = Date.now();
      
      console.log('✅ Firebase load successful:', products.products.length, 'products');
      return products;
      
    } catch (firebaseError) {
      console.warn('⚠️ Firebase failed, using mock data:', firebaseError);
      
      try {
        // Fallback to mock service
        const mockProducts = await MockProductService.getProducts({}, {}, {});
        
        // Cache mock result too
        this.cache = mockProducts;
        this.cacheTimestamp = Date.now();
        
        console.log('✅ Mock service fallback successful:', mockProducts.products.length, 'products');
        return mockProducts;
        
      } catch (mockError) {
        console.error('❌ Both Firebase and mock services failed:', mockError);
        
        // Last resort: return empty result
        const emptyResult: ProductsResponse = {
          products: [],
          hasMore: false,
          total: 0
        };
        
        console.log('⚠️ Returning empty product list as last resort');
        return emptyResult;
      }
    }
  }

  // Clear cache to force fresh load
  static clearCache(): void {
    this.cache = null;
    this.cacheTimestamp = 0;
    console.log('🧹 Production product cache cleared');
  }

  // Check if products are available
  static hasProducts(): boolean {
    return this.isCacheValid() && this.cache !== null && this.cache.products.length > 0;
  }
}

export default ProductionProductService;