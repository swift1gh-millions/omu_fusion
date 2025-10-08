import React, { useState } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { useAuth } from "../../context/EnhancedAppContext";
import { updatePassword, updateEmail } from "firebase/auth";
import { auth } from "../../utils/firebase";
import toast from "react-hot-toast";
import { Save, Mail, Lock, Shield, Eye, EyeOff } from "lucide-react";

export const AdminSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [emailForm, setEmailForm] = useState({
    newEmail: user?.email || "",
    currentPassword: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    try {
      setLoading(true);

      if (emailForm.newEmail === user?.email) {
        toast.error("New email must be different from current email");
        return;
      }

      // In a real application, you would need to re-authenticate the user
      // before changing email. For this demo, we'll just update it directly.
      await updateEmail(auth.currentUser, emailForm.newEmail);

      toast.success("Email updated successfully!");
      setEmailForm((prev) => ({ ...prev, currentPassword: "" }));
    } catch (error: any) {
      console.error("Error updating email:", error);
      if (error.code === "auth/requires-recent-login") {
        toast.error(
          "Please log out and log back in before changing your email"
        );
      } else {
        toast.error("Failed to update email. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    try {
      setLoading(true);

      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        toast.error("New passwords do not match");
        return;
      }

      if (passwordForm.newPassword.length < 6) {
        toast.error("Password must be at least 6 characters long");
        return;
      }

      // In a real application, you would need to re-authenticate the user
      // before changing password. For this demo, we'll just update it directly.
      await updatePassword(auth.currentUser, passwordForm.newPassword);

      toast.success("Password updated successfully!");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      console.error("Error updating password:", error);
      if (error.code === "auth/requires-recent-login") {
        toast.error(
          "Please log out and log back in before changing your password"
        );
      } else {
        toast.error("Failed to update password. Please try again.");
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
                      <span className="text-gray-300">Current Email:</span>
                      <span className="font-semibold text-white">
                        {user?.email}
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

              {/* Change Email */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6 shadow-xl">
                <div className="flex items-center mb-4">
                  <Mail className="h-6 w-6 text-blue-400 mr-3" />
                  <h2 className="text-xl font-semibold text-white">
                    Change Email Address
                  </h2>
                </div>
                <form onSubmit={handleEmailChange} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      New Email Address
                    </label>
                    <input
                      type="email"
                      value={emailForm.newEmail}
                      onChange={(e) =>
                        setEmailForm((prev) => ({
                          ...prev,
                          newEmail: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                      placeholder="Enter new email address"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Current Password (for verification)
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={emailForm.currentPassword}
                        onChange={(e) =>
                          setEmailForm((prev) => ({
                            ...prev,
                            currentPassword: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 pr-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
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
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center px-6 py-3 rounded-lg font-medium">
                    <Save className="h-5 w-5 mr-2" />
                    {loading ? "Updating..." : "Update Email"}
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
                          setPasswordForm((prev) => ({
                            ...prev,
                            currentPassword: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 pr-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
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
                          setPasswordForm((prev) => ({
                            ...prev,
                            newPassword: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 pr-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                        placeholder="Enter new password"
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
                          setPasswordForm((prev) => ({
                            ...prev,
                            confirmPassword: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 pr-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
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
