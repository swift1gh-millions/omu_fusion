import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AppContext";
import { LoadingSpinner } from "./ui/LoadingSpinner";

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin()) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};
