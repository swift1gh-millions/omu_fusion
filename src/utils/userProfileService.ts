import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { UserProfile, Address } from "./databaseSchema";

export class UserProfileService {
  private static readonly COLLECTION_NAME = "users";

  // Create a new user profile
  static async createUserProfile(userProfile: UserProfile): Promise<void> {
    try {
      await setDoc(doc(db, this.COLLECTION_NAME, userProfile.uid), userProfile);
    } catch (error) {
      console.error("Error creating user profile:", error);
      throw new Error("Failed to create user profile");
    }
  }

  // Get user profile by ID
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const userDoc = await getDoc(doc(db, this.COLLECTION_NAME, userId));
      if (userDoc.exists()) {
        return userDoc.data() as UserProfile;
      }
      return null;
    } catch (error) {
      console.error("Error getting user profile:", error);
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
      await updateDoc(doc(db, this.COLLECTION_NAME, userId), updateData);
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw new Error("Failed to update user profile");
    }
  }

  // Add or update user address
  static async addAddress(
    userId: string,
    address: Omit<Address, "id">
  ): Promise<void> {
    try {
      const userProfile = await this.getUserProfile(userId);
      if (!userProfile) {
        throw new Error("User profile not found");
      }

      const newAddress: Address = {
        ...address,
        id: `addr_${Date.now()}`,
      };

      // If this is the first address or marked as default, make it default
      if (userProfile.addresses.length === 0 || address.isDefault) {
        // Remove default from other addresses
        userProfile.addresses = userProfile.addresses.map((addr) => ({
          ...addr,
          isDefault: false,
        }));
        newAddress.isDefault = true;
      }

      const updatedAddresses = [...userProfile.addresses, newAddress];

      await this.updateUserProfile(userId, { addresses: updatedAddresses });
    } catch (error) {
      console.error("Error adding address:", error);
      throw new Error("Failed to add address");
    }
  }

  // Update user address
  static async updateAddress(
    userId: string,
    addressId: string,
    updates: Partial<Address>
  ): Promise<void> {
    try {
      const userProfile = await this.getUserProfile(userId);
      if (!userProfile) {
        throw new Error("User profile not found");
      }

      const updatedAddresses = userProfile.addresses.map((addr) => {
        if (addr.id === addressId) {
          return { ...addr, ...updates };
        }
        return addr;
      });

      await this.updateUserProfile(userId, { addresses: updatedAddresses });
    } catch (error) {
      console.error("Error updating address:", error);
      throw new Error("Failed to update address");
    }
  }

  // Remove user address
  static async removeAddress(userId: string, addressId: string): Promise<void> {
    try {
      const userProfile = await this.getUserProfile(userId);
      if (!userProfile) {
        throw new Error("User profile not found");
      }

      const updatedAddresses = userProfile.addresses.filter(
        (addr) => addr.id !== addressId
      );

      // If the removed address was default and there are other addresses, make the first one default
      const removedAddress = userProfile.addresses.find(
        (addr) => addr.id === addressId
      );
      if (removedAddress?.isDefault && updatedAddresses.length > 0) {
        updatedAddresses[0].isDefault = true;
      }

      await this.updateUserProfile(userId, { addresses: updatedAddresses });
    } catch (error) {
      console.error("Error removing address:", error);
      throw new Error("Failed to remove address");
    }
  }

  // Set default address
  static async setDefaultAddress(
    userId: string,
    addressId: string
  ): Promise<void> {
    try {
      const userProfile = await this.getUserProfile(userId);
      if (!userProfile) {
        throw new Error("User profile not found");
      }

      const updatedAddresses = userProfile.addresses.map((addr) => ({
        ...addr,
        isDefault: addr.id === addressId,
      }));

      await this.updateUserProfile(userId, { addresses: updatedAddresses });
    } catch (error) {
      console.error("Error setting default address:", error);
      throw new Error("Failed to set default address");
    }
  }

  // Update user preferences
  static async updatePreferences(
    userId: string,
    preferences: Partial<UserProfile["preferences"]>
  ): Promise<void> {
    try {
      const userProfile = await this.getUserProfile(userId);
      if (!userProfile) {
        throw new Error("User profile not found");
      }

      const updatedPreferences = {
        ...userProfile.preferences,
        ...preferences,
      };

      await this.updateUserProfile(userId, { preferences: updatedPreferences });
    } catch (error) {
      console.error("Error updating preferences:", error);
      throw new Error("Failed to update preferences");
    }
  }

  // Check if email exists (for registration validation)
  static async emailExists(email: string): Promise<boolean> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where("email", "==", email)
      );
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error("Error checking email existence:", error);
      return false;
    }
  }

  // Update phone number
  static async updatePhoneNumber(
    userId: string,
    phoneNumber: string
  ): Promise<void> {
    try {
      await this.updateUserProfile(userId, { phoneNumber });
    } catch (error) {
      console.error("Error updating phone number:", error);
      throw new Error("Failed to update phone number");
    }
  }

  // Update avatar
  static async updateAvatar(userId: string, avatar: string): Promise<void> {
    try {
      await this.updateUserProfile(userId, { avatar });
    } catch (error) {
      console.error("Error updating avatar:", error);
      throw new Error("Failed to update avatar");
    }
  }

  // Delete user profile (for account deletion)
  static async deleteUserProfile(userId: string): Promise<void> {
    try {
      // Note: This only deletes the profile document
      // For complete user deletion, you'd also need to delete related data
      // and handle Firebase Auth user deletion separately
      await updateDoc(doc(db, this.COLLECTION_NAME, userId), {
        isDeleted: true,
        deletedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("Error deleting user profile:", error);
      throw new Error("Failed to delete user profile");
    }
  }
}
