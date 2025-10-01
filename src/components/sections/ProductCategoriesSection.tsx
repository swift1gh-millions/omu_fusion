import React from "react";
import { GlassCard } from "../ui/GlassCard";
import { Button } from "../ui/Button";

interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  itemCount: number;
}

export const ProductCategoriesSection: React.FC = () => {
  const categories: Category[] = [
    {
      id: "beanies",
      name: "Beanies",
      description: "Premium winter accessories for ultimate comfort and style",
      image:
        "https://images.unsplash.com/photo-1521369909029-2afed882baee?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      itemCount: 12,
    },
    {
      id: "caps",
      name: "Caps",
      description: "Premium headwear collection for style and comfort",
      image:
        "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      itemCount: 8,
    },
    {
      id: "tshirts",
      name: "T-Shirts",
      description: "Essential casual wear crafted from premium materials",
      image:
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      itemCount: 24,
    },
    {
      id: "jeans-short",
      name: "Jeans Short",
      description: "Summer denim collection for effortless style",
      image:
        "https://images.unsplash.com/photo-1565084888279-aca607ecce0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      itemCount: 15,
    },
    {
      id: "jeans-long",
      name: "Jeans Long",
      description: "Full-length premium denim for timeless appeal",
      image:
        "https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      itemCount: 18,
    },
    {
      id: "jeans-jacket",
      name: "Jeans Jacket",
      description: "Signature denim outerwear for urban adventures",
      image:
        "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      itemCount: 10,
    },
    {
      id: "patches",
      name: "Patches",
      description: "Unique accessories for personalization and customization",
      image:
        "https://images.unsplash.com/photo-1503341504253-dff4815485f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      itemCount: 32,
    },
    {
      id: "hoodies",
      name: "Hoodies",
      description: "Streetwear essentials for contemporary comfort",
      image:
        "https://images.unsplash.com/photo-1556821840-3a63f95609a7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      itemCount: 16,
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-dark-primary to-dark-secondary">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-6xl font-bold text-gradient mb-6">
            Our Collections
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto font-body leading-relaxed">
            Discover our curated selection of premium fashion and lifestyle
            pieces, each category thoughtfully designed to elevate your personal
            style.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category, index) => (
            <CategoryCard key={category.id} category={category} index={index} />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-16">
          <Button variant="glass" size="lg">
            Explore All Categories
          </Button>
        </div>
      </div>
    </section>
  );
};

interface CategoryCardProps {
  category: Category;
  index: number;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, index }) => {
  return (
    <GlassCard
      hover
      className="group relative overflow-hidden h-96 animate-fade-in-up cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
      style={{ animationDelay: `${index * 0.1}s` }}>
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={category.image}
          alt={category.name}
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent group-hover:from-black/90"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end p-6">
        {/* Item Count Badge */}
        <div className="absolute top-4 right-4">
          <span className="glass px-3 py-1 rounded-full text-sm font-medium text-white">
            {category.itemCount} items
          </span>
        </div>

        {/* Category Info */}
        <div className="space-y-3">
          <h3 className="font-display text-2xl font-bold text-white group-hover:text-accent-gold transition-colors duration-300">
            {category.name}
          </h3>
          <p className="text-gray-300 text-sm font-body leading-relaxed">
            {category.description}
          </p>

          {/* Shop Button */}
          <div className="pt-2">
            <button className="inline-flex items-center space-x-2 text-white hover:text-accent-gold transition-colors duration-300 group-hover:translate-x-2 transform">
              <span className="font-medium">Shop Now</span>
              <svg
                className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Hover Overlay Effect */}
        <div className="absolute inset-0 glass-dark opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
      </div>

      {/* Accent Border */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-accent-gold rounded-3xl transition-colors duration-300"></div>
    </GlassCard>
  );
};
