import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { motion } from "framer-motion";
import {
  HiViewGrid,
  HiViewList,
  HiFilter,
  HiSearch,
  HiHeart,
} from "react-icons/hi";
import { useSearchParams } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { GlassCard } from "../components/ui/GlassCard";
import { OptimizedImage } from "../components/ui/OptimizedImage";
import { PageBackground } from "../components/ui/PageBackground";
import { LazyLoadWrapper } from "../components/ui/LazyLoadWrapper";
import { ProductModal } from "../components/ui/ProductModal";
import {
  ProductsLoader,
  ModernProductsLoader,
} from "../components/ui/ProductsLoader";
import {
  EnhancedProductService,
  ProductFilter,
} from "../utils/enhancedProductService";
import { Product } from "../utils/databaseSchema";
import {
  useDebounce,
  useAnimationVariants,
  useDebouncedValue,
} from "../hooks/usePerformance";
import { useCart } from "../context/EnhancedAppContext";
import { useWishlist } from "../hooks/useWishlist";
import white3 from "../assets/backgrounds/white7.jpg";

// Extend database Product interface for shop display
interface ShopProduct extends Omit<Product, "id"> {
  id: string;
  image: string; // Primary image for display
  originalPrice?: number;
  isNew?: boolean;
  isOnSale?: boolean;
  rating?: number;
  reviews?: number;
}

// Dynamic categories will be generated from actual products
// const categories = [...] - removed hardcoded categories

// Memoized ProductCard component for better performance
const ProductCard = React.memo(
  ({
    product,
    addToCart,
    onProductClick,
    cart,
    isInWishlist,
    toggleWishlist,
  }: {
    product: ShopProduct;
    addToCart: (item: any) => Promise<void>;
    onProductClick: (product: ShopProduct) => void;
    cart: any[];
    isInWishlist: (productId: string) => boolean;
    toggleWishlist: (product: {
      id: string;
      name: string;
      image: string;
      price: number;
    }) => Promise<void>;
  }) => {
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [isAddedToCart, setIsAddedToCart] = useState(false);

    // Check if product is in cart
    useEffect(() => {
      const inCart = cart.some(
        (item) =>
          item.productId === product.id || item.id === parseInt(product.id)
      );
      setIsAddedToCart(inCart);
    }, [cart, product.id]);

    const handleAddToCart = async (e?: React.MouseEvent) => {
      e?.stopPropagation(); // Prevent opening modal if event is provided
      if (isAddedToCart || isAddingToCart) return;

      setIsAddingToCart(true);
      try {
        await addToCart({
          id: parseInt(product.id),
          name: product.name,
          price: product.price,
          image: product.image,
          productId: product.id,
        });
        setIsAddedToCart(true);
      } catch (error) {
        console.error("Error adding to cart:", error);
      } finally {
        setIsAddingToCart(false);
      }
    };

    return (
      <motion.div
        id={`product-${product.id}`}
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }}
        whileHover={{ y: -5 }}
        className="group touch-manipulation cursor-pointer"
        style={{ scrollMarginTop: "100px" }}
        onClick={() => onProductClick(product)}>
        <GlassCard className="overflow-hidden h-full relative">
          <div className="relative">
            <OptimizedImage
              src={product.image}
              alt={product.name}
              className="w-full h-48 sm:h-56 lg:h-64 object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
              width={400}
              height={256}
            />
            {product.status === "new" && (
              <span className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-green-500 text-white px-2 py-1 text-xs font-bold rounded">
                NEW
              </span>
            )}
            {product.status === "sale" && (
              <span className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-red-500 text-white px-2 py-1 text-xs font-bold rounded">
                SALE
              </span>
            )}

            {/* Wishlist Heart Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleWishlist({
                  id: product.id,
                  name: product.name,
                  image: product.image,
                  price: product.price,
                });
              }}
              className="absolute top-2 sm:top-3 right-2 sm:right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-110 z-10"
              style={{
                right: product.status === "sale" ? "60px" : "8px",
                top: "8px",
              }}>
              <HiHeart
                className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-300 ${
                  isInWishlist(product.id)
                    ? "text-red-500 fill-current"
                    : "text-gray-600 hover:text-red-500"
                }`}
              />
            </button>
          </div>
          <div className="p-3 sm:p-4 lg:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 group-hover:text-accent-gold transition-colors duration-300 line-clamp-2 leading-tight">
              {product.name}
            </h3>

            <div className="flex items-center mb-3">
              <div className="flex text-yellow-400">
                {Array.from({ length: 5 }, (_, i) => (
                  <span
                    key={i}
                    className={`text-xs sm:text-sm ${
                      i < Math.floor(product.rating || 0)
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }`}>
                    ★
                  </span>
                ))}
              </div>
              <span className="text-gray-500 text-xs ml-2">
                ({product.reviews || 0})
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-col">
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
              </div>

              {/* Enhanced Add to Cart Button */}
              <Button
                variant="primary"
                size="sm"
                disabled={isAddingToCart || isAddedToCart}
                className={`opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 text-xs sm:text-sm touch-manipulation shadow-lg hover:shadow-xl transform hover:scale-105 min-w-[80px] ${
                  isAddedToCart
                    ? "bg-green-600 hover:bg-green-700 cursor-default"
                    : isAddingToCart
                    ? "bg-accent-gold/70 cursor-wait"
                    : ""
                }`}
                onClick={handleAddToCart}>
                {isAddingToCart ? (
                  <div className="flex items-center justify-center space-x-1">
                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                    <span className="hidden sm:inline text-xs">Adding...</span>
                  </div>
                ) : isAddedToCart ? (
                  <span className="text-xs sm:text-sm">Added ✓</span>
                ) : (
                  <>
                    <span className="hidden sm:inline">Add to Cart</span>
                    <svg
                      className="w-4 h-4 sm:hidden"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </>
                )}
              </Button>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    );
  }
);

