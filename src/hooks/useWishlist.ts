import { useState, useEffect, useCallback } from "react";
import { WishlistService, WishlistItem } from "../utils/wishlistService";
import { useAuth } from "../context/EnhancedAppContext";
import { toast } from "react-hot-toast";

export interface UseWishlistReturn {
  wishlistItems: string[]; // Array of product IDs
  isInWishlist: (productId: string) => boolean;
  addToWishlist: (product: {
    id: string;
    name: string;
    image: string;
    price: number;
  }) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  toggleWishlist: (product: {
    id: string;
    name: string;
    image: string;
    price: number;
  }) => Promise<void>;
  isLoading: boolean;
  wishlistCount: number;
}

export const useWishlist = (): UseWishlistReturn => {
  const { user, isAuthenticated } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load wishlist when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadWishlist();
    } else {
      setWishlistItems([]);
    }
  }, [isAuthenticated, user?.id]);

  const loadWishlist = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const wishlist = await WishlistService.getUserWishlist(user.id);
      const productIds = wishlist?.items?.map((item) => item.productId) || [];
      setWishlistItems(productIds);
    } catch (error) {
      console.error("Error loading wishlist:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const isInWishlist = useCallback(
    (productId: string): boolean => {
      return wishlistItems.includes(productId);
    },
    [wishlistItems]
  );

  const addToWishlist = async (product: {
    id: string;
    name: string;
    image: string;
    price: number;
  }): Promise<void> => {
    if (!isAuthenticated || !user?.id) {
      toast.error("Please sign in to add items to your wishlist");
      return;
    }

    if (isInWishlist(product.id)) {
      return;
    }

    try {
      const wishlistItem: Omit<WishlistItem, "addedAt"> = {
        productId: product.id,
        productName: product.name,
        productImage: product.image,
        price: product.price,
      };

      await WishlistService.addToWishlist(user.id, wishlistItem);
      setWishlistItems((prev) => [...prev, product.id]);
      toast.success("Added to wishlist");
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      toast.error("Failed to add to wishlist");
    }
  };

  const removeFromWishlist = async (productId: string): Promise<void> => {
    if (!user?.id) return;

    try {
      await WishlistService.removeFromWishlist(user.id, productId);
      setWishlistItems((prev) => prev.filter((id) => id !== productId));
      toast.success("Removed from wishlist");
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast.error("Failed to remove from wishlist");
    }
  };

  const toggleWishlist = async (product: {
    id: string;
    name: string;
    image: string;
    price: number;
  }): Promise<void> => {
    if (isInWishlist(product.id)) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product);
    }
  };

  return {
    wishlistItems,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isLoading,
    wishlistCount: wishlistItems.length,
  };
};
