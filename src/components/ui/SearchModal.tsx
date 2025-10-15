import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiSearch, HiX, HiArrowRight, HiClock } from "react-icons/hi";
import { useSearch } from "../../context/SearchContext";
import { Link } from "react-router-dom";
import { LoadingSpinner } from "../ui/LoadingSpinner";

export const SearchModal: React.FC = () => {
  const {
    isSearchOpen,
    searchTerm,
    searchResults,
    isSearching,
    closeSearch,
    setSearchTerm,
    searchAndNavigate,
    clearSearch,
  } = useSearch();

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeSearch();
      }
    };

    if (isSearchOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isSearchOpen, closeSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      searchAndNavigate(searchTerm);
    }
  };

  const handleProductClick = (productId: number) => {
    closeSearch();
    // Navigate to product detail page (implement as needed)
    console.log("Navigate to product:", productId);
  };

  const recentSearches = [
    "cotton t-shirt",
    "wireless headphones",
    "leather bag",
  ];

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}>
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSearch}
          />

          {/* Search Modal */}
          <motion.div
            className="relative w-full max-w-2xl bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 overflow-hidden"
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.95 }}
            transition={{ duration: 0.3, type: "spring", damping: 25 }}>
            {/* Search Header */}
            <div className="flex items-center gap-4 p-6 border-b border-gray-200/50">
              <div className="relative flex-1">
                <HiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <form onSubmit={handleSubmit}>
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search for products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-transparent border-none outline-none text-lg placeholder-gray-500 text-gray-900"
                    autoComplete="off"
                  />
                </form>
              </div>

              {searchTerm && (
                <motion.button
                  onClick={clearSearch}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}>
                  <HiX className="h-5 w-5" />
                </motion.button>
              )}

              <motion.button
                onClick={closeSearch}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}>
                <HiX className="h-6 w-6" />
              </motion.button>
            </div>

            {/* Search Content */}
            <div className="scrollbar-thin max-h-96 overflow-y-auto">
              {!searchTerm ? (
                /* Recent Searches / Suggestions */
                <div className="p-6">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                    Recent Searches
                  </h3>
                  <div className="space-y-2">
                    {recentSearches.map((term, index) => (
                      <motion.button
                        key={term}
                        onClick={() => setSearchTerm(term)}
                        className="flex items-center gap-3 w-full p-3 text-left hover:bg-gray-100/50 rounded-lg transition-all duration-200 group"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}>
                        <HiClock className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                        <span className="text-gray-700 group-hover:text-gray-900">
                          {term}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              ) : isSearching ? (
                /* Loading State */
                <div className="p-8 flex items-center justify-center">
                  <LoadingSpinner />
                  <span className="ml-3 text-gray-600">Searching...</span>
                </div>
              ) : searchResults.length > 0 ? (
                /* Search Results */
                <div className="p-6">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                    {searchResults.length} Product
                    {searchResults.length !== 1 ? "s" : ""} Found
                  </h3>
                  <div className="space-y-2">
                    {searchResults.map((product, index) => (
                      <motion.button
                        key={product.id}
                        onClick={() => handleProductClick(product.id)}
                        className="flex items-center gap-4 w-full p-3 text-left hover:bg-gray-100/50 rounded-lg transition-all duration-200 group"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}>
                        <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate group-hover:text-accent-gold transition-colors duration-200">
                            {product.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-gray-500">
                              {product.category}
                            </span>
                            <span className="text-sm font-semibold text-gray-900">
                              ₵{product.price.toFixed(2)}
                            </span>
                            {product.isOnSale && product.originalPrice && (
                              <span className="text-xs text-gray-400 line-through">
                                ₵{product.originalPrice.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                        <HiArrowRight className="h-4 w-4 text-gray-400 group-hover:text-accent-gold transition-colors duration-200" />
                      </motion.button>
                    ))}
                  </div>

                  {/* View All Results */}
                  <motion.div
                    className="mt-6 pt-4 border-t border-gray-200/50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}>
                    <button
                      onClick={() => searchAndNavigate(searchTerm)}
                      className="w-full p-4 bg-accent-gold text-black font-semibold rounded-lg hover:bg-accent-gold/90 transition-all duration-300 group">
                      View All Results for "{searchTerm}"
                      <HiArrowRight className="inline-block ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                    </button>
                  </motion.div>
                </div>
              ) : (
                /* No Results */
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <HiSearch className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No products found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Try searching for something else or check the spelling.
                  </p>
                  <Link
                    to="/shop"
                    onClick={closeSearch}
                    className="inline-flex items-center gap-2 text-accent-gold hover:text-accent-gold/80 font-medium transition-colors duration-200">
                    Browse All Products
                    <HiArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
