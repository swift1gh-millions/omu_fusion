import React from "react";
import { motion } from "framer-motion";

export const NewArrivalsSection: React.FC = () => {
  return (
    <section className="py-20 bg-gray-700">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}>
          <motion.h2
            className="text-4xl lg:text-5xl font-black text-white mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}>
            NEW ARRIVALS [698]
          </motion.h2>
          <motion.p
            className="text-lg text-gray-300 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}>
            Discover the latest additions to our curated collection. From
            statement pieces to everyday essentials, each item is carefully
            selected to elevate your wardrobe with contemporary style and
            timeless appeal.
          </motion.p>
        </motion.div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}>
          <motion.button
            className="liquid-glass-dark text-white px-16 py-4 text-sm font-medium tracking-widest transition-all duration-300 modern-button rounded-full"
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.98 }}>
            VIEW ALL
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};
