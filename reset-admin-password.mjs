// Password reset for admin user
import { initializeApp } from "firebase/app";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyC-rq5mAMEfx4JAgIMnGDNGfKXbWFRqW_c",
  authDomain: "omu-fusion.firebaseapp.com",
  projectId: "omu-fusion",
  storageBucket: "omu-fusion.firebasestorage.app",
  messagingSenderId: "262096243067",
  appId: "1:262096243067:web:600538f542dda81feb55de",
};

const resetAdminPassword = async () => {
  try {
    console.log("🔓 Sending password reset email...\n");

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);

    const email = "admin@omufusion.com";

    await sendPasswordResetEmail(auth, email);

    console.log("✅ Password reset email sent successfully!");
    console.log("📧 Check your email:", email);
    console.log("\n📝 After resetting password:");
    console.log("1. Check your email and reset password");
    console.log("2. Run: node create-admin-document.mjs");
    console.log("3. Update the password in the script");
    console.log("\n🎯 Then try admin login again!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
};

resetAdminPassword();
