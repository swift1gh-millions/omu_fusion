import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { EnhancedProductService } from "../../utils/enhancedProductService";
import { OptimizedImage } from "../ui/OptimizedImage";

interface NewArrival {
  id: string;
  image: string;
}

export const NewArrivalsSection: React.FC = () => {
  const navigate = useNavigate();
  const [newArrivals, setNewArrivals] = useState<NewArrival[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadNewArrivals = async () => {
      try {
        setIsLoading(true);

        // Fetch the latest 3 products from database
        const response = await EnhancedProductService.getProducts(
          { isActive: true },
          { field: "createdAt", direction: "desc" },
          { pageSize: 3 }
        );

        const arrivals: NewArrival[] = response.products.map((product) => ({
          id: product.id || "",
          image: product.images && product.images[0] ? product.images[0] : "",
        }));

        setNewArrivals(arrivals);
      } catch (error) {
        console.error("Error loading new arrivals:", error);
        // Fallback data
        setNewArrivals([
          {
            id: "sample-1",
            image:
              "https://images.unsplash.com/photo-1556821840-3a63f95609a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          },
          {
            id: "sample-2",
            image:
              "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          },
          {
            id: "sample-3",
            image:
              "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadNewArrivals();
  }, []);

  const handleViewAll = () => {
    navigate("/shop?filter=new");
  };

  const handleProductClick = (productId: string) => {
    navigate(`/shop?product=${productId}`);
  };

  return (
    <section className="relative py-16 bg-gradient-to-br from-zinc-800 via-zinc-900 to-black rounded-3xl overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent-gold/3 to-transparent"></div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8">
        {/* Compact Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-wide">
            NEW ARRIVALS
          </h2>

          <p className="text-gray-400 text-sm sm:text-base max-w-xl mx-auto">
            Discover the freshest drops in our collection.{" "}
            <span className="text-accent-gold">Just landed.</span>
          </p>
        </motion.div>

        {/* Compact Product Showcase */}
        {!isLoading && newArrivals.length > 0 && (
          <motion.div
            className="flex justify-center items-center gap-4 sm:gap-6 mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}>
            {newArrivals.map((arrival, index) => (
              <motion.div
                key={arrival.id}
                className="group cursor-pointer"
                initial={{
                  opacity: 0,
                  scale: 0.9,
                  y: 20,
                }}
                whileInView={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.5,
                  delay: 0.4 + index * 0.1,
                  type: "spring",
                  stiffness: 120,
                }}
                whileHover={{
                  scale: 1.05,
                  y: -4,
                  transition: { duration: 0.2 },
                }}
                onClick={() => handleProductClick(arrival.id)}
                viewport={{ once: true }}>
                {/* Clean Product Image */}
                <div
                  className={`
                  relative overflow-hidden rounded-2xl
                  ${
                    index === 1
                      ? "w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28"
                      : "w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24"
                  }
                  shadow-xl shadow-black/30
                  border border-white/10
                  group-hover:border-accent-gold/40
                  transition-all duration-300
                  bg-white/5
                `}>
                  <OptimizedImage
                    src={arrival.image}
                    alt="New arrival"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                  />

                  {/* Subtle hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Compact Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center gap-4 sm:gap-6 mb-10">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`
                  ${
                    i === 1
                      ? "w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28"
                      : "w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24"
                  }
                  rounded-2xl bg-white/10 animate-pulse
                  border border-white/10
                `}
              />
            ))}
          </div>
        )}

        {/* Compact CTA Button */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          viewport={{ once: true }}>
          <motion.button
            className="group relative px-6 py-3 text-white font-medium overflow-hidden rounded-xl border border-accent-gold/30 bg-accent-gold/10 backdrop-blur-sm text-sm"
            onClick={handleViewAll}
            whileHover={{
              scale: 1.02,
              boxShadow: "0 10px 25px rgba(251, 191, 36, 0.2)",
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}>
            <span className="relative z-10 flex items-center gap-2">
              <span>EXPLORE ALL NEW DROPS</span>
              <motion.svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                whileHover={{ x: 3 }}
                transition={{ duration: 0.2 }}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </motion.svg>
            </span>

            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-accent-gold/20 to-accent-gold/40"
              initial={{ x: "-100%" }}
              whileHover={{ x: "0%" }}
              transition={{ duration: 0.3 }}
            />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};
