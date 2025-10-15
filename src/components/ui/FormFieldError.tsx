import React from "react";
import { AlertTriangle, Info } from "lucide-react";

interface FormFieldErrorProps {
  error?: string | null;
  touched?: boolean;
  className?: string;
  showIcon?: boolean;
}

/**
 * FormFieldError Component
 *
 * A reusable component for displaying user-friendly error messages below form fields.
 * Provides consistent styling and behavior across all forms in the application.
 *
 * Features:
 * - Only shows errors when field has been touched/interacted with
 * - User-friendly error messages (not technical)
 * - Consistent styling with icon support
 * - Accessibility-friendly with proper ARIA attributes
 */
export const FormFieldError: React.FC<FormFieldErrorProps> = ({
  error,
  touched = true,
  className = "",
  showIcon = true,
}) => {
  if (!error || !touched) {
    return null;
  }

  return (
    <div
      className={`flex items-start gap-2 mt-1 text-sm text-red-400 ${className}`}
      role="alert"
      aria-live="polite">
      {showIcon && <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />}
      <span className="leading-4">{error}</span>
    </div>
  );
};

interface FormFieldWarningProps {
  warning?: string | null;
  className?: string;
  showIcon?: boolean;
}

/**
 * FormFieldWarning Component
 *
 * A companion component for displaying warning messages (non-error feedback)
 */
export const FormFieldWarning: React.FC<FormFieldWarningProps> = ({
  warning,
  className = "",
  showIcon = true,
}) => {
  if (!warning) {
    return null;
  }

  return (
    <div
      className={`flex items-start gap-2 mt-1 text-sm text-yellow-400 ${className}`}
      role="alert"
      aria-live="polite">
      {showIcon && <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />}
      <span className="leading-4">{warning}</span>
    </div>
  );
};

/**
 * Utility function to convert technical error messages to user-friendly ones
 */
export const formatUserFriendlyError = (
  error: string | null | undefined
): string | null => {
  if (!error) return null;

  // Common Firebase Auth errors
  const errorMap: Record<string, string> = {
    "auth/user-not-found": "No account found with this email address.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/email-already-in-use":
      "This email is already registered. Try signing in instead.",
    "auth/weak-password": "Password should be at least 6 characters long.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/too-many-requests":
      "Too many failed attempts. Please try again later.",
    "auth/network-request-failed":
      "Network error. Please check your connection.",
    "auth/requires-recent-login": "Please sign in again to continue.",
    "auth/invalid-credential": "Invalid email or password.",
    "auth/user-disabled": "This account has been disabled.",

    // Firestore errors
    "firestore/permission-denied":
      "You do not have permission to perform this action.",
    "firestore/not-found": "The requested data was not found.",
    "firestore/already-exists": "This item already exists.",
    "firestore/failed-precondition": "Operation failed. Please try again.",

    // Form validation errors
    required: "This field is required.",
    email: "Please enter a valid email address.",
    minLength: "This field is too short.",
    maxLength: "This field is too long.",
    pattern: "Please enter a valid format.",
    numeric: "Please enter numbers only.",
    phone: "Please enter a valid phone number.",
    password: "Password must be at least 6 characters long.",
    passwordMatch: "Passwords do not match.",

    // Custom application errors
    "username-taken": "This username is already taken. Please choose another.",
    "username-invalid":
      "Username can only contain letters, numbers, and underscores.",
    "recovery-email-invalid": "Please enter a valid recovery email address.",
    "current-password-required":
      "Please enter your current password to confirm changes.",
    "product-name-required": "Product name is required.",
    "category-required": "Please select a category.",
    "price-invalid": "Please enter a valid price.",
    "image-required": "Please upload at least one product image.",
    "discount-code-exists": "This discount code already exists.",
    "discount-invalid": "Please enter a valid discount percentage (1-100).",
  };

  // Check for exact matches first
  if (errorMap[error]) {
    return errorMap[error];
  }

  // Check for partial matches (for Firebase error codes)
  for (const [key, message] of Object.entries(errorMap)) {
    if (error.includes(key)) {
      return message;
    }
  }

  // Handle generic validation messages
  if (error.toLowerCase().includes("required")) {
    return "This field is required.";
  }

  if (error.toLowerCase().includes("email")) {
    return "Please enter a valid email address.";
  }

  if (error.toLowerCase().includes("password")) {
    return "Please check your password and try again.";
  }

  if (error.toLowerCase().includes("username")) {
    return "Please check your username format.";
  }

  // For any other error, return a generic user-friendly message
  // Remove technical details and make it simple
  const cleanError = error
    .replace(/^Error:\s*/, "")
    .replace(/^Firebase:\s*/, "")
    .replace(/\s*\([^)]*\)$/, "") // Remove error codes in parentheses
    .replace(/^[A-Z_]+:\s*/, ""); // Remove error prefixes like "VALIDATION_ERROR:"

  // If the cleaned error is short and readable, use it
  if (
    cleanError.length < 100 &&
    !cleanError.includes("Error") &&
    !cleanError.includes("Exception")
  ) {
    return cleanError;
  }

  // Otherwise, return a generic message
  return "Something went wrong. Please try again.";
};

export default FormFieldError;
