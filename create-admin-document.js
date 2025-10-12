import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  Timestamp,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Firebase configuration (get from existing setup)
const firebaseConfig = {
  apiKey: "AIzaSyA8li-tIBgQ0f29c7prX-fwyzOARVnQ3uY",
  authDomain: "omufusion-3bd41.firebaseapp.com",
  projectId: "omufusion-3bd41",
  storageBucket: "omufusion-3bd41.firebasestorage.app",
  messagingSenderId: "571890450164",
  appId: "1:571890450164:web:4c91c773abcc63495935b9",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const createAdminDocument = async () => {
  try {
    console.log("Creating admin document...");

    // Admin user details (this should be the same UID as the existing auth user)
    const adminUid = "YOUR_ADMIN_UID"; // You'll need to get this from Firebase Console
    const adminEmail = "admin@omufusion.com";

    // Create admin document in /admins collection
    const adminDoc = doc(db, "admins", adminUid);
    const adminData = {
      promotedBy: "system",
      promotedAt: Timestamp.now(),
      email: adminEmail,
      loginCount: 0,
      lastLoginAt: null,
      createdAt: Timestamp.now(),
    };

    await setDoc(adminDoc, adminData);
    console.log("✅ Admin document created successfully");

    // Also ensure user profile has admin role
    const userDoc = doc(db, "users", adminUid);
    const userExists = await getDoc(userDoc);

    if (userExists.exists()) {
      const userData = userExists.data();
      if (userData.role !== "admin") {
        await setDoc(userDoc, { ...userData, role: "admin" });
        console.log("✅ User role updated to admin");
      }
    }

    console.log("🎉 Admin setup complete!");
  } catch (error) {
    console.error("❌ Error:", error);
  }
};

createAdminDocument();
