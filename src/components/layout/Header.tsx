import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { HiSearch, HiShoppingBag, HiUser, HiMenu, HiX } from "react-icons/hi";
import { useCart } from "../../context/AppContext";
import { useSearch } from "../../context/SearchContext";
import { SearchModal } from "../ui/SearchModal";

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { cartItemCount, toggleCart } = useCart();
  const { openSearch } = useSearch();

  // Determine if we're on a page with light background
  const isLightBackground =
    ["/shop", "/about", "/contact", "/cart", "/checkout"].includes(
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

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("keydown", handleKeyboard);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("keydown", handleKeyboard);
    };
  }, [openSearch]);

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  // Dynamic classes based on background
  const headerClasses = isLightBackground
    ? "fixed top-0 left-0 right-0 z-50 transition-all duration-500 bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200"
    : "fixed top-0 left-0 right-0 z-50 transition-all duration-500 liquid-glass border-b border-white/10";

  const textClasses = isLightBackground
    ? "text-gray-900 hover:text-accent-gold"
    : "text-white hover:text-accent-gold";

  const activeTextClasses = isLightBackground
    ? "text-accent-gold"
    : "text-accent-gold";

  const logoSrc = isLightBackground
    ? "src/assets/logo_black.png"
    : "src/assets/logo_white.png";

  return (
    <>
      <header className={headerClasses}>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Mobile: Logo on left, menu on right */}
            <div className="lg:hidden flex items-center">
              <Link to="/" className="flex items-center group">
                <motion.img
                  src={logoSrc}
                  alt="OMU FUSION"
                  className="h-8 sm:h-10 w-auto transition-all duration-300 group-hover:scale-110"
                  whileHover={{ rotate: 5 }}
                />
              </Link>
            </div>

            {/* Desktop: Left Navigation */}
            <div className="hidden lg:flex items-center space-x-8 justify-start flex-1">
              {navItems.slice(0, 2).map((item) => (
                <motion.div key={item.name}>
                  <Link
                    to={item.href}
                    className={`${textClasses} font-medium text-sm tracking-wider transition-all duration-300 relative group ${
                      location.pathname === item.href ? activeTextClasses : ""
                    }`}>
                    {item.name}
                    <span
                      className={`absolute -bottom-1 left-0 h-0.5 bg-accent-gold transition-all duration-300 group-hover:w-full ${
                        location.pathname === item.href ? "w-full" : "w-0"
                      }`}></span>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Desktop: Center Logo - Perfectly Centered */}
            <motion.div
              className="hidden lg:flex items-center justify-center flex-shrink-0"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}>
              <Link to="/" className="flex items-center group">
                <motion.img
                  src={logoSrc}
                  alt="OMU FUSION"
                  className="h-12 w-auto transition-all duration-300 group-hover:scale-110"
                  whileHover={{ rotate: 5 }}
                />
              </Link>
            </motion.div>

            {/* Desktop: Right Navigation */}
            <div className="hidden lg:flex items-center space-x-8 justify-end flex-1">
              {navItems.slice(2).map((item) => (
                <motion.div key={item.name}>
                  <Link
                    to={item.href}
                    className={`${textClasses} font-medium text-sm tracking-wider transition-all duration-300 relative group ${
                      location.pathname === item.href ? activeTextClasses : ""
                    }`}>
                    {item.name}
                    <span
                      className={`absolute -bottom-1 left-0 h-0.5 bg-accent-gold transition-all duration-300 group-hover:w-full ${
                        location.pathname === item.href ? "w-full" : "w-0"
                      }`}></span>
                  </Link>
                </motion.div>
              ))}

              {/* Action Icons */}
              <motion.div
                className="flex items-center space-x-2 ml-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}>
                <motion.button
                  onClick={openSearch}
                  className={`p-3 ${textClasses} ${
                    isLightBackground
                      ? "hover:bg-gray-100"
                      : "hover:bg-white/10"
                  } transition-all duration-300 rounded-full backdrop-blur-sm`}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Search products">
                  <HiSearch className="h-5 w-5" />
                </motion.button>
                <Link to="/cart">
                  <motion.button
                    className={`p-3 ${textClasses} ${
                      isLightBackground
                        ? "hover:bg-gray-100"
                        : "hover:bg-white/10"
                    } transition-all duration-300 rounded-full relative backdrop-blur-sm`}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}>
                    <HiShoppingBag className="h-5 w-5" />
                    {cartItemCount > 0 && (
                      <motion.span
                        className="absolute -top-1 -right-1 h-5 w-5 bg-accent-gold text-black text-xs rounded-full flex items-center justify-center font-bold shadow-lg"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          delay: 0.8,
                          type: "spring",
                          stiffness: 500,
                        }}>
                        {cartItemCount}
                      </motion.span>
                    )}
                  </motion.button>
                </Link>
                <motion.button
                  className={`p-3 ${textClasses} hover:text-accent-gold hover:bg-white/10 transition-all duration-300 rounded-full backdrop-blur-sm`}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}>
                  <HiUser className="h-5 w-5" />
                </motion.button>
              </motion.div>
            </div>

            {/* Mobile: Action Icons + Menu Button */}
            <div className="lg:hidden flex items-center space-x-2">
              <motion.button
                onClick={openSearch}
                className={`p-2 sm:p-3 ${textClasses} ${
                  isLightBackground ? "hover:bg-gray-100" : "hover:bg-white/10"
                } transition-all duration-300 rounded-full backdrop-blur-sm touch-manipulation`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Search products">
                <HiSearch className="h-5 w-5" />
              </motion.button>
              <Link to="/cart">
                <motion.button
                  className={`p-2 sm:p-3 ${textClasses} ${
                    isLightBackground
                      ? "hover:bg-gray-100"
                      : "hover:bg-white/10"
                  } transition-all duration-300 rounded-full relative backdrop-blur-sm touch-manipulation`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}>
                  <HiShoppingBag className="h-5 w-5" />
                  {cartItemCount > 0 && (
                    <motion.span
                      className="absolute -top-1 -right-1 h-5 w-5 bg-accent-gold text-black text-xs rounded-full flex items-center justify-center font-bold shadow-lg"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        delay: 0.2,
                        type: "spring",
                        stiffness: 500,
                      }}>
                      {cartItemCount}
                    </motion.span>
                  )}
                </motion.button>
              </Link>
              <motion.button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`p-2 sm:p-3 ${textClasses} hover:text-accent-gold hover:bg-white/10 transition-all duration-300 rounded-full backdrop-blur-sm touch-manipulation`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}>
                <motion.div
                  animate={{ rotate: isMobileMenuOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}>
                  {isMobileMenuOpen ? (
                    <HiX className="h-6 w-6" />
                  ) : (
                    <HiMenu className="h-6 w-6" />
                  )}
                </motion.div>
              </motion.button>
            </div>
          </div>
        </nav>
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
          } shadow-2xl`}
          initial={{ x: "100%" }}
          animate={{
            x: isMobileMenuOpen ? 0 : "100%",
          }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}>
          {/* Menu Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/10">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
              <img src={logoSrc} alt="OMU FUSION" className="h-8 w-auto" />
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
                    className={`block py-3 px-4 rounded-lg text-lg font-medium transition-all duration-300 ${
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
                <button
                  className={`w-full flex items-center space-x-3 py-3 px-4 rounded-lg ${textClasses} hover:text-accent-gold hover:bg-gray-100/50 transition-all duration-300`}>
                  <HiUser className="h-5 w-5" />
                  <span>Account</span>
                </button>
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
