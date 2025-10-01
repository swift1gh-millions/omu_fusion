import React from "react";
import { GlassCard } from "../ui/GlassCard";
import { Button } from "../ui/Button";

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
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black">
      <div className="max-w-7xl mx-auto">
        {/* Must Have Section */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white">
              MUST HAVE HOODIES
            </h2>
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-black"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {mustHaveProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </div>

        {/* Popular Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
              POPULAR HOODIES - STAY AHEAD
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Stay cozy & stylish with this street-ready oversized fit, perfect
              for effortless layering.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
      <div className="relative bg-white bg-opacity-5 backdrop-blur-sm rounded-2xl overflow-hidden mb-4 aspect-[4/5] hover:bg-opacity-10 transition-all duration-300">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Badge */}
        {product.badge && (
          <div className="absolute top-3 left-3 bg-accent-gold text-black text-xs font-bold px-2 py-1 rounded">
            {product.badge}
          </div>
        )}

        {/* Quick View Button */}
        <div className="absolute top-3 right-3 w-8 h-8 bg-white bg-opacity-20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <svg
            className="w-4 h-4 text-white"
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

        {/* Price Tag */}
        <div className="absolute bottom-3 left-3 bg-black text-white text-sm font-semibold px-3 py-1 rounded-full">
          ₵{product.price}
        </div>
      </div>

      {/* Product Info */}
      <div className="space-y-2">
        <h3 className="text-white font-semibold text-lg group-hover:text-accent-gold transition-colors duration-300">
          {product.name}
        </h3>

        {/* Color Options */}
        {product.colors && (
          <div className="flex space-x-2">
            {product.colors.map((color, idx) => (
              <div
                key={idx}
                className="w-4 h-4 rounded-full border border-white border-opacity-20"
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
      <div className="bg-white bg-opacity-5 backdrop-blur-sm rounded-2xl p-6 hover:bg-opacity-10 transition-all duration-300">
        <div className="aspect-square mb-4 overflow-hidden rounded-xl">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        <div className="space-y-3">
          <h3 className="text-white font-semibold text-xl">{product.name}</h3>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-accent-gold font-bold text-2xl">
                ₵{product.price}
              </span>
              {product.originalPrice && (
                <span className="text-gray-500 line-through text-lg">
                  ₵{product.originalPrice}
                </span>
              )}
            </div>

            {product.isTrending && (
              <div className="bg-accent-gold text-black text-xs font-bold px-2 py-1 rounded">
                TRENDING
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
