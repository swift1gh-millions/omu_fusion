import { z } from "zod";

// User validation schemas
export const SignUpSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name too long"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name too long"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain uppercase, lowercase, and number"
    ),
});

export const SignInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Product validation schemas
export const ProductSchema = z.object({
  name: z
    .string()
    .min(1, "Product name is required")
    .max(200, "Product name too long"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(2000, "Description too long"),
  price: z
    .number()
    .positive("Price must be positive")
    .max(1000000, "Price too high"),
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().optional(),
  brand: z.string().optional(),
  sku: z.string().optional(),
  stock: z
    .number()
    .int("Stock must be a whole number")
    .min(0, "Stock cannot be negative"),
  images: z
    .array(z.string().url("Invalid image URL"))
    .min(1, "At least one image is required")
    .max(10, "Too many images"),
  thumbnail: z.string().url("Invalid thumbnail URL").optional(),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  weight: z.number().positive("Weight must be positive").optional(),
  dimensions: z
    .object({
      length: z.number().positive(),
      width: z.number().positive(),
      height: z.number().positive(),
    })
    .optional(),
  seo: z
    .object({
      title: z.string().max(60, "SEO title too long").optional(),
      description: z.string().max(160, "SEO description too long").optional(),
      keywords: z.array(z.string()).optional(),
    })
    .optional(),
  variants: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        sku: z.string(),
        price: z.number().positive(),
        stock: z.number().min(0),
        attributes: z.record(z.string(), z.string()),
        images: z.array(z.string().url()).optional(),
      })
    )
    .optional(),
});

// Address validation schema
export const AddressSchema = z.object({
  type: z.enum(["home", "work", "other"]),
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name too long"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name too long"),
  address: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .max(200, "Address too long"),
  apartment: z.string().max(50, "Apartment info too long").optional(),
  city: z.string().min(1, "City is required").max(50, "City name too long"),
  state: z.string().min(1, "State is required").max(50, "State name too long"),
  zipCode: z.string().min(3, "ZIP code too short").max(20, "ZIP code too long"),
  country: z
    .string()
    .min(1, "Country is required")
    .max(50, "Country name too long"),
  isDefault: z.boolean(),
});

// Order validation schema
export const OrderItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  productName: z.string().min(1, "Product name is required"),
  productImage: z.string().url("Invalid image URL"),
  price: z.number().positive("Price must be positive"),
  quantity: z
    .number()
    .int("Quantity must be a whole number")
    .positive("Quantity must be positive"),
});

export const OrderSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  items: z.array(OrderItemSchema).min(1, "Order must have at least one item"),
  total: z.number().positive("Total must be positive"),
  status: z.enum([
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ]),
});

// User profile validation schema
export const UserProfileUpdateSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name too long")
    .optional(),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name too long")
    .optional(),
  phoneNumber: z
    .string()
    .regex(/^\+?[\d\s\-\(\)]+$/, "Invalid phone number format")
    .optional(),
  avatar: z.string().url("Invalid avatar URL").optional(),
});

// Category validation schema
export const CategorySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(100, "Category name too long"),
  description: z.string().max(500, "Description too long").optional(),
  image: z.string().url("Invalid image URL").optional(),
  isActive: z.boolean().optional(),
});

// Environment validation schema
export const EnvironmentSchema = z.object({
  VITE_FIREBASE_API_KEY: z.string().min(1, "Firebase API key is required"),
  VITE_FIREBASE_AUTH_DOMAIN: z
    .string()
    .min(1, "Firebase auth domain is required"),
  VITE_FIREBASE_PROJECT_ID: z
    .string()
    .min(1, "Firebase project ID is required"),
  VITE_FIREBASE_STORAGE_BUCKET: z
    .string()
    .min(1, "Firebase storage bucket is required"),
  VITE_FIREBASE_MESSAGING_SENDER_ID: z
    .string()
    .min(1, "Firebase messaging sender ID is required"),
  VITE_FIREBASE_APP_ID: z.string().min(1, "Firebase app ID is required"),
});

// Type exports
export type SignUpData = z.infer<typeof SignUpSchema>;
export type SignInData = z.infer<typeof SignInSchema>;
export type ProductData = z.infer<typeof ProductSchema>;
export type AddressData = z.infer<typeof AddressSchema>;
export type OrderData = z.infer<typeof OrderSchema>;
export type OrderItemData = z.infer<typeof OrderItemSchema>;
export type UserProfileUpdateData = z.infer<typeof UserProfileUpdateSchema>;
export type CategoryData = z.infer<typeof CategorySchema>;
export type EnvironmentConfig = z.infer<typeof EnvironmentSchema>;
