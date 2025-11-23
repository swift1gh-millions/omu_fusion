import React, { useState, useEffect } from "react";
import { Button } from "../ui/Button";
import { useNavigate } from "react-router-dom";
import { useDarkBackground } from "../../utils/backgroundUtils";
import { CategoryService } from "../../utils/categoryService";
import { EnhancedProductService } from "../../utils/enhancedProductService";

interface CategoryItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  gradient: string;
  itemCount?: number;
}

export const ModernCategoriesSection: React.FC = () => {
  const navigate = useNavigate();
  const darkBg = useDarkBackground("ModernCategoriesSection", 0.8);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const dbCategories = await CategoryService.getActiveCategories();

      // Show ALL categories, not just first 4
      const sortedCategories = dbCategories.sort((a, b) =>
        a.name.localeCompare(b.name)
      );

      // Map database categories to CategoryItem format with product counts
      const categoriesWithCounts = await Promise.all(
        sortedCategories.map(async (cat, index) => {
          try {
            const productsResponse =
              await EnhancedProductService.getProductsByCategory(cat.name);

            return {
              id: cat.name.toLowerCase().replace(/\s+/g, "-"),
              title: getCategoryTitle(cat.name),
              subtitle: getCategorySubtitle(cat.name),
              description: cat.description || getCategoryDescription(cat.name),
              image: getCategoryImage(cat.name),
              gradient: getCategoryGradient(index),
              itemCount: productsResponse.products.length,
            };
          } catch (error) {
            console.error(
              `Error loading products for category ${cat.name}:`,
              error
            );
            return {
              id: cat.name.toLowerCase().replace(/\s+/g, "-"),
              title: getCategoryTitle(cat.name),
              subtitle: getCategorySubtitle(cat.name),
              description: cat.description || getCategoryDescription(cat.name),
              image: getCategoryImage(cat.name),
              gradient: getCategoryGradient(index),
              itemCount: 0,
            };
          }
        })
      );

      // Filter out categories with 0 products
      const categoriesWithProducts = categoriesWithCounts.filter(
        (cat) => cat.itemCount && cat.itemCount > 0
      );

      setCategories(categoriesWithProducts);
    } catch (error) {
      console.error("Error loading categories:", error);
      // Fallback to default categories if database fails
      setCategories(getFallbackCategories());
    } finally {
      setLoading(false);
    }
  };

  const getCategoryTitle = (categoryName: string): string => {
    // Generate appropriate title based on category name
    const nameMap: { [key: string]: string } = {
      Hoodies: "CASUAL",
      "T-Shirts": "PREMIUM",
      Sneakers: "ATHLETIC",
      Accessories: "STYLE",
      Caps: "HEAD",
      Boots: "WINTER",
      Pants: "COMFORT",
      Jackets: "OUTDOOR",
      Shirts: "FORMAL",
    };

    return nameMap[categoryName] || categoryName.split(" ")[0].toUpperCase();
  };

  const getCategorySubtitle = (categoryName: string): string => {
    // Return the exact category name for proper navigation
    return categoryName;
  };

  const getCategoryDescription = (categoryName: string): string => {
    const descriptionMap: { [key: string]: string } = {
      Hoodies:
        "Daily comfort starts here. Our Casual Hoodie collection is designed for laid-back days and effortless style.",
      "T-Shirts":
        "Essential casual wear crafted from premium materials for everyday comfort and timeless style.",
      Sneakers:
        "Step into comfort and style with our premium sneaker collection designed for every occasion.",
      Accessories:
        "Elevate your active lifestyle with our collection of gadgets, stylish bags, and durable accessories!",
      Caps: "Premium headwear collection for style and comfort in every season.",
      Boots:
        "Durable and stylish footwear designed to keep you comfortable in any weather.",
      Pants:
        "Comfortable and versatile pants for every occasion and lifestyle.",
      Jackets:
        "Premium outerwear collection for style, comfort, and protection.",
      Shirts:
        "Professional and casual shirts crafted for modern style and comfort.",
    };

    return (
      descriptionMap[categoryName] ||
      `Discover our premium ${categoryName.toLowerCase()} collection designed for style and comfort.`
    );
  };

  const getCategoryImage = (categoryName: string): string => {
    const imageMap: { [key: string]: string } = {
      Hoodies:
        "https://images.unsplash.com/photo-1556821840-3a63f95609a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "T-Shirts":
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      Sneakers:
        "https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      Accessories:
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      Caps: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      Boots:
        "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      Pants:
        "https://images.unsplash.com/photo-1565084888279-aca607ecce0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      Jackets:
        "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      Shirts:
        "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    };

    return (
      imageMap[categoryName] ||
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    );
  };

  const getCategoryGradient = (index: number): string => {
    const gradients = [
      "from-blue-600 to-blue-800",
      "from-green-600 to-green-800",
      "from-purple-600 to-purple-800",
      "from-orange-600 to-red-600",
      "from-pink-600 to-pink-800",
      "from-indigo-600 to-indigo-800",
      "from-yellow-600 to-yellow-800",
      "from-gray-600 to-gray-800",
    ];

    return gradients[index % gradients.length];
  };

  const getFallbackCategories = (): CategoryItem[] => [
    {
      id: "hoodies",
      title: "CASUAL",
      subtitle: "HOODIES",
      description:
        "Daily comfort starts here. Our Casual Hoodie collection is designed for laid-back days and effortless style.",
      image:
        "https://images.unsplash.com/photo-1556821840-3a63f95609a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      gradient: "from-blue-600 to-blue-800",
    },
    {
      id: "t-shirts",
      title: "PREMIUM",
      subtitle: "T-SHIRTS",
      description:
        "Essential casual wear crafted from premium materials for everyday comfort and timeless style.",
      image:
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      gradient: "from-green-600 to-green-800",
    },
    {
      id: "sneakers",
      title: "ATHLETIC",
      subtitle: "SNEAKERS",
      description:
        "Step into comfort and style with our premium sneaker collection designed for every occasion.",
      image:
        "https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      gradient: "from-purple-600 to-purple-800",
    },
    {
      id: "accessories",
      title: "ALL",
      subtitle: "ACCESSORIES",
      description:
        "Elevate your active lifestyle with our collection of gadgets, stylish bags, and durable accessories!",
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
        {loading ? (
          <div className="mb-12">
            {/* Loading skeleton for mobile */}
            <div className="md:hidden">
              <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 px-2">
                {[...Array(4)].map((_, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 w-72 h-96 rounded-3xl bg-white/10 animate-pulse"
                  />
                ))}
              </div>
            </div>

            {/* Loading skeleton for desktop */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className="h-96 rounded-3xl bg-white/10 animate-pulse"
                />
              ))}
            </div>
          </div>
        ) : (
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
              {categories.length > 1 && (
                <div className="flex justify-center mt-4 space-x-2">
                  {categories.map((_, index) => (
                    <div
                      key={index}
                      className="w-2 h-2 rounded-full bg-white/30"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Desktop Grid */}
            <div
              className="hidden md:grid gap-6"
              style={{
                gridTemplateColumns: `repeat(${Math.min(
                  categories.length,
                  4
                )}, minmax(0, 1fr))`,
                ...(categories.length > 4 && {
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                }),
              }}>
              {categories.map((category, index) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  index={index}
                />
              ))}
            </div>
          </div>
        )}

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
    // Use the actual category name directly from the subtitle
    const categoryName = category.subtitle;
    navigate(`/shop?category=${encodeURIComponent(categoryName)}`);
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
        {/* Top Badge - for categories with most items */}
        {category.itemCount && category.itemCount > 0 && (
          <div className="self-end">
            <div className="bg-accent-gold text-black text-xs font-bold px-3 py-1 rounded-full">
              {category.itemCount > 5 ? "TRENDING" : "NEW"}
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
            {/* Item count display */}
            {category.itemCount !== undefined && (
              <p className="text-accent-gold text-sm font-medium mt-1">
                {category.itemCount} items available
              </p>
            )}
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
