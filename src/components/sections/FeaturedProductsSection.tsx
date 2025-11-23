import React, { useEffect, useState } from "react";
import { GlassCard } from "../ui/GlassCard";
import { Button } from "../ui/Button";
import { OptimizedImage } from "../ui/OptimizedImage";
import { useNavigate } from "react-router-dom";
import { useCart, CartItem } from "../../context/EnhancedAppContext";
import { EnhancedProductService } from "../../utils/enhancedProductService";
import { Product } from "../../utils/databaseSchema";
import { LoadingSpinner } from "../ui/LoadingSpinner";

// Extended interface for display purposes (includes UI-specific properties)
interface ProductDisplay extends Product {
  badge?: string;
  isTrending?: boolean;
  originalPrice?: number;
}

export const FeaturedProductsSection: React.FC = () => {
  const navigate = useNavigate();
  const { addToCart, cart } = useCart();
  const [popularProducts, setPopularProducts] = useState<ProductDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [randomSeed, setRandomSeed] = useState<number>(Date.now());

  // Seeded random number generator for consistent randomization per session
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  // Fisher-Yates shuffle algorithm with seeded randomization
  const shuffleArray = <T,>(array: T[], seed: number): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const randomValue = seededRandom(seed + i);
      const j = Math.floor(randomValue * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Smart randomization algorithm that considers various factors
  const getRandomizedPopularProducts = (
    products: Product[],
    seed: number
  ): ProductDisplay[] => {
    // Filter active products and add weight scoring
    const weightedProducts = products
      .filter((product) => product.isActive !== false)
      .map((product) => {
        let weight = 1;

        // Increase weight for newer products
        const daysSinceCreation = product.createdAt
          ? (Date.now() - product.createdAt.toDate().getTime()) /
            (1000 * 60 * 60 * 24)
          : 0;
        if (daysSinceCreation < 30) weight += 0.5; // Boost newer products

        // Increase weight for sale items
        if (product.status === "sale") weight += 0.3;

        // Increase weight for featured products
        if (product.featured) weight += 0.2;

        // Add some randomness to prevent same order
        weight += seededRandom(seed + parseInt(product.id || "0")) * 0.4;

        return { product, weight };
      });

    // Sort by weight (descending) and take more than needed
    const sortedByWeight = weightedProducts
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 12) // Take top 12 candidates
      .map((item) => item.product);

    // Apply Fisher-Yates shuffle to the top candidates
    const shuffled = shuffleArray(sortedByWeight, seed);

    // Take final selection and convert to display format
    return shuffled.slice(0, 6).map((product, index) => ({
      ...product,
      isTrending: index < 2, // Mark first 2 as trending
      originalPrice:
        product.status === "sale"
          ? Math.round(product.price * (1.2 + seededRandom(seed + index) * 0.3))
          : undefined,
      badge:
        product.status === "new"
          ? "NEW"
          : product.status === "sale"
          ? "SALE"
          : index === 0 && product.featured
          ? "FEATURED"
          : undefined,
    }));
  };

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);

        // Generate a new random seed for this session
        const sessionSeed = Date.now() + Math.floor(Math.random() * 1000);
        setRandomSeed(sessionSeed);

        // Fetch all active products from database
        const allProductsResponse = await EnhancedProductService.getProducts(
          { isActive: true },
          { field: "createdAt", direction: "desc" },
          { pageSize: 50 } // Fetch more products to have variety for randomization
        );

        if (allProductsResponse.products.length > 0) {
          // Apply smart randomization algorithm
          const randomizedProducts = getRandomizedPopularProducts(
            allProductsResponse.products,
            sessionSeed
          );
          setPopularProducts(randomizedProducts);

          console.log(
            `🎲 Randomized ${randomizedProducts.length} popular products with seed: ${sessionSeed}`
          );
        } else {
          // Fallback to sample data if no products in database
          console.warn("No products found in database, using fallback data");
          setPopularProducts(getFallbackPopularProducts());
        }
      } catch (error) {
        console.error("Error loading products:", error);
        // Fallback to sample data if database fails
        setPopularProducts(getFallbackPopularProducts());
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []); // Only run once per component mount

  // Fallback data in case database is empty or fails
  const getFallbackPopularProducts = (): ProductDisplay[] => [
    {
      id: "sample-1",
      name: "Street Essential Tee",
      description: "Essential street style t-shirt",
      price: 45,
      images: [
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      ],
      isTrending: true,
      category: "T-Shirts",
      stock: 25,
      createdAt: new Date() as any,
      updatedAt: new Date() as any,
      createdBy: "system",
      seo: {},
      tags: [],
    },
    {
      id: "sample-2",
      name: "Classic Denim Jeans",
      description: "Comfortable denim jeans",
      price: 125,
      images: [
        "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      ],
      badge: "LIMITED",
      category: "Jeans",
      stock: 5,
      createdAt: new Date() as any,
      updatedAt: new Date() as any,
      createdBy: "system",
      seo: {},
      tags: [],
    },
    {
      id: "sample-3",
      name: "Essential Cotton T-Shirt",
      description: "Soft cotton t-shirt",
      price: 99,
      images: [
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      ],
      badge: "NEW",
      category: "T-Shirts",
      stock: 20,
      createdAt: new Date() as any,
      updatedAt: new Date() as any,
      createdBy: "system",
      seo: {},
      tags: [],
    },
    {
      id: "sample-4",
      name: "Snapback Baseball Cap",
      description: "Stylish baseball cap",
      price: 59,
      images: [
        "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      ],
      badge: "SALE",
      category: "Caps",
      stock: 15,
      createdAt: new Date() as any,
      updatedAt: new Date() as any,
      createdBy: "system",
      seo: {},
      tags: [],
    },
  ];

  if (isLoading) {
    return (
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-700 rounded-t-3xl">
        <div className="max-w-7xl mx-auto flex justify-center">
          <LoadingSpinner />
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-700 rounded-t-3xl">
      <div className="max-w-7xl mx-auto">
        {/* Popular Section */}
        <div className="mb-20">
          <div className="text-center mb-8 sm:mb-12">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                POPULAR
              </h2>
            </div>
            <p className="text-gray-400 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto">
              Discover curated products selected just for you. Each visit brings
              new surprises!
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {popularProducts.map((product, index) => (
              <PopularProductCard
                key={product.id}
                product={product}
                index={index}
                addToCart={addToCart}
                cart={cart}
              />
            ))}
          </div>
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Button
            variant="glass"
            size="lg"
            className="px-12 py-4 text-base font-medium tracking-wider"
            onClick={() => navigate("/shop")}>
            View All Products
          </Button>
        </div>
      </div>
    </section>
  );
};

interface ProductCardProps {
  product: ProductDisplay;
  index: number;
  addToCart: (
    item: Omit<CartItem, "quantity"> & { quantity?: number }
  ) => Promise<void>;
  cart: any[];
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  index,
  addToCart,
  cart,
}) => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const [isMobile, setIsMobile] = React.useState(false);
  const [isAddingToCart, setIsAddingToCart] = React.useState(false);
  const [isAddedToCart, setIsAddedToCart] = React.useState(false);

  // Check if product is in cart
  React.useEffect(() => {
    const inCart = cart.some(
      (item) =>
        item.productId === product.id ||
        (product.id && item.id === parseInt(product.id))
    );
    setIsAddedToCart(inCart);
  }, [cart, product.id]);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleCardClick = () => {
    if (isMobile) {
      navigate(`/shop?product=${product.id}`);
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAddedToCart || isAddingToCart) return;

    setIsAddingToCart(true);
    try {
      await addToCart({
        id: product.id ? parseInt(product.id) : 0,
        name: product.name,
        price: product.price,
        image: product.images[0],
        productId: product.id || "",
      });
      setIsAddedToCart(true);
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleViewProduct = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/shop?product=${product.id}`);
  };
  return (
    <div
      className="group relative animate-fade-in-up cursor-pointer"
      style={{ animationDelay: `${index * 0.1}s` }}
      onClick={handleCardClick}>
      {/* Product Image */}
      <div className="relative bg-white bg-opacity-5 backdrop-blur-sm rounded-xl overflow-hidden mb-2 sm:mb-3 aspect-[4/5] hover:bg-opacity-10 transition-all duration-300">
        <OptimizedImage
          src={product.images[currentImageIndex]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          fallbackSrc="https://via.placeholder.com/400x500/1a1a1a/ffffff?text=Product+Image"
        />

        {/* Badge - Smaller for mobile */}
        {product.badge && (
          <div className="absolute top-2 left-2 bg-accent-gold text-black text-xs font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-[10px] sm:text-xs">
            {product.badge}
          </div>
        )}

        {/* Quick View Button - Hidden on mobile, shows on desktop hover */}
        <button
          onClick={handleViewProduct}
          className="absolute top-2 right-2 w-6 h-6 sm:w-8 sm:h-8 bg-white bg-opacity-20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 hover:bg-opacity-30">
          <svg
            className="w-3 h-3 sm:w-4 sm:h-4 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </button>

        {/* Price Tag - Smaller and repositioned for mobile */}
        <div className="absolute bottom-2 left-2 bg-black text-white text-xs font-semibold px-2 py-1 rounded-full text-[10px] sm:text-xs">
          ₵{product.price}
        </div>

        {/* Add to Cart Button - Positioned at bottom right */}
        <div
          className="absolute bottom-2 right-2"
          onClick={(e) => e.stopPropagation()}>
          <Button
            variant="primary"
            size="sm"
            className="text-xs py-1.5 px-2 sm:hidden opacity-90 hover:opacity-100 shadow-lg"
            onClick={async () => {
              if (!product.id) return;
              await addToCart({
                id: parseInt(product.id),
                name: product.name,
                price: product.price,
                image: product.images[0],
                productId: product.id,
              });
            }}>
            <svg
              className="w-3 h-3"
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
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="text-xs py-1.5 px-3 hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg"
            onClick={async () => {
              if (!product.id) return;
              await addToCart({
                id: parseInt(product.id),
                name: product.name,
                price: product.price,
                image: product.images[0],
                productId: product.id,
              });
            }}>
            Add
          </Button>
        </div>
      </div>

      {/* Product Info - Optimized for smaller grid */}
      <div className="space-y-2 sm:space-y-2 px-1">
        <h3 className="text-white font-semibold text-sm sm:text-base lg:text-lg group-hover:text-accent-gold transition-colors duration-300 line-clamp-2 leading-tight">
          {product.name}
        </h3>

        {/* Image Navigation Dots */}
        {product.images.length > 1 && (
          <div className="flex space-x-1 sm:space-x-2 mb-2 justify-center">
            {product.images.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(idx);
                }}
                className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-200 touch-manipulation ${
                  idx === currentImageIndex
                    ? "bg-accent-gold scale-110"
                    : "bg-white bg-opacity-30 hover:bg-opacity-50"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const PopularProductCard: React.FC<ProductCardProps> = ({
  product,
  index,
  addToCart,
}) => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleCardClick = () => {
    navigate(`/shop?product=${product.id}`);
  };

  return (
    <div
      className="group relative animate-fade-in-up cursor-pointer"
      style={{ animationDelay: `${index * 0.2}s` }}
      onClick={handleCardClick}>
      <div className="bg-white bg-opacity-5 backdrop-blur-sm rounded-xl p-3 sm:p-4 lg:p-6 hover:bg-opacity-10 transition-all duration-300 relative">
        <div className="aspect-square mb-2 sm:mb-3 lg:mb-4 overflow-hidden rounded-lg relative">
          <OptimizedImage
            src={product.images[currentImageIndex]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            fallbackSrc="https://via.placeholder.com/400x400/1a1a1a/ffffff?text=Product+Image"
          />

          {/* Image Navigation Dots for Popular Products */}
          {product.images.length > 1 && (
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {product.images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(idx);
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    idx === currentImageIndex
                      ? "bg-accent-gold"
                      : "bg-white bg-opacity-50 hover:bg-opacity-75"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Add to Cart Button - Positioned at bottom right of image */}
          <div
            className="absolute bottom-2 right-2"
            onClick={(e) => e.stopPropagation()}>
            <Button
              variant="primary"
              size="sm"
              className="text-xs py-1.5 px-2 sm:hidden opacity-90 hover:opacity-100 shadow-lg"
              onClick={async () => {
                if (!product.id) return;
                await addToCart({
                  id: parseInt(product.id),
                  name: product.name,
                  price: product.price,
                  image: product.images[0],
                  productId: product.id,
                });
              }}>
              <svg
                className="w-3 h-3"
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
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="text-xs py-1.5 px-3 hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg"
              onClick={async () => {
                if (!product.id) return;
                await addToCart({
                  id: parseInt(product.id),
                  name: product.name,
                  price: product.price,
                  image: product.images[0],
                  productId: product.id,
                });
              }}>
              Add
            </Button>
          </div>
        </div>

        <div className="space-y-3 sm:space-y-3">
          <h3 className="text-white font-semibold text-sm sm:text-base lg:text-xl line-clamp-2 leading-tight">
            {product.description}
          </h3>

          {/* Price section - stacked on mobile, inline on larger screens */}
          <div className="space-y-1 sm:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
                <span className="text-accent-gold font-bold text-lg sm:text-xl lg:text-2xl">
                  ₵{product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-gray-500 line-through text-sm sm:text-base lg:text-lg">
                    ₵{product.originalPrice}
                  </span>
                )}
              </div>

              {product.isTrending && (
                <div className="bg-accent-gold text-black text-[10px] sm:text-xs font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded whitespace-nowrap self-start sm:self-center">
                  TRENDING
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
