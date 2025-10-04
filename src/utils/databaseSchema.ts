import { db } from "../utils/firebase";
import { collection, doc, setDoc, addDoc, Timestamp } from "firebase/firestore";

// Database schema and initialization for OMU Fusion

export interface UserProfile {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  avatar?: string;
  addresses: Address[];
  preferences: UserPreferences;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  emailVerified: boolean;
}

export interface Address {
  id: string;
  type: "home" | "work" | "other";
  firstName: string;
  lastName: string;
  address: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export interface UserPreferences {
  newsletter: boolean;
  smsNotifications: boolean;
  orderUpdates: boolean;
  promotions: boolean;
  language: string;
  currency: string;
  sizePreference: string[];
  favoriteCategories: string[];
}

export interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  image: string;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  updatedAt: Timestamp;
}

export interface Wishlist {
  userId: string;
  productIds: string[];
  updatedAt: Timestamp;
}

export interface ProductReview {
  id?: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  verified: boolean;
  helpful: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface OrderTracking {
  orderId: string;
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  updates: TrackingUpdate[];
  estimatedDelivery?: Timestamp;
  trackingNumber?: string;
}

export interface TrackingUpdate {
  status: string;
  message: string;
  location?: string;
  timestamp: Timestamp;
}

export interface ProductAnalytics {
  productId: string;
  views: number;
  cartAdds: number;
  purchases: number;
  wishlistAdds: number;
  averageRating: number;
  totalReviews: number;
  lastUpdated: Timestamp;
}

export interface Notification {
  id?: string;
  userId: string;
  type: "order" | "promotion" | "system" | "review";
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: Timestamp;
}

export interface Coupon {
  id?: string;
  code: string;
  description: string;
  type: "percentage" | "fixed" | "free_shipping";
  value: number;
  minimumOrder?: number;
  maxUses?: number;
  usedCount: number;
  validFrom: Timestamp;
  validUntil: Timestamp;
  isActive: boolean;
}

// Database initialization functions
export class DatabaseInitializer {
  static async initializeCollections() {
    // This function can be called to ensure all collections exist
    // Firestore creates collections automatically when first document is added
    console.log(
      "Database collections will be created automatically when first documents are added"
    );
  }

  static async createSampleData() {
    // Add any sample data initialization here if needed
    console.log("Sample data initialization can be added here");
  }

  // Helper function to create user profile
  static async createUserProfile(
    uid: string,
    userData: Partial<UserProfile>
  ): Promise<void> {
    const userProfile: UserProfile = {
      uid,
      email: userData.email || "",
      firstName: userData.firstName || "",
      lastName: userData.lastName || "",
      phoneNumber: userData.phoneNumber,
      addresses: userData.addresses || [],
      preferences: userData.preferences || {
        newsletter: true,
        smsNotifications: true,
        orderUpdates: true,
        promotions: true,
        language: "en",
        currency: "GHS",
        sizePreference: [],
        favoriteCategories: [],
      },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      emailVerified: false,
      ...userData,
    };

    await setDoc(doc(db, "users", uid), userProfile);
  }

  // Helper function to initialize user cart
  static async initializeUserCart(userId: string): Promise<void> {
    const cart: Cart = {
      userId,
      items: [],
      totalItems: 0,
      subtotal: 0,
      updatedAt: Timestamp.now(),
    };

    await setDoc(doc(db, "carts", userId), cart);
  }

  // Helper function to initialize user wishlist
  static async initializeUserWishlist(userId: string): Promise<void> {
    const wishlist: Wishlist = {
      userId,
      productIds: [],
      updatedAt: Timestamp.now(),
    };

    await setDoc(doc(db, "wishlists", userId), wishlist);
  }
}
