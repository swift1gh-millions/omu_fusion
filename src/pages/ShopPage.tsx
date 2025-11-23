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
import toast from "react-hot-toast";
import { Button } from "../components/ui/Button";
import { GlassCard } from "../components/ui/GlassCard";
import { OptimizedImage } from "../components/ui/OptimizedImage";
import { PageBackground } from "../components/ui/PageBackground";
import { LazyLoadWrapper } from "../components/ui/LazyLoadWrapper";
import { ProductModal } from "../components/ui/ProductModal";
import { PerformanceMonitor } from "../components/ui/PerformanceMonitor";
import { Seo } from "../components/ui/Seo";
import { useLoadTime } from "../hooks/useLoadTime";
import {
  ProductsLoader,
  ModernProductsLoader,
} from "../components/ui/ProductsLoader";
import {
  EnhancedProductService,
  ProductFilter,
} from "../utils/enhancedProductService";
import { Product } from "../utils/databaseSchema";
import ProductDebugService from "../utils/productDebugService";
import ProductPreloader from "../utils/productPreloader";
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
  stock: number; // Ensure stock is included
  originalPrice?: number;
  isNew?: boolean;
  isOnSale?: boolean;
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
      if (isAddedToCart || isAddingToCart || product.stock === 0) return;

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

    const isOutOfStock = product.stock === 0;

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
              className="absolute top-2 sm:top-3 right-2 sm:right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-110 z-10 cursor-pointer"
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

            <div className="mb-3">
              <p className="text-gray-600 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                {product.description || "No description available"}
              </p>
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
                variant={isOutOfStock ? "secondary" : "primary"}
                size="sm"
                disabled={isAddingToCart || isAddedToCart || isOutOfStock}
                className={`opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 text-xs sm:text-sm touch-manipulation shadow-lg hover:shadow-xl transform hover:scale-105 min-w-[80px] ${
                  isOutOfStock
                    ? "bg-gray-400 hover:bg-gray-400 cursor-not-allowed opacity-50"
                    : isAddedToCart
                    ? "bg-green-600 hover:bg-green-700 cursor-default"
                    : isAddingToCart
                    ? "bg-accent-gold/70 cursor-wait"
                    : ""
                }`}
                onClick={handleAddToCart}>
                {isOutOfStock ? (
                  <span className="text-xs sm:text-sm">Out of Stock</span>
                ) : isAddingToCart ? (
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
  const [priceRange, setPriceRange] = useState({ min: 0, max: 999999 });
  const [isLoading, setIsLoading] = useState(true);
  const [focusedProduct, setFocusedProduct] = useState<string | null>(
    searchParams.get("product")
  );

  // Load time tracking
  const loadTime = useLoadTime();

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
    // Only return products from the same category (excluding current product)
    const sameCategoryProducts = products.filter(
      (p) =>
        p.id !== currentProduct.id && p.category === currentProduct.category
    );

    // If there are no other products in the same category, return empty array
    if (sameCategoryProducts.length === 0) {
      return [];
    }

    // Function to calculate text similarity for ranking within same category
    const calculateTextSimilarity = (text1: string, text2: string): number => {
      const words1 = text1.toLowerCase().split(/\s+/);
      const words2 = text2.toLowerCase().split(/\s+/);
      const commonWords = words1.filter(
        (word) => words2.includes(word) && word.length > 2
      );
      return commonWords.length / Math.max(words1.length, words2.length);
    };

    // Score products within the same category for better ranking
    const scoredProducts = sameCategoryProducts.map((p) => {
      let score = 0;

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

      // Price range similarity (minor factor)
      const priceDiff = Math.abs(p.price - currentProduct.price);
      if (priceDiff <= 20) score += 2;
      else if (priceDiff <= 50) score += 1;

      return { product: p, score };
    });

    // Sort by score and return up to 4 products
    return scoredProducts
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map((item) => item.product);
  };

  // Load products with optimized preloading
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const startTime = performance.now();
        setIsLoading(true);
        console.log("Loading products...");

        // Check if preloader is ready for instant loading
        if (ProductPreloader.isReady()) {
          console.log("⚡ Using preloaded products for instant load");
        }

        // Use preloader service for optimized loading
        const productsResponse = await ProductPreloader.getProducts();

        console.log("Raw products fetched:", productsResponse.products.length);
        console.log(
          "Products data:",
          productsResponse.products.map((p) => ({
            id: p.id,
            name: p.name,
            category: p.category,
            isActive: p.isActive,
            hasImages: p.images?.length > 0,
          }))
        );

        // Filter active products client-side - be more permissive
        const activeProducts = productsResponse.products.filter(
          (product) =>
            product.isActive === true || product.isActive === undefined // Include products that are true or undefined
        );

        console.log("Active products after filtering:", activeProducts.length);

        // Convert products to shop display format - handle missing images gracefully
        const shopProducts: ShopProduct[] = activeProducts
          .filter((product) => {
            const hasValidImage =
              product.images &&
              product.images.length > 0 &&
              product.images[0].trim() !== "";
            if (!hasValidImage) {
              console.warn("Product missing images:", product.name, product.id);
            }
            return hasValidImage; // Only include products with valid images
          })
          .map((product) => ({
            ...product,
            id: product.id || "",
            image: product.images[0], // Use first image as primary
            rating: 4.5 + Math.random() * 0.5, // Generate rating 4.5-5.0
            reviews: Math.floor(Math.random() * 200) + 50, // Generate 50-250 reviews
            // Status badges now controlled by admin through product.status field
          }));

        console.log("Final shop products:", shopProducts.length);

        const loadEndTime = performance.now();
        const totalLoadTime = loadEndTime - startTime;

        console.log(`📊 Products loaded in ${totalLoadTime.toFixed(2)}ms`);

        if ((productsResponse as any).fromCache) {
          console.log("🚀 Loaded from cache - Super fast!");
        } else {
          console.log("🌐 Loaded from network - First time load");
        }
        ProductDebugService.debugProductDisplay(
          shopProducts.map((p) => ({
            id: p.id,
            name: p.name,
            category: p.category,
            price: p.price,
            stock: p.stock,
            isActive: true, // We only show active products
            hasImages: Boolean(p.image && p.image.trim() !== ""),
            imageCount: p.images?.length || 0,
          }))
        );
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

        // Set dynamic price range based on actual product prices
        if (shopProducts.length > 0) {
          const prices = shopProducts.map((p) => p.price);
          const maxPrice = Math.max(...prices);
          // No artificial limits - use actual max price + buffer for user filtering
          const bufferMax = Math.ceil(maxPrice * 1.2); // Add 20% buffer
          setPriceRange((prev) => ({
            min: 0,
            max: Math.max(bufferMax, prev.max),
          }));
        }
      } catch (error) {
        console.error("Failed to load products:", error);
        ProductDebugService.log("Shop Page Product Load Failed", {
          error: error instanceof Error ? error.message : "Unknown error",
        });
        // Show user-friendly error message
        toast.error("Failed to load products. Please refresh the page.");
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

    // Only attempt to open product modal if products are loaded and URL has product ID
    if (urlProduct && products.length > 0) {
      // Auto-open product modal for the specified product
      const product = products.find((p) => p.id === urlProduct);
      if (product && (!selectedProduct || selectedProduct.id !== urlProduct)) {
        setFocusedProduct(urlProduct);
        setSelectedProduct(product);
        setIsModalOpen(true);
      }

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
  }, [searchParams, products]); // Added products as dependency

  // Enhanced search function with fuzzy matching and relevance scoring
  const searchProducts = useCallback(
    (products: ShopProduct[], searchTerm: string) => {
      if (!searchTerm.trim()) return products;

      const normalizeText = (text: string): string => {
        return text
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "") // Remove accents
          .replace(/[^\w\s]/g, " ") // Replace special chars with spaces
          .replace(/\s+/g, " ") // Normalize whitespace
          .trim();
      };

      const normalizedSearchTerm = normalizeText(searchTerm);
      const searchWords = normalizedSearchTerm
        .split(" ")
        .filter((word) => word.length > 0);

      const scoredProducts = products.map((product) => {
        let score = 0;
        const normalizedName = normalizeText(product.name || "");
        const normalizedCategory = normalizeText(product.category || "");
        const normalizedDescription = normalizeText(product.description || "");

        // Combine all searchable text
        const allText = `${normalizedName} ${normalizedCategory} ${normalizedDescription}`;

        searchWords.forEach((word) => {
          // Exact match in name (highest score)
          if (normalizedName.includes(word)) {
            if (normalizedName.startsWith(word)) {
              score += 100; // Name starts with search term
            } else if (
              normalizedName
                .split(" ")
                .some((nameWord) => nameWord.startsWith(word))
            ) {
              score += 80; // Word in name starts with search term
            } else {
              score += 60; // Word appears anywhere in name
            }
          }

          // Enhanced Category match with singular/plural handling
          const checkCategoryMatch = (
            category: string,
            searchWord: string
          ): number => {
            let categoryScore = 0;

            // Direct match
            if (category.includes(searchWord)) {
              if (category.startsWith(searchWord) || searchWord === category) {
                categoryScore += 100; // Perfect match
              } else {
                categoryScore += 60; // Partial match
              }
            }

            // Handle singular/plural variations
            const singularWord =
              searchWord.endsWith("s") && searchWord.length > 3
                ? searchWord.slice(0, -1)
                : searchWord;
            const pluralWord = !searchWord.endsWith("s")
              ? searchWord + "s"
              : searchWord;

            if (
              category.includes(singularWord) ||
              category.includes(pluralWord)
            ) {
              categoryScore += 80; // Singular/plural match
            }

            // Common category aliases
            const categoryAliases: { [key: string]: string[] } = {
              jacket: ["jackets", "coat", "coats", "outerwear"],
              jackets: ["jacket", "coat", "coats", "outerwear"],
              tshirt: ["t-shirts", "tee", "shirt", "top"],
              "t-shirts": ["tshirt", "tee", "shirt", "top"],
              jean: ["jeans", "denim", "pants"],
              jeans: ["jean", "denim", "pants"],
              pant: ["pants", "trousers"],
              pants: ["pant", "trousers"],
            };

            if (categoryAliases[searchWord]) {
              for (const alias of categoryAliases[searchWord]) {
                if (category.includes(alias)) {
                  categoryScore += 70; // Alias match
                  break;
                }
              }
            }

            return categoryScore;
          };

          score += checkCategoryMatch(normalizedCategory, word);

          // Description match (medium score)
          if (normalizedDescription.includes(word)) {
            const descriptionWords = normalizedDescription.split(" ");
            const wordMatches = descriptionWords.filter((descWord) =>
              descWord.includes(word)
            ).length;
            score += wordMatches * 10; // Multiple matches in description increase score
          }

          // Fuzzy matching for typos (lower score)
          const fuzzyMatch = (text: string, searchWord: string): number => {
            if (searchWord.length < 3) return 0; // Skip fuzzy for short words

            const words = text.split(" ");
            return words.reduce((acc, word) => {
              if (word.length > 0 && searchWord.length > 0) {
                const similarity = calculateSimilarity(word, searchWord);
                if (similarity > 0.7) {
                  // 70% similarity threshold
                  acc += similarity * 5;
                }
              }
              return acc;
            }, 0);
          };

          score += fuzzyMatch(allText, word);
        });

        // Bonus for multiple word matches
        const allWordsMatch = searchWords.every((word) =>
          allText.includes(word)
        );
        if (allWordsMatch && searchWords.length > 1) {
          score += 20;
        }

        return { product, score };
      });

      // Filter products with score > 0 and sort by score
      return scoredProducts
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((item) => item.product);
    },
    []
  );

  // Helper function for fuzzy string matching
  const calculateSimilarity = (str1: string, str2: string): number => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  };

  // Levenshtein distance calculation for fuzzy matching
  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = Array(str2.length + 1)
      .fill(null)
      .map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }

    return matrix[str2.length][str1.length];
  };

  // Debounce search term for better performance
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);

  // Memoized filtered and sorted products
  const filteredProducts = useMemo(() => {
    let filtered = [...products]; // Create a new array to avoid mutations

    // Filter by category first
    if (selectedCategory !== "All") {
      filtered = filtered.filter(
        (product) => product.category === selectedCategory
      );
    }

    // Apply advanced search if there's a search term
    if (debouncedSearchTerm.trim()) {
      filtered = searchProducts(filtered, debouncedSearchTerm);
    }

    // Filter by price range
    filtered = filtered.filter(
      (product) =>
        product.price >= priceRange.min && product.price <= priceRange.max
    );

    // Sort products (only if not already sorted by search relevance)
    if (!debouncedSearchTerm.trim()) {
      const sorted = [...filtered].sort((a, b) => {
        switch (sortBy) {
          case "price-low":
            return a.price - b.price;
          case "price-high":
            return b.price - a.price;
          case "newest":
            // Sort by creation date (newest first)
            const aDate = a.createdAt?.toDate
              ? a.createdAt.toDate()
              : new Date(
                  (a.createdAt as any)?.seconds
                    ? (a.createdAt as any).seconds * 1000
                    : 0
                );
            const bDate = b.createdAt?.toDate
              ? b.createdAt.toDate()
              : new Date(
                  (b.createdAt as any)?.seconds
                    ? (b.createdAt as any).seconds * 1000
                    : 0
                );
            return bDate.getTime() - aDate.getTime();
          default:
            return a.name.localeCompare(b.name);
        }
      });
      return sorted;
    }

    return filtered;
  }, [
    products,
    selectedCategory,
    debouncedSearchTerm,
    sortBy,
    priceRange,
    searchProducts,
  ]);

  // Memoized event handlers
  const handleCategoryChange = useCallback(
    (category: string) => {
      setSelectedCategory(category);
      // Update URL parameters
      const newParams = new URLSearchParams();
      if (category !== "All") newParams.set("category", category);
      if (searchTerm.trim()) newParams.set("search", searchTerm);
      setSearchParams(newParams);
    },
    [searchTerm, setSearchParams]
  );

  const handleSortChange = useCallback((value: string) => {
    setSortBy(value);
  }, []);

  // Handle search term changes with URL sync
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchTerm(value);
      // Update URL parameters
      const newParams = new URLSearchParams();
      if (selectedCategory !== "All")
        newParams.set("category", selectedCategory);
      if (value.trim()) newParams.set("search", value);
      setSearchParams(newParams);
    },
    [selectedCategory, setSearchParams]
  );

  const handleViewModeChange = useCallback((mode: "grid" | "list") => {
    setViewMode(mode);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSelectedCategory("All");
    setSearchTerm("");
    // Reset to dynamic range based on current products
    if (products.length > 0) {
      const prices = products.map((p) => p.price);
      const maxPrice = Math.max(...prices);
      const bufferMax = Math.ceil(maxPrice * 1.2);
      setPriceRange({ min: 0, max: bufferMax });
    } else {
      setPriceRange({ min: 0, max: 999999 });
    }
    // Clear URL search parameters
    setSearchParams({});
  }, [setSearchParams, products]);

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
    <>
      <Seo
        title="Shop | OMU FUSION – Premium Fashion Store"
        description="Browse OMU FUSION's latest outfits, dresses, streetwear and accessories. Discover premium fashion with secure checkout and fast delivery across Nigeria."
        keywords="OMU FUSION shop, buy fashion online, Nigerian clothing store, premium outfits, dresses, streetwear, accessories"
      />
      <div
        className="scrollbar-animated min-h-screen relative bg-gradient-to-br from-gray-50 to-gray-100"
        style={{
          backgroundImage: `url(${white3})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
        }}>
        {/* Light overlay */}
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px]"></div>
        <div className="relative z-10 min-h-screen pt-20 pb-12 sm:pb-16">
          <div className="max-w-7xl mx-auto px-4 pt-4 pb-12 sm:px-6 lg:px-8">
            {/* Filters*/}
            <motion.div
              className="mb-6 sm:mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}>
              <GlassCard className="p-4 sm:p-6">
                <div className="flex flex-col space-y-4">
                  <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:gap-4 lg:items-center lg:justify-between">
                    {/* Categories */}
                    <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                      {categories.map((category) => (
                        <button
                          key={category}
                          onClick={() => handleCategoryChange(category)}
                          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 touch-manipulation shadow-md hover:shadow-lg cursor-pointer ${
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
                        className="px-3 sm:px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-accent-gold focus:border-accent-gold text-xs sm:text-sm text-gray-800 font-semibold bg-white shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer">
                        <option value="name">Sort by Name</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="newest">Newest First</option>
                      </select>

                      <div className="flex border-2 border-gray-200 rounded-lg overflow-hidden shadow-md">
                        <button
                          onClick={() => handleViewModeChange("grid")}
                          className={`p-2 touch-manipulation transition-all duration-300 cursor-pointer ${
                            viewMode === "grid"
                              ? "bg-accent-gold text-black border-r border-accent-gold"
                              : "bg-white text-gray-800 hover:bg-accent-gold hover:text-black border-r border-gray-200"
                          }`}>
                          <HiViewGrid className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                        <button
                          onClick={() => handleViewModeChange("list")}
                          className={`p-2 touch-manipulation transition-all duration-300 cursor-pointer ${
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
              /* Enhanced Empty State */
              <motion.div
                className="text-center py-16 px-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}>
                <div className="max-w-md mx-auto">
                  <div className="mb-6">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <HiSearch className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No products found
                    </h3>
                    <p className="text-gray-500">
                      {debouncedSearchTerm
                        ? `No products match "${debouncedSearchTerm}". Try searching for something else or check the spelling.`
                        : "Refresh the page."}
                    </p>
                  </div>

                  {debouncedSearchTerm && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-900 mb-2">
                        Search Tips:
                      </h4>
                      <ul className="text-sm text-blue-800 space-y-1 text-left">
                        <li>• Try different keywords or synonyms</li>
                        <li>• Check your spelling</li>
                        <li>
                          • Use broader terms (e.g., "shirt" instead of "graphic
                          tee")
                        </li>
                        <li>
                          • Search by category, brand, or product features
                        </li>
                      </ul>
                    </div>
                  )}

                  <div className="space-y-3">
                    <Button
                      variant="primary"
                      className="w-full sm:w-auto"
                      onClick={handleClearFilters}>
                      Clear All Filters
                    </Button>
                    {debouncedSearchTerm && (
                      <Button
                        variant="outline"
                        className="w-full sm:w-auto sm:ml-3"
                        onClick={() => handleSearchChange("")}>
                        Clear Search
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Performance Monitor */}
        <PerformanceMonitor />

        {/* Product Modal */}
        <ProductModal
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          similarProducts={
            selectedProduct ? getSimilarProducts(selectedProduct) : []
          }
          onProductSelect={(product) => {
            setSelectedProduct(product);
            // Keep modal open to show the new product
          }}
        />
      </div>
    </>
  );
};

ShopPage.displayName = "ShopPage";
