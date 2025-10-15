import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserSessionPersistence,
  User as FirebaseUser,
} from "firebase/auth";
import {
  doc,
  getDoc,
  updateDoc,
  Timestamp,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import { AuthUser, UserRole } from "./enhancedAuthService";
import toast from "react-hot-toast";

/**
 * Admin Authentication Service
 *
 * This service handles authentication specifically for admin users.
 * It uses SESSION persistence (not LOCAL) to ensure admin login
 * only persists in the current tab and doesn't affect customer sessions
 * in other tabs.
 *
 * Key Features:
 * - Session-based persistence (only current tab)
 * - Admin-only access validation
 * - Separate from customer authentication
 * - Prevents cross-contamination between admin and customer sessions
 */
class AdminAuthService {
  private static readonly ADMINS_COLLECTION = "admins";
  private static sessionInitialized = false;

  /**
   * Initialize admin session persistence
   * Sets auth to use SESSION persistence so it only affects current tab
   */
  private static async initializeSessionPersistence(): Promise<void> {
    if (!this.sessionInitialized) {
      try {
        await setPersistence(auth, browserSessionPersistence);
        this.sessionInitialized = true;
        console.log("Admin session persistence initialized");
      } catch (error) {
        console.error("Failed to set session persistence:", error);
        throw error;
      }
    }
  }

  /**
   * Check if a user is an admin by looking in the admins collection
   */
  private static async isAdmin(uid: string): Promise<boolean> {
    try {
      console.log(`🔍 Checking admin status for UID: ${uid}`);
      const adminDoc = await getDoc(doc(db, this.ADMINS_COLLECTION, uid));
      const isAdminUser = adminDoc.exists();
      console.log(`👤 Is admin: ${isAdminUser}`);
      return isAdminUser;
    } catch (error) {
      console.error("❌ Error checking admin status:", error);
      return false;
    }
  }

  /**
   * Get admin profile from Firestore
   */
  private static async getUserProfile(uid: string): Promise<any | null> {
    try {
      console.log(`🔍 Getting admin profile for UID: ${uid}`);

      // Get admin data from admins collection
      const adminDoc = await getDoc(doc(db, this.ADMINS_COLLECTION, uid));
      console.log(`📄 Admin document exists: ${adminDoc.exists()}`);

      if (adminDoc.exists()) {
        const adminData = adminDoc.data();
        console.log(`📋 Admin data:`, adminData);

        // Also get user profile data for display name
        const userDoc = await getDoc(doc(db, "users", uid));
        console.log(`👤 User document exists: ${userDoc.exists()}`);

        let firstName = "Admin";
        let lastName = "User";
        let permissions = [];

        if (userDoc.exists()) {
          const userData = userDoc.data();
          firstName = userData.firstName || "Admin";
          lastName = userData.lastName || "User";
          permissions = userData.permissions || [];
        }

        // Create a user profile format compatible with AuthUser
        const profile = {
          firstName,
          lastName,
          email: adminData.email,
          username: adminData.username,
          recoveryEmail: adminData.recoveryEmail,
          role: "admin",
          permissions,
          accountStatus: "active",
          loginCount: adminData.loginCount || 0,
          lastLoginAt: adminData.lastLoginAt,
          createdAt: adminData.promotedAt || adminData.createdAt,
          updatedAt: Timestamp.now(),
        };

        console.log(`✅ Returning admin profile:`, profile);
        return profile;
      } else {
        console.log(`❌ Admin document not found for UID: ${uid}`);
        return null;
      }
    } catch (error) {
      console.error("❌ Error getting admin profile:", error);
      return null;
    }
  }

  /**
   * Update last login timestamp in admins collection
   */
  private static async updateLastLogin(uid: string): Promise<void> {
    try {
      const adminRef = doc(db, this.ADMINS_COLLECTION, uid);
      const adminDoc = await getDoc(adminRef);

      if (adminDoc.exists()) {
        const currentLoginCount = adminDoc.data().loginCount || 0;
        await updateDoc(adminRef, {
          lastLoginAt: Timestamp.now(),
          loginCount: currentLoginCount + 1,
          lastUpdated: Timestamp.now(),
        });
      }
    } catch (error) {
      console.error("Error updating admin last login:", error);
    }
  }

  /**
   * Find admin email by username
   */
  private static async getAdminEmailByUsername(
    username: string
  ): Promise<string | null> {
    try {
      const adminsRef = collection(db, this.ADMINS_COLLECTION);
      const q = query(adminsRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const adminDoc = querySnapshot.docs[0];
        const adminData = adminDoc.data();
        return adminData.email;
      }

      return null;
    } catch (error) {
      console.error("Error finding admin by username:", error);
      return null;
    }
  }

  /**
   * Sign in admin user with email or username
   * Only affects current tab/window
   */
  static async signIn(
    emailOrUsername: string,
    password: string
  ): Promise<AuthUser> {
    try {
      // Initialize session persistence before signing in
      await this.initializeSessionPersistence();

      // Determine if input is email or username
      let email = emailOrUsername;

      // Simple email validation - if it doesn't contain @ it's likely a username
      if (!emailOrUsername.includes("@")) {
        // Try to find email by username
        const foundEmail = await this.getAdminEmailByUsername(emailOrUsername);
        if (!foundEmail) {
          throw new Error("Username not found");
        }
        email = foundEmail;
      }

      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const firebaseUser = userCredential.user;

      // Verify user is an admin
      const isAdminUser = await this.isAdmin(firebaseUser.uid);
      if (!isAdminUser) {
        // Sign out if not admin
        await signOut(auth);
        throw new Error(
          "Access denied. This account does not have admin privileges."
        );
      }

      // Get full user profile
      const userProfile = await this.getUserProfile(firebaseUser.uid);
      if (!userProfile) {
        await signOut(auth);
        throw new Error("User profile not found");
      }

      // Update last login
      await this.updateLastLogin(firebaseUser.uid);

      // Mark this session as admin session
      sessionStorage.setItem("isAdminSession", "true");
      sessionStorage.setItem("adminUserId", firebaseUser.uid);

      // Trigger storage event for cross-component communication
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "isAdminSession",
          newValue: "true",
          storageArea: sessionStorage,
        })
      );

      // Return auth user
      const authUser: AuthUser = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        username: userProfile.username,
        recoveryEmail: userProfile.recoveryEmail,
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
    } catch (error: any) {
      console.error("Admin sign in error:", error);

      // Clear any session markers
      sessionStorage.removeItem("isAdminSession");
      sessionStorage.removeItem("adminUserId");

      if (error.code === "auth/user-not-found") {
        throw new Error("Admin account not found");
      } else if (error.code === "auth/wrong-password") {
        throw new Error("Invalid credentials");
      } else if (error.code === "auth/invalid-credential") {
        throw new Error(
          "Invalid email or password. Please check your credentials."
        );
      } else if (error.code === "auth/too-many-requests") {
        throw new Error("Too many failed attempts. Please try again later.");
      } else if (error.message?.includes("Access denied")) {
        throw error;
      } else if (error.message?.includes("Username not found")) {
        throw new Error("Username not found");
      } else {
        console.error("Full error details:", error);
        throw new Error(
          `Login failed: ${error.message || "Please try again."}`
        );
      }
    }
  }

  /**
   * Sign out admin user
   * Only affects current tab
   */
  static async signOut(): Promise<void> {
    try {
      await signOut(auth);
      sessionStorage.removeItem("isAdminSession");
      sessionStorage.removeItem("adminUserId");

      // Trigger storage event for cross-component communication
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "isAdminSession",
          newValue: null,
          storageArea: sessionStorage,
        })
      );

      console.log("Admin signed out successfully");
    } catch (error) {
      console.error("Admin sign out error:", error);
      throw new Error("Failed to sign out");
    }
  }

  /**
   * Check if current session is an admin session
   */
  static isAdminSession(): boolean {
    return sessionStorage.getItem("isAdminSession") === "true";
  }

  /**
   * Get current admin user ID from session
   */
  static getAdminUserId(): string | null {
    return sessionStorage.getItem("adminUserId");
  }

  /**
   * Listen for admin auth state changes
   * Only triggers for admin sessions in current tab
   */
  static onAuthStateChanged(
    callback: (user: AuthUser | null) => void
  ): () => void {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      // Only process if this is an admin session
      const isAdminSession = this.isAdminSession();

      if (firebaseUser && isAdminSession) {
        try {
          const userProfile = await this.getUserProfile(firebaseUser.uid);

          if (
            userProfile &&
            (userProfile.role === "admin" || userProfile.role === "moderator")
          ) {
            const authUser: AuthUser = {
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              firstName: userProfile.firstName,
              lastName: userProfile.lastName,
              username: userProfile.username,
              recoveryEmail: userProfile.recoveryEmail,
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
            // Not an admin, sign out
            await this.signOut();
            callback(null);
          }
        } catch (error) {
          console.error("Error in admin auth state change:", error);
          callback(null);
        }
      } else if (!isAdminSession && firebaseUser) {
        // There's a Firebase user but not in admin session
        // This might be a customer in another tab
        // Don't callback anything to avoid interference
        return;
      } else {
        // No user or session ended
        callback(null);
      }
    });
  }

  /**
   * Verify admin access for protected routes
   */
  static async verifyAdminAccess(): Promise<boolean> {
    const isAdminSession = this.isAdminSession();
    if (!isAdminSession) {
      return false;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      return false;
    }

    return await this.isAdmin(currentUser.uid);
  }

  /**
   * Update admin username in Firestore
   */
  static async updateAdminUsername(newUsername: string): Promise<void> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("Not authenticated");
      }

      const adminRef = doc(db, this.ADMINS_COLLECTION, currentUser.uid);
      await updateDoc(adminRef, {
        username: newUsername,
        lastUpdated: Timestamp.now(),
      });

      console.log("Admin username updated successfully");
    } catch (error) {
      console.error("Error updating admin username:", error);
      throw new Error("Failed to update username");
    }
  }

  /**
   * Update admin recovery email in Firestore
   */
  static async updateAdminRecoveryEmail(
    newRecoveryEmail: string
  ): Promise<void> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("Not authenticated");
      }

      const adminRef = doc(db, this.ADMINS_COLLECTION, currentUser.uid);
      await updateDoc(adminRef, {
        recoveryEmail: newRecoveryEmail,
        lastUpdated: Timestamp.now(),
      });

      console.log("Admin recovery email updated successfully");
    } catch (error) {
      console.error("Error updating admin recovery email:", error);
      throw new Error("Failed to update recovery email");
    }
  }
}

export default AdminAuthService;
