import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../components/ui/Button";
import { GlassCard } from "../components/ui/GlassCard";

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pt-32 pb-16">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 pt-4 pb-40">
        <motion.div
          className="text-center py-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}>
          <GlassCard className="p-12">
            {/* 404 Animation */}
            <motion.div
              className="text-8xl lg:text-9xl font-bold text-gray-200 mb-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, type: "spring", stiffness: 100 }}>
              404
            </motion.div>

            {/* Main Message */}
            <motion.h1
              className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}>
              Page Not Found
            </motion.h1>

            <motion.p
              className="text-lg text-gray-600 mb-8 max-w-lg mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}>
              Oops! The page you're looking for doesn't exist. It might have
              been moved, deleted, or you entered the wrong URL.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}>
              <Link to="/">
                <Button variant="primary" size="lg">
                  Go Home
                </Button>
              </Link>
              <Link to="/shop">
                <Button variant="secondary" size="lg">
                  Browse Products
                </Button>
              </Link>
            </motion.div>

            {/* Additional Help */}
            <motion.div
              className="mt-8 pt-8 border-t border-gray-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}>
              <p className="text-sm text-gray-500 mb-4">
                Still can't find what you're looking for?
              </p>
              <Link to="/contact">
                <Button variant="outline" size="sm">
                  Contact Support
                </Button>
              </Link>
            </motion.div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};
