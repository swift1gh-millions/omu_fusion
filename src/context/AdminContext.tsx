import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import AdminAuthService from "../utils/adminAuthService";
import { AuthUser } from "../utils/enhancedAuthService";
import toast from "react-hot-toast";

interface AdminContextType {
  admin: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshAdminProfile: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdminAuth = (): AdminContextType => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within AdminProvider");
  }
  return context;
};

interface AdminProviderProps {
  children: ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const [admin, setAdmin] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const initializeAuth = () => {
      // Check if this is an admin session
      const isAdminSession = AdminAuthService.isAdminSession();

      if (!isAdminSession) {
        setIsLoading(false);
        setAdmin(null);
        return;
      }

      // Listen for admin auth state changes
      unsubscribe = AdminAuthService.onAuthStateChanged((user) => {
        console.log(
          "Admin auth state changed:",
          user ? "logged in" : "logged out"
        );
        setAdmin(user);
        setIsLoading(false);
      });
    };

    // Initialize immediately
    initializeAuth();

    // Also listen for storage changes to detect admin login from other components
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "isAdminSession") {
        console.log("Admin session storage changed, reinitializing...");
        initializeAuth();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      if (unsubscribe) unsubscribe();
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const signOut = async () => {
    try {
      await AdminAuthService.signOut();
      setAdmin(null);
      toast.success("Signed out successfully");
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out");
    }
  };

  const refreshAdminProfile = async () => {
    try {
      // Re-initialize auth to fetch fresh profile data
      const initializeAuth = async () => {
        let unsubscribe: (() => void) | null = null;

        // Listen for admin auth state changes
        unsubscribe = AdminAuthService.onAuthStateChanged((user) => {
          console.log("Admin profile refreshed:", user ? "updated" : "cleared");
          setAdmin(user);
          // Unsubscribe immediately after getting the fresh data
          if (unsubscribe) unsubscribe();
        });
      };

      await initializeAuth();
    } catch (error) {
      console.error("Error refreshing admin profile:", error);
    }
  };

  const value: AdminContextType = {
    admin,
    isAuthenticated: !!admin,
    isLoading,
    signOut,
    refreshAdminProfile,
  };

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
};
