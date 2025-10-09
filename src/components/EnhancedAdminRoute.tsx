import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/EnhancedAppContext";
import { FullscreenLoader } from "./ui/ModernLoader";

interface EnhancedAdminRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "moderator";
  requiredPermission?: { resource: string; action: string };
}

export const EnhancedAdminRoute: React.FC<EnhancedAdminRouteProps> = ({
  children,
  requiredRole = "admin",
  requiredPermission,
}) => {
  const {
    user,
    isAuthenticated,
    isLoading,
    isAdmin,
    isModerator,
    hasPermission,
  } = useAuth();
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
  if (!isAuthenticated || !user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Check if user account is active
  if (user.accountStatus !== "active") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Account Access Restricted
          </h2>
          <p className="text-gray-600 mb-4">
            Your account status is:{" "}
            <span className="font-semibold">{user.accountStatus}</span>
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
    hasRoleAccess = isAdmin();
  } else if (requiredRole === "moderator") {
    hasRoleAccess = isModerator() || isAdmin();
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
            Your role: <span className="font-semibold">{user.role}</span>
          </p>
        </div>
      </div>
    );
  }

  // Check specific permission if required
  if (requiredPermission) {
    const hasSpecificPermission = hasPermission(
      requiredPermission.resource,
      requiredPermission.action
    );

    if (!hasSpecificPermission) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50">
          <div className="text-center p-8 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Permission Denied
            </h2>
            <p className="text-gray-600 mb-4">
              You don't have permission to perform this action.
            </p>
            <p className="text-gray-600">
              Required:{" "}
              <span className="font-semibold">
                {requiredPermission.action} on {requiredPermission.resource}
              </span>
            </p>
          </div>
        </div>
      );
    }
  }

  // Render children if all checks pass
  return <>{children}</>;
};

// Higher-order component for protecting routes
export const withAdminAuth = <P extends object>(
  Component: React.ComponentType<P>,
  requiredRole?: "admin" | "moderator",
  requiredPermission?: { resource: string; action: string }
) => {
  return (props: P) => (
    <EnhancedAdminRoute
      requiredRole={requiredRole}
      requiredPermission={requiredPermission}>
      <Component {...props} />
    </EnhancedAdminRoute>
  );
};

export default EnhancedAdminRoute;
