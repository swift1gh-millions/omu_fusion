import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User as FirebaseUser,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  Timestamp,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import {
  UserProfile,
  Address,
  UserPreferences,
  DatabaseInitializer,
} from "./databaseSchema";
import {
  SignUpSchema,
  SignInSchema,
  type SignUpData,
  type SignInData,
} from "./validationSchemas";
import ErrorService from "./errorService";
import CacheService from "./cacheService";

export type UserRole = "customer" | "admin" | "moderator";

export interface Permission {
  resource: string;
  actions: string[];
}

export interface EnhancedUserProfile extends UserProfile {
  role: UserRole;
  permissions: Permission[];
  lastLoginAt?: Timestamp;
  loginCount: number;
  accountStatus: "active" | "suspended" | "pending_verification";
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    registrationSource?: string;
  };
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  phone?: string;
  role: UserRole;
  permissions: Permission[];
  emailVerified: boolean;
  accountStatus: "active" | "suspended" | "pending_verification";
  createdAt: string;
  lastLoginAt?: string;
}

class EnhancedAuthService {
  private static readonly ADMIN_COLLECTION = "admins";
  private static readonly USERS_COLLECTION = "users";
  private static readonly CACHE_TTL = 10 * 60 * 1000; // 10 minutes

  // Role-based permissions
  private static readonly ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
    customer: [
      { resource: "profile", actions: ["read", "update"] },
      { resource: "cart", actions: ["read", "write"] },
      { resource: "orders", actions: ["read", "create"] },
      { resource: "reviews", actions: ["read", "write"] },
      { resource: "wishlist", actions: ["read", "write"] },
    ],
    moderator: [
      { resource: "profile", actions: ["read", "update"] },
      { resource: "products", actions: ["read", "update"] },
      { resource: "categories", actions: ["read", "update"] },
      { resource: "reviews", actions: ["read", "write", "moderate"] },
      { resource: "orders", actions: ["read", "update"] },
    ],
    admin: [
      { resource: "*", actions: ["*"] }, // Full access
    ],
  };

  // Listen for auth state changes
  static onAuthStateChanged(callback: (user: AuthUser | null) => void) {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userProfile = await this.getEnhancedUserProfile(
            firebaseUser.uid
          );
          if (userProfile) {
            // Update last login
            await this.updateLastLogin(firebaseUser.uid);

            const authUser: AuthUser = {
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              firstName: userProfile.firstName,
              lastName: userProfile.lastName,
              avatar: userProfile.avatar,
              phone: userProfile.phoneNumber,
              role: userProfile.role,
              permissions: userProfile.permissions,
              emailVerified: firebaseUser.emailVerified,
              accountStatus: userProfile.accountStatus,
              createdAt: userProfile.createdAt.toDate().toISOString(),
              lastLoginAt: userProfile.lastLoginAt?.toDate().toISOString(),
            };
            callback(authUser);
          } else {
            callback(null);
          }
        } catch (error) {
          ErrorService.logError(
            error as Error,
            { action: "Auth state change" },
            "high"
          );
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  }

  // Sign up new user with enhanced validation
  static async signUp(signUpData: SignUpData): Promise<AuthUser> {
    return ErrorService.handleServiceError(
      async () => {
        // Validate input data
        const validatedData = SignUpSchema.parse(signUpData);

        console.log("Starting enhanced signup process...", validatedData.email);

        // Set LOCAL persistence for customer accounts (persists across tabs/windows)
        await setPersistence(auth, browserLocalPersistence);

        // Create Firebase Auth user
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          validatedData.email,
          validatedData.password
        );

        // Clear any admin session markers
        sessionStorage.removeItem("isAdminSession");
        sessionStorage.removeItem("adminUserId");

        const firebaseUser = userCredential.user;

        // Update display name
        await updateProfile(firebaseUser, {
          displayName: `${validatedData.firstName} ${validatedData.lastName}`,
        });

        // Send email verification
        await sendEmailVerification(firebaseUser);

        // Create enhanced user profile
        const userProfile: EnhancedUserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email!,
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          phoneNumber: "",
          addresses: [],
          preferences: {
            newsletter: false,
            smsNotifications: false,
            orderUpdates: true,
            promotions: false,
            language: "en",
            currency: "GHS",
            sizePreference: [],
            favoriteCategories: [],
          },
          role:
            validatedData.email === "admin@omufusion.com"
              ? "admin"
              : "customer",
          permissions:
            validatedData.email === "admin@omufusion.com"
              ? this.ROLE_PERMISSIONS.admin
              : this.ROLE_PERMISSIONS.customer,
          loginCount: 1,
          accountStatus: "pending_verification",
          metadata: {
            userAgent: navigator.userAgent,
            registrationSource: "website",
          },
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          emailVerified: false,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.email}`,
        };

        await setDoc(
          doc(db, this.USERS_COLLECTION, firebaseUser.uid),
          userProfile
        );

        // Initialize user cart and wishlist
        await DatabaseInitializer.initializeUserCart(firebaseUser.uid);
        await DatabaseInitializer.initializeUserWishlist(firebaseUser.uid);

        // Clear cache for this user
        CacheService.invalidate(`user_profile_${firebaseUser.uid}`);

        console.log("Enhanced user profile created successfully");

        const authUser: AuthUser = {
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          avatar: userProfile.avatar,
          role: userProfile.role,
          permissions: userProfile.permissions,
          emailVerified: false,
          accountStatus: userProfile.accountStatus,
          createdAt: new Date().toISOString(),
        };

        return authUser;
      },
      { action: "User signup" },
      "high"
    );
  }

  // Sign in with enhanced validation
  static async signIn(signInData: SignInData): Promise<AuthUser> {
    return ErrorService.handleServiceError(
      async () => {
        // Validate input data
        const validatedData = SignInSchema.parse(signInData);

        // Set LOCAL persistence for customer accounts (persists across tabs/windows)
        await setPersistence(auth, browserLocalPersistence);

        const userCredential = await signInWithEmailAndPassword(
          auth,
          validatedData.email,
          validatedData.password
        );

        const firebaseUser = userCredential.user;
        const userProfile = await this.getEnhancedUserProfile(firebaseUser.uid);

        if (!userProfile) {
          throw new Error("User profile not found");
        }

        // Prevent admin accounts from logging in as customers
        if (userProfile.role === "admin" || userProfile.role === "moderator") {
          await signOut(auth);
          throw new Error(
            "Admin accounts cannot be used to access the shopping site. Please use the admin dashboard login."
          );
        }

        // Check account status
        if (userProfile.accountStatus === "suspended") {
          await signOut(auth);
          throw new Error(
            "Account has been suspended. Please contact support."
          );
        }

        // Update login statistics
        await this.updateLastLogin(firebaseUser.uid);

        // Clear any admin session markers
        sessionStorage.removeItem("isAdminSession");
        sessionStorage.removeItem("adminUserId");

        const authUser: AuthUser = {
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          firstName: userProfile.firstName,
          lastName: userProfile.lastName,
          avatar: userProfile.avatar,
          phone: userProfile.phoneNumber,
          role: userProfile.role,
          permissions: userProfile.permissions,
          emailVerified: firebaseUser.emailVerified,
          accountStatus: userProfile.accountStatus,
          createdAt: userProfile.createdAt.toDate().toISOString(),
          lastLoginAt: userProfile.lastLoginAt?.toDate().toISOString(),
        };

        return authUser;
      },
      { action: "User signin" },
      "medium"
    );
  }

  // Sign out
  static async signOut(): Promise<void> {
    return ErrorService.handleServiceError(
      async () => {
        await signOut(auth);
        // Clear all user-related cache
        CacheService.invalidatePattern("user_.*");
      },
      { action: "User signout" },
      "low"
    );
  }

  // Send password reset email
  static async sendPasswordResetEmail(email: string): Promise<void> {
    return ErrorService.handleServiceError(
      async () => {
        await sendPasswordResetEmail(auth, email);
      },
      { action: "Password reset" },
      "medium"
    );
  }

  // Get enhanced user profile with caching
  private static async getEnhancedUserProfile(
    uid: string
  ): Promise<EnhancedUserProfile | null> {
    const cacheKey = `user_profile_${uid}`;

    return CacheService.getOrFetch(
      cacheKey,
      async () => {
        const userDoc = await getDoc(doc(db, this.USERS_COLLECTION, uid));
        if (userDoc.exists()) {
          return userDoc.data() as EnhancedUserProfile;
        }
        return null;
      },
      this.CACHE_TTL
    );
  }

  // Update last login timestamp and increment login count
  private static async updateLastLogin(uid: string): Promise<void> {
    try {
      const userRef = doc(db, this.USERS_COLLECTION, uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const currentData = userDoc.data() as EnhancedUserProfile;
        await updateDoc(userRef, {
          lastLoginAt: Timestamp.now(),
          loginCount: (currentData.loginCount || 0) + 1,
          updatedAt: Timestamp.now(),
        });

        // Invalidate cache
        CacheService.invalidate(`user_profile_${uid}`);
      }
    } catch (error) {
      // Don't fail login if we can't update login stats
      ErrorService.logError(
        error as Error,
        { action: "Update login stats" },
        "low"
      );
    }
  }

  // Check if user has specific permission
  static hasPermission(
    user: AuthUser,
    resource: string,
    action: string
  ): boolean {
    // Admin has all permissions
    if (user.role === "admin") {
      return true;
    }

    return user.permissions.some(
      (permission) =>
        (permission.resource === resource || permission.resource === "*") &&
        (permission.actions.includes(action) ||
          permission.actions.includes("*"))
    );
  }

  // Check if user is admin
  static isAdmin(user: AuthUser): boolean {
    return user.role === "admin";
  }

  // Check if user is moderator or admin
  static isModerator(user: AuthUser): boolean {
    return user.role === "moderator" || user.role === "admin";
  }

  // Promote user to admin (only for existing admins)
  static async promoteToAdmin(
    currentUser: AuthUser,
    targetUserId: string
  ): Promise<void> {
    if (!this.isAdmin(currentUser)) {
      throw new Error("Only admins can promote users");
    }

    return ErrorService.handleServiceError(
      async () => {
        const userRef = doc(db, this.USERS_COLLECTION, targetUserId);
        await updateDoc(userRef, {
          role: "admin",
          permissions: this.ROLE_PERMISSIONS.admin,
          updatedAt: Timestamp.now(),
        });

        // Add to admin collection
        await setDoc(doc(db, this.ADMIN_COLLECTION, targetUserId), {
          promotedBy: currentUser.id,
          promotedAt: Timestamp.now(),
          email: (await getDoc(userRef)).data()?.email,
        });

        // Clear cache
        CacheService.invalidate(`user_profile_${targetUserId}`);
      },
      { action: "Promote user to admin", userId: currentUser.id },
      "high"
    );
  }

  // Suspend user account
  static async suspendUser(
    currentUser: AuthUser,
    targetUserId: string,
    reason: string
  ): Promise<void> {
    if (!this.isAdmin(currentUser) && !this.isModerator(currentUser)) {
      throw new Error("Only admins and moderators can suspend users");
    }

    return ErrorService.handleServiceError(
      async () => {
        const userRef = doc(db, this.USERS_COLLECTION, targetUserId);
        await updateDoc(userRef, {
          accountStatus: "suspended",
          suspendedBy: currentUser.id,
          suspendedAt: Timestamp.now(),
          suspensionReason: reason,
          updatedAt: Timestamp.now(),
        });

        // Clear cache
        CacheService.invalidate(`user_profile_${targetUserId}`);
      },
      { action: "Suspend user account", userId: currentUser.id },
      "high"
    );
  }

  // Get user by email (admin only)
  static async getUserByEmail(
    currentUser: AuthUser,
    email: string
  ): Promise<EnhancedUserProfile | null> {
    if (!this.isAdmin(currentUser)) {
      throw new Error("Only admins can search users by email");
    }

    return ErrorService.handleServiceError(
      async () => {
        const q = query(
          collection(db, this.USERS_COLLECTION),
          where("email", "==", email)
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          return null;
        }

        return querySnapshot.docs[0].data() as EnhancedUserProfile;
      },
      { action: "Get user by email", userId: currentUser.id },
      "medium"
    );
  }
}

export default EnhancedAuthService;
