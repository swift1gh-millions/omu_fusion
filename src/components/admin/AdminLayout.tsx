import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AppContext";
import {
  Home,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Plus,
  Menu,
  X,
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/admin/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navigation = [
    { name: "Dashboard", href: "/admin/dashboard", icon: Home },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Add Product", href: "/admin/products/add", icon: Plus },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-slate-800/95 to-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 shadow-lg">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200">
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center ml-3">
              <img
                src="/logo_white.png"
                alt="OMU Fusion"
                className="h-8 w-auto"
              />
              <span className="ml-2 text-lg font-semibold text-white">
                Admin
              </span>
            </div>
          </div>
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
              <span className="text-xs font-bold text-white">
                {user?.firstName?.charAt(0) || "A"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-slate-800/95 to-slate-900/95 backdrop-blur-xl border-r border-slate-700/50 shadow-2xl transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-700/50 px-6">
            <div className="flex items-center">
              <img
                src="/logo_white.png"
                alt="OMU Fusion"
                className="h-8 w-auto"
              />
              <span className="ml-2 text-xl font-semibold text-white">
                Admin
              </span>
            </div>
            <button
              onClick={closeSidebar}
              className="lg:hidden p-2 text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={closeSidebar}
                  className={`${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
                      : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                  } group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 mx-2`}>
                  <item.icon
                    className={`${
                      isActive
                        ? "text-white"
                        : "text-slate-400 group-hover:text-slate-200"
                    } mr-3 h-5 w-5 transition-colors flex-shrink-0`}
                  />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User info and logout */}
          <div className="border-t border-slate-700/50 p-4">
            <div className="flex items-center mb-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg flex-shrink-0">
                <span className="text-sm font-bold text-white">
                  {user?.firstName?.charAt(0) || "A"}
                </span>
              </div>
              <div className="ml-3 min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-slate-400">Administrator</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200">
              <LogOut className="mr-3 h-4 w-4 flex-shrink-0" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 pt-16 lg:pt-0">
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
};
