import React from "react";
import { GlassCard } from "../ui/GlassCard";
import { Button } from "../ui/Button";
import { OptimizedImage } from "../ui/OptimizedImage";

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  colors?: string[];
  badge?: string;
  isTrending?: boolean;
}

export const FeaturedProductsSection: React.FC = () => {
  const mustHaveProducts: Product[] = [
    {
      id: "1",
      name: "Premium Oversized Hoodie",
      price: 129,
      image:
        "https://images.unsplash.com/photo-1556821840-3a63f95609a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      colors: ["#000000", "#ffffff", "#808080"],
      badge: "MUST HAVE",
    },
    {
      id: "2",
      name: "Chain Up Hoodie",
      price: 125,
      image:
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      colors: ["#0066ff", "#000000", "#ffffff"],
      badge: "LIMITED",
    },
    {
      id: "3",
      name: "Pullover Solid Hoodie",
      price: 99,
      image:
        "https://images.unsplash.com/photo-1583743814966-8936f37f4082?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      colors: ["#ff6600", "#000000", "#ffffff"],
      badge: "NEW",
    },
    {
      id: "4",
      name: "Jacket Hoodie",
      price: 59,
      image:
        "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      colors: ["#003366", "#000000"],
      badge: "SALE",
    },
  ];

  const popularProducts: Product[] = [
    {
      id: "5",
      name: "Street Essential Tee",
      price: 45,
      image:
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      isTrending: true,
    },
    {
      id: "6",
      name: "Urban Cargo Pants",
      price: 89,
      image:
        "https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      isTrending: true,
    },
    {
      id: "7",
      name: "Premium Denim Jacket",
      price: 149,
      originalPrice: 199,
      image:
        "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      isTrending: true,
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-700 p-1 rounded-t-3xl">
      <div className="max-w-7xl mx-auto">
        {/* Must Have Section */}
        <div className="mb-20 ">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white">
              MUST HAVE HOODIES
            </h2>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-black"
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
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {mustHaveProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </div>

        {/* Popular Section */}
        <div className="mb-20 ">
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
              />
            ))}
          </div>
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Button variant="glass" size="lg" className="px-12 py-4">
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
}

const ProductCard: React.FC<ProductCardProps> = ({ product, index }) => {
  return (
    <div
      className="group relative animate-fade-in-up"
      style={{ animationDelay: `${index * 0.1}s` }}>
      {/* Product Image */}
      <div className="relative bg-white bg-opacity-5 backdrop-blur-sm rounded-xl overflow-hidden mb-2 sm:mb-3 aspect-[4/5] hover:bg-opacity-10 transition-all duration-300">
        <OptimizedImage
          src={product.image}
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

        {/* Quick View Button - Smaller for mobile */}
        <div className="absolute top-2 right-2 w-6 h-6 sm:w-8 sm:h-8 bg-white bg-opacity-20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
        </div>

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

        {/* Color Options - Smaller for mobile */}
        {product.colors && (
          <div className="flex space-x-1 sm:space-x-2">
            {product.colors.map((color, idx) => (
              <div
                key={idx}
                className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border border-white border-opacity-20"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const PopularProductCard: React.FC<ProductCardProps> = ({ product, index }) => {
  return (
    <div
      className="group relative animate-fade-in-up"
      style={{ animationDelay: `${index * 0.2}s` }}>
      <div className="bg-white bg-opacity-5 backdrop-blur-sm rounded-xl p-3 sm:p-4 lg:p-6 hover:bg-opacity-10 transition-all duration-300">
        <div className="aspect-square mb-2 sm:mb-3 lg:mb-4 overflow-hidden rounded-lg">
          <OptimizedImage
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            fallbackSrc="https://via.placeholder.com/400x400/1a1a1a/ffffff?text=Product+Image"
          />
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
        </div>
      </div>
    </div>
  );
};
