import React, { useState, useEffect } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { Link } from "react-router-dom";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../utils/firebase";
import { Button } from "../../components/ui/Button";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  MoreVertical,
  Package,
} from "lucide-react";
import { EnhancedProductService } from "../../utils/enhancedProductService";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images: string[];
  status?: "none" | "new" | "sale";
  createdAt: any;
  updatedAt: any;
}

export const ProductManagementPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const categories = [
    "All Categories",
    "Sneakers",
    "Boots",
    "Sandals",
    "Formal Shoes",
    "Casual Shoes",
    "Athletic Shoes",
    "Accessories",
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const productsSnapshot = await getDocs(collection(db, "products"));
      const productsData = productsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];

      setProducts(productsData);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory && selectedCategory !== "All Categories") {
      filtered = filtered.filter(
        (product) => product.category === selectedCategory
      );
    }

    setFilteredProducts(filtered);
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      setDeleting(true);
      await deleteDoc(doc(db, "products", productToDelete.id));
      setProducts(products.filter((p) => p.id !== productToDelete.id));
      setShowDeleteModal(false);
      setProductToDelete(null);
    } catch (error) {
      console.error("Error deleting product:", error);
    } finally {
      setDeleting(false);
    }
  };

  const updateProductStock = async (productId: string, newStock: number) => {
    try {
      await updateDoc(doc(db, "products", productId), {
        stock: newStock,
        updatedAt: new Date().toISOString(),
      });

      setProducts(
        products.map((p) =>
          p.id === productId ? { ...p, stock: newStock } : p
        )
      );
    } catch (error) {
      console.error("Error updating stock:", error);
    }
  };

  const updateProductStatus = async (
    productId: string,
    newStatus: "none" | "new" | "sale"
  ) => {
    try {
      await EnhancedProductService.updateProductStatus(
        productId,
        newStatus,
        "admin"
      );

      setProducts(
        products.map((p) =>
          p.id === productId ? { ...p, status: newStatus } : p
        )
      );
    } catch (error) {
      console.error("Error updating product status:", error);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-96">
          <LoadingSpinner />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-5 rounded-lg">
        <div className="space-y-6 lg:space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Product Management
              </h1>
              <p className="text-gray-300 text-sm sm:text-base">
                Manage your store's product catalog
              </p>
            </div>
            <Link to="/admin/products/add">
              <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center px-4 sm:px-6 py-2 sm:py-3 justify-center">
                <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Add Product
              </Button>
            </Link>
          </div>

          {/* Filters */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-4 lg:p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 sm:pl-10 pr-4 py-2 sm:py-3 w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                  />
                </div>
              </div>
              <div className="w-full sm:w-56">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 sm:py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 text-sm sm:text-base">
                  {categories.map((category) => (
                    <option
                      key={category}
                      value={category}
                      className="bg-slate-800 text-white">
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-12 max-w-md mx-auto">
                <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  No products found
                </h3>
                <p className="text-gray-300 mb-6">
                  {products.length === 0
                    ? "Get started by adding your first product."
                    : "Try adjusting your search or filter criteria."}
                </p>
                {products.length === 0 && (
                  <Link to="/admin/products/add">
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                  <div className="aspect-w-1 aspect-h-1">
                    <img
                      src={product.images[0] || "/placeholder-image.jpg"}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-white truncate mb-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xl font-bold text-white">
                        GH₵{product.price.toLocaleString()}
                      </span>
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          product.stock > 10
                            ? "bg-green-500/20 text-green-300 border border-green-500/30"
                            : product.stock > 0
                            ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                            : "bg-red-500/20 text-red-300 border border-red-500/30"
                        }`}>
                        {product.stock} in stock
                      </span>
                    </div>
                    {/* Stock Management and Actions */}
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="0"
                          value={product.stock}
                          onChange={(e) =>
                            updateProductStock(
                              product.id,
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="flex-1 px-3 py-2 text-sm bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                          placeholder="Stock count"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Actions:</span>
                        <div className="flex items-center space-x-2">
                          <button
                            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-all duration-200 flex-shrink-0"
                            title="Edit Product">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setProductToDelete(product);
                              setShowDeleteModal(true);
                            }}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-200 flex-shrink-0"
                            title="Delete Product">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    {/* Product Status Selector */}
                    <div className="mb-3">
                      <label className="text-xs text-gray-400 mb-2 block">
                        Product Status
                      </label>
                      <select
                        value={product.status || "none"}
                        onChange={(e) =>
                          updateProductStatus(
                            product.id,
                            e.target.value as "none" | "new" | "sale"
                          )
                        }
                        className="w-full px-3 py-2 text-sm bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200">
                        <option value="none" className="bg-gray-800 text-white">
                          None
                        </option>
                        <option value="new" className="bg-gray-800 text-white">
                          New
                        </option>
                        <option value="sale" className="bg-gray-800 text-white">
                          Sale
                        </option>
                      </select>
                    </div>
                    <div className="text-xs text-gray-400 bg-white/5 rounded-lg px-3 py-2">
                      Category:{" "}
                      <span className="text-gray-300 font-medium">
                        {product.category}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteModal && productToDelete && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-2xl p-4 sm:p-6 w-full max-w-sm sm:max-w-md">
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-red-500/20 border border-red-500/30 mb-4">
                    <Trash2 className="h-6 w-6 sm:h-8 sm:w-8 text-red-400" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
                    Delete Product
                  </h3>
                  <p className="text-gray-300 mb-6 text-sm sm:text-base">
                    Are you sure you want to delete "{productToDelete.name}"?
                    This action cannot be undone.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setShowDeleteModal(false);
                        setProductToDelete(null);
                      }}
                      disabled={deleting}
                      className="w-full sm:w-auto bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all duration-200 text-sm sm:text-base">
                      Cancel
                    </Button>
                    <Button
                      onClick={handleDeleteProduct}
                      disabled={deleting}
                      className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 transition-all duration-200 flex items-center justify-center text-sm sm:text-base">
                      {deleting ? (
                        <>
                          <LoadingSpinner size="sm" />
                          <span className="ml-2">Deleting...</span>
                        </>
                      ) : (
                        "Delete Product"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};