ProductCard.displayName = "ProductCard";

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]); // Dynamic categories
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "All"
  );
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [isLoading, setIsLoading] = useState(true);
  const [focusedProduct, setFocusedProduct] = useState<string | null>(
    searchParams.get("product")
  );

  // Hooks
  const { cart, addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  // Product Modal State
  const [selectedProduct, setSelectedProduct] = useState<ShopProduct | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handle product click to open modal
  const handleProductClick = (product: ShopProduct) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  // Get similar products for recommendations
  const getSimilarProducts = (currentProduct: ShopProduct) => {
    // Function to calculate text similarity based on common words
    const calculateTextSimilarity = (text1: string, text2: string): number => {
      const words1 = text1.toLowerCase().split(/\s+/);
      const words2 = text2.toLowerCase().split(/\s+/);
      const commonWords = words1.filter(
        (word) => words2.includes(word) && word.length > 2
      );
      return commonWords.length / Math.max(words1.length, words2.length);
    };

    return products
      .filter((p) => p.id !== currentProduct.id)
      .map((p) => {
        let score = 0;

        // Category match (highest priority)
        if (p.category === currentProduct.category) {
          score += 10;
        }

        // Description similarity
        const descSimilarity = calculateTextSimilarity(
          p.description || "",
          currentProduct.description || ""
        );
        score += descSimilarity * 5;

        // Name similarity
        const nameSimilarity = calculateTextSimilarity(
          p.name || "",
          currentProduct.name || ""
        );
        score += nameSimilarity * 3;

        // Price range similarity (bonus, not primary)
        const priceDiff = Math.abs(p.price - currentProduct.price);
        if (priceDiff <= 20) score += 2;
        else if (priceDiff <= 50) score += 1;

        return { product: p, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map((item) => item.product);
  };

  // Load products from Firestore
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);

        // Use simpler query until indexes are built, then filter client-side
        const productsResponse = await EnhancedProductService.getProducts(
          {}, // No server-side filtering to avoid index requirements
          { field: "name", direction: "asc" } // Use simpler sorting
        );

        // Filter active products client-side
        const activeProducts = productsResponse.products.filter(
          (product) => product.isActive !== false // Include products that are true or undefined
        );

        // Convert products to shop display format
        const shopProducts: ShopProduct[] = activeProducts.map((product) => ({
          ...product,
          id: product.id || "",
          image: product.images && product.images[0] ? product.images[0] : "", // Use first image as primary
          rating: 4.5 + Math.random() * 0.5, // Generate rating 4.5-5.0
          reviews: Math.floor(Math.random() * 200) + 50, // Generate 50-250 reviews
          // Status badges now controlled by admin through product.status field
        }));

        console.log("Products loaded:", shopProducts.length);

        setProducts(shopProducts);

        // Generate dynamic categories from actual products
        const uniqueCategories = new Set<string>();
        shopProducts.forEach((product) => {
          if (product.category) {
            uniqueCategories.add(product.category);
          }
        });

        // Sort categories alphabetically and add "All" at the beginning
        const dynamicCategories = [
          "All",
          ...Array.from(uniqueCategories).sort(),
        ];
        setCategories(dynamicCategories);
      } catch (error) {
        console.error("❌ Failed to load products:", error);
        setProducts([]); // Set empty array on error
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Validate selected category when categories change
  useEffect(() => {
    if (categories.length > 0 && !categories.includes(selectedCategory)) {
      setSelectedCategory("All");
    }
  }, [categories, selectedCategory]);

  // Handle URL parameters for category and product focus
  useEffect(() => {
    const urlCategory = searchParams.get("category");
    const urlProduct = searchParams.get("product");
    const urlSearchTerm = searchParams.get("search");

    if (urlCategory && urlCategory !== selectedCategory) {
      setSelectedCategory(urlCategory);
    }

    if (urlProduct && urlProduct !== focusedProduct) {
      setFocusedProduct(urlProduct);
      // Scroll to product after a short delay to ensure rendering
      setTimeout(() => {
        const productElement = document.getElementById(`product-${urlProduct}`);
        if (productElement) {
          productElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          // Add highlight effect
          productElement.style.boxShadow = "0 0 20px rgba(255, 193, 7, 0.5)";
          setTimeout(() => {
            productElement.style.boxShadow = "";
          }, 2000);
        }
      }, 500);
    }

    if (urlSearchTerm && urlSearchTerm !== searchTerm) {
      setSearchTerm(urlSearchTerm);
    }
  }, [searchParams]);

  // Debounce search term for better performance
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);

  // Memoized filtered and sorted products
  const filteredProducts = useMemo(() => {
    let filtered = [...products]; // Create a new array to avoid mutations

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

    // Filter by price range
    filtered = filtered.filter(
      (product) =>
        product.price >= priceRange.min && product.price <= priceRange.max
    );

    // Sort products
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        case "newest":
          return (b.status === "new" ? 1 : 0) - (a.status === "new" ? 1 : 0);
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return sorted;
  }, [products, selectedCategory, debouncedSearchTerm, sortBy, priceRange]);

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
    setPriceRange({ min: 0, max: 1000 });
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
    <div
      className="scrollbar-animated min-h-screen relative"
      style={{
        backgroundImage: `url(${white3})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}>
      {/* Light overlay */}
      <div className="absolute inset-0 bg-white/20 backdrop-blur-[0.5px]"></div>
      <div className="relative z-10 pt-32 pb-12 sm:pb-16">
        <div className="max-w-7xl mx-auto px-4 pt-4 pb-40 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            className="text-center mb-8 sm:mb-12"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
              Shop Our Collection
            </h1>
          </motion.div>

          {/* Filters*/}
          <motion.div
            className="mb-6 sm:mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}>
            <GlassCard className="p-4 sm:p-6">
              <div className="flex flex-col space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <HiSearch className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent-gold focus:border-transparent text-sm"
                  />
                </div>

                <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:gap-4 lg:items-center lg:justify-between">
                  {/* Categories */}
                  <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => handleCategoryChange(category)}
                        className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 touch-manipulation shadow-md hover:shadow-lg ${
                          selectedCategory === category
                            ? "bg-accent-gold text-black border-2 border-accent-gold shadow-lg"
                            : "bg-white text-gray-800 border-2 border-gray-200 hover:bg-accent-gold hover:text-black hover:border-accent-gold"
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
                      className="px-3 sm:px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-accent-gold focus:border-accent-gold text-xs sm:text-sm text-gray-800 font-semibold bg-white shadow-md hover:shadow-lg transition-all duration-300">
                      <option value="name">Sort by Name</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="rating">Highest Rated</option>
                      <option value="newest">Newest First</option>
                    </select>

                    <div className="flex border-2 border-gray-200 rounded-lg overflow-hidden shadow-md">
                      <button
                        onClick={() => handleViewModeChange("grid")}
                        className={`p-2 touch-manipulation transition-all duration-300 ${
                          viewMode === "grid"
                            ? "bg-accent-gold text-black border-r border-accent-gold"
                            : "bg-white text-gray-800 hover:bg-accent-gold hover:text-black border-r border-gray-200"
                        }`}>
                        <HiViewGrid className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                      <button
                        onClick={() => handleViewModeChange("list")}
                        className={`p-2 touch-manipulation transition-all duration-300 ${
                          viewMode === "list"
                            ? "bg-accent-gold text-black"
                            : "bg-white text-gray-800 hover:bg-accent-gold hover:text-black"
                        }`}>
                        <HiViewList className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Products Grid or Loading State */}
          {isLoading ? (
            <ProductsLoader viewMode={viewMode} />
          ) : filteredProducts.length > 0 ? (
            <motion.div
              key={`products-${selectedCategory}-${filteredProducts.length}`}
              className={`grid gap-4 sm:gap-6 ${
                viewMode === "grid"
                  ? "grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "grid-cols-1"
              }`}
              variants={containerVariants}
              initial="hidden"
              animate="visible">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={`product-${product.id}-${selectedCategory}`}
                  product={product}
                  addToCart={addToCart}
                  onProductClick={handleProductClick}
                  cart={cart}
                  isInWishlist={isInWishlist}
                  toggleWishlist={toggleWishlist}
                />
              ))}
            </motion.div>
          ) : (
            /* Empty State */
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

      {/* Product Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        similarProducts={
          selectedProduct ? getSimilarProducts(selectedProduct) : []
        }
      />
    </div>
  );
};

ShopPage.displayName = "ShopPage";
