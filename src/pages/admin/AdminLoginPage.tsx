import React, { useState } from "react";
import { useAuth } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { Shield, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

export const AdminLoginPage: React.FC = () => {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Use Firebase Auth directly for admin login
      const { signInWithEmailAndPassword } = await import("firebase/auth");
      const { auth } = await import("../../utils/firebase");

      const userCredential = await signInWithEmailAndPassword(
        auth,
        "admin@omufusion.com",
        password
      );

      const firebaseUser = userCredential.user;

      // Create admin user object for context
      const adminUser = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        firstName: "Admin",
        lastName: "User",
        isAdmin: true,
        emailVerified: firebaseUser.emailVerified,
        createdAt: new Date().toISOString(),
      };

      // Set user in context
      login(adminUser);

      toast.success("Welcome, Admin!");
      navigate("/admin/dashboard");
    } catch (error: any) {
      console.error("Login failed:", error);
      const errorMessage = error.message || "Invalid password";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat relative flex items-center justify-center px-4 sm:px-6 lg:px-8"
      style={{
        backgroundImage: `url('/src/assets/backgrounds/dark7.avif')`,
      }}>
      {/* Dark overlay for better readability */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-white/10 backdrop-blur-lg rounded-full flex items-center justify-center border border-white/20 shadow-2xl mb-6">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Admin Login
          </h2>
          <p className="text-gray-300 text-sm sm:text-base">
            Access the OMU Fusion admin dashboard
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl p-6 sm:p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-white mb-2">
                Admin Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 pr-12"
                  placeholder="Enter admin password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200">
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/30 backdrop-blur-sm rounded-lg p-4">
                <div className="text-red-300 text-sm font-medium">{error}</div>
              </div>
            )}

            <div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center py-3 px-4 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Signing in...</span>
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white/10 backdrop-blur-sm text-gray-300 rounded-full border border-white/10">
                  Need help? Contact system administrator
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
