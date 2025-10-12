import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiX, HiStar, HiHeart, HiShare } from "react-icons/hi";
import { Button } from "./Button";
import { OptimizedImage } from "./OptimizedImage";
import { useCart } from "../../context/EnhancedAppContext";

interface ProductModalProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
  similarProducts?: any[];
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  isOpen,
  onClose,
  similarProducts = [],
}) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const { addToCart, cart } = useCart();

  // Check if product is already in cart
  useEffect(() => {
    if (product) {
      const isInCart = cart.some(
        (item) =>
          item.productId === product.id || item.id === parseInt(product.id)
      );
      setIsAddedToCart(isInCart);
    }
  }, [cart, product]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedImage(0);
      setSelectedSize("");
      setSelectedColor("");
      setQuantity(1);
      setIsAddingToCart(false);
    }
  }, [isOpen]);

  const handleAddToCart = async () => {
    if (isAddedToCart) return;

    setIsAddingToCart(true);
    try {
      await addToCart({
        id: parseInt(product.id),
        name: product.name,
        price: product.price,
        image: product.image || product.images?.[0],
        quantity,
        size: selectedSize,
        color: selectedColor,
        productId: product.id,
      });
      setIsAddedToCart(true);
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (!product) return null;

  const productImages = product.images || [product.image];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal Content */}
          {/* Close Button - Fixed position above modal */}
          <button
            onClick={onClose}
            className="fixed top-4 right-4 z-[60] p-3 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-all duration-200 hover:scale-110">
            <HiX className="w-6 h-6" />
          </button>

          <motion.div
            className="relative bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-8">
              {/* Product Images */}
              <div className="space-y-4">
                <div className="aspect-square overflow-hidden rounded-xl bg-gray-100">
                  <OptimizedImage
                    src={productImages[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    width={500}
                    height={500}
                  />
                </div>

                {productImages.length > 1 && (
                  <div className="flex space-x-2 overflow-x-auto">
                    {productImages.map((image: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors duration-200 ${
                          selectedImage === index
                            ? "border-accent-gold"
                            : "border-gray-200 hover:border-gray-300"
                        }`}>
                        <OptimizedImage
                          src={image}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                          width={64}
                          height={64}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                    {product.name}
                  </h1>

                  {/* Rating */}
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="flex text-yellow-400">
                      {Array.from({ length: 5 }, (_, i) => (
                        <HiStar
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(product.rating || 4.5)
                              ? "fill-current"
                              : "stroke-current fill-transparent"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      ({product.reviews || "126"} reviews)
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center space-x-3 mb-6">
                    <span className="text-3xl font-bold text-gray-900">
                      ₵{product.price}
                    </span>
                    {product.originalPrice && (
                      <span className="text-xl text-gray-500 line-through">
                        ₵{product.originalPrice}
                      </span>
                    )}
                    {product.originalPrice && (
                      <span className="bg-red-100 text-red-800 text-sm font-medium px-2 py-1 rounded">
                        {Math.round(
                          ((product.originalPrice - product.price) /
                            product.originalPrice) *
                            100
                        )}
                        % OFF
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {product.description ||
                      "High-quality product crafted with attention to detail. Perfect for everyday use with premium materials and excellent durability."}
                  </p>
                </div>

                {/* Size Selection */}
                {product.sizes && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Size</h3>
                    <div className="flex space-x-2">
                      {product.sizes.map((size: string) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`px-4 py-2 border rounded-lg transition-colors duration-200 ${
                            selectedSize === size
                              ? "border-accent-gold bg-accent-gold text-black"
                              : "border-gray-300 hover:border-gray-400"
                          }`}>
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Color Selection */}
                {product.colors && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Color</h3>
                    <div className="flex space-x-2">
                      {product.colors.map((color: string) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`px-4 py-2 border rounded-lg transition-colors duration-200 ${
                            selectedColor === color
                              ? "border-accent-gold bg-accent-gold text-black"
                              : "border-gray-300 hover:border-gray-400"
                          }`}>
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Quantity</h3>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors duration-200">
                      -
                    </button>
                    <span className="text-lg font-medium w-8 text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors duration-200">
                      +
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={handleAddToCart}
                    disabled={isAddingToCart || isAddedToCart}
                    className={`w-full py-3 text-lg font-medium transition-all duration-300 ${
                      isAddedToCart
                        ? "bg-green-600 hover:bg-green-700 cursor-default"
                        : "bg-gradient-to-r from-accent-gold to-accent-orange hover:from-accent-orange hover:to-accent-gold"
                    }`}>
                    {isAddingToCart ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Adding...</span>
                      </div>
                    ) : isAddedToCart ? (
                      "Added to Cart"
                    ) : (
                      "Add to Cart"
                    )}
                  </Button>

                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      className="flex-1 py-3 flex items-center justify-center space-x-2">
                      <HiHeart className="w-5 h-5" />
                      <span>Wishlist</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 py-3 flex items-center justify-center space-x-2">
                      <HiShare className="w-5 h-5" />
                      <span>Share</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Similar Products Section */}
            {similarProducts.length > 0 && (
              <div className="border-t border-gray-200 p-6 lg:p-8">
                <h3 className="text-xl font-bold mb-6">Similar Products</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {similarProducts.slice(0, 4).map((similarProduct) => (
                    <div
                      key={similarProduct.id}
                      className="group cursor-pointer"
                      onClick={() => {
                        setSelectedImage(0);
                        // You can implement opening this product in the modal here
                      }}>
                      <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-2">
                        <OptimizedImage
                          src={
                            similarProduct.image || similarProduct.images?.[0]
                          }
                          alt={similarProduct.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          width={200}
                          height={200}
                        />
                      </div>
                      <h4 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-accent-gold transition-colors duration-200">
                        {similarProduct.name}
                      </h4>
                      <p className="text-sm font-bold text-gray-700 mt-1">
                        ₵{similarProduct.price}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
