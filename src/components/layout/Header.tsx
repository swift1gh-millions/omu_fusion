import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiSearch,
  HiShoppingBag,
  HiUser,
  HiMenu,
  HiX,
  HiLogout,
  HiUserCircle,
  HiHeart,
  HiCog,
} from "react-icons/hi";
import { useCart, useAuth } from "../../context/EnhancedAppContext";
import { useSearch } from "../../context/SearchContext";
import { useWishlist } from "../../hooks/useWishlist";
import { SearchModal } from "../ui/SearchModal";
import { OptimizedImage } from "../ui/OptimizedImage";
import logoBlack from "../../assets/logo_black.png";
import logoWhite from "../../assets/logo_white.png";

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const { cartItemCount, toggleCart } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const { wishlistCount } = useWishlist();
  const { openSearch } = useSearch();

  // Determine if we're on a page with light background
  const isLightBackground =
    ["/shop", "/about", "/contact", "/cart", "/checkout", "/profile"].includes(
      location.pathname
    ) ||
    (location.pathname === "/" && isScrolled);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    const handleKeyboard = (e: KeyboardEvent) => {
      // Open search with Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        openSearch();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      // Only close if clicking outside the user menu container
      const target = e.target as Element;
      if (showUserMenu && !target.closest(".user-menu-container")) {
        setShowUserMenu(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("keydown", handleKeyboard);
    document.addEventListener("click", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("keydown", handleKeyboard);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [openSearch, showUserMenu]);

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  // Dynamic classes based on background - Updated for wider detached style
  const headerClasses =
    "fixed top-4 left-4 right-4 z-50 transition-all duration-500";

  const navContainerClasses = isLightBackground
    ? "bg-white/90 backdrop-blur-xl border border-gray-200/50 shadow-2xl"
    : "bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl";

  const textClasses = isLightBackground
    ? "text-gray-900 hover:text-accent-gold"
    : "text-white hover:text-accent-gold";

  const activeTextClasses = isLightBackground
    ? "text-accent-gold"
    : "text-accent-gold";

  const logoSrc = isLightBackground ? logoBlack : logoWhite;

  return (
    <>
      <header className={headerClasses}>
        {/* Detached Navigation Container */}
        <motion.nav
          className={`${navContainerClasses} rounded-full px-8 py-2 shadow-xl max-w-7xl mx-auto hover:shadow-3xl hover:border-gray-300 transition-all duration-100`}
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.1 }}
          whileHover={{ scale: 1.01 }}>
          <div className="flex items-center justify-between w-full">
            {/* Desktop Navigation - Left Side */}
            <div className="hidden lg:flex items-center space-x-6">
              {navItems.slice(0, 2).map((item) => (
                <motion.div key={item.name}>
                  <Link
                    to={item.href}
                    className={`${textClasses} font-medium text-sm tracking-wider transition-all duration-300 relative group px-4 py-2 rounded-full hover:scale-105 ${
                      location.pathname === item.href ? activeTextClasses : ""
                    }`}>
                    <motion.span
                      whileHover={{ scale: 1.05 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      }}>
                      {item.name}
                    </motion.span>
                    {location.pathname === item.href && (
                      <motion.div
                        className="absolute inset-0 bg-accent-gold/20 rounded-full"
                        layoutId="activeTab"
                        transition={{ duration: 0.3 }}
                      />
                    )}
                    <motion.div
                      className="absolute inset-0 bg-accent-gold/10 rounded-full opacity-0 group-hover:opacity-100"
                      transition={{ duration: 0.2 }}
                    />
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Center Logo - Desktop Only */}
            <motion.div
              className="hidden lg:flex items-center justify-center absolute left-1/2 transform -translate-x-1/2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}>
              <Link to="/" className="flex items-center group">
                <motion.div whileHover={{ rotate: 5, scale: 1.1 }}>
                  <OptimizedImage
                    src={logoSrc}
                    alt="OMU FUSION"
                    className="h-10 lg:h-12 w-auto transition-all duration-300"
                    loading="eager"
                    priority={true}
                    quality={95}
                  />
                </motion.div>
              </Link>
            </motion.div>

            {/* Desktop: Right Navigation + Actions */}
            <div className="hidden lg:flex items-center space-x-6">
              {navItems.slice(2).map((item) => (
                <motion.div key={item.name}>
                  <Link
                    to={item.href}
                    className={`${textClasses} font-medium text-sm tracking-wider transition-all duration-300 relative group px-4 py-2 rounded-full ${
                      location.pathname === item.href ? activeTextClasses : ""
                    }`}>
                    {item.name}
                    {location.pathname === item.href && (
                      <motion.div
                        className="absolute inset-0 bg-accent-gold/10 rounded-full"
                        layoutId="activeTab2"
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </Link>
                </motion.div>
              ))}

              {/* Action Icons */}
              <motion.div
                className="flex items-center space-x-2 ml-6 pl-6 border-l border-gray-300/20"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}>
                <motion.button
                  onClick={openSearch}
                  className={`p-2 ${textClasses} ${
                    isLightBackground
                      ? "hover:bg-gray-100"
                      : "hover:bg-white/10"
                  } transition-all duration-300 rounded-full`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Search products">
                  <HiSearch className="h-5 w-5" />
                </motion.button>
                <Link to="/cart">
                  <motion.button
                    className={`p-2 ${textClasses} ${
                      isLightBackground
                        ? "hover:bg-gray-100"
                        : "hover:bg-white/10"
                    } transition-all duration-300 rounded-full relative`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}>
                    <HiShoppingBag className="h-5 w-5" />
                    {cartItemCount > 0 && (
                      <motion.span
                        className="absolute -top-1 -right-1 h-4 w-4 bg-accent-gold text-black text-xs rounded-full flex items-center justify-center font-bold shadow-lg"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          delay: 0.8,
                          type: "spring",
                          stiffness: 500,
                        }}>
                        {cartItemCount > 9 ? "9+" : cartItemCount}
                      </motion.span>
                    )}
                  </motion.button>
                </Link>

                {/* User Menu */}
                <div className="relative user-menu-container">
                  {isAuthenticated ? (
                    <>
                      <motion.button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className={`p-2 ${textClasses} hover:text-accent-gold ${
                          isLightBackground
                            ? "hover:bg-gray-100"
                            : "hover:bg-white/10"
                        } transition-all duration-300 rounded-full flex items-center space-x-2`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}>
                        {user?.avatar ? (
                          <img
                            src={user.avatar}
                            alt="Profile"
                            className="h-6 w-6 rounded-full object-cover"
                          />
                        ) : (
                          <HiUserCircle className="h-6 w-6" />
                        )}
                      </motion.button>

                      <AnimatePresence>
                        {showUserMenu && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                            <div className="px-4 py-2 border-b border-gray-100">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {user?.firstName} {user?.lastName}
                              </p>
                              <p
                                className="text-sm text-gray-500 truncate max-w-[180px]"
                                title={user?.email}>
                                {user?.email}
                              </p>
                            </div>
                            <Link
                              to="/profile"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200">
                              <HiUser className="mr-3 h-4 w-4" />
                              Profile
                            </Link>
                            <Link
                              to="/profile?tab=orders"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200">
                              <HiShoppingBag className="mr-3 h-4 w-4" />
                              Orders
                            </Link>
                            <Link
                              to="/wishlist"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200">
                              <div className="flex items-center">
                                <HiHeart className="mr-3 h-4 w-4" />
                                Wishlist
                              </div>
                              {wishlistCount > 0 && (
                                <span className="bg-accent-gold text-white text-xs font-medium px-2 py-1 rounded-full">
                                  {wishlistCount}
                                </span>
                              )}
                            </Link>
                            <Link
                              to="/profile?tab=settings"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200">
                              <HiCog className="mr-3 h-4 w-4" />
                              Settings
                            </Link>
                            <div className="border-t border-gray-100 my-1"></div>
                            <button
                              onClick={() => {
                                logout();
                                setShowUserMenu(false);
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200">
                              <HiLogout className="mr-3 h-4 w-4" />
                              Sign Out
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <Link to="/signin">
                      <motion.button
                        className={`p-2 ${textClasses} hover:text-accent-gold ${
                          isLightBackground
                            ? "hover:bg-gray-100"
                            : "hover:bg-white/10"
                        } transition-all duration-300 rounded-full`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}>
                        <HiUser className="h-5 w-5" />
                      </motion.button>
                    </Link>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Mobile: Logo + Action Icons + Menu Button */}
            <div className="lg:hidden flex items-center justify-between w-full">
              {/* Mobile Logo */}
              <Link to="/" className="flex items-center group">
                <motion.img
                  src={logoSrc}
                  alt="OMU FUSION"
                  className="h-12 w-auto transition-all duration-300 group-hover:scale-110"
                  loading="eager"
                  decoding="sync"
                  fetchPriority="high"
                  whileHover={{ rotate: 5 }}
                />
              </Link>

              {/* Mobile Action Icons */}
              <div className="flex items-center space-x-2">
                <motion.button
                  onClick={openSearch}
                  className={`p-2 ${textClasses} ${
                    isLightBackground
                      ? "hover:bg-gray-100"
                      : "hover:bg-white/10"
                  } transition-all duration-300 rounded-full`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Search products">
                  <HiSearch className="h-5 w-5" />
                </motion.button>
                <Link to="/cart">
                  <motion.button
                    className={`p-2 ${textClasses} ${
                      isLightBackground
                        ? "hover:bg-gray-100"
                        : "hover:bg-white/10"
                    } transition-all duration-300 rounded-full relative`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}>
                    <HiShoppingBag className="h-5 w-5" />
                    {cartItemCount > 0 && (
                      <motion.span
                        className="absolute -top-1 -right-1 h-4 w-4 bg-accent-gold text-black text-xs rounded-full flex items-center justify-center font-bold shadow-lg"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          delay: 0.2,
                          type: "spring",
                          stiffness: 500,
                        }}>
                        {cartItemCount > 9 ? "9+" : cartItemCount}
                      </motion.span>
                    )}
                  </motion.button>
                </Link>
                <motion.button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className={`p-2 ${textClasses} hover:text-accent-gold ${
                    isLightBackground
                      ? "hover:bg-gray-100"
                      : "hover:bg-white/10"
                  } transition-all duration-300 rounded-full`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}>
                  <motion.div
                    animate={{ rotate: isMobileMenuOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}>
                    {isMobileMenuOpen ? (
                      <HiX className="h-5 w-5" />
                    ) : (
                      <HiMenu className="h-5 w-5" />
                    )}
                  </motion.div>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.nav>
      </header>

      {/* Mobile Navigation Menu - Full Screen Overlay */}
      <motion.div
        className={`fixed inset-0 z-50 lg:hidden ${
          isMobileMenuOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
        initial={{ opacity: 0 }}
        animate={{
          opacity: isMobileMenuOpen ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}>
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Menu Content */}
        <motion.div
          className={`absolute top-0 right-0 h-full w-80 max-w-[85vw] ${
            isLightBackground
              ? "bg-white/95 backdrop-blur-md border-l border-gray-200"
              : "bg-gray-900/95 backdrop-blur-md border-l border-white/10"
          } shadow-2xl overflow-y-auto`}
          initial={{ x: "100%" }}
          animate={{
            x: isMobileMenuOpen ? 0 : "100%",
          }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}>
          {/* Menu Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/10">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
              <OptimizedImage
                src={logoSrc}
                alt="OMU FUSION"
                className="h-8 w-auto"
                loading="eager"
                priority={true}
                quality={95}
              />
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className={`p-2 ${textClasses} hover:text-accent-gold transition-colors duration-300 rounded-full`}>
              <HiX className="h-6 w-6" />
            </button>
          </div>

          {/* Menu Items */}
          <div className="p-6">
            <div className="space-y-1">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{
                    opacity: isMobileMenuOpen ? 1 : 0,
                    x: isMobileMenuOpen ? 0 : 20,
                  }}
                  transition={{ delay: index * 0.1 + 0.1 }}>
                  <Link
                    to={item.href}
                    className={`flex items-center py-4 px-4 rounded-lg text-lg font-medium transition-all duration-300 min-h-[48px] ${
                      location.pathname === item.href
                        ? "text-accent-gold bg-accent-gold/10"
                        : `${textClasses} hover:text-accent-gold hover:bg-gray-100/50`
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}>
                    {item.name}
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* User Actions */}
            <motion.div
              className="mt-8 pt-6 border-t border-gray-200 dark:border-white/10"
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: isMobileMenuOpen ? 1 : 0,
                y: isMobileMenuOpen ? 0 : 20,
              }}
              transition={{ delay: 0.4 }}>
              <div className="space-y-3">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center space-x-3 py-3 px-4 bg-gray-100/50 rounded-lg">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt="Profile"
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <HiUserCircle className="h-8 w-8 text-gray-400" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                    <Link
                      to="/profile"
                      className={`w-full flex items-center space-x-3 py-3 px-4 rounded-lg ${textClasses} hover:text-accent-gold hover:bg-gray-100/50 transition-all duration-300`}
                      onClick={() => setIsMobileMenuOpen(false)}>
                      <HiUser className="h-5 w-5" />
                      <span>Profile</span>
                    </Link>
                    <Link
                      to="/wishlist"
                      className={`w-full flex items-center justify-between py-3 px-4 rounded-lg ${textClasses} hover:text-accent-gold hover:bg-gray-100/50 transition-all duration-300`}
                      onClick={() => setIsMobileMenuOpen(false)}>
                      <div className="flex items-center space-x-3">
                        <HiHeart className="h-5 w-5" />
                        <span>Wishlist</span>
                      </div>
                      {wishlistCount > 0 && (
                        <span className="bg-accent-gold text-black text-sm font-bold rounded-full h-6 w-6 flex items-center justify-center">
                          {wishlistCount}
                        </span>
                      )}
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-3 py-3 px-4 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-300">
                      <HiLogout className="h-5 w-5" />
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/signin"
                      className={`w-full flex items-center space-x-3 py-3 px-4 rounded-lg ${textClasses} hover:text-accent-gold hover:bg-gray-100/50 transition-all duration-300`}
                      onClick={() => setIsMobileMenuOpen(false)}>
                      <HiUser className="h-5 w-5" />
                      <span>Sign In</span>
                    </Link>
                    <Link
                      to="/signup"
                      className="w-full flex items-center justify-center py-3 px-4 rounded-lg bg-accent-gold text-black font-semibold hover:bg-accent-orange transition-all duration-300"
                      onClick={() => setIsMobileMenuOpen(false)}>
                      <span>Create Account</span>
                    </Link>
                  </>
                )}
                <Link
                  to="/cart"
                  className={`w-full flex items-center justify-between py-3 px-4 rounded-lg ${textClasses} hover:text-accent-gold hover:bg-gray-100/50 transition-all duration-300`}
                  onClick={() => setIsMobileMenuOpen(false)}>
                  <div className="flex items-center space-x-3">
                    <HiShoppingBag className="h-5 w-5" />
                    <span>Shopping Cart</span>
                  </div>
                  {cartItemCount > 0 && (
                    <span className="bg-accent-gold text-black text-sm font-bold rounded-full h-6 w-6 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </Link>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* Search Modal */}
      <SearchModal />
    </>
  );
};
