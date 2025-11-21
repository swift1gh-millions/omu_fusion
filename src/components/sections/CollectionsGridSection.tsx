import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import coreVisionImage from "../../assets/core_vision.webp";
import capImage from "../../assets/cap.webp";
import jacketImage from "../../assets/jacket.webp";

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
      title: "Beanie Flex",
      subtitle: "OMU FUSION",
      image: coreVisionImage,
      buttonText: "EXPLORE",
    },
    {
      id: 2,
      title: "Cap",
      subtitle: "OMU FUSION",
      image: capImage,
      buttonText: "SHOP NOW",
    },
    {
      id: 3,
      title: " Two-Piece Jacket",
      subtitle: "Limited Edition",
      image: jacketImage,
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
