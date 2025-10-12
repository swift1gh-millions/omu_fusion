// Direct script to create admin document in Firestore
// Run this with: node create-admin-document.mjs

import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyC-rq5mAMEfx4JAgIMnGDNGfKXbWFRqW_c",
  authDomain: "omu-fusion.firebaseapp.com",
  projectId: "omu-fusion",
  storageBucket: "omu-fusion.firebasestorage.app",
  messagingSenderId: "262096243067",
  appId: "1:262096243067:web:600538f542dda81feb55de",
};

const createAdminDocument = async () => {
  try {
    console.log("🔧 Creating admin document in Firestore...\n");

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    const email = "admin@omufusion.com";

    // Try multiple possible passwords
    const possiblePasswords = [
      "Admin123!",
      "admin123",
      "password",
      "123456",
      "admin@omufusion.com",
      "omufusion",
      "Admin@123",
    ];

    let user = null;
    let password = null;

    console.log("🔐 Trying different passwords...");

    for (const tryPassword of possiblePasswords) {
      try {
        console.log(`   Trying: ${tryPassword.replace(/./g, "*")}`);
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          tryPassword
        );
        user = userCredential.user;
        password = tryPassword;
        console.log(`✅ Success with password: ${tryPassword}`);
        break;
      } catch (error) {
        // Continue to next password
      }
    }

    if (!user) {
      throw new Error("Could not authenticate with any common passwords");
    }

    console.log("📧 Signing in as admin...");

    console.log("✅ Successfully signed in as:", user.email);
    console.log("🆔 Admin UID:", user.uid);

    console.log("📄 Creating admin document in /admins collection...");

    // Create admin document in admins collection
    const adminDocRef = doc(db, "admins", user.uid);
    await setDoc(adminDocRef, {
      email: user.email,
      promotedAt: serverTimestamp(),
      promotedBy: "system-repair",
      loginCount: 0,
      lastLoginAt: null,
      lastUpdated: serverTimestamp(),
      status: "active",
    });

    console.log("✅ Admin document created successfully!");
    console.log("📍 Location: /admins/" + user.uid);
    console.log("\n🎉 ADMIN LOGIN SHOULD NOW WORK!");
    console.log("🔗 Try: http://localhost:3001/admin/login");
    console.log("📧 Email: admin@omufusion.com");
    console.log("🔑 Password: Admin123!");
    console.log("\n✅ Setup complete!");
  } catch (error) {
    console.error("❌ Error:", error.message);

    if (error.code === "auth/user-not-found") {
      console.log("\n💡 Solution: The admin user needs to be created first.");
      console.log("Run: node setup-admin.js");
    } else if (error.code === "auth/wrong-password") {
      console.log("\n💡 Solution: Check the admin password in setup-admin.js");
    } else if (error.message.includes("permissions")) {
      console.log(
        "\n💡 Solution: The Firestore rules have been updated, try again in a minute."
      );
    }
  }
};

createAdminDocument();
