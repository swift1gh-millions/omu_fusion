import React from "react";
import { HeroSection } from "../components/sections/HeroSection";
import { ProductSpotlightSection } from "../components/sections/ProductSpotlightSection";
import { NewArrivalsSection } from "../components/sections/NewArrivalsSection";
import { CollectionsGridSection } from "../components/sections/CollectionsGridSection";
import { FeaturedProductsSection } from "../components/sections/FeaturedProductsSection";
import { ModernCategoriesSection } from "../components/sections/ModernCategoriesSection";
import { BrandStorySection } from "../components/sections/BrandStorySection";
import { NewsletterSection } from "../components/sections/NewsletterSection";
import { useScrollAnimation } from "../components/ui/ScrollAnimation";

export const HomePage: React.FC = () => {
  // Initialize scroll animations
  useScrollAnimation();

  return (
    <div className="min-h-screen">
      <section id="home">
        <HeroSection />
      </section>
      <ProductSpotlightSection />
      <NewArrivalsSection />
      <section id="collections">
        <CollectionsGridSection />
      </section>
      <FeaturedProductsSection />
      <ModernCategoriesSection />
      <section id="about">
        <BrandStorySection />
      </section>
      <NewsletterSection />
    </div>
  );
};
