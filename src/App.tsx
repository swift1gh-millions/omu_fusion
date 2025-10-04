import React from "react";
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
import { AppProvider } from "./context/AppContext";
import { SearchProvider } from "./context/SearchContext";
import { ScrollToTop } from "./components/ui/ScrollToTop";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useScrollAnimation } from "./components/ui/ScrollAnimation";

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
import { NotFoundPage } from "./pages/NotFoundPage";
import { PrivacyPage } from "./pages/PrivacyPage";
import { TermsPage } from "./pages/TermsPage";
import { CookiesPage } from "./pages/CookiesPage";

// Admin Pages
import { AdminRoute } from "./components/AdminRoute";
import { AdminLoginPage } from "./pages/admin/AdminLoginPage";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { ProductUploadPage } from "./pages/admin/ProductUploadPage";
import { ProductManagementPage } from "./pages/admin/ProductManagementPage";
import { CategoryManagementPage } from "./pages/admin/CategoryManagementPage";
import { OrderManagementPage } from "./pages/admin/OrderManagementPage";
import { UserManagementPage } from "./pages/admin/UserManagementPage";
import { AnalyticsPage } from "./pages/admin/AnalyticsPage";

function AppContent() {
  // Initialize scroll animations
  useScrollAnimation();
  const location = useLocation();

  // Determine which footer to show based on current route
  const showFullFooter = location.pathname === "/";
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div className="min-h-screen bg-white">
      <ScrollToTop />
      {!isAdminRoute && <Header />}
      <main className="relative">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/cart" element={<CartPage />} />
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

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminDashboardPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <AdminRoute>
                <ProductManagementPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/products/add"
            element={
              <AdminRoute>
                <ProductUploadPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <AdminRoute>
                <CategoryManagementPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <AdminRoute>
                <OrderManagementPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <UserManagementPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <AdminRoute>
                <AnalyticsPage />
              </AdminRoute>
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
        </SearchProvider>
      </Router>
    </AppProvider>
  );
}

export default App;
