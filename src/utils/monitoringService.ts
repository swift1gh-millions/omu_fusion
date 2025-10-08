// Performance Monitoring and Analytics Service
import { getCLS, getFID, getFCP, getLCP, getTTFB } from "web-vitals";

export interface PerformanceMetric {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  timestamp: number;
  id: string;
  url: string;
}

export interface UserSession {
  sessionId: string;
  userId?: string;
  startTime: number;
  lastActivity: number;
  pageViews: number;
  actions: UserAction[];
  device: DeviceInfo;
  referrer?: string;
}

export interface UserAction {
  type:
    | "click"
    | "scroll"
    | "form_submit"
    | "page_view"
    | "purchase"
    | "search"
    | "error";
  element?: string;
  value?: any;
  timestamp: number;
  page: string;
}

export interface DeviceInfo {
  userAgent: string;
  screen: { width: number; height: number };
  viewport: { width: number; height: number };
  connection?: any; // NetworkInformation not available in all browsers
  memory?: number;
}

class MonitoringService {
  private sessionId: string;
  private session: UserSession;
  private metrics: PerformanceMetric[] = [];
  private isInitialized = false;
  private isDevelopment = process.env.NODE_ENV === "development";

  constructor() {
    this.sessionId = this.generateSessionId();
    this.session = this.createSession();
    this.initialize();
  }

  /**
   * Initialize monitoring service
   */
  initialize(): void {
    if (this.isInitialized) return;

    // Collect Core Web Vitals
    this.collectWebVitals();

    // Set up user interaction tracking
    this.setupInteractionTracking();

    // Set up error tracking
    this.setupErrorTracking();

    // Set up page visibility tracking
    this.setupVisibilityTracking();

    // Set up performance observer
    this.setupPerformanceObserver();

    this.isInitialized = true;
  }

  /**
   * Track user action
   */
  trackAction(action: Omit<UserAction, "timestamp" | "page">): void {
    const actionWithTimestamp: UserAction = {
      ...action,
      timestamp: Date.now(),
      page: window.location.pathname,
    };

    this.session.actions.push(actionWithTimestamp);
    this.session.lastActivity = Date.now();

    // Send to analytics endpoint
    this.sendAnalytics("user_action", actionWithTimestamp);
  }

  /**
   * Track page view
   */
  trackPageView(page: string): void {
    this.session.pageViews++;
    this.trackAction({
      type: "page_view",
      value: { page, referrer: document.referrer },
    });
  }

  /**
   * Track custom event
   */
  trackEvent(eventName: string, properties: Record<string, any>): void {
    const event = {
      name: eventName,
      properties,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      url: window.location.href,
    };

    this.sendAnalytics("custom_event", event);
  }

  /**
   * Track error
   */
  trackError(error: Error, context?: Record<string, any>): void {
    const errorData = {
      message: error.message,
      stack: error.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
      context,
    };

    this.trackAction({
      type: "error",
      value: errorData,
    });
  }

  /**
   * Get current session data
   */
  getSession(): UserSession {
    return { ...this.session };
  }

  /**
   * Get performance metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Collect Core Web Vitals
   */
  private collectWebVitals(): void {
    getCLS(this.onPerfEntry.bind(this));
    getFID(this.onPerfEntry.bind(this));
    getFCP(this.onPerfEntry.bind(this));
    getLCP(this.onPerfEntry.bind(this));
    getTTFB(this.onPerfEntry.bind(this));
  }

  /**
   * Handle performance entry
   */
  private onPerfEntry(metric: any): void {
    const performanceMetric: PerformanceMetric = {
      name: metric.name,
      value: metric.value,
      rating: metric.rating || "good",
      timestamp: Date.now(),
      id: metric.id,
      url: window.location.href,
    };

    this.metrics.push(performanceMetric);
    this.sendAnalytics("web_vital", performanceMetric);
  }

