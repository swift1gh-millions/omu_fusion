import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import coreVisionImage from "../../assets/core_vision.webp";

export const CollectionsGridSection: React.FC = () => {
  const navigate = useNavigate();

  const handleCollectionClick = (collectionId: number, buttonText: string) => {
    // Navigate to shop page with collection filter
    navigate("/shop", {
      state: { collection: collectionId, filter: buttonText },
    });
  };

  const collections = [
    {
      id: 1,
      title: "OMU FUSION Beanie Flex",
      image: coreVisionImage,
      buttonText: "EXPLORE",
    },
    {
      id: 2,
      title: "OMU FUSION Cap",
      subtitle: "Limited Edition",
      image:
        "https://plus.unsplash.com/premium_photo-1758742058529-6fb2fda160cf?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      buttonText: "SHOP NOW",
    },
    {
      id: 3,
      title: "Limited Two-Piece Jacket",
      image:
        "https://images.unsplash.com/photo-1542596768-5d1d21f1cf98?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      buttonText: "DISCOVER",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {collections.map((collection, index) => (
            <motion.div
              key={collection.id}
              className="group relative overflow-hidden rounded-2xl aspect-[4/5] sm:aspect-[3/4] lg:aspect-[4/5] bg-gray-100 hover-lift"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}>
              <img
                src={collection.image}
                alt={collection.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  {collection.subtitle && (
                    <span className="text-xs font-medium tracking-widest mb-2 block opacity-80">
                      {collection.subtitle}
                    </span>
                  )}
                  <h3 className="text-2xl font-black mb-4 leading-tight">
                    {collection.title}
                  </h3>
                  <motion.button
                    className="liquid-glass text-black px-8 py-3 text-xs font-medium tracking-widest opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-100 rounded-full modern-button"
                    onClick={() =>
                      handleCollectionClick(
                        collection.id,
                        collection.buttonText
                      )
                    }
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}>
                    {collection.buttonText} →
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
