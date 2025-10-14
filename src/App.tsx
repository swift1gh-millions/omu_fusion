import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { MinimalFooter } from "./components/layout/MinimalFooter";
import { AppProvider } from "./context/EnhancedAppContext";
import { AdminProvider } from "./context/AdminContext";
import { SearchProvider } from "./context/SearchContext";
import { NotificationProvider } from "./components/ui/Notification";
import { ScrollToTop } from "./components/ui/ScrollToTop";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { EnhancedAdminRoute } from "./components/EnhancedAdminRoute";
import { useScrollAnimation } from "./components/ui/ScrollAnimation";
import { ErrorBoundary } from "react-error-boundary";
import monitoringService from "./utils/monitoringService";
import { useAnalytics } from "./hooks/useAnalytics";
import {
  PerformanceOptimizer,
  registerServiceWorker,
  unregisterServiceWorkers,
  addPreconnects,
} from "./utils/performanceOptimizer";
import {
  CriticalResourcePreloader,
  CriticalCSS,
} from "./components/ui/CriticalResourcePreloader";
import { CookieConsentBanner } from "./components/ui/CookieConsent";

// Pages
import { HomePage } from "./pages/HomePage";
import { ShopPage } from "./pages/ShopPage";
import { AboutPage } from "./pages/AboutPage";
import { ContactPage } from "./pages/ContactPage";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { SignInPage } from "./pages/SignInPage";
import { SignUpPage } from "./pages/SignUpPage";
import { ProfilePage } from "./pages/ProfilePage";
import { WishlistPage } from "./pages/WishlistPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { PrivacyPage } from "./pages/PrivacyPage";
import { TermsPage } from "./pages/TermsPage";
import { CookiesPage } from "./pages/CookiesPage";

// Admin Pages
import { AdminLoginPage } from "./pages/admin/AdminLoginPage";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { ProductUploadPage } from "./pages/admin/ProductUploadPage";
import { ProductManagementPage } from "./pages/admin/ProductManagementPage";
import { CategoryManagementPage } from "./pages/admin/CategoryManagementPage";
import { OrderManagementPage } from "./pages/admin/OrderManagementPage";
import { UserManagementPage } from "./pages/admin/UserManagementPage";
import { AnalyticsPage } from "./pages/admin/AnalyticsPage";
import { AdminSettingsPage } from "./pages/admin/AdminSettingsPage";
import { DiscountManagementPage } from "./pages/admin/DiscountManagementPage";

// Error Fallback Component
function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  // Track error in monitoring service
  React.useEffect(() => {
    monitoringService.trackError(error, {
      component: "ErrorBoundary",
      recovery: "fallback_displayed",
    });
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Something went wrong
        </h2>
        <p className="text-gray-600 mb-4">{error.message}</p>
        <button
          onClick={() => {
            monitoringService.trackEvent("error_recovery_attempt", {
              error_message: error.message,
            });
            resetErrorBoundary();
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Try again
        </button>
      </div>
    </div>
  );
}

function AppContent() {
  // Initialize scroll animations
  useScrollAnimation();
  const location = useLocation();

  // Initialize analytics
  const { trackError } = useAnalytics({ trackPageViews: true });

  // Initialize performance optimizations
  useEffect(() => {
    // Add preconnects to external domains
    addPreconnects();

    // First, aggressively unregister any previous SW and clear caches
    // to avoid stale HTML/assets on custom domain and mobile white screen
    unregisterServiceWorkers().finally(() => {
      // Optionally register SW if explicitly enabled
      registerServiceWorker();
    });
  }, []);

  // Determine which footer to show based on current route
  const showFullFooter = location.pathname === "/";
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div className="min-h-screen bg-white flex flex-col prevent-overscroll">
      <CriticalCSS />
      <CriticalResourcePreloader />
      <PerformanceOptimizer />
      <ScrollToTop />
      {!isAdminRoute && <Header />}
      <main className="relative flex-1 prevent-overscroll">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <CartPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/cookies" element={<CookiesPage />} />
          <Route
            path="/signin"
            element={
              <ProtectedRoute requireAuth={false}>
                <SignInPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <ProtectedRoute requireAuth={false}>
                <SignUpPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wishlist"
            element={
              <ProtectedRoute>
                <WishlistPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes - Wrapped with AdminProvider */}
          <Route
            path="/admin/login"
            element={
              <AdminProvider>
                <AdminLoginPage />
              </AdminProvider>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <AdminProvider>
                <EnhancedAdminRoute>
                  <AdminDashboardPage />
                </EnhancedAdminRoute>
              </AdminProvider>
            }
          />
          <Route
            path="/admin/products"
            element={
              <AdminProvider>
                <EnhancedAdminRoute>
                  <ProductManagementPage />
                </EnhancedAdminRoute>
              </AdminProvider>
            }
          />
          <Route
            path="/admin/products/add"
            element={
              <AdminProvider>
                <EnhancedAdminRoute>
                  <ProductUploadPage />
                </EnhancedAdminRoute>
              </AdminProvider>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <AdminProvider>
                <EnhancedAdminRoute>
                  <CategoryManagementPage />
                </EnhancedAdminRoute>
              </AdminProvider>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <AdminProvider>
                <EnhancedAdminRoute>
                  <OrderManagementPage />
                </EnhancedAdminRoute>
              </AdminProvider>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminProvider>
                <EnhancedAdminRoute>
                  <UserManagementPage />
                </EnhancedAdminRoute>
              </AdminProvider>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <AdminProvider>
                <EnhancedAdminRoute>
                  <AnalyticsPage />
                </EnhancedAdminRoute>
              </AdminProvider>
            }
          />
          <Route
            path="/admin/discounts"
            element={
              <AdminProvider>
                <EnhancedAdminRoute>
                  <DiscountManagementPage />
                </EnhancedAdminRoute>
              </AdminProvider>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <AdminProvider>
                <EnhancedAdminRoute>
                  <AdminSettingsPage />
                </EnhancedAdminRoute>
              </AdminProvider>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      {!isAdminRoute && (showFullFooter ? <Footer /> : <MinimalFooter />)}
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <NotificationProvider>
        <AppProvider>
          <Router>
            <SearchProvider>
              <AppContent />
              <Toaster
                position="top-center"
                reverseOrder={false}
                gutter={8}
                containerClassName=""
                containerStyle={{}}
                toastOptions={{
                  // Define default options
                  className: "",
                  duration: 4000,
                  style: {
                    background: "rgba(0, 0, 0, 0.8)",
                    color: "#fff",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "12px",
                    padding: "16px",
                  },
                  // Default options for specific types
                  success: {
                    duration: 3000,
                    style: {
                      background: "rgba(34, 197, 94, 0.9)",
                    },
                  },
                  error: {
                    duration: 5000,
                    style: {
                      background: "rgba(239, 68, 68, 0.9)",
                    },
                  },
                }}
              />

              {/* Cookie Consent Banner */}
              <CookieConsentBanner />
            </SearchProvider>
          </Router>
        </AppProvider>
      </NotificationProvider>
    </ErrorBoundary>
  );
}

export default App;
