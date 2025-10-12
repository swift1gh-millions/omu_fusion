import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  Timestamp,
} from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";

// Firebase configuration (replace with your actual config)
const firebaseConfig = {
  apiKey: "AIzaSyA8li-tIBgQ0f29c7prX-fwyzOARVnQ3uY",
  authDomain: "omufusion-3bd41.firebaseapp.com",
  projectId: "omufusion-3bd41",
  storageBucket: "omufusion-3bd41.firebasestorage.app",
  messagingSenderId: "571890450164",
  appId: "1:571890450164:web:4c91c773abcc63495935b9",
  measurementId: "G-FT7HCQTJM8",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const fixAdminPermissions = async () => {
  try {
    console.log("🔧 Fixing admin permissions...");

    // Admin credentials
    const email = "admin@omufusion.com";
    const password = "Admin123!"; // Change this if you used a different password

    // Sign in as admin
    console.log("📝 Signing in as admin...");
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    console.log(`✅ Signed in successfully: ${user.uid}`);

    // Check if admin document exists in /admins collection
    console.log("🔍 Checking /admins collection...");
    const adminDocRef = doc(db, "admins", user.uid);
    const adminDoc = await getDoc(adminDocRef);

    if (!adminDoc.exists()) {
      console.log(
        "❌ Admin document missing in /admins collection. Creating..."
      );

      // Create admin document in /admins collection
      await setDoc(adminDocRef, {
        promotedBy: "system",
        promotedAt: Timestamp.now(),
        email: user.email,
        loginCount: 0,
        lastLoginAt: null,
        createdAt: Timestamp.now(),
      });

      console.log("✅ Admin document created in /admins collection");
    } else {
      console.log("✅ Admin document already exists in /admins collection");
    }

    // Check if user profile exists in /users collection
    console.log("🔍 Checking /users collection...");
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      console.log("❌ User profile missing in /users collection. Creating...");

      // Create user profile in /users collection
      const userProfile = {
        uid: user.uid,
        email: user.email,
        firstName: "Admin",
        lastName: "User",
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
        role: "admin",
        permissions: [
          "user:read",
          "user:write",
          "user:delete",
          "product:read",
          "product:write",
          "product:delete",
          "order:read",
          "order:write",
          "order:delete",
          "analytics:read",
          "category:read",
          "category:write",
          "category:delete",
          "admin:access",
        ],
        loginCount: 0,
        accountStatus: "active",
        metadata: {
          userAgent: "Admin Fix Script",
          registrationSource: "fix-script",
        },
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        emailVerified: true,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
      };

      await setDoc(userDocRef, userProfile);
      console.log("✅ User profile created in /users collection");
    } else {
      console.log("✅ User profile already exists in /users collection");

      // Update role to admin if it's not already
      const userData = userDoc.data();
      if (userData.role !== "admin") {
        console.log("🔧 Updating user role to admin...");
        await setDoc(userDocRef, {
          ...userData,
          role: "admin",
          permissions: [
            "user:read",
            "user:write",
            "user:delete",
            "product:read",
            "product:write",
            "product:delete",
            "order:read",
            "order:write",
            "order:delete",
            "analytics:read",
            "category:read",
            "category:write",
            "category:delete",
            "admin:access",
          ],
          updatedAt: Timestamp.now(),
        });
        console.log("✅ User role updated to admin");
      }
    }

    // Sign out
    await signOut(auth);

    console.log("🎉 Admin permissions fixed successfully!");
    console.log("📱 You can now log in to the admin dashboard");
  } catch (error) {
    console.error("❌ Error fixing admin permissions:", error);
  }
};

// Run the function
fixAdminPermissions();
