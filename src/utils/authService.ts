import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User as FirebaseUser,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "./firebase";
import { UserProfile } from "./databaseSchema";

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  phone?: string;
  digitalAddress?: string;
  apartment?: string;
  country?: string;
  createdAt: string;
  emailVerified: boolean;
}

export interface SignUpData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export class AuthService {
  // Listen for auth state changes
  static onAuthStateChanged(callback: (user: AuthUser | null) => void) {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userProfile = await this.getUserProfile(firebaseUser.uid);
        if (userProfile) {
          const authUser: AuthUser = {
            id: firebaseUser.uid,
            email: firebaseUser.email!,
            firstName: userProfile.firstName,
            lastName: userProfile.lastName,
            avatar: userProfile.avatar,
            phone: userProfile.phoneNumber,
            digitalAddress: userProfile.addresses.find((addr) => addr.isDefault)
              ?.address,
            apartment: userProfile.addresses.find((addr) => addr.isDefault)
              ?.address,
            country:
              userProfile.addresses.find((addr) => addr.isDefault)?.country ||
              "Ghana",
            createdAt: userProfile.createdAt.toDate().toISOString(),
            emailVerified: firebaseUser.emailVerified,
          };
          callback(authUser);
        } else {
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  }

  // Sign up new user
  static async signUp(signUpData: SignUpData): Promise<AuthUser> {
    try {
      console.log("Starting Firebase signup process...", signUpData.email);

      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        signUpData.email,
        signUpData.password
      );

      console.log("Firebase user created:", userCredential.user.uid);
      const firebaseUser = userCredential.user;

      // Update display name
      try {
        await updateProfile(firebaseUser, {
          displayName: `${signUpData.firstName} ${signUpData.lastName}`,
        });
        console.log("Display name updated successfully");
      } catch (profileError: any) {
        console.warn("Failed to update display name:", profileError);
        // Continue even if display name update fails
      }

      // Create user profile in Firestore
      console.log("Creating user profile in Firestore...");
      const userProfile: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        firstName: signUpData.firstName,
        lastName: signUpData.lastName,
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
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        emailVerified: firebaseUser.emailVerified,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.email}`,
      };

      try {
        await setDoc(doc(db, "users", firebaseUser.uid), userProfile);
        console.log("User profile created successfully in Firestore");
      } catch (firestoreError: any) {
        console.error("Firestore error:", firestoreError);

        // If Firestore fails, we still want to return the user since Firebase Auth succeeded
        // The user can still use the app, just without the profile data
        console.warn(
          "User profile creation failed, but authentication succeeded"
        );
      }

      const authUser: AuthUser = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        firstName: signUpData.firstName,
        lastName: signUpData.lastName,
        avatar: userProfile.avatar,
        createdAt: new Date().toISOString(),
        emailVerified: firebaseUser.emailVerified,
      };

      return authUser;
    } catch (error: any) {
      console.error("Sign up error:", error);
      console.error("Error details:", {
        code: error.code,
        message: error.message,
        name: error.name,
      });
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  // Sign in existing user
  static async signIn(signInData: SignInData): Promise<AuthUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        signInData.email,
        signInData.password
      );

      const firebaseUser = userCredential.user;
      const userProfile = await this.getUserProfile(firebaseUser.uid);

      if (!userProfile) {
        throw new Error("User profile not found");
      }

      const authUser: AuthUser = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        avatar: userProfile.avatar,
        phone: userProfile.phoneNumber,
        digitalAddress: userProfile.addresses.find((addr) => addr.isDefault)
          ?.address,
        apartment: userProfile.addresses.find((addr) => addr.isDefault)
          ?.address,
        country:
          userProfile.addresses.find((addr) => addr.isDefault)?.country ||
          "Ghana",
        createdAt: userProfile.createdAt.toDate().toISOString(),
        emailVerified: firebaseUser.emailVerified,
      };

      return authUser;
    } catch (error: any) {
      console.error("Sign in error:", error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  // Sign out user
  static async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error("Sign out error:", error);
      throw new Error("Failed to sign out");
    }
  }

  // Get user profile from Firestore
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        return userDoc.data() as UserProfile;
      }
      return null;
    } catch (error) {
      console.error("Get user profile error:", error);
      return null;
    }
  }

  // Update user profile
  static async updateUserProfile(
    userId: string,
    updates: Partial<Omit<UserProfile, "uid" | "createdAt">>
  ): Promise<void> {
    try {
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now(),
      };
      await updateDoc(doc(db, "users", userId), updateData);
    } catch (error) {
      console.error("Update user profile error:", error);
      throw new Error("Failed to update profile");
    }
  }

  // Send password reset email
  static async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error("Password reset error:", error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  // Get current user
  static getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }

  // Convert Firebase error codes to user-friendly messages
  private static getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case "auth/user-not-found":
        return "No user found with this email address";
      case "auth/wrong-password":
        return "Incorrect password";
      case "auth/email-already-in-use":
        return "Email address is already registered";
      case "auth/weak-password":
        return "Password should be at least 6 characters";
      case "auth/invalid-email":
        return "Invalid email address";
      case "auth/too-many-requests":
        return "Too many attempts. Please try again later";
      default:
        return "An error occurred. Please try again";
    }
  }
}
