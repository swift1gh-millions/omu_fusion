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
import { Button } from "../components/ui/Button";
import { GlassCard } from "../components/ui/GlassCard";
import { useAuth } from "../context/AppContext";

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  zipCode?: string;
  country?: string;
}

interface PurchaseItem {
  id: string;
  orderId: string;
  date: string;
  status: "delivered" | "shipped" | "processing" | "cancelled";
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

// Mock purchase history data
const mockPurchaseHistory: PurchaseItem[] = [
  {
    id: "order-001",
    orderId: "OMU-2024-001",
    date: "2024-09-15",
    status: "delivered",
    total: 259.97,
    items: [
      {
        id: "1",
        name: "Premium Cotton T-Shirt",
        image:
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
        price: 49.99,
        quantity: 2,
        size: "M",
        color: "Black",
      },
      {
        id: "2",
        name: "Designer Jeans",
        image:
          "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400",
        price: 159.99,
        quantity: 1,
        size: "32",
        color: "Indigo",
      },
    ],
  },
  {
    id: "order-002",
    orderId: "OMU-2024-002",
    date: "2024-09-28",
    status: "shipped",
    total: 89.99,
    items: [
      {
        id: "3",
        name: "Casual Sneakers",
        image:
          "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400",
        price: 89.99,
        quantity: 1,
        size: "10",
        color: "White",
      },
    ],
  },
  {
    id: "order-003",
    orderId: "OMU-2024-003",
    date: "2024-10-01",
    status: "processing",
    total: 199.98,
    items: [
      {
        id: "4",
        name: "Winter Jacket",
        image:
          "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400",
        price: 199.98,
        quantity: 1,
        size: "L",
        color: "Navy",
      },
    ],
  },
];

export const ProfilePage: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "settings">(
    "profile"
  );
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<UserProfile>({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
    country: "",
  });

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

  const handleSaveProfile = () => {
    updateUser({
      firstName: profileData.firstName,
      lastName: profileData.lastName,
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setProfileData({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: "",
      address: "",
      city: "",
      zipCode: "",
      country: "",
    });
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

  const totalSpent = mockPurchaseHistory
    .filter((order) => order.status === "delivered")
    .reduce((sum, order) => sum + order.total, 0);

  const totalOrders = mockPurchaseHistory.length;

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
                          className="flex items-center bg-green-600 hover:bg-green-700">
                          <HiCheck className="mr-2 h-4 w-4" />
                          Save
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
                        Address
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.address}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              address: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold"
                          placeholder="Add address"
                        />
                      ) : (
                        <div className="flex items-center px-3 py-2 bg-gray-50 rounded-lg">
                          <HiLocationMarker className="mr-2 h-5 w-5 text-gray-400" />
                          {profileData.address || "Not provided"}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Statistics */}
                  <div className="mt-8 pt-8 border-t border-gray-200/50">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Account Summary
                    </h3>
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
                          {totalOrders}
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
                          ${totalSpent.toFixed(2)}
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
                        <div className="text-3xl font-black mb-2">0</div>
                        <div className="text-sm font-semibold text-white/90">
                          Wishlist Items
                        </div>
                      </motion.div>
                    </div>
                  </div>
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

                  <div className="space-y-6">
                    {mockPurchaseHistory.map((order) => (
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

                  {mockPurchaseHistory.length === 0 && (
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
