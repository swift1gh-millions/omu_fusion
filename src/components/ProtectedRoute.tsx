import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AppContext";
import { LoadingSpinner } from "./ui/LoadingSpinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
}) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // If authentication is required and user is not authenticated
  if (requireAuth && !isAuthenticated) {
    // Redirect to sign in page with return URL
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // If user is authenticated and trying to access auth pages, redirect to profile
  if (
    !requireAuth &&
    isAuthenticated &&
    ["/signin", "/signup"].includes(location.pathname)
  ) {
    return <Navigate to="/profile" replace />;
  }

  return <>{children}</>;
};
