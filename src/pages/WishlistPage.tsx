import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  HiHeart,
  HiShoppingCart,
  HiTrash,
  HiX,
  HiShoppingBag,
} from "react-icons/hi";
import { useAuth, useCart } from "../context/EnhancedAppContext";
import { WishlistService, WishlistItem } from "../utils/wishlistService";
import { EnhancedProductService } from "../utils/enhancedProductService";
import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import { Seo } from "../components/ui/Seo";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { toast } from "react-hot-toast";

interface WishlistPageProps {}

export const WishlistPage: React.FC<WishlistPageProps> = () => {
  const { user, isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadWishlist();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.id]);

  const loadWishlist = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const wishlist = await WishlistService.getUserWishlist(user.id);
      setWishlistItems(wishlist?.items || []);
    } catch (error) {
      console.error("Error loading wishlist:", error);
      toast.error("Failed to load wishlist");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    if (!user?.id) return;

    try {
      setIsRemoving(productId);
      await WishlistService.removeFromWishlist(user.id, productId);
      setWishlistItems((prev) =>
        prev.filter((item) => item.productId !== productId)
      );
      toast.success("Removed from wishlist");
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast.error("Failed to remove from wishlist");
    } finally {
      setIsRemoving(null);
    }
  };

  const handleAddToCart = async (item: WishlistItem) => {
    try {
      // Get full product details
      const product = await EnhancedProductService.getProductById(
        item.productId
      );
      if (product) {
        await addToCart({
          id: parseInt(product.id || "0"),
          name: product.name,
          price: product.price,
          image: product.images?.[0] || item.productImage, // Use first image or fallback to wishlist item image
          productId: product.id || "",
        });
        toast.success("Added to cart");
      } else {
        toast.error("Product not found");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart");
    }
  };

  const handleClearWishlist = async () => {
    if (!user?.id || wishlistItems.length === 0) return;

    try {
      await WishlistService.clearWishlist(user.id);
      setWishlistItems([]);
      toast.success("Wishlist cleared");
    } catch (error) {
      console.error("Error clearing wishlist:", error);
      toast.error("Failed to clear wishlist");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto text-center">
            <GlassCard className="p-8">
              <HiHeart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Sign in to view your wishlist
              </h2>
              <p className="text-gray-600 mb-6">
                Save your favorite items for later by signing in to your
                account.
              </p>
              <div className="space-y-3">
                <Link to="/signin">
                  <Button variant="primary" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="outline" className="w-full">
                    Create Account
                  </Button>
                </Link>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <p className="text-gray-600">Loading your wishlist...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Seo
        title="Wishlist | OMU FUSION"
        description="View your saved items on OMU FUSION. Keep track of your favorite fashion pieces and shop them later."
      />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <HiHeart className="w-8 h-8 text-red-500" />
              </motion.div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                My Wishlist
              </h1>
              <p className="text-lg text-gray-600">
                {wishlistItems.length}{" "}
                {wishlistItems.length === 1 ? "item" : "items"} saved for later
              </p>
            </div>

            {/* Empty State */}
            {wishlistItems.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="max-w-md mx-auto text-center">
                <GlassCard className="p-12">
                  <HiHeart className="w-16 h-16 text-gray-400 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Your wishlist is empty
                  </h3>
                  <p className="text-gray-600 mb-8">
                    Start adding items you love to your wishlist and find them
                    here later.
                  </p>
                  <Link to="/shop">
                    <Button
                      variant="primary"
                      size="lg"
                      icon={<HiShoppingBag className="w-5 h-5" />}>
                      Start Shopping
                    </Button>
                  </Link>
                </GlassCard>
              </motion.div>
            )}

            {/* Wishlist Items */}
            {wishlistItems.length > 0 && (
              <>
                {/* Clear All Button */}
                <div className="flex justify-between items-center mb-8">
                  <div></div>
                  <Button
                    variant="outline"
                    onClick={handleClearWishlist}
                    className="text-red-600 border-red-300 hover:bg-red-50">
                    <HiTrash className="w-4 h-4 mr-2" />
                    Clear All
                  </Button>
                </div>

                {/* Items Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence>
                    {wishlistItems.map((item, index) => (
                      <motion.div
                        key={item.productId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.1 }}
                        layout>
                        <GlassCard className="relative group hover:shadow-xl transition-all duration-300">
                          {/* Remove Button */}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() =>
                              handleRemoveFromWishlist(item.productId)
                            }
                            disabled={isRemoving === item.productId}
                            className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200 shadow-md">
                            {isRemoving === item.productId ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              <HiX className="w-4 h-4" />
                            )}
                          </motion.button>

                          {/* Product Image */}
                          <div className="aspect-square overflow-hidden rounded-t-2xl bg-gray-100">
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.currentTarget.src =
                                  "/api/placeholder/300/300";
                              }}
                            />
                          </div>

                          {/* Product Info */}
                          <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                              {item.productName}
                            </h3>
                            <p className="text-2xl font-bold text-accent-gold mb-4">
                              ₵{item.price.toFixed(2)}
                            </p>

                            {/* Action Buttons */}
                            <div className="space-y-3">
                              <Button
                                variant="primary"
                                className="w-full"
                                onClick={() => handleAddToCart(item)}
                                icon={<HiShoppingCart className="w-4 h-4" />}>
                                Add to Cart
                              </Button>
                              <Link
                                to={`/shop?product=${item.productId}`}
                                className="block">
                                <Button variant="outline" className="w-full">
                                  View Details
                                </Button>
                              </Link>
                            </div>

                            {/* Added Date */}
                            <p className="text-xs text-gray-500 mt-4 text-center">
                              Added{" "}
                              {item.addedAt?.toDate?.()?.toLocaleDateString() ||
                                "recently"}
                            </p>
                          </div>
                        </GlassCard>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Continue Shopping */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-center mt-12">
                  <Link to="/shop">
                    <Button
                      variant="outline"
                      size="lg"
                      icon={<HiShoppingBag className="w-5 h-5" />}>
                      Continue Shopping
                    </Button>
                  </Link>
                </motion.div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
};
