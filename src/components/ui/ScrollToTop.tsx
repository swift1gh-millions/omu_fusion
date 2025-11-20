import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top immediately when the route changes
    // Use multiple methods for better browser compatibility
    try {
      // Method 1: Modern scroll API
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant",
      });

      // Method 2: Fallback for older browsers
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      // Method 3: For mobile/touch devices
      if (window.scrollTo) {
        window.scrollTo(0, 0);
      }
    } catch (error) {
      // Fallback if all methods fail
      document.documentElement.scrollTop = 0;
    }
  }, [pathname]);

  return null;
};
