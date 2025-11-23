// Mock Product Service for Development
// This allows testing the UI without Firebase until environment is configured

import { Product } from "./databaseSchema";

// Mock product data for development
const mockProducts: Product[] = [
  {
    id: "1",
    name: "FUSION FLEX BEANIE PEARLS FLEX",
    description:
      "Premium quality beanie with pearl accents and flexible design",
    price: 500,
    category: "Caps",
    stock: 1,
    images: ["https://via.placeholder.com/400x300/e97c36/fff?text=Beanie+1"],
    tags: ["beanie", "caps", "fashion"],
    featured: false,
    isActive: true,
    status: "none",
    seo: {},
    variants: [],
    createdAt: { toDate: () => new Date() } as any,
    updatedAt: { toDate: () => new Date() } as any,
    createdBy: "admin",
  },
  {
    id: "2",
    name: "BORN TO BE GREAT GTA6 TEE(GREEN)",
    description: "Stylish green t-shirt with GTA6 inspired design",
    price: 500,
    category: "T-Shirts",
    stock: 10,
    images: ["https://via.placeholder.com/400x300/4ade80/fff?text=T-Shirt"],
    tags: ["t-shirt", "clothing", "green"],
    featured: true,
    isActive: true,
    status: "new",
    seo: {},
    variants: [],
    createdAt: { toDate: () => new Date() } as any,
    updatedAt: { toDate: () => new Date() } as any,
    createdBy: "admin",
  },
  {
    id: "3",
    name: "FUSION FLEX BEANIE PEARLS FLEX (Black)",
    description: "Black variant of the popular beanie with pearl accents",
    price: 500,
    category: "Caps",
    stock: 1,
    images: [
      "https://via.placeholder.com/400x300/1f2937/fff?text=Black+Beanie",
    ],
    tags: ["beanie", "caps", "black"],
    featured: false,
    isActive: true,
    status: "none",
    seo: {},
    variants: [],
    createdAt: { toDate: () => new Date() } as any,
    updatedAt: { toDate: () => new Date() } as any,
    createdBy: "admin",
  },
  {
    id: "4",
    name: "TWO PIECE JACKET (LIMITED)",
    description: "Limited edition two-piece jacket set",
    price: 2000,
    category: "Jackets",
    stock: 3,
    images: ["https://via.placeholder.com/400x300/7c3aed/fff?text=Jacket"],
    tags: ["jacket", "clothing", "limited"],
    featured: true,
    isActive: true,
    status: "sale",
    seo: {},
    variants: [],
    createdAt: { toDate: () => new Date() } as any,
    updatedAt: { toDate: () => new Date() } as any,
    createdBy: "admin",
  },
  {
    id: "5",
    name: "FUSION FLEX BEANIE PEARLS FLEX (White)",
    description: "White beanie with colorful pearl decorations",
    price: 500,
    category: "Caps",
    stock: 1,
    images: [
      "https://via.placeholder.com/400x300/f8fafc/333?text=White+Beanie",
    ],
    tags: ["beanie", "caps", "white"],
    featured: false,
    isActive: true,
    status: "none",
    seo: {},
    variants: [],
    createdAt: { toDate: () => new Date() } as any,
    updatedAt: { toDate: () => new Date() } as any,
    createdBy: "admin",
  },
];

export class MockProductService {
  private static products = [...mockProducts];

  // Mock delay to simulate network requests
  private static delay(ms: number = 500): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  static async getProducts(
    filters = {},
    sort = {},
    pagination = {}
  ): Promise<{
    products: Product[];
    hasMore: boolean;
    total: number;
  }> {
    await this.delay();
    console.log("🔄 Using mock product service (Firebase not configured)");

    let filteredProducts = [...this.products];

    // Apply basic filtering
    if (filters && typeof filters === "object") {
      const { category, isActive } = filters as any;

      if (category) {
        filteredProducts = filteredProducts.filter(
          (p) => p.category === category
        );
      }

      if (isActive !== undefined) {
        filteredProducts = filteredProducts.filter(
          (p) => p.isActive === isActive
        );
      }
    }

    return {
      products: filteredProducts,
      hasMore: false,
      total: filteredProducts.length,
    };
  }

  static async addProduct(productData: any, userId: string): Promise<string> {
    await this.delay();
    console.log("🔄 Mock product creation (Firebase not configured)");

    const newProduct: Product = {
      ...productData,
      id: `mock_${Date.now()}`,
      createdAt: { toDate: () => new Date() } as any,
      updatedAt: { toDate: () => new Date() } as any,
      createdBy: userId,
    };

    this.products.push(newProduct);
    console.log("✅ Mock product created:", newProduct.name);

    return newProduct.id!;
  }

  static async uploadProductImages(images: File[]): Promise<string[]> {
    await this.delay(1000);
    console.log("🔄 Mock image upload (Firebase not configured)");

    // Return mock image URLs
    return images.map(
      (_, index) =>
        `https://via.placeholder.com/400x300/ef4444/fff?text=Image+${index + 1}`
    );
  }

  static async getFeaturedProducts(limit = 8): Promise<Product[]> {
    await this.delay();
    return this.products.filter((p) => p.featured).slice(0, limit);
  }

  static async getProductById(id: string): Promise<Product | null> {
    await this.delay();
    return this.products.find((p) => p.id === id) || null;
  }

  static async updateProduct(
    id: string,
    updates: any,
    userId: string
  ): Promise<void> {
    await this.delay();
    const productIndex = this.products.findIndex((p) => p.id === id);
    if (productIndex >= 0) {
      this.products[productIndex] = {
        ...this.products[productIndex],
        ...updates,
        updatedAt: { toDate: () => new Date() } as any,
      };
    }
  }

  static async deleteProduct(id: string, userId: string): Promise<void> {
    await this.delay();
    this.products = this.products.filter((p) => p.id !== id);
  }

  // Helper method to detect if Firebase is available
  static isFirebaseConfigured(): boolean {
    try {
      const requiredVars = [
        "VITE_FIREBASE_API_KEY",
        "VITE_FIREBASE_AUTH_DOMAIN",
        "VITE_FIREBASE_PROJECT_ID",
        "VITE_FIREBASE_STORAGE_BUCKET",
        "VITE_FIREBASE_MESSAGING_SENDER_ID",
        "VITE_FIREBASE_APP_ID",
      ];

      return requiredVars.every((varName) => {
        const value = import.meta.env[varName];
        return value && value.trim() !== "";
      });
    } catch {
      return false;
    }
  }
}

export default MockProductService;
