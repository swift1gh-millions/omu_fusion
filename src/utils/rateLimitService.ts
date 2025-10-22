/**
 * Rate Limiting Service
 * Implements client-side rate limiting to prevent API abuse
 *
 * Developer: Prince Yekunya
 * Website: https://swift1dev.netlify.app
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  blockDurationMs?: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
  blocked: boolean;
  blockUntil?: number;
}

class RateLimitService {
  private limits: Map<string, RateLimitEntry> = new Map();
  private configs: Map<string, RateLimitConfig> = new Map();

  /**
   * Configure rate limit for an operation
   */
  configure(operation: string, config: RateLimitConfig): void {
    this.configs.set(operation, config);
  }

  /**
   * Check if an operation is allowed
   */
  isAllowed(operation: string, userId?: string): boolean {
    const key = userId ? `${operation}:${userId}` : operation;
    const config = this.configs.get(operation);

    if (!config) {
      console.warn(`No rate limit config for operation: ${operation}`);
      return true;
    }

    const now = Date.now();
    let entry = this.limits.get(key);

    // Check if blocked
    if (entry?.blocked && entry.blockUntil && now < entry.blockUntil) {
      console.warn(
        `Operation ${operation} is blocked until ${new Date(
          entry.blockUntil
        ).toLocaleTimeString()}`
      );
      return false;
    }

    // Reset if window expired
    if (!entry || now >= entry.resetTime) {
      entry = {
        count: 0,
        resetTime: now + config.windowMs,
        blocked: false,
      };
      this.limits.set(key, entry);
    }

    // Increment counter
    entry.count++;

    // Check if limit exceeded
    if (entry.count > config.maxRequests) {
      entry.blocked = true;
      entry.blockUntil = now + (config.blockDurationMs || config.windowMs);
      console.warn(
        `Rate limit exceeded for ${operation}. Max: ${config.maxRequests} requests per ${config.windowMs}ms`
      );
      return false;
    }

    return true;
  }

  /**
   * Get remaining requests for an operation
   */
  getRemaining(operation: string, userId?: string): number {
    const key = userId ? `${operation}:${userId}` : operation;
    const config = this.configs.get(operation);
    const entry = this.limits.get(key);

    if (!config) return Infinity;
    if (!entry) return config.maxRequests;

    return Math.max(0, config.maxRequests - entry.count);
  }

  /**
   * Reset rate limit for an operation
   */
  reset(operation: string, userId?: string): void {
    const key = userId ? `${operation}:${userId}` : operation;
    this.limits.delete(key);
  }

  /**
   * Clear all rate limits
   */
  clearAll(): void {
    this.limits.clear();
  }
}

// Create singleton instance
const rateLimitService = new RateLimitService();

// Configure default rate limits
rateLimitService.configure("login", {
  maxRequests: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  blockDurationMs: 30 * 60 * 1000, // Block for 30 minutes
});

rateLimitService.configure("signup", {
  maxRequests: 3,
  windowMs: 60 * 60 * 1000, // 1 hour
  blockDurationMs: 60 * 60 * 1000, // Block for 1 hour
});

rateLimitService.configure("password_reset", {
  maxRequests: 3,
  windowMs: 60 * 60 * 1000, // 1 hour
  blockDurationMs: 2 * 60 * 60 * 1000, // Block for 2 hours
});

rateLimitService.configure("product_upload", {
  maxRequests: 10,
  windowMs: 5 * 60 * 1000, // 5 minutes
});

rateLimitService.configure("image_upload", {
  maxRequests: 20,
  windowMs: 10 * 60 * 1000, // 10 minutes
});

rateLimitService.configure("order_creation", {
  maxRequests: 10,
  windowMs: 60 * 60 * 1000, // 1 hour
});

rateLimitService.configure("review_submission", {
  maxRequests: 5,
  windowMs: 60 * 60 * 1000, // 1 hour
});

export default rateLimitService;
