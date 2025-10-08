import React, { useState, useEffect } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { useNavigate } from "react-router-dom";
import { EnhancedProductService } from "../../utils/enhancedProductService";
import { CategoryService } from "../../utils/categoryService";
import { useAuth } from "../../context/EnhancedAppContext";
import { Button } from "../../components/ui/Button";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import {
  Upload,
  X,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images: File[];
}

export const ProductUploadPage: React.FC = () => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    price: 0,
    category: "",
    stock: 0,
    images: [],
  });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const categoryNames = await CategoryService.getCategoryNames();
      setCategories(categoryNames);
    } catch (error) {
      console.error("Failed to load categories:", error);
      toast.error("Failed to load categories");
      // Use fallback categories
      setCategories([
        "Sneakers",
        "Pants",
        "Caps",
        "Boots",
        "Hoodies",
        "T-Shirts",
        "Jackets",
        "Sandals",
        "Formal Shoes",
        "Casual Shoes",
        "Athletic Shoes",
        "Accessories",
      ]);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "price" || name === "stock" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 5) {
      setError("Maximum 5 images allowed");
      return;
    }

    setFormData((prev) => ({ ...prev, images: files }));

    // Create preview URLs
    const previewUrls = files.map((file) => URL.createObjectURL(file));
    setImagePreview(previewUrls);
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviews = imagePreview.filter((_, i) => i !== index);

    setFormData((prev) => ({ ...prev, images: newImages }));
    setImagePreview(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setUploading(true);

    try {
      // Validate form
      if (
        !formData.name.trim() ||
        !formData.description.trim() ||
        !formData.category ||
        formData.price <= 0
      ) {
        throw new Error("Please fill in all required fields");
      }

      if (formData.images.length === 0) {
        throw new Error("Please add at least one product image");
      }

      // Validate image files
      const validImageTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      const invalidImages = formData.images.filter(
        (img) => !validImageTypes.includes(img.type)
      );
      if (invalidImages.length > 0) {
        throw new Error(
          "Please upload only valid image files (JPEG, PNG, GIF, WebP)"
        );
      }

      // Check file sizes (10MB each)
      const oversizedImages = formData.images.filter(
        (img) => img.size > 10 * 1024 * 1024
      );
      if (oversizedImages.length > 0) {
        throw new Error(
          "Some images are too large. Please keep images under 10MB each."
        );
      }

      toast.loading("Uploading product images...", { id: "upload" });

      // Upload images using the service
      const imageUrls = await EnhancedProductService.uploadProductImages(
        formData.images
      );

      toast.loading("Saving product details...", { id: "upload" });

      // Save product using the service
      const productId = await EnhancedProductService.addProduct(
        {
          name: formData.name.trim(),
          description: formData.description.trim(),
          price: Number(formData.price),
          category: formData.category,
          stock: Number(formData.stock),
          images: imageUrls,
          featured: false,
          isActive: true,
        },
        user?.id || "admin"
      );

      toast.success("Product uploaded successfully!", { id: "upload" });
      setSuccess(true);

      // Reset form
      setFormData({
        name: "",
        description: "",
        price: 0,
        category: "",
        stock: 0,
        images: [],
      });
      setImagePreview([]);
      setUploadProgress([]);

      // Redirect after success
      setTimeout(() => {
        navigate("/admin/products");
      }, 2000);
    } catch (error: any) {
      console.error("Upload error:", error);
      const errorMessage =
        error.message || "An unexpected error occurred. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage, { id: "upload" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-5 rounded-lg">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Add New Product
            </h1>
            <p className="text-gray-300 text-sm sm:text-base">
              Upload product details and images to add to your store catalog.
            </p>
          </div>

          {success && (
            <div className="mb-6 bg-green-500/20 border border-green-500/30 backdrop-blur-sm rounded-lg p-4">
              <div className="text-green-300 font-medium text-sm sm:text-base">
                Product uploaded successfully! Redirecting to products page...
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-500/20 border border-red-500/30 backdrop-blur-sm rounded-lg p-4">
              <div className="text-red-300 font-medium text-sm sm:text-base">
                {error}
              </div>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-6 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-4 sm:p-6 lg:p-8 shadow-xl">
            {/* Product Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-semibold text-white mb-2">
                Product Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 sm:py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                placeholder="Enter product name"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-semibold text-white mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-4 py-2 sm:py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 resize-none text-sm sm:text-base"
                placeholder="Enter product description"
              />
            </div>

            {/* Price and Stock */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label
                  htmlFor="price"
                  className="block text-sm font-semibold text-white mb-2">
                  Price (GH₵) *
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 sm:py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                  placeholder="0"
                />
              </div>

              <div>
                <label
                  htmlFor="stock"
                  className="block text-sm font-semibold text-white mb-2">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  min="0"
                  value={formData.stock}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 sm:py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="category"
                  className="block text-sm font-semibold text-white">
                  Category *
                </label>
                <button
                  type="button"
                  onClick={loadCategories}
                  disabled={loadingCategories}
                  className="text-blue-400 hover:text-blue-300 transition-colors duration-200 disabled:opacity-50">
                  <RefreshCw
                    className={`h-4 w-4 ${
                      loadingCategories ? "animate-spin" : ""
                    }`}
                  />
                </button>
              </div>
              <select
                id="category"
                name="category"
                required
                value={formData.category}
                onChange={handleInputChange}
                disabled={loadingCategories}
                className="w-full px-4 py-2 sm:py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 text-sm sm:text-base disabled:opacity-50">
                <option value="" className="bg-slate-800 text-white">
                  {loadingCategories
                    ? "Loading categories..."
                    : "Select a category"}
                </option>
                {categories.map((category) => (
                  <option
                    key={category}
                    value={category}
                    className="bg-slate-800 text-white">
                    {category}
                  </option>
                ))}
              </select>
              {categories.length === 0 && !loadingCategories && (
                <p className="mt-1 text-sm text-yellow-400">
                  No categories found. Please add categories in the Categories
                  section first.
                </p>
              )}
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Product Images * (Max 5 images, 10MB each)
              </label>
              <div className="border-2 border-dashed border-white/30 rounded-lg p-4 sm:p-6 lg:p-8 text-center bg-white/5 backdrop-blur-sm hover:border-white/40 transition-all duration-200">
                <div className="space-y-3">
                  <Upload className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
                  <div className="flex text-xs sm:text-sm text-gray-300 justify-center">
                    <label
                      htmlFor="images"
                      className={`relative cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg px-3 sm:px-4 py-2 font-medium hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg text-xs sm:text-sm ${
                        uploading ? "opacity-50 cursor-not-allowed" : ""
                      }`}>
                      <span>Upload images</span>
                      <input
                        id="images"
                        name="images"
                        type="file"
                        multiple
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        className="sr-only"
                        onChange={handleImageChange}
                        disabled={uploading}
                      />
                    </label>
                    <p className="pl-2 sm:pl-3 self-center text-xs sm:text-sm">
                      or drag and drop
                    </p>
                  </div>
                  <p className="text-xs text-gray-400">
                    PNG, JPG, GIF, WebP up to 10MB each
                  </p>
                </div>
              </div>

              {/* Image Preview */}
              {imagePreview.length > 0 && (
                <div className="mt-4 sm:mt-6">
                  <h4 className="text-sm font-medium text-white mb-3">
                    Selected Images ({imagePreview.length})
                  </h4>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-4">
                    {imagePreview.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 object-cover rounded-lg border border-white/20 shadow-lg"
                        />
                        {uploading && uploadProgress[index] !== undefined && (
                          <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                            {uploadProgress[index] === 100 ? (
                              <CheckCircle className="h-6 w-6 text-green-400" />
                            ) : (
                              <div className="text-white text-xs font-bold">
                                {uploadProgress[index]}%
                              </div>
                            )}
                          </div>
                        )}
                        {!uploading && (
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transform hover:scale-110 transition-all duration-200 shadow-lg opacity-0 group-hover:opacity-100">
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-white/20">
              <Button
                type="button"
                onClick={() => navigate("/admin/products")}
                disabled={uploading}
                className="w-full sm:w-auto bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all duration-200 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={uploading}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base">
                {uploading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Uploading...</span>
                  </>
                ) : (
                  <>
                    <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Upload Product
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};
