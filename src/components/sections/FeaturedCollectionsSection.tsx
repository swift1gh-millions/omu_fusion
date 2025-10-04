import React from "react";
import { GlassCard } from "../ui/GlassCard";
import { Button } from "../ui/Button";
import { useDarkBackground } from "../../utils/backgroundUtils";

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  isNew?: boolean;
  isBestSeller?: boolean;
  isLimited?: boolean;
  rating: number;
}

export const FeaturedCollectionsSection: React.FC = () => {
  const darkBg = useDarkBackground("FeaturedCollectionsSection", 0.7);
  const featuredProducts: Product[] = [
    // New Arrivals
    {
      id: "1",
      name: "Premium Urban Hoodie",
      price: 89.99,
      image:
        "https://images.unsplash.com/photo-1556821840-3a63f95609a7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      category: "Hoodies",
      isNew: true,
      rating: 4.8,
    },
    {
      id: "2",
      name: "Classic Denim Jacket",
      price: 129.99,
      image:
        "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      category: "Jeans Jacket",
      isNew: true,
      rating: 4.9,
    },
    {
      id: "3",
      name: "Minimalist Tee",
      price: 34.99,
      image:
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      category: "T-Shirts",
      isNew: true,
      rating: 4.7,
    },
    {
      id: "4",
      name: "Premium Snapback Cap",
      price: 24.99,
      image:
        "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      category: "Caps",
      isNew: true,
      rating: 4.6,
    },
    // Best Sellers
    {
      id: "5",
      name: "Signature Beanie",
      price: 29.99,
      image:
        "https://images.unsplash.com/photo-1521369909029-2afed882baee?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      category: "Beanies",
      isBestSeller: true,
      rating: 4.9,
    },
    {
      id: "6",
      name: "Essential Jeans",
      price: 79.99,
      image:
        "https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      category: "Jeans Long",
      isBestSeller: true,
      rating: 4.8,
    },
    {
      id: "7",
      name: "Summer Shorts",
      price: 49.99,
      image:
        "https://images.unsplash.com/photo-1565084888279-aca607ecce0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      category: "Jeans Short",
      isBestSeller: true,
      rating: 4.7,
    },
    {
      id: "8",
      name: "Custom Patch Set",
      price: 14.99,
      image:
        "https://images.unsplash.com/photo-1503341504253-dff4815485f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      category: "Patches",
      isBestSeller: true,
      rating: 4.9,
    },
    // Limited Edition
    {
      id: "9",
      name: "Gold Edition Hoodie",
      price: 199.99,
      originalPrice: 249.99,
      image:
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      category: "Hoodies",
      isLimited: true,
      rating: 5.0,
    },
    {
      id: "10",
      name: "Platinum Denim",
      price: 299.99,
      originalPrice: 349.99,
      image:
        "https://images.unsplash.com/photo-1582552938357-32b906df40cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      category: "Jeans Long",
      isLimited: true,
      rating: 4.9,
    },
  ];

  const newArrivals = featuredProducts.filter((p) => p.isNew);
  const bestSellers = featuredProducts.filter((p) => p.isBestSeller);
  const limitedEdition = featuredProducts.filter((p) => p.isLimited);

  return (
    <section
      className={`py-20 px-4 sm:px-6 lg:px-8 ${darkBg.className}`}
      style={darkBg.style}>
      <div className="max-w-7xl mx-auto space-y-20">
        {/* New Arrivals */}
        <FeaturedCollection
          title="New Arrivals"
          subtitle="Latest additions to our premium collection"
          products={newArrivals}
          badgeColor="accent-gold"
        />

        {/* Best Sellers */}
        <FeaturedCollection
          title="Best Sellers"
          subtitle="Customer favorites that define our brand"
          products={bestSellers}
          badgeColor="green-500"
        />

        {/* Limited Edition */}
        <FeaturedCollection
          title="Limited Edition"
          subtitle="Exclusive pieces for the discerning collector"
          products={limitedEdition}
          badgeColor="purple-500"
          isLimited
        />
      </div>
    </section>
  );
};

interface FeaturedCollectionProps {
  title: string;
  subtitle: string;
  products: Product[];
  badgeColor: string;
  isLimited?: boolean;
}

const FeaturedCollection: React.FC<FeaturedCollectionProps> = ({
  title,
  subtitle,
  products,
  badgeColor,
  isLimited = false,
}) => {
  return (
    <div>
      {/* Section Header */}
      <div className="text-center mb-12">
        <h3 className="font-display text-3xl md:text-5xl font-bold text-white mb-4">
          {title}
        </h3>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto font-body">
          {subtitle}
        </p>
        {isLimited && (
          <div className="mt-4 inline-flex items-center space-x-2 glass px-4 py-2 rounded-full">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-white font-medium">
              Only a few left in stock
            </span>
          </div>
        )}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            badgeColor={badgeColor}
            index={index}
          />
        ))}
      </div>

      {/* View All Button */}
      <div className="text-center">
        <Button variant="glass" size="lg">
          View All {title}
        </Button>
      </div>
    </div>
  );
};

interface ProductCardProps {
  product: Product;
  badgeColor: string;
  index: number;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  badgeColor,
  index,
}) => {
  const [isWishlisted, setIsWishlisted] = React.useState(false);

  return (
    <GlassCard
      hover
      className="group overflow-hidden animate-fade-in-up relative"
      style={{ animationDelay: `${index * 0.1}s` }}>
      {/* Product Image */}
      <div className="relative overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>

        {/* Badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`bg-${badgeColor} text-white px-3 py-1 rounded-full text-xs font-bold`}>
            {product.isNew && "NEW"}
            {product.isBestSeller && "BESTSELLER"}
            {product.isLimited && "LIMITED"}
          </span>
        </div>

        {/* Wishlist Button */}
        <button
          onClick={() => setIsWishlisted(!isWishlisted)}
          className="absolute top-3 right-3 glass rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <svg
            className={`w-5 h-5 ${
              isWishlisted ? "text-red-500 fill-current" : "text-white"
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>

        {/* Quick Add Button - Positioned at bottom right */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <Button
            variant="primary"
            size="sm"
            className="hidden sm:block shadow-lg">
            Quick Add
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="sm:hidden px-2 py-1.5 shadow-lg">
            <svg
              className="w-4 h-4"
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
        </div>
      </div>

      {/* Product Info */}
      <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
        {/* Category */}
        <span className="text-xs text-accent-gold uppercase tracking-wide font-medium">
          {product.category}
        </span>

        {/* Name */}
        <h4 className="font-display text-base sm:text-lg font-semibold text-white group-hover:text-accent-gold transition-colors duration-300 line-clamp-2 leading-tight">
          {product.name}
        </h4>

        {/* Rating */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-3 h-3 sm:w-4 sm:h-4 ${
                  i < Math.floor(product.rating)
                    ? "text-yellow-400"
                    : "text-gray-600"
                }`}
                fill="currentColor"
                viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-xs sm:text-sm text-gray-400">
            ({product.rating})
          </span>
        </div>

        {/* Price - stacked on mobile, inline on larger screens */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
          <span className="text-xl font-bold text-white">₵{product.price}</span>
          {product.originalPrice && (
            <span className="text-sm text-gray-500 line-through">
              ₵{product.originalPrice}
            </span>
          )}
        </div>
      </div>
    </GlassCard>
  );
};
