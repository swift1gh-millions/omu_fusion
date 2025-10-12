import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "../context/AdminContext";
import { FullscreenLoader } from "./ui/ModernLoader";

interface EnhancedAdminRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "moderator";
}

export const EnhancedAdminRoute: React.FC<EnhancedAdminRouteProps> = ({
  children,
  requiredRole = "admin",
}) => {
  const { admin, isAuthenticated, isLoading } = useAdminAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <FullscreenLoader
        message="Verifying Access"
        submessage="Checking admin permissions..."
      />
    );
  }

  // Redirect to admin login if not authenticated
  if (!isAuthenticated || !admin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Check if admin account is active
  if (admin.accountStatus !== "active") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Account Access Restricted
          </h2>
          <p className="text-gray-600 mb-4">
            Your account status is:{" "}
            <span className="font-semibold">{admin.accountStatus}</span>
          </p>
          <p className="text-gray-600">
            Please contact support for assistance.
          </p>
        </div>
      </div>
    );
  }

  // Check role-based access
  let hasRoleAccess = false;
  if (requiredRole === "admin") {
    hasRoleAccess = admin.role === "admin";
  } else if (requiredRole === "moderator") {
    hasRoleAccess = admin.role === "moderator" || admin.role === "admin";
  }

  if (!hasRoleAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-4">
            You don't have the required permissions to access this area.
          </p>
          <p className="text-gray-600">
            Required role: <span className="font-semibold">{requiredRole}</span>
          </p>
          <p className="text-gray-600">
            Your role: <span className="font-semibold">{admin.role}</span>
          </p>
        </div>
      </div>
    );
  }

  // Render children if all checks pass
  return <>{children}</>;
};

export default EnhancedAdminRoute;
