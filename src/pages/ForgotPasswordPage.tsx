import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { HiMail, HiArrowLeft, HiCheckCircle } from "react-icons/hi";
import toast from "react-hot-toast";
import { Button } from "../components/ui/Button";
import { GlassCard } from "../components/ui/GlassCard";
import {
  FormFieldError,
  formatUserFriendlyError,
} from "../components/ui/FormFieldError";
import { useAuth } from "../context/EnhancedAppContext";
import { useDarkBackground } from "../utils/backgroundUtils";

interface FormData {
  email: string;
}

interface FormErrors {
  email?: string;
  general?: string;
}

export const ForgotPasswordPage: React.FC = () => {
  const darkBg = useDarkBackground("ForgotPasswordPage", 0.85);
  const { sendPasswordResetEmail } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    email: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear specific error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      await sendPasswordResetEmail(formData.email);

      setEmailSent(true);
      toast.success("Password reset email sent successfully!");
    } catch (error: any) {
      console.error("Password reset error:", error);

      // Use our user-friendly error formatter
      const userFriendlyError = formatUserFriendlyError(
        error.code || error.message
      );

      // Set field-specific errors where appropriate
      if (error.code === "auth/user-not-found") {
        setErrors({ email: "No account found with this email address" });
      } else if (error.code === "auth/invalid-email") {
        setErrors({ email: "Please enter a valid email address" });
      } else if (error.code === "auth/too-many-requests") {
        setErrors({ general: "Too many requests. Please try again later" });
        toast.error("Too many reset attempts. Please try again later");
      } else {
        // For other errors, show as general error
        const cleanError =
          userFriendlyError || "Failed to send reset email. Please try again";
        setErrors({ general: cleanError });
        toast.error(cleanError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(formData.email);
      toast.success("Password reset email sent again!");
    } catch (error: any) {
      console.error("Resend error:", error);
      toast.error("Failed to resend email. Please try again");
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
          {!emailSent ? (
            <>
              <div className="text-center">
                <h2 className="mt-6 text-3xl font-extrabold text-white">
                  Forgot Password?
                </h2>
                <p className="mt-2 text-sm text-gray-300">
                  Enter your email address and we'll send you a link to reset
                  your password.
                </p>
              </div>

              <GlassCard className="mt-8 p-8">
                <form className="space-y-6" onSubmit={handleSubmit}>
                  {errors.general && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                      <p className="text-sm text-red-400 text-center">
                        {errors.general}
                      </p>
                    </div>
                  )}

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
                        className={`block w-full pl-10 pr-3 py-3 border ${
                          errors.email ? "border-red-500" : "border-gray-300/20"
                        } rounded-lg bg-black/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-gold focus:border-transparent transition-all duration-200`}
                        placeholder="Email address"
                      />
                    </div>
                    <FormFieldError error={errors.email} />
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-accent-gold hover:bg-accent-orange text-black font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                    {isLoading ? "Sending..." : "Send Reset Email"}
                  </Button>

                  <div className="text-center">
                    <Link
                      to="/signin"
                      className="inline-flex items-center text-sm text-accent-gold hover:text-accent-orange transition-colors duration-200">
                      <HiArrowLeft className="h-4 w-4 mr-1" />
                      Back to Sign In
                    </Link>
                  </div>
                </form>
              </GlassCard>
            </>
          ) : (
            <>
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}>
                  <HiCheckCircle className="mx-auto h-16 w-16 text-green-500" />
                </motion.div>
                <h2 className="mt-6 text-3xl font-extrabold text-white">
                  Email Sent!
                </h2>
                <p className="mt-2 text-sm text-gray-300">
                  We've sent a password reset link to{" "}
                  <span className="text-accent-gold font-medium">
                    {formData.email}
                  </span>
                </p>
              </div>

              <GlassCard className="mt-8 p-8">
                <div className="space-y-6">
                  <div className="text-center space-y-4">
                    <p className="text-sm text-gray-300">
                      Check your email inbox and click the link to reset your
                      password. The link will expire in 1 hour for security
                      reasons.
                    </p>

                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                      <p className="text-xs text-blue-300">
                        <strong>Can't find the email?</strong> Check your spam
                        folder or ensure the email address is correct.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-3">
                    <Button
                      type="button"
                      onClick={handleResendEmail}
                      disabled={isLoading}
                      className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50">
                      {isLoading ? "Resending..." : "Resend Email"}
                    </Button>

                    <Link
                      to="/signin"
                      className="w-full inline-flex items-center justify-center text-sm text-accent-gold hover:text-accent-orange transition-colors duration-200 py-2">
                      <HiArrowLeft className="h-4 w-4 mr-1" />
                      Back to Sign In
                    </Link>
                  </div>
                </div>
              </GlassCard>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};
