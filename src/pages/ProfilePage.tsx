import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  HiUser,
  HiMail,
  HiPhone,
  HiLocationMarker,
  HiShoppingBag,
  HiHeart,
  HiCog,
  HiLogout,
  HiPencil,
  HiCheck,
  HiX,
} from "react-icons/hi";
import toast from "react-hot-toast";
import { Button } from "../components/ui/Button";
import { GlassCard } from "../components/ui/GlassCard";
import { useAuth } from "../context/EnhancedAppContext";
import { UserProfileService } from "../utils/userProfileService";
import EnhancedAuthService from "../utils/enhancedAuthService";
import { UserStatsService, UserStatistics } from "../utils/userStatsService";
import { Order } from "../utils/orderService";

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  digitalAddress?: string;
  apartment?: string;
  country?: string;
}

interface PurchaseItem {
  id: string;
  orderId: string;
  date: string;
  status: "delivered" | "shipped" | "processing" | "cancelled" | "pending";
  total: number;
  items: {
    id: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
    size?: string;
    color?: string;
  }[];
}

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "settings">(
    "profile"
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [userStats, setUserStats] = useState<UserStatistics>({
    totalOrders: 0,
    totalSpent: 0,
    wishlistItems: 0,
    ordersByStatus: {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    },
    recentOrdersCount: 0,
  });
  const [orderHistory, setOrderHistory] = useState<PurchaseItem[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [profileData, setProfileData] = useState<UserProfile>({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    digitalAddress: "", // Not available in EnhancedAuthService AuthUser
    apartment: "", // Not available in EnhancedAuthService AuthUser
    country: "Ghana", // Not available in EnhancedAuthService AuthUser
  });

  // Load full profile data from Firestore
  useEffect(() => {
    const loadUserProfile = async () => {
      if (user?.id) {
        setIsLoading(true);
        try {
          const userProfile = await UserProfileService.getUserProfile(user.id);
          if (userProfile) {
            setProfileData({
              firstName: userProfile.firstName,
              lastName: userProfile.lastName,
              email: userProfile.email,
              phone: userProfile.phoneNumber || "",
              digitalAddress:
                userProfile.addresses.find((addr) => addr.isDefault)?.address ||
                "",
              apartment:
                userProfile.addresses.find((addr) => addr.isDefault)
                  ?.apartment || "",
              country:
                userProfile.addresses.find((addr) => addr.isDefault)?.country ||
                "Ghana",
            });
          }
        } catch (error) {
          console.error("Error loading user profile:", error);
          toast.error("Failed to load profile data");
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadUserProfile();
  }, [user?.id]);

  // Load user statistics and order history
  useEffect(() => {
    const loadUserData = async () => {
      if (user?.id) {
        setIsLoadingStats(true);
        try {
          // Load user statistics
          const stats = await UserStatsService.getUserStatistics(user.id);
          setUserStats(stats);

          // Load order history
          const orders = await UserStatsService.getUserOrderHistory(user.id);
          const formattedOrders = orders.map((order) =>
            UserStatsService.formatOrderForDisplay(order)
          );
          setOrderHistory(formattedOrders);
        } catch (error) {
          console.error("Error loading user data:", error);
          toast.error("Failed to load user statistics");
        } finally {
          setIsLoadingStats(false);
        }
      }
    };

    loadUserData();
  }, [user?.id]);

  // Handle tab parameter from URL
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["profile", "orders", "settings"].includes(tabParam)) {
      setActiveTab(tabParam as "profile" | "orders" | "settings");
    }
  }, [searchParams]);

  // Redirect if not authenticated
  if (!user) {
    navigate("/signin");
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSaveProfile = async () => {
    if (!user?.id) return;

    setIsSaving(true);
    try {
      // Update basic profile info
      await UserProfileService.updateUserProfile(user.id, {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phoneNumber: profileData.phone,
      });

      // Update or add address if digitalAddress is provided
      if (profileData.digitalAddress || profileData.apartment) {
        const currentProfile = await UserProfileService.getUserProfile(user.id);
        if (currentProfile) {
          const defaultAddress = currentProfile.addresses.find(
            (addr) => addr.isDefault
          );

          if (defaultAddress) {
            // Update existing default address
            await UserProfileService.updateAddress(user.id, defaultAddress.id, {
              address: profileData.digitalAddress,
              apartment: profileData.apartment,
              country: profileData.country,
            });
          } else {
            // Add new default address
            await UserProfileService.addAddress(user.id, {
              type: "home",
              firstName: profileData.firstName,
              lastName: profileData.lastName,
              address: profileData.digitalAddress || "",
              city: "", // You might want to add a city field
              state: "", // You might want to add a state field
              zipCode: "", // You might want to add a zipCode field
              country: profileData.country || "Ghana",
              isDefault: true,
              apartment: profileData.apartment || "",
            });
          }
        }
      }

      // Update local user context
      // TODO: Implement updateUser in EnhancedAppContext
      /*
      await updateUser({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone,
        digitalAddress: profileData.digitalAddress,
        apartment: profileData.apartment,
        country: profileData.country,
      });
      */

      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = async () => {
    // Reset to current data from Firestore
    if (user?.id) {
      try {
        const userProfile = await UserProfileService.getUserProfile(user.id);
        if (userProfile) {
          setProfileData({
            firstName: userProfile.firstName,
            lastName: userProfile.lastName,
            email: userProfile.email,
            phone: userProfile.phoneNumber || "",
            digitalAddress:
              userProfile.addresses.find((addr) => addr.isDefault)?.address ||
              "",
            apartment:
              userProfile.addresses.find((addr) => addr.isDefault)?.apartment ||
              "",
            country:
              userProfile.addresses.find((addr) => addr.isDefault)?.country ||
              "Ghana",
          });
        }
      } catch (error) {
        console.error("Error resetting profile data:", error);
        // Fallback to user context data
        setProfileData({
          firstName: user?.firstName || "",
          lastName: user?.lastName || "",
          email: user?.email || "",
          phone: user?.phone || "",
          digitalAddress: "", // Not available in EnhancedAuthService AuthUser
          apartment: "", // Not available in EnhancedAuthService AuthUser
          country: "Ghana", // Not available in EnhancedAuthService AuthUser
        });
      }
    }
    setIsEditing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "text-green-400 bg-green-400/10";
      case "shipped":
        return "text-blue-400 bg-blue-400/10";
      case "processing":
        return "text-yellow-400 bg-yellow-400/10";
      case "cancelled":
        return "text-red-400 bg-red-400/10";
      default:
        return "text-gray-400 bg-gray-400/10";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 pt-32 pb-12 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-10 w-72 h-72 bg-accent-gold/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}>
              <GlassCard className="p-6 sticky top-8 backdrop-blur-xl bg-white/70 border border-white/20 shadow-xl">
                <div className="text-center mb-6">
                  <motion.div
                    className="w-24 h-24 mx-auto mb-4 relative"
                    whileHover={{ scale: 1.05 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                    }}>
                    <img
                      src={
                        user.avatar ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`
                      }
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover ring-4 ring-accent-gold/30 shadow-lg"
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-md"></div>
                  </motion.div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className="text-sm text-gray-600 font-medium">
                    {user.email}
                  </p>
                </div>

                <nav className="space-y-3">
                  <motion.button
                    onClick={() => setActiveTab("profile")}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${
                      activeTab === "profile"
                        ? "bg-gradient-to-r from-accent-gold to-accent-orange text-black shadow-lg shadow-accent-gold/30"
                        : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 hover:shadow-md"
                    }`}>
                    <HiUser className="mr-3 h-5 w-5" />
                    Profile
                  </motion.button>
                  <motion.button
                    onClick={() => setActiveTab("orders")}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${
                      activeTab === "orders"
                        ? "bg-gradient-to-r from-accent-gold to-accent-orange text-black shadow-lg shadow-accent-gold/30"
                        : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 hover:shadow-md"
                    }`}>
                    <HiShoppingBag className="mr-3 h-5 w-5" />
                    Orders
                  </motion.button>
                  <motion.button
                    onClick={() => setActiveTab("settings")}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${
                      activeTab === "settings"
                        ? "bg-gradient-to-r from-accent-gold to-accent-orange text-black shadow-lg shadow-accent-gold/30"
                        : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 hover:shadow-md"
                    }`}>
                    <HiCog className="mr-3 h-5 w-5" />
                    Settings
                  </motion.button>
                  <motion.button
                    onClick={handleLogout}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 rounded-xl transition-all duration-300 hover:shadow-md">
                    <HiLogout className="mr-3 h-5 w-5" />
                    Sign Out
                  </motion.button>
                </nav>
              </GlassCard>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === "profile" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}>
                <GlassCard className="p-8 backdrop-blur-xl bg-white/80 border border-white/30 shadow-2xl">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-gold"></div>
                      <span className="ml-3 text-lg text-gray-600">
                        Loading profile...
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center mb-8">
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                          Profile Information
                        </h2>
                        {!isEditing ? (
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}>
                            <Button
                              onClick={() => setIsEditing(true)}
                              variant="outline"
                              className="flex items-center bg-gradient-to-r from-accent-gold to-accent-orange hover:from-accent-orange hover:to-accent-gold text-black border-none shadow-lg hover:shadow-xl transition-all duration-300">
                              <HiPencil className="mr-2 h-4 w-4" />
                              Edit
                            </Button>
                          </motion.div>
                        ) : (
                          <div className="flex space-x-2">
                            <Button
                              onClick={handleSaveProfile}
                              disabled={isSaving}
                              className="flex items-center bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">
                              <HiCheck className="mr-2 h-4 w-4" />
                              {isSaving ? "Saving..." : "Save"}
                            </Button>
                            <Button
                              onClick={handleCancelEdit}
                              variant="outline"
                              className="flex items-center">
                              <HiX className="mr-2 h-4 w-4" />
                              Cancel
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            First Name
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={profileData.firstName}
                              onChange={(e) =>
                                setProfileData({
                                  ...profileData,
                                  firstName: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold"
                            />
                          ) : (
                            <div className="flex items-center px-3 py-2 bg-gray-50 rounded-lg">
                              <HiUser className="mr-2 h-5 w-5 text-gray-400" />
                              {profileData.firstName}
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Last Name
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={profileData.lastName}
                              onChange={(e) =>
                                setProfileData({
                                  ...profileData,
                                  lastName: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold"
                            />
                          ) : (
                            <div className="flex items-center px-3 py-2 bg-gray-50 rounded-lg">
                              <HiUser className="mr-2 h-5 w-5 text-gray-400" />
                              {profileData.lastName}
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                          </label>
                          <div className="flex items-center px-3 py-2 bg-gray-50 rounded-lg">
                            <HiMail className="mr-2 h-5 w-5 text-gray-400" />
                            {profileData.email}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone
                          </label>
                          {isEditing ? (
                            <input
                              type="tel"
                              value={profileData.phone}
                              onChange={(e) =>
                                setProfileData({
                                  ...profileData,
                                  phone: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold"
                              placeholder="Add phone number"
                            />
                          ) : (
                            <div className="flex items-center px-3 py-2 bg-gray-50 rounded-lg">
                              <HiPhone className="mr-2 h-5 w-5 text-gray-400" />
                              {profileData.phone || "Not provided"}
                            </div>
                          )}
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Digital Address
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={profileData.digitalAddress}
                              onChange={(e) =>
                                setProfileData({
                                  ...profileData,
                                  digitalAddress: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold"
                              placeholder="e.g. GA-123-4567 or GE-456-7890"
                            />
                          ) : (
                            <div className="flex items-center px-3 py-2 bg-gray-50 rounded-lg">
                              <HiLocationMarker className="mr-2 h-5 w-5 text-gray-400" />
                              {profileData.digitalAddress || "Not provided"}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Statistics */}
                      <div className="mt-8 pt-8 border-t border-gray-200/50">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">
                          Account Summary
                        </h3>
                        {isLoadingStats ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-gold mr-3"></div>
                            <span className="text-gray-600">
                              Loading statistics...
                            </span>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <motion.div
                              className="bg-gradient-to-br from-accent-gold via-accent-orange to-yellow-500 p-6 rounded-2xl text-center shadow-xl shadow-accent-gold/20 hover:shadow-2xl hover:shadow-accent-gold/30 transition-all duration-300"
                              whileHover={{ scale: 1.05, y: -5 }}
                              transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 20,
                              }}>
                              <div className="text-3xl font-black text-black mb-2">
                                {userStats.totalOrders}
                              </div>
                              <div className="text-sm font-semibold text-black/80">
                                Total Orders
                              </div>
                            </motion.div>
                            <motion.div
                              className="bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 p-6 rounded-2xl text-center text-white shadow-xl shadow-green-500/20 hover:shadow-2xl hover:shadow-green-500/30 transition-all duration-300"
                              whileHover={{ scale: 1.05, y: -5 }}
                              transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 20,
                              }}>
                              <div className="text-3xl font-black mb-2">
                                ${userStats.totalSpent.toFixed(2)}
                              </div>
                              <div className="text-sm font-semibold text-white/90">
                                Total Spent
                              </div>
                            </motion.div>
                            <motion.div
                              className="bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 p-6 rounded-2xl text-center text-white shadow-xl shadow-purple-500/20 hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-300"
                              whileHover={{ scale: 1.05, y: -5 }}
                              transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 20,
                              }}>
                              <div className="text-3xl font-black mb-2">
                                {userStats.wishlistItems}
                              </div>
                              <div className="text-sm font-semibold text-white/90">
                                Wishlist Items
                              </div>
                            </motion.div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </GlassCard>
              </motion.div>
            )}

            {activeTab === "orders" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}>
                <GlassCard className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Order History
                  </h2>

                  {isLoadingStats ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-gold mr-3"></div>
                      <span className="text-lg text-gray-600">
                        Loading orders...
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-6">
                        {orderHistory.map((order) => (
                          <div
                            key={order.id}
                            className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                  Order #{order.orderId}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  Placed on {formatDate(order.date)}
                                </p>
                              </div>
                              <div className="text-right">
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                    order.status
                                  )}`}>
                                  {order.status.charAt(0).toUpperCase() +
                                    order.status.slice(1)}
                                </span>
                                <p className="text-lg font-bold text-gray-900 mt-1">
                                  ${order.total.toFixed(2)}
                                </p>
                              </div>
                            </div>

                            <div className="space-y-3">
                              {order.items.map((item) => (
                                <div
                                  key={item.id}
                                  className="flex items-center space-x-4">
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-16 h-16 object-cover rounded-lg"
                                  />
                                  <div className="flex-1">
                                    <h4 className="font-medium text-gray-900">
                                      {item.name}
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                      {item.size && `Size: ${item.size}`}{" "}
                                      {item.color && `• Color: ${item.color}`}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      Qty: {item.quantity} • $
                                      {item.price.toFixed(2)} each
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                              {order.status === "delivered" && (
                                <Button size="sm">Reorder</Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {orderHistory.length === 0 && !isLoadingStats && (
                        <div className="text-center py-12">
                          <HiShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No orders yet
                          </h3>
                          <p className="text-gray-600 mb-6">
                            Start shopping to see your orders here
                          </p>
                          <Button onClick={() => navigate("/shop")}>
                            Start Shopping
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </GlassCard>
              </motion.div>
            )}

            {activeTab === "settings" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}>
                <GlassCard className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Account Settings
                  </h2>

                  <div className="space-y-6">
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Email Notifications
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Manage your email notification preferences
                      </p>
                      <div className="space-y-3">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            defaultChecked
                            className="h-4 w-4 text-accent-gold focus:ring-accent-gold border-gray-300 rounded"
                          />
                          <span className="ml-3 text-sm text-gray-700">
                            Order updates
                          </span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            defaultChecked
                            className="h-4 w-4 text-accent-gold focus:ring-accent-gold border-gray-300 rounded"
                          />
                          <span className="ml-3 text-sm text-gray-700">
                            Promotional emails
                          </span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-accent-gold focus:ring-accent-gold border-gray-300 rounded"
                          />
                          <span className="ml-3 text-sm text-gray-700">
                            Newsletter
                          </span>
                        </label>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Security
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Keep your account secure
                      </p>
                      <div className="space-y-3">
                        <Button
                          variant="outline"
                          className="w-full justify-start">
                          Change Password
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start">
                          Two-Factor Authentication
                        </Button>
                      </div>
                    </div>

                    <div className="border border-red-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-red-900 mb-2">
                        Danger Zone
                      </h3>
                      <p className="text-red-600 mb-4">
                        These actions cannot be undone
                      </p>
                      <Button
                        variant="outline"
                        className="w-full justify-start border-red-300 text-red-600 hover:bg-red-50">
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
