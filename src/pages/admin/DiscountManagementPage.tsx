import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { HiPlus, HiPencil, HiTrash, HiX } from "react-icons/hi";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { Button } from "../../components/ui/Button";
import { GlassCard } from "../../components/ui/GlassCard";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import {
  DiscountService,
  DiscountCode,
  DiscountType,
} from "../../utils/discountService";
import { useAdminAuth } from "../../context/AdminContext";
import toast from "react-hot-toast";

interface DiscountFormData {
  code: string;
  type: DiscountType;
  value: number;
  description: string;
  minOrderAmount: string;
  maxUses: string;
  expiryDate: string;
  isActive: boolean;
}

interface DiscountFormErrors {
  code?: string;
  type?: string;
  value?: string;
  description?: string;
  minOrderAmount?: string;
  maxUses?: string;
  expiryDate?: string;
  isActive?: string;
}

export const DiscountManagementPage: React.FC = () => {
  const { admin } = useAdminAuth();
  const [discounts, setDiscounts] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<DiscountCode | null>(
    null
  );
  const [formData, setFormData] = useState<DiscountFormData>({
    code: "",
    type: "percentage",
    value: 0,
    description: "",
    minOrderAmount: "",
    maxUses: "",
    expiryDate: "",
    isActive: true,
  });
  const [errors, setErrors] = useState<DiscountFormErrors>({});

  useEffect(() => {
    loadDiscounts();
  }, []);

  const loadDiscounts = async () => {
    try {
      setLoading(true);
      const discountList = await DiscountService.getAllDiscountCodes();
      setDiscounts(discountList);
    } catch (error) {
      console.error("Error loading discounts:", error);
      toast.error("Failed to load discount codes");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      type: "percentage",
      value: 0,
      description: "",
      minOrderAmount: "",
      maxUses: "",
      expiryDate: "",
      isActive: true,
    });
    setErrors({});
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : type === "number"
          ? parseFloat(value) || 0
          : value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof DiscountFormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: DiscountFormErrors = {};

    if (!formData.code.trim()) {
      newErrors.code = "Discount code is required";
    } else if (formData.code.length < 3) {
      newErrors.code = "Code must be at least 3 characters";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (formData.value <= 0) {
      newErrors.value = "Value must be greater than 0";
    } else if (formData.type === "percentage" && formData.value > 100) {
      newErrors.value = "Percentage cannot exceed 100%";
    }

    // Validate minOrderAmount only if provided
    if (formData.minOrderAmount && formData.minOrderAmount.trim() !== "") {
      const minAmount = parseFloat(formData.minOrderAmount);
      if (isNaN(minAmount) || minAmount < 0) {
        newErrors.minOrderAmount = "Must be a valid positive number";
      }
    }

    // Validate maxUses only if provided
    if (formData.maxUses && formData.maxUses.trim() !== "") {
      const maxUsesNum = parseInt(formData.maxUses);
      if (isNaN(maxUsesNum) || maxUsesNum < 1) {
        newErrors.maxUses = "Must be a valid number greater than 0";
      }
    }

    // Validate expiry date only if provided
    if (formData.expiryDate && formData.expiryDate.trim() !== "") {
      const expiryDate = new Date(formData.expiryDate);
      if (isNaN(expiryDate.getTime())) {
        newErrors.expiryDate = "Must be a valid date";
      } else if (expiryDate <= new Date()) {
        newErrors.expiryDate = "Expiry date must be in the future";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    console.log("🎯 Form submit triggered");
    console.log("👤 Current admin:", admin);
    console.log("📝 Form data:", formData);

    if (!validateForm()) {
      console.log("❌ Form validation failed");
      return;
    }

    if (!admin?.id) {
      console.log("❌ Admin ID not available");
      toast.error("Admin authentication required");
      return;
    }

    // Prevent multiple submissions
    if (submitting) {
      console.log("⏳ Already processing, ignoring duplicate submission");
      return;
    }

    setSubmitting(true);

    try {
      // Build discount data object, only including optional fields if they have values
      const discountData: any = {
        code: formData.code.toUpperCase(),
        type: formData.type,
        value: formData.value,
        description: formData.description,
        isActive: formData.isActive,
        createdBy: admin.id,
      };

      // Only add optional fields if they have valid values
      if (formData.minOrderAmount && formData.minOrderAmount.trim() !== "") {
        const minAmount = parseFloat(formData.minOrderAmount);
        if (!isNaN(minAmount) && minAmount > 0) {
          discountData.minOrderAmount = minAmount;
        }
      }

      if (formData.maxUses && formData.maxUses.trim() !== "") {
        const maxUsesNum = parseInt(formData.maxUses);
        if (!isNaN(maxUsesNum) && maxUsesNum > 0) {
          discountData.maxUses = maxUsesNum;
        }
      }

      if (formData.expiryDate && formData.expiryDate.trim() !== "") {
        const expiryDate = new Date(formData.expiryDate);
        if (!isNaN(expiryDate.getTime())) {
          discountData.expiryDate = expiryDate;
        }
      }

      console.log("💾 Saving discount data:", discountData);

      if (editingDiscount) {
        console.log("✏️ Updating existing discount");
        await DiscountService.updateDiscountCode(
          editingDiscount.id,
          discountData
        );
        toast.success("Discount code updated successfully");
      } else {
        console.log("➕ Creating new discount");
        const newDiscountId = await DiscountService.createDiscountCode(
          discountData,
          admin.id
        );
        console.log("✅ Discount created with ID:", newDiscountId);
        toast.success("Discount code created successfully");
      }

      console.log("🔄 Reloading discounts list");
      await loadDiscounts();
      setShowModal(false);
      setEditingDiscount(null);
      resetForm();
      console.log("🎉 Process completed successfully");
    } catch (error) {
      console.error("💥 Error saving discount:", error);
      toast.error(
        `Failed to save discount code: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (discount: DiscountCode) => {
    setEditingDiscount(discount);
    setFormData({
      code: discount.code,
      type: discount.type,
      value: discount.value,
      description: discount.description,
      minOrderAmount: discount.minOrderAmount?.toString() || "",
      maxUses: discount.maxUses?.toString() || "",
      expiryDate: discount.expiryDate
        ? discount.expiryDate.toISOString().split("T")[0]
        : "",
      isActive: discount.isActive,
    });
    setShowModal(true);
  };

  const handleDelete = async (discountId: string) => {
    if (!confirm("Are you sure you want to delete this discount code?")) return;

    try {
      await DiscountService.deleteDiscountCode(discountId);
      toast.success("Discount code deleted successfully");
      await loadDiscounts();
    } catch (error) {
      console.error("Error deleting discount:", error);
      toast.error("Failed to delete discount code");
    }
  };

  const openCreateModal = () => {
    setEditingDiscount(null);
    resetForm();
    setShowModal(true);
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
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Discount Codes
              </h1>
              <p className="text-gray-300 text-sm sm:text-base">
                Manage promotional discount codes for customers
              </p>
            </div>
            <Button
              variant="primary"
              onClick={openCreateModal}
              className="flex items-center space-x-2">
              <HiPlus className="w-5 h-5" />
              <span>Create Code</span>
            </Button>
          </div>

          {/* Discount Codes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {discounts.map((discount) => (
              <motion.div
                key={discount.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">
                      {discount.code}
                    </h3>
                    <p className="text-gray-300 text-sm">
                      {discount.description}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(discount)}
                      className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-all">
                      <HiPencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(discount.id)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all">
                      <HiTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Value:</span>
                    <span className="text-white font-medium">
                      {discount.type === "percentage"
                        ? `${discount.value}%`
                        : `₵${discount.value}`}
                    </span>
                  </div>

                  {discount.minOrderAmount && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Min Order:</span>
                      <span className="text-white font-medium">
                        ₵{discount.minOrderAmount}
                      </span>
                    </div>
                  )}

                  {discount.maxUses && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Usage:</span>
                      <span className="text-white font-medium">
                        {discount.currentUses}/{discount.maxUses}
                      </span>
                    </div>
                  )}

                  {discount.expiryDate && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Expires:</span>
                      <span className="text-white font-medium">
                        {discount.expiryDate.toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Status:</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        discount.isActive
                          ? "bg-green-500/20 text-green-300"
                          : "bg-gray-500/20 text-gray-300"
                      }`}>
                      {discount.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {discounts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg mb-4">
                No discount codes created yet
              </p>
              <Button variant="primary" onClick={openCreateModal}>
                Create Your First Discount Code
              </Button>
            </div>
          )}

          {/* Create/Edit Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto">
              <div className="min-h-full flex items-start justify-center p-4">
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-2xl w-full max-w-2xl my-8 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-white">
                        {editingDiscount
                          ? "Edit Discount Code"
                          : "Create New Discount Code"}
                      </h2>
                      <button
                        onClick={() => {
                          setShowModal(false);
                          setEditingDiscount(null);
                          resetForm();
                        }}
                        className="text-gray-400 hover:text-white transition-colors">
                        <HiX className="w-6 h-6" />
                      </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Code */}
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">
                            Discount Code *
                          </label>
                          <input
                            type="text"
                            name="code"
                            value={formData.code}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border ${
                              errors.code ? "border-red-500" : "border-white/20"
                            } rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200`}
                            placeholder="e.g., WELCOME10"
                          />
                          {errors.code && (
                            <p className="mt-1 text-sm text-red-400">
                              {errors.code}
                            </p>
                          )}
                        </div>

                        {/* Type */}
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">
                            Discount Type *
                          </label>
                          <select
                            name="type"
                            value={formData.type}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200">
                            <option value="percentage">Percentage (%)</option>
                            <option value="fixed">Fixed Amount (₵)</option>
                          </select>
                        </div>

                        {/* Value */}
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">
                            {formData.type === "percentage"
                              ? "Percentage"
                              : "Amount"}{" "}
                            *
                          </label>
                          <input
                            type="number"
                            name="value"
                            value={formData.value}
                            onChange={handleInputChange}
                            min="0"
                            max={
                              formData.type === "percentage" ? "100" : undefined
                            }
                            step={formData.type === "percentage" ? "1" : "0.01"}
                            className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border ${
                              errors.value
                                ? "border-red-500"
                                : "border-white/20"
                            } rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200`}
                            placeholder={
                              formData.type === "percentage" ? "10" : "5.00"
                            }
                          />
                          {errors.value && (
                            <p className="mt-1 text-sm text-red-400">
                              {errors.value}
                            </p>
                          )}
                        </div>

                        {/* Min Order Amount */}
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">
                            Minimum Order Amount (Optional)
                          </label>
                          <input
                            type="number"
                            name="minOrderAmount"
                            value={formData.minOrderAmount}
                            onChange={handleInputChange}
                            min="0"
                            step="0.01"
                            className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                            placeholder="50.00"
                          />
                        </div>

                        {/* Max Uses */}
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">
                            Maximum Uses (Optional)
                          </label>
                          <input
                            type="number"
                            name="maxUses"
                            value={formData.maxUses}
                            onChange={handleInputChange}
                            min="1"
                            className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                            placeholder="100"
                          />
                        </div>

                        {/* Expiry Date */}
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">
                            Expiry Date (Optional)
                          </label>
                          <input
                            type="date"
                            name="expiryDate"
                            value={formData.expiryDate}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                          />
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Description *
                        </label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          rows={3}
                          className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border ${
                            errors.description
                              ? "border-red-500"
                              : "border-white/20"
                          } rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 resize-none`}
                          placeholder="Brief description of the discount..."
                        />
                        {errors.description && (
                          <p className="mt-1 text-sm text-red-400">
                            {errors.description}
                          </p>
                        )}
                      </div>

                      {/* Active Toggle */}
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="isActive"
                          checked={formData.isActive}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                        />
                        <label className="ml-2 text-sm text-white">
                          Active (customers can use this code)
                        </label>
                      </div>

                      <div className="flex justify-end space-x-4 pt-6 border-t border-white/20">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowModal(false);
                            setEditingDiscount(null);
                            resetForm();
                          }}>
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          variant="primary"
                          disabled={submitting}
                          className="flex items-center gap-2">
                          {submitting && <LoadingSpinner size="sm" />}
                          {editingDiscount ? "Update Code" : "Create Code"}
                        </Button>
                      </div>
                    </form>
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
