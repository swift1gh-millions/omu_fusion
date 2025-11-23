// Enhanced Caching Service for improved performance
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expires: number;
  version?: string;
  priority?: "low" | "medium" | "high";
}

class CacheService {
  private static cache = new Map<string, CacheItem<any>>();
  private static defaultTTL = 5 * 60 * 1000; // 5 minutes
  private static readonly CACHE_VERSION = "v1.2";
  static readonly CACHE_EXPIRY = {
    IMAGES: 7 * 24 * 60 * 60 * 1000, // 7 days
    ASSETS: 30 * 24 * 60 * 60 * 1000, // 30 days
    DATA: 1 * 60 * 60 * 1000, // 1 hour
    CRITICAL: 24 * 60 * 60 * 1000, // 24 hours for critical resources
  };

  static set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    const now = Date.now();
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: now,
      expires: now + ttl,
    };
    this.cache.set(key, cacheItem);
  }

  static get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) {
      return null;
    }

    const now = Date.now();
    if (now > item.expires) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  static async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = this.defaultTTL
  ): Promise<T> {
    // Try to get from cache first
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // If not in cache, fetch and cache
    try {
      const data = await fetcher();
      this.set(key, data, ttl);
      return data;
    } catch (error) {
      // Don't cache errors, just re-throw
      throw error;
    }
  }

  static invalidate(key: string): void {
    this.cache.delete(key);
  }

  static invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  static clear(): void {
    this.cache.clear();
  }

  static clearAll(): void {
    this.cache.clear();
  }

  // Cache image URLs with different strategies
  static cacheImage(
    url: string,
    priority: "low" | "medium" | "high" = "medium"
  ): void {
    const ttl =
      priority === "high"
        ? this.CACHE_EXPIRY.CRITICAL
        : this.CACHE_EXPIRY.IMAGES;
    this.set(`image_${url}`, { url, cached: true }, ttl);
  }

  // Store in localStorage for persistence
  static setPersistent(key: string, data: any, expiryMs?: number): void {
    try {
      const expiry = expiryMs ? Date.now() + expiryMs : null;
      const cacheItem = {
        data,
        expiry,
        version: this.CACHE_VERSION,
        timestamp: Date.now(),
      };
      localStorage.setItem(`omufusion_${key}`, JSON.stringify(cacheItem));
    } catch (error) {
      console.warn("Failed to set persistent cache:", error);
    }
  }

  // Get from localStorage with expiry check
  static getPersistent<T = any>(key: string): T | null {
    try {
      const item = localStorage.getItem(`omufusion_${key}`);
      if (!item) return null;

      const cacheItem = JSON.parse(item);

      // Check version compatibility
      if (cacheItem.version !== this.CACHE_VERSION) {
        localStorage.removeItem(`omufusion_${key}`);
        return null;
      }

      // Check expiry
      if (cacheItem.expiry && Date.now() > cacheItem.expiry) {
        localStorage.removeItem(`omufusion_${key}`);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.warn("Failed to get persistent cache:", error);
      return null;
    }
  }

  static getStats(): {
    size: number;
    keys: string[];
    persistent: { size: number; items: number };
  } {
    let persistentSize = 0;
    let persistentItems = 0;

    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith("omufusion_")) {
          persistentItems++;
          persistentSize += localStorage.getItem(key)?.length || 0;
        }
      });
    } catch (error) {
      console.warn("Failed to get persistent cache stats:", error);
    }

    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      persistent: {
        size: Math.round(persistentSize / 1024), // KB
        items: persistentItems,
      },
    };
  }

  // Cleanup expired items
  static cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expires) {
        this.cache.delete(key);
      }
    }
  }

  // Start periodic cleanup
  static startCleanup(interval: number = 10 * 60 * 1000): void {
    setInterval(() => {
      this.cleanup();
    }, interval);
  }
}

