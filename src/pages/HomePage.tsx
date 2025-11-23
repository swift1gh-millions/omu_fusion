import React, { memo, useEffect } from "react";
import { HeroSection } from "../components/sections/HeroSection";
import { ProductSpotlightSection } from "../components/sections/ProductSpotlightSection";
import { NewArrivalsSection } from "../components/sections/NewArrivalsSection";
import { CollectionsGridSection } from "../components/sections/CollectionsGridSection";
import { FeaturedProductsSection } from "../components/sections/FeaturedProductsSection";
import { ModernCategoriesSection } from "../components/sections/ModernCategoriesSection";
import { BrandStorySection } from "../components/sections/BrandStorySection";
import { LazyLoadWrapper } from "../components/ui/LazyLoadWrapper";
import { useScrollAnimation } from "../components/ui/ScrollAnimation";
import ProductPreloader from "../utils/productPreloader";

export const HomePage: React.FC = memo(() => {
  // Initialize scroll animations
  useScrollAnimation();

  // Start background product preloading after homepage loads
  useEffect(() => {
    const timer = setTimeout(() => {
      ProductPreloader.startBackgroundPreload();
    }, 1500); // Start preloading 1.5s after homepage loads

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen">
      <section id="home">
        <HeroSection />
      </section>

      <LazyLoadWrapper>
        <ProductSpotlightSection />
      </LazyLoadWrapper>

      <LazyLoadWrapper>
        <NewArrivalsSection />
      </LazyLoadWrapper>

      <section id="collections">
        <LazyLoadWrapper>
          <CollectionsGridSection />
        </LazyLoadWrapper>
      </section>

      <LazyLoadWrapper>
        <FeaturedProductsSection />
      </LazyLoadWrapper>

      <LazyLoadWrapper>
        <ModernCategoriesSection />
      </LazyLoadWrapper>
    </div>
  );
});

HomePage.displayName = "HomePage";
