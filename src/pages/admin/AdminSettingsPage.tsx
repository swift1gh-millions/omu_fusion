import React, { useState } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { useAdminAuth } from "../../context/AdminContext";
import {
  updatePassword,
  updateEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { auth } from "../../utils/firebase";
import toast from "react-hot-toast";
import {
  Save,
  Mail,
  Lock,
  Shield,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  User,
  AtSign,
} from "lucide-react";
import {
  FormFieldError,
  formatUserFriendlyError,
} from "../../components/ui/FormFieldError";

export const AdminSettingsPage: React.FC = () => {
  const { admin, refreshAdminProfile } = useAdminAuth();
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [usernameForm, setUsernameForm] = useState({
    newUsername: admin?.username || "",
    currentPassword: "",
  });

  const [recoveryEmailForm, setRecoveryEmailForm] = useState({
    recoveryEmail: admin?.recoveryEmail || "",
    currentPassword: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Error states for form validation
  const [usernameErrors, setUsernameErrors] = useState({
    newUsername: "",
    currentPassword: "",
  });

  const [recoveryEmailErrors, setRecoveryEmailErrors] = useState({
    recoveryEmail: "",
    currentPassword: "",
  });

  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Touch states to track which fields have been interacted with
  const [usernameTouched, setUsernameTouched] = useState({
    newUsername: false,
    currentPassword: false,
  });

  const [recoveryEmailTouched, setRecoveryEmailTouched] = useState({
    recoveryEmail: false,
    currentPassword: false,
  });

  const [passwordTouched, setPasswordTouched] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  // Validation functions
  const validateUsername = (username: string): string => {
    if (!username.trim()) {
      return "Username is required";
    }
    if (username.length < 3 || username.length > 20) {
      return "Username must be between 3-20 characters";
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return "Username can only contain letters, numbers, underscore, or hyphen";
    }
    if (username === admin?.username) {
      return "New username must be different from current username";
    }
    return "";
  };

  const validateRecoveryEmail = (email: string): string => {
    if (!email.trim()) {
      return "Recovery email is required";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Please enter a valid email address";
    }
    if (email === admin?.recoveryEmail) {
      return "New recovery email must be different from current recovery email";
    }
    return "";
  };

  const validatePassword = (password: string): string => {
    if (!password.trim()) {
      return "Password is required";
    }
    if (password.length < 6) {
      return "Password must be at least 6 characters long";
    }
    return "";
  };

  const validatePasswordMatch = (
    password: string,
    confirmPassword: string
  ): string => {
    if (!confirmPassword.trim()) {
      return "Please confirm your password";
    }
    if (password !== confirmPassword) {
      return "Passwords do not match";
    }
    return "";
  };

  // Field change handlers with validation
  const handleUsernameFieldChange = (
    field: keyof typeof usernameForm,
    value: string
  ) => {
    setUsernameForm((prev) => ({ ...prev, [field]: value }));
    setUsernameTouched((prev) => ({ ...prev, [field]: true }));

    // Validate and set errors
    if (field === "newUsername") {
      setUsernameErrors((prev) => ({
        ...prev,
        newUsername: validateUsername(value),
      }));
    } else if (field === "currentPassword") {
      setUsernameErrors((prev) => ({
        ...prev,
        currentPassword: validatePassword(value),
      }));
    }
  };

  const handleRecoveryEmailFieldChange = (
    field: keyof typeof recoveryEmailForm,
    value: string
  ) => {
    setRecoveryEmailForm((prev) => ({ ...prev, [field]: value }));
    setRecoveryEmailTouched((prev) => ({ ...prev, [field]: true }));

    // Validate and set errors
    if (field === "recoveryEmail") {
      setRecoveryEmailErrors((prev) => ({
        ...prev,
        recoveryEmail: validateRecoveryEmail(value),
      }));
    } else if (field === "currentPassword") {
      setRecoveryEmailErrors((prev) => ({
        ...prev,
        currentPassword: validatePassword(value),
      }));
    }
  };

  const handlePasswordFieldChange = (
    field: keyof typeof passwordForm,
    value: string
  ) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
    setPasswordTouched((prev) => ({ ...prev, [field]: true }));

    // Validate and set errors
    if (field === "currentPassword") {
      setPasswordErrors((prev) => ({
        ...prev,
        currentPassword: validatePassword(value),
      }));
    } else if (field === "newPassword") {
      setPasswordErrors((prev) => ({
        ...prev,
        newPassword: validatePassword(value),
      }));
      // Re-validate confirm password if it's been touched
      if (passwordTouched.confirmPassword) {
        setPasswordErrors((prev) => ({
          ...prev,
          confirmPassword: validatePasswordMatch(
            value,
            passwordForm.confirmPassword
          ),
        }));
      }
    } else if (field === "confirmPassword") {
      setPasswordErrors((prev) => ({
        ...prev,
        confirmPassword: validatePasswordMatch(passwordForm.newPassword, value),
      }));
    }
  };

  // Password strength checker
  const getPasswordStrength = (password: string) => {
    let score = 0;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /\d/.test(password),
      symbols: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };

    Object.values(checks).forEach((check) => check && score++);

    if (score < 3)
      return { strength: "Weak", color: "text-red-400", percentage: 25 };
    if (score < 4)
      return { strength: "Fair", color: "text-yellow-400", percentage: 50 };
    if (score < 5)
      return { strength: "Good", color: "text-blue-400", percentage: 75 };
    return { strength: "Strong", color: "text-green-400", percentage: 100 };
  };

  const handleUsernameChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !admin?.email) return;

    // Mark all fields as touched
    setUsernameTouched({ newUsername: true, currentPassword: true });

    // Validate all fields
    const usernameError = validateUsername(usernameForm.newUsername);
    const passwordError = validatePassword(usernameForm.currentPassword);

    setUsernameErrors({
      newUsername: usernameError,
      currentPassword: passwordError,
    });

    // Don't proceed if there are validation errors
    if (usernameError || passwordError) {
      return;
    }

    try {
      setLoading(true);

      console.log("🔄 Starting username update process...");

      // Re-authenticate the user with current password first
      const credential = EmailAuthProvider.credential(
        admin.email,
        usernameForm.currentPassword
      );

      console.log("🔐 Re-authenticating user...");
      await reauthenticateWithCredential(auth.currentUser, credential);
      console.log("✅ Re-authentication successful");

      // Update admin document in Firestore with new username
      console.log("📄 Updating admin document in Firestore...");
      const { updateDoc, doc, Timestamp } = await import("firebase/firestore");
      const { db } = await import("../../utils/firebase");

      const adminRef = doc(db, "admins", auth.currentUser.uid);
      await updateDoc(adminRef, {
        username: usernameForm.newUsername,
        lastUpdated: Timestamp.now(),
      });

      console.log("✅ Username updated successfully");
      toast.success("Username updated successfully!");

      // Clear the form
      setUsernameForm({
        newUsername: usernameForm.newUsername,
        currentPassword: "",
      });

      // Refresh admin profile to show updated data
      await refreshAdminProfile();
    } catch (error: any) {
      console.error("❌ Error updating username:", error);

      // Handle specific Firebase errors with field-specific error display
      if (error.code === "auth/wrong-password") {
        setUsernameErrors((prev) => ({
          ...prev,
          currentPassword: "Current password is incorrect",
        }));
      } else if (error.code === "auth/requires-recent-login") {
        toast.error("Session expired. Please sign in again to continue");
      } else if (error.code === "auth/too-many-requests") {
        toast.error("Too many failed attempts. Please try again later");
      } else if (error.code === "auth/network-request-failed") {
        toast.error(
          "Network error. Please check your connection and try again"
        );
      } else {
        const userFriendlyError = formatUserFriendlyError(error.message);
        toast.error(
          userFriendlyError || "Failed to update username. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRecoveryEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !admin?.email) return;

    // Mark all fields as touched
    setRecoveryEmailTouched({ recoveryEmail: true, currentPassword: true });

    // Validate all fields
    const emailError = validateRecoveryEmail(recoveryEmailForm.recoveryEmail);
    const passwordError = validatePassword(recoveryEmailForm.currentPassword);

    setRecoveryEmailErrors({
      recoveryEmail: emailError,
      currentPassword: passwordError,
    });

    // Don't proceed if there are validation errors
    if (emailError || passwordError) {
      return;
    }

    try {
      setLoading(true);

      console.log("🔄 Starting recovery email update process...");

      // Re-authenticate the user with current password first
      const credential = EmailAuthProvider.credential(
        admin.email,
        recoveryEmailForm.currentPassword
      );

      console.log("🔐 Re-authenticating user...");
      await reauthenticateWithCredential(auth.currentUser, credential);
      console.log("✅ Re-authentication successful");

      // Update admin document in Firestore with new recovery email
      console.log("📄 Updating admin document in Firestore...");
      const { updateDoc, doc, Timestamp } = await import("firebase/firestore");
      const { db } = await import("../../utils/firebase");

      const adminRef = doc(db, "admins", auth.currentUser.uid);
      await updateDoc(adminRef, {
        recoveryEmail: recoveryEmailForm.recoveryEmail,
        lastUpdated: Timestamp.now(),
      });

      console.log("✅ Recovery email updated successfully");
      toast.success(
        "Recovery email updated successfully! This email will be used for password recovery."
      );

      // Clear the form
      setRecoveryEmailForm({
        recoveryEmail: recoveryEmailForm.recoveryEmail,
        currentPassword: "",
      });

      // Refresh admin profile to show updated data
      await refreshAdminProfile();
    } catch (error: any) {
      console.error("❌ Error updating recovery email:", error);

      // Handle specific Firebase errors with field-specific error display
      if (error.code === "auth/wrong-password") {
        setRecoveryEmailErrors((prev) => ({
          ...prev,
          currentPassword: "Current password is incorrect",
        }));
      } else if (error.code === "auth/requires-recent-login") {
        toast.error("Session expired. Please sign in again to continue");
      } else if (error.code === "auth/network-request-failed") {
        toast.error(
          "Network error. Please check your connection and try again"
        );
      } else {
        const userFriendlyError = formatUserFriendlyError(error.message);
        toast.error(
          userFriendlyError ||
            "Failed to update recovery email. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !admin?.email) return;

    // Mark all fields as touched
    setPasswordTouched({
      currentPassword: true,
      newPassword: true,
      confirmPassword: true,
    });

    // Validate all fields
    const currentPasswordError = validatePassword(passwordForm.currentPassword);
    const newPasswordError = validatePassword(passwordForm.newPassword);
    const confirmPasswordError = validatePasswordMatch(
      passwordForm.newPassword,
      passwordForm.confirmPassword
    );

    setPasswordErrors({
      currentPassword: currentPasswordError,
      newPassword: newPasswordError,
      confirmPassword: confirmPasswordError,
    });

    // Don't proceed if there are validation errors
    if (currentPasswordError || newPasswordError || confirmPasswordError) {
      return;
    }

    try {
      setLoading(true);

      if (passwordForm.newPassword === passwordForm.currentPassword) {
        toast.error("New password must be different from current password");
        return;
      }

      // Check password strength
      const hasUpperCase = /[A-Z]/.test(passwordForm.newPassword);
      const hasLowerCase = /[a-z]/.test(passwordForm.newPassword);
      const hasNumbers = /\d/.test(passwordForm.newPassword);

      if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
        toast.error("Password must contain uppercase, lowercase, and numbers");
        return;
      }

      // Re-authenticate the user with current password
      const credential = EmailAuthProvider.credential(
        admin.email,
        passwordForm.currentPassword
      );

      await reauthenticateWithCredential(auth.currentUser, credential);

      // Update password
      await updatePassword(auth.currentUser, passwordForm.newPassword);

      toast.success("Password updated successfully!");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      console.error("Error updating password:", error);

      // Handle specific Firebase errors with field-specific error display
      if (error.code === "auth/wrong-password") {
        setPasswordErrors((prev) => ({
          ...prev,
          currentPassword: "Current password is incorrect",
        }));
      } else if (error.code === "auth/requires-recent-login") {
        toast.error("Please sign in again to continue");
      } else if (error.code === "auth/weak-password") {
        setPasswordErrors((prev) => ({
          ...prev,
          newPassword:
            "Password is too weak. Please choose a stronger password",
        }));
      } else {
        const userFriendlyError = formatUserFriendlyError(error.message);
        toast.error(
          userFriendlyError || "Failed to update password. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                Admin Settings
              </h1>
              <p className="text-gray-300">
                Manage your admin account credentials
              </p>
            </div>

            <div className="space-y-8">
              {/* Account Info */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6 shadow-xl">
                <div className="flex items-center mb-4">
                  <Shield className="h-6 w-6 text-blue-400 mr-3" />
                  <h2 className="text-xl font-semibold text-white">
                    Account Information
                  </h2>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Username:</span>
                      <span className="font-semibold text-white">
                        {admin?.username || "Not set"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Current Email:</span>
                      <span className="font-semibold text-white">
                        {admin?.email || "Not available"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Recovery Email:</span>
                      <span className="font-semibold text-white">
                        {admin?.recoveryEmail || "Not set"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Role:</span>
                      <span className="font-semibold text-blue-300">
                        Administrator
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Account Type:</span>
                      <span className="font-semibold text-green-300">
                        Admin Account
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Change Username */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6 shadow-xl">
                <div className="flex items-center mb-4">
                  <User className="h-6 w-6 text-blue-400 mr-3" />
                  <h2 className="text-xl font-semibold text-white">
                    Change Username
                  </h2>
                </div>
                <form onSubmit={handleUsernameChange} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      New Username
                    </label>
                    <input
                      type="text"
                      value={usernameForm.newUsername}
                      onChange={(e) =>
                        handleUsernameFieldChange("newUsername", e.target.value)
                      }
                      className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 ${
                        usernameErrors.newUsername &&
                        usernameTouched.newUsername
                          ? "border-red-400"
                          : "border-white/20"
                      }`}
                      placeholder="Enter new username (3-20 characters)"
                      minLength={3}
                      maxLength={20}
                      required
                    />
                    <FormFieldError
                      error={usernameErrors.newUsername}
                      touched={usernameTouched.newUsername}
                    />
                    {!usernameErrors.newUsername && (
                      <p className="text-xs text-gray-400 mt-1">
                        Username can only contain letters, numbers, underscore
                        (_), or hyphen (-)
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Current Password (for verification)
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={usernameForm.currentPassword}
                        onChange={(e) =>
                          handleUsernameFieldChange(
                            "currentPassword",
                            e.target.value
                          )
                        }
                        className={`w-full px-4 py-3 pr-12 bg-white/10 backdrop-blur-sm border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 ${
                          usernameErrors.currentPassword &&
                          usernameTouched.currentPassword
                            ? "border-red-400"
                            : "border-white/20"
                        }`}
                        placeholder="Enter current password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200">
                        {showCurrentPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    <FormFieldError
                      error={usernameErrors.currentPassword}
                      touched={usernameTouched.currentPassword}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center px-6 py-3 rounded-lg font-medium">
                    <Save className="h-5 w-5 mr-2" />
                    {loading ? "Updating..." : "Update Username"}
                  </button>
                </form>
              </div>

              {/* Recovery Email */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6 shadow-xl">
                <div className="flex items-center mb-4">
                  <AtSign className="h-6 w-6 text-blue-400 mr-3" />
                  <h2 className="text-xl font-semibold text-white">
                    Recovery Email
                  </h2>
                </div>
                <p className="text-sm text-gray-300 mb-4">
                  Set a recovery email to reset your password if you forget it.
                  This should be a real email address you can access.
                </p>
                <form
                  onSubmit={handleRecoveryEmailChange}
                  className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Recovery Email Address
                    </label>
                    <input
                      type="email"
                      value={recoveryEmailForm.recoveryEmail}
                      onChange={(e) =>
                        handleRecoveryEmailFieldChange(
                          "recoveryEmail",
                          e.target.value
                        )
                      }
                      className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 ${
                        recoveryEmailErrors.recoveryEmail &&
                        recoveryEmailTouched.recoveryEmail
                          ? "border-red-400"
                          : "border-white/20"
                      }`}
                      placeholder="Enter your real email address"
                      required
                    />
                    <FormFieldError
                      error={recoveryEmailErrors.recoveryEmail}
                      touched={recoveryEmailTouched.recoveryEmail}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Current Password (for verification)
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={recoveryEmailForm.currentPassword}
                        onChange={(e) =>
                          handleRecoveryEmailFieldChange(
                            "currentPassword",
                            e.target.value
                          )
                        }
                        className={`w-full px-4 py-3 pr-12 bg-white/10 backdrop-blur-sm border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 ${
                          recoveryEmailErrors.currentPassword &&
                          recoveryEmailTouched.currentPassword
                            ? "border-red-400"
                            : "border-white/20"
                        }`}
                        placeholder="Enter current password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200">
                        {showCurrentPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    <FormFieldError
                      error={recoveryEmailErrors.currentPassword}
                      touched={recoveryEmailTouched.currentPassword}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center px-6 py-3 rounded-lg font-medium">
                    <Save className="h-5 w-5 mr-2" />
                    {loading ? "Updating..." : "Set Recovery Email"}
                  </button>
                </form>
              </div>

              {/* Change Password */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6 shadow-xl">
                <div className="flex items-center mb-4">
                  <Lock className="h-6 w-6 text-blue-400 mr-3" />
                  <h2 className="text-xl font-semibold text-white">
                    Change Password
                  </h2>
                </div>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={(e) =>
                          handlePasswordFieldChange(
                            "currentPassword",
                            e.target.value
                          )
                        }
                        className={`w-full px-4 py-3 pr-12 bg-white/10 backdrop-blur-sm border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 ${
                          passwordErrors.currentPassword &&
                          passwordTouched.currentPassword
                            ? "border-red-400"
                            : "border-white/20"
                        }`}
                        placeholder="Enter current password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200">
                        {showCurrentPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    <FormFieldError
                      error={passwordErrors.currentPassword}
                      touched={passwordTouched.currentPassword}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={(e) =>
                          handlePasswordFieldChange(
                            "newPassword",
                            e.target.value
                          )
                        }
                        className={`w-full px-4 py-3 pr-12 bg-white/10 backdrop-blur-sm border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 ${
                          passwordErrors.newPassword &&
                          passwordTouched.newPassword
                            ? "border-red-400"
                            : "border-white/20"
                        }`}
                        placeholder="Enter new password (min 6 characters)"
                        minLength={6}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200">
                        {showNewPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {/* Password Strength Indicator */}
                    {passwordForm.newPassword && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-300">
                            Password Strength:
                          </span>
                          <span
                            className={
                              getPasswordStrength(passwordForm.newPassword)
                                .color
                            }>
                            {
                              getPasswordStrength(passwordForm.newPassword)
                                .strength
                            }
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              getPasswordStrength(passwordForm.newPassword)
                                .strength === "Weak"
                                ? "bg-red-400"
                                : getPasswordStrength(passwordForm.newPassword)
                                    .strength === "Fair"
                                ? "bg-yellow-400"
                                : getPasswordStrength(passwordForm.newPassword)
                                    .strength === "Good"
                                ? "bg-blue-400"
                                : "bg-green-400"
                            }`}
                            style={{
                              width: `${
                                getPasswordStrength(passwordForm.newPassword)
                                  .percentage
                              }%`,
                            }}
                          />
                        </div>
                        <div className="mt-1 text-xs text-gray-400">
                          Requirements: 6+ characters, uppercase, lowercase,
                          numbers
                        </div>
                      </div>
                    )}
                    <FormFieldError
                      error={passwordErrors.newPassword}
                      touched={passwordTouched.newPassword}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordForm.confirmPassword}
                        onChange={(e) =>
                          handlePasswordFieldChange(
                            "confirmPassword",
                            e.target.value
                          )
                        }
                        className={`w-full px-4 py-3 pr-12 bg-white/10 backdrop-blur-sm border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 ${
                          passwordErrors.confirmPassword &&
                          passwordTouched.confirmPassword
                            ? "border-red-400"
                            : "border-white/20"
                        }`}
                        placeholder="Confirm new password"
                        minLength={6}
                        required
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200">
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {/* Password Match Indicator */}
                    {passwordForm.confirmPassword && (
                      <div className="mt-2 flex items-center text-sm">
                        {passwordForm.newPassword ===
                        passwordForm.confirmPassword ? (
                          <div className="flex items-center text-green-400">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            <span>Passwords match</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-red-400">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            <span>Passwords do not match</span>
                          </div>
                        )}
                      </div>
                    )}
                    <FormFieldError
                      error={passwordErrors.confirmPassword}
                      touched={passwordTouched.confirmPassword}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center px-6 py-3 rounded-lg font-medium">
                    <Lock className="h-5 w-5 mr-2" />
                    {loading ? "Updating..." : "Update Password"}
                  </button>
                </form>
              </div>

              {/* Security Notice */}
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <div className="flex items-start">
                  <Shield className="h-6 w-6 text-yellow-400 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-yellow-300 font-medium mb-1">
                      Security Notice
                    </h4>
                    <p className="text-yellow-200/80 text-sm">
                      For security reasons, you may be required to log out and
                      log back in after changing your email or password. Make
                      sure to use a strong password with at least 6 characters.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
