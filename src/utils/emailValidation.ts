import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Email Validation Utility
 * Checks if an email is already registered in the system
 */

export class EmailValidationService {
  private static readonly USERS_COLLECTION = "users";

  /**
   * Check if an email already exists in the database
   * @param email - Email address to check
   * @returns true if email exists, false otherwise
   */
  static async emailExists(email: string): Promise<boolean> {
    try {
      if (!email || !email.trim()) {
        return false;
      }

      const emailLower = email.toLowerCase().trim();

      const q = query(
        collection(db, this.USERS_COLLECTION),
        where("email", "==", emailLower)
      );

      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error("Error checking email:", error);
      // Return false to not block user if check fails
      return false;
    }
  }

  /**
   * Validate email format
   * @param email - Email address to validate
   * @returns true if valid format, false otherwise
   */
  static isValidFormat(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Get user-friendly error message for email validation
   * @param email - Email address
   * @returns Error message or null if valid
   */
  static async getEmailError(email: string): Promise<string | null> {
    if (!email || !email.trim()) {
      return null; // Don't show error for empty field on blur
    }

    if (!this.isValidFormat(email)) {
      return "Please enter a valid email address";
    }

    const exists = await this.emailExists(email);
    if (exists) {
      return "This email is already registered";
    }

    return null;
  }
}
