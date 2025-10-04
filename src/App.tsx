import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
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

function AppContent() {
  // Initialize scroll animations
  useScrollAnimation();
  const location = useLocation();

  // Determine which footer to show based on current route
  const showFullFooter = location.pathname === "/";

  return (
    <div className="min-h-screen bg-white">
      <ScrollToTop />
      <Header />
      <main className="relative">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
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
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      {showFullFooter ? <Footer /> : <MinimalFooter />}
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <Router>
        <SearchProvider>
          <AppContent />
        </SearchProvider>
      </Router>
    </AppProvider>
  );
}

export default App;
