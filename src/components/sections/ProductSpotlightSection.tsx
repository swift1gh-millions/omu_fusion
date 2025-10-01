import React from "react";
import { motion } from "framer-motion";

interface ProductSpotlightProps {
  productName?: string;
  productDescription?: string;
  productPrice?: string;
  productImage?: string;
  productAlt?: string;
}

export const ProductSpotlightSection: React.FC<ProductSpotlightProps> =
  React.memo(
    ({
      productName = "CELESTE SLIP DRESS",
      productDescription = "Effortless elegance meets contemporary design in this stunning piece. Crafted from premium materials with attention to every detail, the Celeste Slip Dress embodies modern sophistication.",
      productPrice = "₵149.99",
      productImage = "https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      productAlt = "Celeste Slip Dress - Premium women's fashion",
    }) => {
      const handleShopNowClick = React.useCallback(() => {
        // Add navigation logic here
        console.log(`Navigate to product: ${productName}`);
      }, [productName]);

      return (
        <motion.section className="py-12 sm:py-16 lg:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
            <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
              {/* Text Content */}
              <div className="space-y-6 sm:space-y-8 text-center lg:text-left">
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3 sm:mb-4 block">
                    HIGHLIGHTS
                  </span>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-black leading-tight">
                    {productName}
                  </h2>
                </div>

                <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-prose mx-auto lg:mx-0">
                  {productDescription}
                </p>

                <button
                  onClick={handleShopNowClick}
                  className="liquid-glass-dark text-white px-8 sm:px-12 py-3 sm:py-4 text-sm font-medium tracking-widest hover:bg-gray-800 focus:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-300 modern-button rounded-full touch-manipulation btn-mobile"
                  aria-label={`Shop ${productName}`}>
                  SHOP NOW →
                </button>
              </div>

              {/* Product Image */}
              <div className="relative order-first lg:order-last">
                <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden hover-lift">
                  <img
                    src={productImage}
                    alt={productAlt}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                    decoding="async"
                    width="500"
                    height="500"
                  />
                </div>

                {/* Floating price tag */}
                <div className="absolute -top-2 sm:-top-4 -right-2 sm:-right-4 liquid-glass rounded-full px-4 sm:px-6 py-2 sm:py-3 touch-target">
                  <span
                    className="text-base sm:text-lg font-bold text-black"
                    aria-label={`Price: ${productPrice}`}>
                    {productPrice}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      );
    }
  );

ProductSpotlightSection.displayName = "ProductSpotlightSection";
