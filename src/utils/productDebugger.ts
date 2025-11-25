// Debug utility for troubleshooting product loading issues
// This creates comprehensive debug reports for production troubleshooting

interface DebugReport {
  timestamp: string;
  environment: {
    mode: string;
    prod: boolean;
    dev: boolean;
    nodeEnv: string;
    url: string;
    userAgent: string;
  };
  firebase: {
    hasApiKey: boolean;
    hasProjectId: boolean;
    hasAuthDomain: boolean;
    apiKeyLength: number;
    projectId: string;
    authDomain: string;
  };
  services: {
    firebaseAvailable: boolean;
    mockServiceAvailable: boolean;
    cacheAvailable: boolean;
  };
  performance: {
    loadStartTime: number;
    memoryUsage?: any;
  };
  errors: any[];
}

class ProductDebugger {
  private static errors: any[] = [];
  private static startTime: number = 0;

  // Start debugging session
  static startDebugging(): void {
    this.startTime = Date.now();
    this.errors = [];
    console.log("🐛 ProductDebugger: Debug session started");
  }

  // Log an error
  static logError(context: string, error: any): void {
    const errorInfo = {
      context,
      timestamp: new Date().toISOString(),
      error: {
        name: error?.name,
        message: error?.message,
        code: error?.code,
        stack: error?.stack?.split("\n").slice(0, 5),
      },
    };

    this.errors.push(errorInfo);
    console.log(`🐛 ProductDebugger: Error logged in ${context}:`, errorInfo);
  }

  // Generate comprehensive debug report
  static generateReport(): DebugReport {
    const report: DebugReport = {
      timestamp: new Date().toISOString(),
      environment: {
        mode: import.meta.env.MODE,
        prod: import.meta.env.PROD,
        dev: import.meta.env.DEV,
        nodeEnv: import.meta.env.NODE_ENV || "unknown",
        url: window.location.href,
        userAgent: navigator.userAgent,
      },
      firebase: {
        hasApiKey: !!import.meta.env.VITE_FIREBASE_API_KEY,
        hasProjectId: !!import.meta.env.VITE_FIREBASE_PROJECT_ID,
        hasAuthDomain: !!import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        apiKeyLength: import.meta.env.VITE_FIREBASE_API_KEY?.length || 0,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "MISSING",
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "MISSING",
      },
      services: {
        firebaseAvailable: false, // Will be updated by calling services
        mockServiceAvailable: true, // Assume available unless proven otherwise
        cacheAvailable: typeof localStorage !== "undefined",
      },
      performance: {
        loadStartTime: this.startTime,
        memoryUsage: (performance as any).memory
          ? {
              usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
              totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
            }
          : "not available",
      },
      errors: this.errors,
    };

    return report;
  }

  // Print formatted debug report
  static printReport(): void {
    const report = this.generateReport();

    console.log("🐛 ===== PRODUCT DEBUG REPORT =====");
    console.log("🕒 Timestamp:", report.timestamp);
    console.log("🌍 Environment:", report.environment);
    console.log("🔥 Firebase Config:", report.firebase);
    console.log("⚙️ Services:", report.services);
    console.log("⚡ Performance:", report.performance);
    console.log("❌ Errors (" + report.errors.length + "):", report.errors);
    console.log("🐛 ===== END DEBUG REPORT =====");

    // Also log as a single object for easy copying
    console.log("🐛 Full Debug Report Object:", report);
  }

  // Quick status check
  static quickStatus(): void {
    console.log("🐛 Quick Status Check:", {
      firebaseApiKey: !!import.meta.env.VITE_FIREBASE_API_KEY,
      firebaseProjectId: !!import.meta.env.VITE_FIREBASE_PROJECT_ID,
      environment: import.meta.env.MODE,
      isProduction: import.meta.env.PROD,
      errorCount: this.errors.length,
      uptime: Date.now() - this.startTime,
    });
  }
}

// Auto-start debugging in development
if (import.meta.env.DEV) {
  ProductDebugger.startDebugging();
}

// Make it globally available for manual debugging
if (typeof window !== "undefined") {
  (window as any).ProductDebugger = ProductDebugger;
}

export default ProductDebugger;
