import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { HiEye, HiEyeOff, HiMail, HiLockClosed, HiUser } from "react-icons/hi";
import toast from "react-hot-toast";
import { Button } from "../components/ui/Button";
import { GlassCard } from "../components/ui/GlassCard";
import {
  FormFieldError,
  formatUserFriendlyError,
} from "../components/ui/FormFieldError";
import { useAuth } from "../context/EnhancedAppContext";
import { useDarkBackground } from "../utils/backgroundUtils";
import { EmailValidationService } from "../utils/emailValidation";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  agreeToTerms?: string;
  general?: string;
}

export const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const darkBg = useDarkBackground("SignUpPage", 0.85);

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // First name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password =
        "Password must contain at least one uppercase letter, one lowercase letter, and one number";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Terms validation
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear specific error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Check email availability when user leaves the email field
  const handleEmailBlur = async () => {
    const email = formData.email.trim();

    if (!email) {
      return; // Don't check empty email
    }

    setIsCheckingEmail(true);

    try {
      const errorMessage = await EmailValidationService.getEmailError(email);
      if (errorMessage) {
        setErrors((prev) => ({ ...prev, email: errorMessage }));
      } else {
        // Clear email error if valid
        setErrors((prev) => ({ ...prev, email: undefined }));
      }
    } catch (error) {
      console.error("Error checking email:", error);
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      // Use real Firebase authentication
      console.log("Starting registration process...");
      await signUp(
        formData.firstName.trim(),
        formData.lastName.trim(),
        formData.email,
        formData.password
      );

      console.log("Registration successful!");

      // Show success message
      toast.success("Account created successfully! Welcome to OMU Fusion! 🎉");

      // Small delay to ensure context state is updated before navigation
      setTimeout(() => {
        // Redirect to profile page after successful signup
        navigate("/profile", { replace: true });
      }, 100);
    } catch (error: any) {
      console.error("Registration error:", error);

      // Use our user-friendly error formatter
      const userFriendlyError = formatUserFriendlyError(
        error.code || error.message
      );

      // Handle specific Firebase error codes with field-specific errors
      if (error.code === "auth/email-already-in-use") {
        setErrors({
          email: "This email is already registered. Try signing in instead.",
        });
      } else if (error.code === "auth/invalid-email") {
        setErrors({ email: "Please enter a valid email address" });
      } else if (error.code === "auth/weak-password") {
        setErrors({
          password: "Password should be at least 6 characters long",
        });
      } else if (error.code === "auth/operation-not-allowed") {
        toast.error(
          "Email/password accounts are not enabled. Please contact support."
        );
      } else if (error.code === "auth/network-request-failed") {
        toast.error(
          "Network error. Please check your connection and try again."
        );
      } else {
        // For other errors, show user-friendly message
        const cleanError =
          userFriendlyError || "Registration failed. Please try again.";
        toast.error(cleanError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
      style={darkBg.style}>
      <div className="max-w-md w-full space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}>
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-white">
              Create Your Account
            </h2>
            <p className="mt-2 text-sm text-gray-300">
              Join us and start your shopping journey
            </p>
          </div>

          <GlassCard className="mt-8 p-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="sr-only">
                    First name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <HiUser className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      autoComplete="given-name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`block w-full pl-10 pr-3 py-3 border ${
                        errors.firstName
                          ? "border-red-500"
                          : "border-gray-300/20"
                      } rounded-lg bg-black/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-gold focus:border-transparent transition-all duration-200`}
                      placeholder="First name"
                    />
                  </div>
                  <FormFieldError error={errors.firstName} />
                </div>

                <div>
                  <label htmlFor="lastName" className="sr-only">
                    Last name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`block w-full px-3 py-3 border ${
                      errors.lastName ? "border-red-500" : "border-gray-300/20"
                    } rounded-lg bg-black/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-gold focus:border-transparent transition-all duration-200`}
                    placeholder="Last name"
                  />
                  <FormFieldError error={errors.lastName} />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <HiMail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    onBlur={handleEmailBlur}
                    disabled={isCheckingEmail}
                    className={`block w-full pl-10 pr-3 py-3 border ${
                      errors.email ? "border-red-500" : "border-gray-300/20"
                    } rounded-lg bg-black/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-gold focus:border-transparent transition-all duration-200 disabled:opacity-50`}
                    placeholder="Email address"
                  />
                  {isCheckingEmail && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg
                        className="animate-spin h-5 w-5 text-accent-gold"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  )}
                </div>
                <FormFieldError error={errors.email} />
              </div>

              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <HiLockClosed className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-10 py-3 border ${
                      errors.password ? "border-red-500" : "border-gray-300/20"
                    } rounded-lg bg-black/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-gold focus:border-transparent transition-all duration-200`}
                    placeholder="Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    {showPassword ? (
                      <HiEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                    ) : (
                      <HiEye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                    )}
                  </button>
                </div>
                <FormFieldError error={errors.password} />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="sr-only">
                  Confirm password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <HiLockClosed className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-10 py-3 border ${
                      errors.confirmPassword
                        ? "border-red-500"
                        : "border-gray-300/20"
                    } rounded-lg bg-black/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-gold focus:border-transparent transition-all duration-200`}
                    placeholder="Confirm password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    {showConfirmPassword ? (
                      <HiEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                    ) : (
                      <HiEye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                    )}
                  </button>
                </div>
                <FormFieldError error={errors.confirmPassword} />
              </div>

              <div className="flex items-start">
                <input
                  id="agreeToTerms"
                  name="agreeToTerms"
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-accent-gold focus:ring-accent-gold border-gray-300 rounded mt-1"
                />
                <label
                  htmlFor="agreeToTerms"
                  className="ml-3 block text-sm text-gray-300">
                  I agree to the{" "}
                  <Link
                    to="/terms"
                    className="text-accent-gold hover:text-accent-orange">
                    Terms and Conditions
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/privacy"
                    className="text-accent-gold hover:text-accent-orange">
                    Privacy Policy
                  </Link>
                </label>
              </div>
              <FormFieldError error={errors.agreeToTerms} showIcon={false} />

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-accent-gold hover:bg-accent-orange text-black font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-400">
                  Already have an account?{" "}
                  <Link
                    to="/signin"
                    className="text-accent-gold hover:text-accent-orange transition-colors duration-200">
                    Sign in here
                  </Link>
                </p>
              </div>
            </form>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};
