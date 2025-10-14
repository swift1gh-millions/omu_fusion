import { lazy } from "react";

// Lazy load pages for better performance
// Note: These use named exports, so we destructure them
export const LazyHomePage = lazy(() =>
  import("../../pages/HomePage").then((module) => ({
    default: module.HomePage,
  }))
);
export const LazyShopPage = lazy(() =>
  import("../../pages/ShopPage").then((module) => ({
    default: module.ShopPage,
  }))
);
export const LazyAboutPage = lazy(() =>
  import("../../pages/AboutPage").then((module) => ({
    default: module.AboutPage,
  }))
);
export const LazyContactPage = lazy(() =>
  import("../../pages/ContactPage").then((module) => ({
    default: module.ContactPage,
  }))
);
export const LazyCartPage = lazy(() =>
  import("../../pages/CartPage").then((module) => ({
    default: module.CartPage,
  }))
);
export const LazyCheckoutPage = lazy(() =>
  import("../../pages/CheckoutPage").then((module) => ({
    default: module.CheckoutPage,
  }))
);
export const LazyProfilePage = lazy(() =>
  import("../../pages/ProfilePage").then((module) => ({
    default: module.ProfilePage,
  }))
);
export const LazySignInPage = lazy(() =>
  import("../../pages/SignInPage").then((module) => ({
    default: module.SignInPage,
  }))
);
export const LazySignUpPage = lazy(() =>
  import("../../pages/SignUpPage").then((module) => ({
    default: module.SignUpPage,
  }))
);

// Admin pages
export const LazyAdminDashboardPage = lazy(() =>
  import("../../pages/admin/AdminDashboardPage").then((module) => ({
    default: module.AdminDashboardPage,
  }))
);
export const LazyProductUploadPage = lazy(() =>
  import("../../pages/admin/ProductUploadPage").then((module) => ({
    default: module.ProductUploadPage,
  }))
);
export const LazyProductManagementPage = lazy(() =>
  import("../../pages/admin/ProductManagementPage").then((module) => ({
    default: module.ProductManagementPage,
  }))
);
export const LazyOrderManagementPage = lazy(() =>
  import("../../pages/admin/OrderManagementPage").then((module) => ({
    default: module.OrderManagementPage,
  }))
);
export const LazyUserManagementPage = lazy(() =>
  import("../../pages/admin/UserManagementPage").then((module) => ({
    default: module.UserManagementPage,
  }))
);
export const LazyAnalyticsPage = lazy(() =>
  import("../../pages/admin/AnalyticsPage").then((module) => ({
    default: module.AnalyticsPage,
  }))
);
export const LazyDiscountManagementPage = lazy(() =>
  import("../../pages/admin/DiscountManagementPage").then((module) => ({
    default: module.DiscountManagementPage,
  }))
);
export const LazyAdminLoginPage = lazy(() =>
  import("../../pages/admin/AdminLoginPage").then((module) => ({
    default: module.AdminLoginPage,
  }))
);
export const LazyCategoryManagementPage = lazy(() =>
  import("../../pages/admin/CategoryManagementPage").then((module) => ({
    default: module.CategoryManagementPage,
  }))
);
export const LazyAdminSettingsPage = lazy(() =>
  import("../../pages/admin/AdminSettingsPage").then((module) => ({
    default: module.AdminSettingsPage,
  }))
);

// Legal pages
export const LazyPrivacyPage = lazy(() =>
  import("../../pages/PrivacyPage").then((module) => ({
    default: module.PrivacyPage,
  }))
);
export const LazyTermsPage = lazy(() =>
  import("../../pages/TermsPage").then((module) => ({
    default: module.TermsPage,
  }))
);
export const LazyCookiesPage = lazy(() =>
  import("../../pages/CookiesPage").then((module) => ({
    default: module.CookiesPage,
  }))
);

// 404 page
export const LazyNotFoundPage = lazy(() =>
  import("../../pages/NotFoundPage").then((module) => ({
    default: module.NotFoundPage,
  }))
);
