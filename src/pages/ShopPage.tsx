import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { HiViewGrid, HiViewList, HiFilter, HiSearch } from "react-icons/hi";
import { useSearchParams } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { GlassCard } from "../components/ui/GlassCard";
import { OptimizedImage } from "../components/ui/OptimizedImage";
import { useDebounce } from "../hooks/useOptimizedScroll";

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  isNew?: boolean;
  isOnSale?: boolean;
  rating: number;
  reviews: number;
}

const mockProducts: Product[] = [
  {
    id: 1,
    name: "Premium Cotton T-Shirt",
    price: 49.99,
    originalPrice: 69.99,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
    category: "Apparel",
    isOnSale: true,
    rating: 4.8,
    reviews: 124,
  },
  {
    id: 2,
    name: "Minimalist Watch",
    price: 299.99,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
    category: "Accessories",
    isNew: true,
    rating: 4.9,
    reviews: 89,
  },
  {
    id: 3,
    name: "Wireless Headphones",
    price: 199.99,
    originalPrice: 249.99,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
    category: "Electronics",
    isOnSale: true,
    rating: 4.7,
    reviews: 256,
  },
  {
    id: 4,
    name: "Leather Handbag",
    price: 179.99,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400",
    category: "Accessories",
    rating: 4.6,
    reviews: 73,
  },
  {
    id: 5,
    name: "Eco-Friendly Notebook",
    price: 24.99,
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400",
    category: "Stationery",
    isNew: true,
    rating: 4.5,
    reviews: 41,
  },
  {
    id: 6,
    name: "Smart Fitness Tracker",
    price: 149.99,
    originalPrice: 199.99,
    image: "https://images.unsplash.com/photo-1544117519-31a4b719223d?w=400",
    category: "Electronics",
    isOnSale: true,
    rating: 4.4,
    reviews: 189,
  },
];

const categories = [
  "All",
  "Apparel",
  "Accessories",
  "Electronics",
  "Stationery",
];

// Memoized ProductCard component for better performance
const ProductCard = React.memo(({ product }: { product: Product }) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      whileHover={{ y: -5 }}
      className="group touch-manipulation">
      <GlassCard className="overflow-hidden h-full">
        <div className="relative">
          <OptimizedImage
            src={product.image}
            alt={product.name}
            className="w-full h-48 sm:h-56 lg:h-64 object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
            width={400}
            height={256}
          />
          {product.isNew && (
            <span className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-green-500 text-white px-2 py-1 text-xs font-bold rounded">
              NEW
            </span>
          )}
          {product.isOnSale && (
            <span className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-red-500 text-white px-2 py-1 text-xs font-bold rounded">
              SALE
            </span>
          )}
        </div>
        <div className="p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 group-hover:text-accent-gold transition-colors duration-300 line-clamp-2">
            {product.name}
          </h3>
          <p className="text-gray-600 text-sm mb-3">{product.category}</p>

          <div className="flex items-center mb-3">
            <div className="flex text-yellow-400">
              {Array.from({ length: 5 }, (_, i) => (
                <span
                  key={i}
                  className={`text-sm ${
                    i < Math.floor(product.rating)
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }`}>
                  ★
                </span>
              ))}
            </div>
            <span className="text-gray-500 text-xs sm:text-sm ml-2">
              ({product.reviews})
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl font-bold text-gray-900">
                ₵{product.price}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-gray-500 line-through">
                  ₵{product.originalPrice}
                </span>
              )}
            </div>
            <Button
              variant="primary"
              size="sm"
              className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 text-xs sm:text-sm touch-manipulation">
              Add to Cart
            </Button>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
});

ProductCard.displayName = "ProductCard";

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Update search term from URL parameters
  useEffect(() => {
    const urlSearchTerm = searchParams.get("search");
    if (urlSearchTerm && urlSearchTerm !== searchTerm) {
      setSearchTerm(urlSearchTerm);
    }
  }, [searchParams]);

  // Debounce search term for better performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Memoized filtered and sorted products
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter(
        (product) => product.category === selectedCategory
      );
    }

    // Filter by search term
    if (debouncedSearchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name
            .toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase()) ||
          product.category
            .toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase())
      );
    }

    // Sort products
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "rating":
          return b.rating - a.rating;
        case "newest":
          return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return sorted;
  }, [products, selectedCategory, debouncedSearchTerm, sortBy]);

  // Memoized event handlers
  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  const handleSortChange = useCallback((value: string) => {
    setSortBy(value);
  }, []);

  const handleViewModeChange = useCallback((mode: "grid" | "list") => {
    setViewMode(mode);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSelectedCategory("All");
    setSearchTerm("");
    // Clear URL search parameters
    setSearchParams({});
  }, [setSearchParams]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pt-16 sm:pt-20 pb-12 sm:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-8 sm:mb-12"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
            Shop Our Collection
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            Discover premium products crafted with excellence and designed for
            modern living.
          </p>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          className="mb-6 sm:mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}>
          <GlassCard className="p-4 sm:p-6">
            <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:gap-4 lg:items-center lg:justify-between">
              {/* Search */}
              <div className="relative w-full lg:flex-1 lg:max-w-md">
                <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent-gold focus:border-transparent transition-all duration-300 text-sm sm:text-base"
                />
              </div>

              {/* Categories */}
              <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 touch-manipulation ${
                      selectedCategory === category
                        ? "bg-accent-gold text-black"
                        : "bg-white/80 text-gray-600 hover:bg-accent-gold/20"
                    }`}>
                    {category}
                  </button>
                ))}
              </div>

              {/* Sort and View Options */}
              <div className="flex gap-2 sm:gap-3 items-center justify-center lg:justify-end">
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="px-3 sm:px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent-gold focus:border-transparent text-xs sm:text-sm">
                  <option value="name">Sort by Name</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest First</option>
                </select>

                <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => handleViewModeChange("grid")}
                    className={`p-2 touch-manipulation ${
                      viewMode === "grid"
                        ? "bg-accent-gold text-black"
                        : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}>
                    <HiViewGrid className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                  <button
                    onClick={() => handleViewModeChange("list")}
                    className={`p-2 touch-manipulation ${
                      viewMode === "list"
                        ? "bg-accent-gold text-black"
                        : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}>
                    <HiViewList className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Products Grid */}
        <motion.div
          className={`grid gap-4 sm:gap-6 ${
            viewMode === "grid"
              ? "grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "grid-cols-1"
          }`}
          variants={containerVariants}
          initial="hidden"
          animate="visible">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}>
            <p className="text-xl text-gray-500">
              No products found matching your criteria.
            </p>
            <Button
              variant="primary"
              className="mt-4"
              onClick={handleClearFilters}>
              Clear Filters
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};
