import React from "react";
import { GlassCard } from "../ui/GlassCard";
import { Button } from "../ui/Button";
import { OptimizedImage } from "../ui/OptimizedImage";
import { useNavigate } from "react-router-dom";
import { useCart, CartItem } from "../../context/AppContext";

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  images: string[];
  badge?: string;
  isTrending?: boolean;
  category: string;
}

export const FeaturedProductsSection: React.FC = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const mustHaveProducts: Product[] = [
    {
      id: "1",
      name: "Premium Hoodie",
      price: 129,
      images: [
        "https://images.unsplash.com/photo-1556821840-3a63f95609a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1583743814966-8936f37f4082?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      ],
      badge: "MUST HAVE",
      category: "Hoodies",
    },
    {
      id: "2",
      name: "Classic Denim Jeans",
      price: 125,
      images: [
        "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      ],
      badge: "LIMITED",
      category: "Jeans",
    },
    {
      id: "3",
      name: "Essential Cotton T-Shirt",
      price: 99,
      images: [
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1583743814966-8936f37f4082?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1571945153237-4929e783af4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      ],
      badge: "NEW",
      category: "T-Shirts",
    },
    {
      id: "4",
      name: "Snapback Baseball Cap",
      price: 59,
      images: [
        "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1614252234630-a41b1a1bdab1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      ],
      badge: "SALE",
      category: "Caps",
    },
  ];

  const popularProducts: Product[] = [
    {
      id: "5",
      name: "Street Essential Tee",
      price: 45,
      images: [
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1571945153237-4929e783af4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      ],
      isTrending: true,
      category: "T-Shirts",
    },
    {
      id: "6",
      name: "Urban Cargo Pants",
      price: 89,
      images: [
        "https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      ],
      isTrending: true,
      category: "Pants",
    },
    {
      id: "7",
      name: "Premium Denim Jacket",
      price: 149,
      originalPrice: 199,
      images: [
        "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      ],
      isTrending: true,
      category: "Jackets",
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-700 rounded-t-3xl">
      <div className="max-w-7xl mx-auto">
        {/* Must Have Section */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white">
              MUST HAVES
            </h2>
            <button
              onClick={() => navigate("/shop?category=All")}
              className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors duration-200 group">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-black group-hover:translate-x-0.5 transition-transform duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {mustHaveProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
                addToCart={addToCart}
              />
            ))}
          </div>
        </div>

        {/* Popular Section */}
        <div className="mb-20">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4">
              POPULAR HOODIES
            </h2>
            <p className="text-gray-400 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto">
              Stay cozy & stylish with this street-ready oversized fit, perfect
              for effortless layering.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {popularProducts.map((product, index) => (
              <PopularProductCard
                key={product.id}
                product={product}
                index={index}
                addToCart={addToCart}
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
  product: Product;
  index: number;
  addToCart: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
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
    if (isMobile) {
      navigate(`/shop?product=${product.id}`);
    }
  };

  const handleViewProduct = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/shop?product=${product.id}`);
  };
  return (
    <div
      className="group relative animate-fade-in-up cursor-pointer md:cursor-default"
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
      </div>

      {/* Product Info - Optimized for smaller grid */}
      <div className="space-y-1 sm:space-y-2">
        <h3 className="text-white font-semibold text-sm sm:text-base lg:text-lg group-hover:text-accent-gold transition-colors duration-300 line-clamp-2">
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
                className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-200 ${
                  idx === currentImageIndex
                    ? "bg-accent-gold scale-110"
                    : "bg-white bg-opacity-30 hover:bg-opacity-50"
                }`}
              />
            ))}
          </div>
        )}

        {/* Add to Cart Button */}
        <div onClick={(e) => e.stopPropagation()}>
          <Button
            variant="primary"
            size="sm"
            className="w-full text-xs py-2 mt-2"
            onClick={() => {
              addToCart({
                id: parseInt(product.id),
                name: product.name,
                price: product.price,
                image: product.images[0],
              });
            }}>
            Add to Cart
          </Button>
        </div>
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
    if (isMobile) {
      navigate(`/shop?product=${product.id}`);
    }
  };

  return (
    <div
      className="group relative animate-fade-in-up cursor-pointer md:cursor-default"
      style={{ animationDelay: `${index * 0.2}s` }}
      onClick={handleCardClick}>
      <div className="bg-white bg-opacity-5 backdrop-blur-sm rounded-xl p-3 sm:p-4 lg:p-6 hover:bg-opacity-10 transition-all duration-300">
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
        </div>

        <div className="space-y-2 sm:space-y-3">
          <h3 className="text-white font-semibold text-sm sm:text-base lg:text-xl line-clamp-2">
            {product.name}
          </h3>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center space-x-1 sm:space-x-2">
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
              <div className="bg-accent-gold text-black text-[10px] sm:text-xs font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded whitespace-nowrap">
                TRENDING
              </div>
            )}
          </div>

          {/* Add to Cart Button */}
          <div onClick={(e) => e.stopPropagation()}>
            <Button
              variant="primary"
              size="sm"
              className="w-full text-xs py-2 mt-3"
              onClick={() => {
                addToCart({
                  id: parseInt(product.id),
                  name: product.name,
                  price: product.price,
                  image: product.images[0],
                });
              }}>
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
