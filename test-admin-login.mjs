// Quick test of admin credentials
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyC-rq5mAMEfx4JAgIMnGDNGfKXbWFRqW_c",
  authDomain: "omu-fusion.firebaseapp.com",
  projectId: "omu-fusion",
  storageBucket: "omu-fusion.firebasestorage.app",
  messagingSenderId: "262096243067",
  appId: "1:262096243067:web:600538f542dda81feb55de",
};

const testAdminLogin = async () => {
  try {
    console.log("🔐 Testing admin credentials...\n");

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);

    const email = "admin@omufusion.com";
    const password = "Admin123!"; // From setup-admin.js

    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log("");

    // Try to sign in
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    console.log("✅ SUCCESS! Admin login works!");
    console.log("🆔 Admin UID:", user.uid);
    console.log("📧 Email:", user.email);
    console.log("🕐 Last Sign In:", new Date(user.metadata.lastSignInTime));
    console.log("");
    console.log("🎉 You can now login to admin dashboard!");
    console.log("🔗 Go to: http://localhost:3001/admin/login");
    console.log("📧 Email: admin@omufusion.com");
    console.log("🔑 Password: Admin123!");
  } catch (error) {
    console.error("❌ Login failed:", error.message);

    if (
      error.code === "auth/invalid-credential" ||
      error.code === "auth/wrong-password"
    ) {
      console.log("\n💡 The password might have been changed.");
      console.log("🔄 You can either:");
      console.log("   1. Try other common passwords");
      console.log("   2. Use the password reset email we sent");
      console.log("   3. Check if you changed the password in setup-admin.js");
    }
  }
};

testAdminLogin();
