import React, { useState, useEffect } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../utils/firebase";
import { Button } from "../../components/ui/Button";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import {
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  Tag,
  Save,
  X,
  Package,
} from "lucide-react";
import toast from "react-hot-toast";

interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: any;
  updatedAt: any;
}

export const CategoryManagementPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null
  );
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [productsInCategory, setProductsInCategory] = useState(0);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
  });

  // Default categories that should always exist
  const defaultCategories = [
    "Sneakers",
    "Boots",
    "Sandals",
    "Formal Shoes",
    "Casual Shoes",
    "Athletic Shoes",
    "Accessories",
    "Hoodies",
    "T-Shirts",
    "Jeans",
    "Caps",
    "Jackets",
    "Pants",
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const categoriesRef = collection(db, "categories");
      const snapshot = await getDocs(categoriesRef);
      const categoriesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Category[];

      // If no categories exist, create default ones
      if (categoriesData.length === 0) {
        await createDefaultCategories();
        return;
      }

      setCategories(categoriesData);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const createDefaultCategories = async () => {
    try {
      const batch = defaultCategories.map(async (categoryName) => {
        await addDoc(collection(db, "categories"), {
          name: categoryName,
          description: `${categoryName} category`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });

      await Promise.all(batch);
      await fetchCategories();
      toast.success("Default categories created");
    } catch (error) {
      console.error("Error creating default categories:", error);
      toast.error("Failed to create default categories");
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    setSaving(true);
    try {
      const docRef = await addDoc(collection(db, "categories"), {
        name: newCategory.name.trim(),
        description: newCategory.description.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const newCat: Category = {
        id: docRef.id,
        name: newCategory.name.trim(),
        description: newCategory.description.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setCategories([...categories, newCat]);
      setNewCategory({ name: "", description: "" });
      setShowAddForm(false);
      toast.success("Category added successfully");
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error("Failed to add category");
    } finally {
      setSaving(false);
    }
  };

  const handleEditCategory = async () => {
    if (!editingCategory || !editingCategory.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    setSaving(true);
    try {
      await updateDoc(doc(db, "categories", editingCategory.id), {
        name: editingCategory.name.trim(),
        description: editingCategory.description?.trim() || "",
        updatedAt: new Date().toISOString(),
      });

      setCategories(
        categories.map((cat) =>
          cat.id === editingCategory.id
            ? { ...editingCategory, updatedAt: new Date().toISOString() }
            : cat
        )
      );

      setEditingCategory(null);
      toast.success("Category updated successfully");
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Failed to update category");
    } finally {
      setSaving(false);
    }
  };

  const checkProductsInCategory = async (categoryName: string) => {
    try {
      const productsRef = collection(db, "products");
      const q = query(productsRef, where("category", "==", categoryName));
      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error("Error checking products in category:", error);
      return 0;
    }
  };

  const handleDeleteRequest = async (category: Category) => {
    const productCount = await checkProductsInCategory(category.name);
    setProductsInCategory(productCount);
    setCategoryToDelete(category);
    setShowDeleteModal(true);
    setDeleteConfirmation("");
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    if (
      productsInCategory > 0 &&
      deleteConfirmation !== categoryToDelete.name
    ) {
      toast.error("Please type the category name to confirm deletion");
      return;
    }

    setDeleting(true);
    try {
      // Delete the category
      await deleteDoc(doc(db, "categories", categoryToDelete.id));

      // If there are products in this category, delete them too
      if (productsInCategory > 0) {
        const productsRef = collection(db, "products");
        const q = query(
          productsRef,
          where("category", "==", categoryToDelete.name)
        );
        const snapshot = await getDocs(q);

        const deletePromises = snapshot.docs.map((productDoc) =>
          deleteDoc(doc(db, "products", productDoc.id))
        );

        await Promise.all(deletePromises);
        toast.success(
          `Category and ${productsInCategory} products deleted successfully`
        );
      } else {
        toast.success("Category deleted successfully");
      }

      setCategories(categories.filter((cat) => cat.id !== categoryToDelete.id));
      setShowDeleteModal(false);
      setCategoryToDelete(null);
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
    } finally {
      setDeleting(false);
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
      <div className="space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800/50 to-indigo-800/50 backdrop-blur-xl rounded-2xl p-4 lg:p-8 border border-slate-700/50 shadow-2xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Category Management
              </h1>
              <p className="text-slate-300 text-sm sm:text-base">
                Manage product categories for your store
              </p>
            </div>
            <Button
              onClick={() => setShowAddForm(true)}
              className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3">
              <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Add Category
            </Button>
          </div>
        </div>

        {/* Add Category Form */}
        {showAddForm && (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-4 lg:p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Add New Category
              </h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-white transition-colors duration-200">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, name: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                  placeholder="Enter category name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={newCategory.description}
                  onChange={(e) =>
                    setNewCategory({
                      ...newCategory,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                  placeholder="Enter description (optional)"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleAddCategory}
                disabled={saving || !newCategory.name.trim()}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center">
                {saving ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Adding...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Add Category
                  </>
                )}
              </Button>
              <Button
                onClick={() => setShowAddForm(false)}
                className="bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all duration-200">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Categories List */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-xl overflow-hidden">
          <div className="px-4 lg:px-6 py-4 border-b border-white/20">
            <h3 className="text-lg font-semibold text-white">
              Categories ({categories.length})
            </h3>
          </div>
          <div className="divide-y divide-white/10">
            {categories.map((category) => (
              <div
                key={category.id}
                className="p-4 lg:p-6 hover:bg-white/5 transition-all duration-200">
                {editingCategory?.id === category.id ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <input
                        type="text"
                        value={editingCategory.name}
                        onChange={(e) =>
                          setEditingCategory({
                            ...editingCategory,
                            name: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={editingCategory.description || ""}
                        onChange={(e) =>
                          setEditingCategory({
                            ...editingCategory,
                            description: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                        placeholder="Description (optional)"
                      />
                    </div>
                    <div className="sm:col-span-2 flex gap-3">
                      <Button
                        onClick={handleEditCategory}
                        disabled={saving}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center">
                        {saving ? (
                          <>
                            <LoadingSpinner size="sm" />
                            <span className="ml-2">Saving...</span>
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => setEditingCategory(null)}
                        className="bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all duration-200">
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-3 rounded-lg mr-4">
                        <Tag className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white">
                          {category.name}
                        </h4>
                        {category.description && (
                          <p className="text-gray-300 text-sm">
                            {category.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => setEditingCategory(category)}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-all duration-200">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteRequest(category)}
                        className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-all duration-200">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && categoryToDelete && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-2xl p-4 sm:p-6 w-full max-w-md">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-red-500/20 border border-red-500/30 mb-4">
                  <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-red-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
                  Delete Category
                </h3>

                {productsInCategory > 0 ? (
                  <div className="mb-6">
                    <p className="text-red-300 mb-4 text-sm sm:text-base">
                      ⚠️ This category contains{" "}
                      <strong>{productsInCategory} product(s)</strong>
                    </p>
                    <p className="text-gray-300 mb-4 text-sm sm:text-base">
                      Deleting this category will also delete all products in
                      it. This action cannot be undone.
                    </p>
                    <p className="text-white mb-2 text-sm">
                      Type <strong>"{categoryToDelete.name}"</strong> to
                      confirm:
                    </p>
                    <input
                      type="text"
                      value={deleteConfirmation}
                      onChange={(e) => setDeleteConfirmation(e.target.value)}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all duration-200"
                      placeholder={categoryToDelete.name}
                    />
                  </div>
                ) : (
                  <p className="text-gray-300 mb-6 text-sm sm:text-base">
                    Are you sure you want to delete "{categoryToDelete.name}"?
                    This action cannot be undone.
                  </p>
                )}

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setCategoryToDelete(null);
                      setDeleteConfirmation("");
                    }}
                    disabled={deleting}
                    className="w-full sm:w-auto bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all duration-200">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDeleteCategory}
                    disabled={
                      deleting ||
                      (productsInCategory > 0 &&
                        deleteConfirmation !== categoryToDelete.name)
                    }
                    className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 transition-all duration-200 flex items-center justify-center">
                    {deleting ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span className="ml-2">Deleting...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Category
                        {productsInCategory > 0 &&
                          ` & ${productsInCategory} Products`}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
