import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import img2 from "../../assets/img2.webp";

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
      productName = "ELEVATING YOUR DRIP",
      productDescription = "Street style meets premium quality in this fire collection. From bold patterns to fresh cuts, every piece is designed to make you stand out. Level up your wardrobe with pieces that speak your language.",

      productImage = img2,
      productAlt = "Elevating Your Drip - Premium streetwear fashion",
    }) => {
      const navigate = useNavigate();

      const handleShopNowClick = React.useCallback(() => {
        // Navigate to shop page
        navigate("/shop");
      }, [navigate]);

      return (
        <motion.section className="py-12 sm:py-16 lg:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
            <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
              {/* Text Content */}
              <div className="space-y-6 sm:space-y-8 text-center lg:text-left">
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3 sm:mb-4 block">
                    STREET STYLE
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
              </div>
            </div>
          </div>
        </motion.section>
      );
    }
  );

ProductSpotlightSection.displayName = "ProductSpotlightSection";