  /**
   * Set up interaction tracking
   */
  private setupInteractionTracking(): void {
    // Click tracking
    document.addEventListener("click", (event) => {
      const target = event.target as HTMLElement;
      const element = target.tagName.toLowerCase();

      if (element === "button" || element === "a" || target.onclick) {
        this.trackAction({
          type: "click",
          element: `${element}${target.id ? "#" + target.id : ""}${
            target.className ? "." + target.className.split(" ")[0] : ""
          }`,
          value:
            target.textContent?.trim() || target.getAttribute("aria-label"),
        });
      }
    });

    // Form submission tracking
    document.addEventListener("submit", (event) => {
      const form = event.target as HTMLFormElement;
      this.trackAction({
        type: "form_submit",
        element: form.id || "form",
        value: { action: form.action, method: form.method },
      });
    });

    // Scroll tracking (throttled)
    let scrollTimeout: NodeJS.Timeout;
    document.addEventListener("scroll", () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const scrollPercent = Math.round(
          (window.scrollY /
            (document.documentElement.scrollHeight - window.innerHeight)) *
            100
        );

        if (scrollPercent % 25 === 0 && scrollPercent > 0) {
          this.trackAction({
            type: "scroll",
            value: { scrollPercent },
          });
        }
      }, 100);
    });
  }

  /**
   * Set up error tracking
   */
  private setupErrorTracking(): void {
    // JavaScript errors
    window.addEventListener("error", (event) => {
      this.trackError(new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    // Promise rejections
    window.addEventListener("unhandledrejection", (event) => {
      this.trackError(new Error(event.reason), {
        type: "unhandled_promise_rejection",
      });
    });
  }

  /**
   * Set up visibility tracking
   */
  private setupVisibilityTracking(): void {
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.sendSession();
      } else {
        this.session.lastActivity = Date.now();
      }
    });

    // Send session data before page unload
    window.addEventListener("beforeunload", () => {
      this.sendSession();
    });
  }

  /**
   * Set up performance observer
   */
  private setupPerformanceObserver(): void {
    if ("PerformanceObserver" in window) {
      // Observe navigation timing
      const navObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries() as PerformanceNavigationTiming[];
        entries.forEach((entry) => {
          const metrics = this.extractNavigationMetrics(entry);
          metrics.forEach((metric) => this.onPerfEntry(metric));
        });
      });

      try {
        navObserver.observe({ type: "navigation", buffered: true });
      } catch (e) {
        // Fallback for older browsers
        console.warn("Navigation timing not supported");
      }

      // Observe resource timing
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries() as PerformanceResourceTiming[];
        const slowResources = entries.filter((entry) => entry.duration > 1000);

        slowResources.forEach((entry) => {
          this.trackEvent("slow_resource", {
            name: entry.name,
            duration: entry.duration,
            size: entry.transferSize,
          });
        });
      });

      try {
        resourceObserver.observe({ type: "resource", buffered: true });
      } catch (e) {
        console.warn("Resource timing not supported");
      }
    }
  }

  /**
   * Extract navigation metrics
   */
  private extractNavigationMetrics(entry: PerformanceNavigationTiming): any[] {
    return [
      {
        name: "DNS_Time",
        value: entry.domainLookupEnd - entry.domainLookupStart,
        rating: "good",
        id: "dns",
      },
      {
        name: "TCP_Time",
        value: entry.connectEnd - entry.connectStart,
        rating: "good",
        id: "tcp",
      },
      {
        name: "Request_Time",
        value: entry.responseStart - entry.requestStart,
        rating: "good",
        id: "request",
      },
      {
        name: "Response_Time",
        value: entry.responseEnd - entry.responseStart,
        rating: "good",
        id: "response",
      },
      {
        name: "DOM_Interactive",
        value: entry.domInteractive - entry.fetchStart,
        rating: "good",
        id: "dom_interactive",
      },
      {
        name: "DOM_Complete",
        value: entry.domComplete - entry.fetchStart,
        rating: "good",
        id: "dom_complete",
      },
    ];
  }

  /**
   * Create new session
   */
  private createSession(): UserSession {
    return {
      sessionId: this.sessionId,
      startTime: Date.now(),
      lastActivity: Date.now(),
      pageViews: 0,
      actions: [],
      device: this.getDeviceInfo(),
      referrer: document.referrer,
    };
  }

  /**
   * Get device information
   */
  private getDeviceInfo(): DeviceInfo {
    return {
      userAgent: navigator.userAgent,
      screen: {
        width: screen.width,
        height: screen.height,
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      connection: (navigator as any).connection,
      memory: (performance as any).memory?.usedJSHeapSize,
    };
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Send analytics data
   */
  private async sendAnalytics(type: string, data: any): Promise<void> {
    try {
      // In development, just log to console and store locally
      if (this.isDevelopment) {
        console.log(`[Analytics] ${type}:`, data);
        this.storeOfflineData({ type, data });
        return;
      }

      const payload = {
        type,
        data,
        sessionId: this.sessionId,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      };

      // Use sendBeacon for better reliability
      if ("sendBeacon" in navigator) {
        navigator.sendBeacon("/api/analytics", JSON.stringify(payload));
      } else {
        // Fallback to fetch
        fetch("/api/analytics", {
          method: "POST",
          body: JSON.stringify(payload),
          headers: {
            "Content-Type": "application/json",
          },
          keepalive: true,
        }).catch(() => {
          // Store in localStorage as backup
          this.storeOfflineData(payload);
        });
      }
    } catch (error) {
      console.warn("Failed to send analytics:", error);
      this.storeOfflineData({ type, data });
    }
  }

  /**
   * Send session data
   */
  private async sendSession(): Promise<void> {
    await this.sendAnalytics("session", this.session);
  }

  /**
   * Store data offline for later retry
   */
  private storeOfflineData(data: any): void {
    try {
      const stored = localStorage.getItem("pending_analytics") || "[]";
      const pending = JSON.parse(stored);
      pending.push(data);

      // Keep only last 50 entries
      if (pending.length > 50) {
        pending.splice(0, pending.length - 50);
      }

      localStorage.setItem("pending_analytics", JSON.stringify(pending));
    } catch (error) {
      console.warn("Failed to store offline analytics data:", error);
    }
  }

  /**
   * Send stored offline data
   */
  async sendOfflineData(): Promise<void> {
    try {
      const stored = localStorage.getItem("pending_analytics");
      if (stored) {
        const pending = JSON.parse(stored);

        for (const item of pending) {
          await this.sendAnalytics(item.type, item.data);
        }

        localStorage.removeItem("pending_analytics");
      }
    } catch (error) {
      console.warn("Failed to send offline analytics data:", error);
    }
  }
}

// Create global instance
const monitoringService = new MonitoringService();

// Export both class and instance
export { MonitoringService };
export default monitoringService;
