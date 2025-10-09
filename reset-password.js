import { initializeApp } from "firebase/app";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyC-rq5mAMEfx4JAgIMnGDNGfKXbWFRqW_c",
  authDomain: "omu-fusion.firebaseapp.com",
  projectId: "omu-fusion",
  storageBucket: "omu-fusion.firebasestorage.app",
  messagingSenderId: "262096243067",
  appId: "1:262096243067:web:600538f542dda81feb55de",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const resetPassword = async () => {
  try {
    console.log("Sending password reset email...");

    const email = "swift1gh@gmail.com";

    await sendPasswordResetEmail(auth, email);

    console.log("✅ Password reset email sent to:", email);
    console.log("Check your email inbox for reset instructions.");
  } catch (error) {
    console.error("❌ Error sending password reset email:", error);
  }
};

resetPassword();
