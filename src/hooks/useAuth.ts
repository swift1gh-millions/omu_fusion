import { useState, useEffect } from "react";
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, db } from "../utils/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { DatabaseInitializer } from "../utils/databaseSchema";

export interface UserProfile {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: "customer" | "admin";
  createdAt: string;
  updatedAt: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Get user profile from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data() as UserProfile);
        }
        setUser(user);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      const result = await signInWithEmailAndPassword(auth, email, password);

      // Get user profile
      const userDoc = await getDoc(doc(db, "users", result.user.uid));
      if (userDoc.exists()) {
        setUserProfile(userDoc.data() as UserProfile);
      }

      return result;
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    additionalData: Partial<UserProfile>
  ) => {
    try {
      setError(null);
      setLoading(true);
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Create user profile in Firestore
      const newUserProfile: UserProfile = {
        uid: result.user.uid,
        email: result.user.email || email,
        firstName: additionalData.firstName || "",
        lastName: additionalData.lastName || "",
        phoneNumber: additionalData.phoneNumber,
        role: additionalData.role || "customer",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, "users", result.user.uid), newUserProfile);

      // Initialize user cart and wishlist
      await DatabaseInitializer.initializeUserCart(result.user.uid);
      await DatabaseInitializer.initializeUserWishlist(result.user.uid);

      setUserProfile(newUserProfile);
      return result;
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const isAdmin = () => {
    return userProfile?.role === "admin";
  };

  const isCustomer = () => {
    return userProfile?.role === "customer";
  };

  return {
    user,
    userProfile,
    loading,
    error,
    signIn,
    signUp,
    logout,
    resetPassword,
    isAdmin,
    isCustomer,
    setError,
  };
};
