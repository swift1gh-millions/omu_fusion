import React from "react";
import { Button } from "../ui/Button";
import { useNavigate } from "react-router-dom";
import { useDarkBackground } from "../../utils/backgroundUtils";

interface CategoryItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  gradient: string;
}

export const ModernCategoriesSection: React.FC = () => {
  const navigate = useNavigate();
  const darkBg = useDarkBackground("ModernCategoriesSection", 0.8);
  const categories: CategoryItem[] = [
    {
      id: "new-arrivals",
      title: "NEW",
      subtitle: "ARRIVAL",
      description:
        "Fresh off the press! Our New Arrivals are packed with the latest trends, colors, and designs to keep you ahead of the curve.",
      image:
        "https://images.unsplash.com/photo-1583743814966-8936f37f4082?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      gradient: "from-blue-600 to-blue-800",
    },
    {
      id: "best-sellers",
      title: "BEST",
      subtitle: "SELLERS",
      description:
        "The hoodies everyone's talking about! These fan favorites are loved for their perfect fit, unmatched comfort, and timeless style.",
      image:
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      gradient: "from-green-600 to-green-800",
    },
    {
      id: "casual-hoodies",
      title: "CASUAL",
      subtitle: "HOODIES",
      description:
        "Daily comfort starts here. Our Casual Hoodie collection is designed for laid-back days and effortless style.",
      image:
        "https://images.unsplash.com/photo-1556821840-3a63f95609a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      gradient: "from-gray-600 to-gray-800",
    },
    {
      id: "all-accessories",
      title: "ALL",
      subtitle: "ACCESSORIES",
      description:
        "Elevate your active lifestyle with our collection of gadgets, stylish bags, and durable watches to complete your performance-ready look!",
      image:
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      gradient: "from-orange-600 to-red-600",
    },
  ];

  return (
    <section
      className={`py-20 px-4 sm:px-6 lg:px-8 ${darkBg.className}`}
      style={darkBg.style}>
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-display text-5xl md:text-6xl font-bold text-white mb-4">
            SHOP BY CATEGORIES
          </h2>
        </div>

        {/* Categories Grid/Carousel */}
        <div className="mb-12">
          {/* Mobile Carousel */}
          <div className="md:hidden">
            <div className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4 px-2 scroll-smooth">
              {categories.map((category, index) => (
                <div
                  key={category.id}
                  className="flex-shrink-0 w-72 snap-center">
                  <CategoryCard category={category} index={index} />
                </div>
              ))}
            </div>
            {/* Scroll indicator */}
            <div className="flex justify-center mt-4 space-x-2">
              {categories.map((_, index) => (
                <div key={index} className="w-2 h-2 rounded-full bg-white/30" />
              ))}
            </div>
          </div>

          {/* Desktop Grid */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <CategoryCard
                key={category.id}
                category={category}
                index={index}
              />
            ))}
          </div>
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Button
            variant="glass"
            size="lg"
            className="px-16 py-4 text-lg font-semibold border-2 border-white border-opacity-20 hover:border-accent-gold"
            onClick={() => navigate("/shop")}>
            View All
            <svg
              className="ml-2 w-5 h-5"
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
          </Button>
        </div>
      </div>
    </section>
  );
};

interface CategoryCardProps {
  category: CategoryItem;
  index: number;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, index }) => {
  const navigate = useNavigate();

  const handleCategoryClick = () => {
    // Navigate to shop with category filter
    switch (category.id) {
      case "new-arrivals":
        navigate("/shop?filter=new");
        break;
      case "best-sellers":
        navigate("/shop?sort=popular");
        break;
      case "casual-hoodies":
        navigate("/shop?category=Hoodies");
        break;
      case "all-accessories":
        navigate("/shop?category=Accessories");
        break;
      default:
        navigate("/shop");
    }
  };

  return (
    <div
      className="group relative h-96 rounded-3xl overflow-hidden cursor-pointer transform transition-all duration-500 hover:scale-105 animate-fade-in-up touch-manipulation"
      style={{ animationDelay: `${index * 0.1}s` }}
      onClick={handleCategoryClick}>
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={category.image}
          alt={category.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {/* Gradient Overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-t ${category.gradient} opacity-60 group-hover:opacity-70 transition-opacity duration-300`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-between p-4 sm:p-6">
        {/* Top Badge - for special categories */}
        {index === 0 && (
          <div className="self-end">
            <div className="bg-accent-gold text-black text-xs font-bold px-3 py-1 rounded-full">
              TRENDING
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="mt-auto space-y-3 sm:space-y-4">
          <div>
            <h3 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-white leading-tight">
              {category.title}
            </h3>
            <h4 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-white leading-tight">
              {category.subtitle}
            </h4>
          </div>

          <p className="text-gray-200 text-sm leading-relaxed opacity-0 md:group-hover:opacity-100 md:transition-opacity md:duration-300 md:transform md:translate-y-2 md:group-hover:translate-y-0 block md:hidden md:group-hover:block">
            {category.description}
          </p>

          {/* CTA Button */}
          <div className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 md:transform md:translate-y-2 md:group-hover:translate-y-0">
            <button
              className="bg-white/30 backdrop-blur-sm text-white font-bold py-2 px-4 sm:px-6 rounded-full hover:bg-accent-gold hover:text-black transition-all duration-300 shadow-lg border border-white/40 text-shadow text-sm sm:text-base"
              onClick={(e) => {
                e.stopPropagation();
                handleCategoryClick();
              }}>
              Explore More
            </button>
          </div>
        </div>

        {/* Decorative Element */}
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 w-8 h-8 sm:w-12 sm:h-12 border-2 border-white border-opacity-30 rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Corner Accent */}
        <div className="absolute bottom-0 right-0 w-12 h-12 sm:w-16 sm:h-16 bg-accent-gold opacity-10 transform rotate-45 translate-x-6 translate-y-6 sm:translate-x-8 sm:translate-y-8 group-hover:opacity-20 transition-opacity duration-300" />
      </div>

      {/* Hover Border Effect */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-accent-gold rounded-3xl transition-colors duration-300" />
    </div>
  );
};
