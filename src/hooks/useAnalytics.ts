import { useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import monitoringService from "../utils/monitoringService";

interface UseAnalyticsOptions {
  trackPageViews?: boolean;
  trackClicks?: boolean;
  userId?: string;
}

interface UseAnalyticsReturn {
  trackEvent: (eventName: string, properties?: Record<string, any>) => void;
  trackPurchase: (transactionData: PurchaseData) => void;
  trackSearch: (query: string, results: number) => void;
  trackError: (error: Error, context?: Record<string, any>) => void;
  setUserId: (userId: string) => void;
}

interface PurchaseData {
  transactionId: string;
  value: number;
  currency: string;
  items: Array<{
    productId: string;
    name: string;
    category: string;
    price: number;
    quantity: number;
  }>;
}

export const useAnalytics = (
  options: UseAnalyticsOptions = {}
): UseAnalyticsReturn => {
  const location = useLocation();
  const { trackPageViews = true, trackClicks = true, userId } = options;
  const previousPath = useRef<string>("");

  // Track page views when location changes
  useEffect(() => {
    if (trackPageViews && location.pathname !== previousPath.current) {
      monitoringService.trackPageView(location.pathname);
      previousPath.current = location.pathname;
    }
  }, [location.pathname, trackPageViews]);

  // Set user ID if provided
  useEffect(() => {
    if (userId) {
      setUserId(userId);
    }
  }, [userId]);

  const trackEvent = useCallback(
    (eventName: string, properties: Record<string, any> = {}): void => {
      monitoringService.trackEvent(eventName, {
        ...properties,
        page: location.pathname,
        userId,
      });
    },
    [location.pathname, userId]
  );

  const trackPurchase = useCallback(
    (transactionData: PurchaseData): void => {
      trackEvent("purchase", {
        transaction_id: transactionData.transactionId,
        value: transactionData.value,
        currency: transactionData.currency,
        items: transactionData.items,
        item_count: transactionData.items.length,
        revenue: transactionData.value,
      });

      // Track each item separately for detailed analytics
      transactionData.items.forEach((item, index) => {
        trackEvent("purchase_item", {
          transaction_id: transactionData.transactionId,
          product_id: item.productId,
          product_name: item.name,
          product_category: item.category,
          price: item.price,
          quantity: item.quantity,
          position: index,
        });
      });
    },
    [trackEvent]
  );

  const trackSearch = useCallback(
    (query: string, results: number): void => {
      trackEvent("search", {
        query,
        results_count: results,
        has_results: results > 0,
      });
    },
    [trackEvent]
  );

  const trackError = useCallback(
    (error: Error, context: Record<string, any> = {}): void => {
      monitoringService.trackError(error, {
        ...context,
        page: location.pathname,
        userId,
      });
    },
    [location.pathname, userId]
  );

  const setUserId = useCallback(
    (newUserId: string): void => {
      // Store user ID in session for analytics
      const session = monitoringService.getSession();
      session.userId = newUserId;

      trackEvent("user_identify", { user_id: newUserId });
    },
    [trackEvent]
  );

  return {
    trackEvent,
    trackPurchase,
    trackSearch,
    trackError,
    setUserId,
  };
};

// Higher-order component for automatic analytics
import React from "react";

export const withAnalytics = <P extends object>(
  Component: React.ComponentType<P>,
  eventName: string,
  getProperties?: (props: P) => Record<string, any>
): React.ComponentType<P> => {
  const AnalyticsWrapper: React.FC<P> = (props: P) => {
    const { trackEvent } = useAnalytics();

    useEffect(() => {
      const properties = getProperties ? getProperties(props) : {};
      trackEvent(eventName, properties);
    }, [trackEvent, props]);

    return React.createElement(Component, props);
  };

  return AnalyticsWrapper;
};

export default useAnalytics;
