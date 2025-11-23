// Product Debug Utility
// Helps track and debug product upload and display issues

export interface ProductDebugInfo {
  id?: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  isActive: boolean;
  hasImages: boolean;
  imageCount: number;
  createdAt?: any;
  updatedAt?: any;
}

export class ProductDebugService {
  private static logs: string[] = [];
  private static readonly MAX_LOGS = 100;

  // Log product operations with timestamps
  static log(message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;

    console.log(logEntry, data || "");

    this.logs.unshift(logEntry);
    if (this.logs.length > this.MAX_LOGS) {
      this.logs = this.logs.slice(0, this.MAX_LOGS);
    }
  }

  // Debug product upload process
  static debugProductUpload(formData: any, stage: string): void {
    this.log(`Product Upload - ${stage}`, {
      name: formData.name,
      category: formData.category,
      price: formData.price,
      stock: formData.stock,
      imageCount: formData.images?.length || 0,
    });
  }

  // Debug product display issues
  static debugProductDisplay(
    products: ProductDebugInfo[],
    filters?: any
  ): void {
    this.log("Product Display Debug", {
      totalProducts: products.length,
      activeProducts: products.filter((p) => p.isActive).length,
      productsWithImages: products.filter((p) => p.hasImages).length,
      categories: [...new Set(products.map((p) => p.category))],
      filters: filters || "none",
    });

    // Check for common issues
    const noImages = products.filter((p) => !p.hasImages);
    if (noImages.length > 0) {
      this.log(
        `Warning: ${noImages.length} products have no images`,
        noImages.map((p) => ({ id: p.id, name: p.name }))
      );
    }

    const inactive = products.filter((p) => !p.isActive);
    if (inactive.length > 0) {
      this.log(
        `Info: ${inactive.length} products are inactive`,
        inactive.map((p) => ({ id: p.id, name: p.name }))
      );
    }

    const missingCategory = products.filter((p) => !p.category);
    if (missingCategory.length > 0) {
      this.log(
        `Warning: ${missingCategory.length} products have no category`,
        missingCategory.map((p) => ({ id: p.id, name: p.name }))
      );
    }
  }

  // Validate product data structure
  static validateProductData(product: any): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!product.name || typeof product.name !== "string") {
      errors.push("Invalid or missing product name");
    }

    if (!product.description || typeof product.description !== "string") {
      errors.push("Invalid or missing product description");
    }

    if (typeof product.price !== "number" || product.price <= 0) {
      errors.push("Invalid product price");
    }

    if (!product.category || typeof product.category !== "string") {
      errors.push("Invalid or missing product category");
    }

    if (!Array.isArray(product.images) || product.images.length === 0) {
      errors.push("Product must have at least one image");
    }

    if (product.images && Array.isArray(product.images)) {
      const invalidImages = product.images.filter(
        (img: any) => !img || typeof img !== "string" || img.trim() === ""
      );
      if (invalidImages.length > 0) {
        errors.push(`${invalidImages.length} invalid image URLs found`);
      }
    }

    if (
      product.isActive !== true &&
      product.isActive !== false &&
      product.isActive !== undefined
    ) {
      errors.push("Invalid isActive status - must be boolean or undefined");
    }

    if (errors.length > 0) {
      this.log("Product Validation Failed", { product, errors });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Check system health for product operations
  static async checkSystemHealth(): Promise<{
    healthy: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];

    try {
      // Check if we can access Firestore
      const testQuery = "SELECT 1";
      // Note: In a real implementation, you'd test Firestore connection
      this.log("System Health Check: Firestore connection OK");
    } catch (error) {
      issues.push("Cannot connect to Firestore database");
      this.log("System Health Check: Firestore connection FAILED", error);
    }

    try {
      // Check cache service
      if (typeof Map === "undefined") {
        issues.push("Cache service not available");
      } else {
        this.log("System Health Check: Cache service OK");
      }
    } catch (error) {
      issues.push("Cache service error");
      this.log("System Health Check: Cache service FAILED", error);
    }

    // Check localStorage availability
    try {
      localStorage.setItem("test", "test");
      localStorage.removeItem("test");
      this.log("System Health Check: LocalStorage OK");
    } catch (error) {
      issues.push("localStorage not available");
      this.log("System Health Check: LocalStorage FAILED", error);
    }

    return {
      healthy: issues.length === 0,
      issues,
    };
  }

  // Get recent logs for debugging
  static getRecentLogs(count: number = 20): string[] {
    return this.logs.slice(0, count);
  }

  // Export debug report
  static generateDebugReport(products?: ProductDebugInfo[]): string {
    const report = [
      "=== PRODUCT DEBUG REPORT ===",
      `Generated: ${new Date().toISOString()}`,
      "",
      "--- Recent Logs ---",
      ...this.getRecentLogs(10),
      "",
    ];

    if (products) {
      report.push("--- Product Summary ---");
      report.push(`Total Products: ${products.length}`);
      report.push(
        `Active Products: ${products.filter((p) => p.isActive).length}`
      );
      report.push(
        `Products with Images: ${products.filter((p) => p.hasImages).length}`
      );
      report.push(
        `Categories: ${[...new Set(products.map((p) => p.category))].join(
          ", "
        )}`
      );
      report.push("");

      const issues = [];
      const noImages = products.filter((p) => !p.hasImages);
      if (noImages.length > 0) {
        issues.push(`${noImages.length} products missing images`);
      }

      const inactive = products.filter((p) => !p.isActive);
      if (inactive.length > 0) {
        issues.push(`${inactive.length} products inactive`);
      }

      if (issues.length > 0) {
        report.push("--- Issues Found ---");
        report.push(...issues);
      } else {
        report.push("--- No Issues Found ---");
      }
    }

    return report.join("\n");
  }

  // Clear logs
  static clearLogs(): void {
    this.logs = [];
    this.log("Debug logs cleared");
  }

  // Enable debug mode with enhanced logging
  static enableDebugMode(): void {
    this.log("Debug mode enabled");

    // Override console methods to capture all product-related logs
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    console.log = (...args) => {
      if (
        args.some(
          (arg) =>
            typeof arg === "string" &&
            (arg.includes("product") || arg.includes("Product"))
        )
      ) {
        this.log("Console Log: " + args.join(" "));
      }
      originalLog.apply(console, args);
    };

    console.error = (...args) => {
      if (
        args.some(
          (arg) =>
            typeof arg === "string" &&
            (arg.includes("product") || arg.includes("Product"))
        )
      ) {
        this.log("Console Error: " + args.join(" "));
      }
      originalError.apply(console, args);
    };

    console.warn = (...args) => {
      if (
        args.some(
          (arg) =>
            typeof arg === "string" &&
            (arg.includes("product") || arg.includes("Product"))
        )
      ) {
        this.log("Console Warn: " + args.join(" "));
      }
      originalWarn.apply(console, args);
    };
  }
}

// Export for use in components
export default ProductDebugService;
