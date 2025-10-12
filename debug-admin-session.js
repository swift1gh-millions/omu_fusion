// Simple test to check admin session status
console.log("🔍 Checking Admin Session Status...");

// Check session storage
const isAdminSession = sessionStorage.getItem("isAdminSession");
const adminUserId = sessionStorage.getItem("adminUserId");

console.log("📊 Session Data:");
console.log("  isAdminSession:", isAdminSession);
console.log("  adminUserId:", adminUserId);

// Check Firebase Auth current user
import("./src/utils/firebase.js").then(({ auth }) => {
  import("firebase/auth").then(({ onAuthStateChanged }) => {
    onAuthStateChanged(auth, (user) => {
      console.log("🔐 Firebase Auth Current User:");
      console.log("  user:", user ? user.uid : "null");
      console.log("  email:", user ? user.email : "null");

      if (user && isAdminSession === "true") {
        console.log("✅ Admin session is active and user is authenticated");
        console.log("🎯 Should be able to access admin dashboard");
      } else if (!user) {
        console.log("❌ No authenticated user");
      } else if (isAdminSession !== "true") {
        console.log("❌ Not marked as admin session");
      }
    });
  });
});

// Instructions
console.log("");
console.log("📝 To test:");
console.log("1. Run this in browser console after admin login");
console.log("2. Check if both user authentication and admin session are set");
console.log("3. If not, there might be a timing issue with the redirect");
