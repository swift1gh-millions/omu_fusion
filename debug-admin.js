// Quick Debug Script for Admin Issues
// Run this in the browser console after trying to log in as admin

console.log("🔍 Admin Debug Information");
console.log("📍 Current URL:", window.location.href);
console.log("🔐 Admin session:", sessionStorage.getItem("isAdminSession"));
console.log("👤 Admin user ID:", sessionStorage.getItem("adminUserId"));

// Check Firebase Auth state
if (window.firebase && firebase.auth) {
  const user = firebase.auth().currentUser;
  console.log("🔥 Firebase user:", user);

  if (user) {
    console.log("👤 User UID:", user.uid);
    console.log("📧 User email:", user.email);
    console.log("✅ Email verified:", user.emailVerified);
  }
}

// Check if admin document exists
async function checkAdminDocument() {
  try {
    const user = firebase.auth().currentUser;
    if (!user) {
      console.log("❌ No user signed in");
      return;
    }

    const db = firebase.firestore();
    const adminDoc = await db.collection("admins").doc(user.uid).get();

    console.log("📄 Admin document exists:", adminDoc.exists);
    if (adminDoc.exists) {
      console.log("📋 Admin document data:", adminDoc.data());
    }

    const userDoc = await db.collection("users").doc(user.uid).get();
    console.log("👤 User document exists:", userDoc.exists);
    if (userDoc.exists) {
      const userData = userDoc.data();
      console.log("👤 User role:", userData.role);
      console.log("🔑 User permissions:", userData.permissions);
    }
  } catch (error) {
    console.error("❌ Error checking documents:", error);
  }
}

// Auto-check if on admin page
if (window.location.pathname.includes("/admin")) {
  setTimeout(checkAdminDocument, 2000);
}

console.log("💡 Run checkAdminDocument() to manually check admin documents");