// Cookie Management Service
export class CookieService {
  // Set cookie with options
  static set(
    name: string,
    value: string,
    options: {
      days?: number;
      path?: string;
      domain?: string;
      secure?: boolean;
      sameSite?: "strict" | "lax" | "none";
    } = {}
  ): void {
    const {
      days = 30,
      path = "/",
      domain,
      secure = window.location.protocol === "https:",
      sameSite = "lax",
    } = options;

    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(
      value
    )}`;

    if (days) {
      const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
      cookieString += `; expires=${expires.toUTCString()}`;
    }

    cookieString += `; path=${path}`;

    if (domain) {
      cookieString += `; domain=${domain}`;
    }

    if (secure) {
      cookieString += "; secure";
    }

    cookieString += `; samesite=${sameSite}`;

    document.cookie = cookieString;
  }

  // Get cookie value
  static get(name: string): string | null {
    const nameEQ = encodeURIComponent(name) + "=";
    const cookies = document.cookie.split(";");

    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.indexOf(nameEQ) === 0) {
        return decodeURIComponent(cookie.substring(nameEQ.length));
      }
    }

    return null;
  }

  // Remove cookie
  static remove(name: string, path: string = "/", domain?: string): void {
    let cookieString = `${encodeURIComponent(
      name
    )}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;

    if (domain) {
      cookieString += `; domain=${domain}`;
    }

    document.cookie = cookieString;
  }

  // Check if cookies are enabled
  static isEnabled(): boolean {
    try {
      this.set("test", "test", { days: 1 });
      const enabled = this.get("test") === "test";
      this.remove("test");
      return enabled;
    } catch {
      return false;
    }
  }
}

// User Preferences with caching
export class UserPreferencesService {
  private static readonly PREFS_KEY = "user_preferences";

  // Image quality preference
  static getImageQuality(): "low" | "medium" | "high" {
    const prefs = CacheService.getPersistent(this.PREFS_KEY) || {};

    // Also check cookies as fallback
    const cookieQuality = CookieService.get("image_quality");
    if (cookieQuality) {
      return cookieQuality as "low" | "medium" | "high";
    }

    return prefs.imageQuality || "high";
  }

  static setImageQuality(quality: "low" | "medium" | "high"): void {
    const prefs = CacheService.getPersistent(this.PREFS_KEY) || {};
    prefs.imageQuality = quality;

    // Store in both localStorage and cookies
    CacheService.setPersistent(
      this.PREFS_KEY,
      prefs,
      CacheService.CACHE_EXPIRY.ASSETS
    );
    CookieService.set("image_quality", quality, { days: 365 });
  }

  // Data saver preference
  static getDataSaver(): boolean {
    const prefs = CacheService.getPersistent(this.PREFS_KEY) || {};
    const cookieDataSaver = CookieService.get("data_saver");

    if (cookieDataSaver) {
      return cookieDataSaver === "true";
    }

    return prefs.dataSaver || false;
  }

  static setDataSaver(enabled: boolean): void {
    const prefs = CacheService.getPersistent(this.PREFS_KEY) || {};
    prefs.dataSaver = enabled;

    CacheService.setPersistent(
      this.PREFS_KEY,
      prefs,
      CacheService.CACHE_EXPIRY.ASSETS
    );
    CookieService.set("data_saver", enabled.toString(), { days: 365 });
  }

  // Theme preference
  static getTheme(): "light" | "dark" | "auto" {
    const prefs = CacheService.getPersistent(this.PREFS_KEY) || {};
    const cookieTheme = CookieService.get("theme");

    if (cookieTheme) {
      return cookieTheme as "light" | "dark" | "auto";
    }

    return prefs.theme || "auto";
  }

  static setTheme(theme: "light" | "dark" | "auto"): void {
    const prefs = CacheService.getPersistent(this.PREFS_KEY) || {};
    prefs.theme = theme;

    CacheService.setPersistent(
      this.PREFS_KEY,
      prefs,
      CacheService.CACHE_EXPIRY.ASSETS
    );
    CookieService.set("theme", theme, { days: 365 });
  }

  // Get all preferences
  static getAllPreferences() {
    return {
      imageQuality: this.getImageQuality(),
      dataSaver: this.getDataSaver(),
      theme: this.getTheme(),
    };
  }
}

export default CacheService;
