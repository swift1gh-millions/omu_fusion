// Manual Admin Document Creation Guide
// Since we can't run the setup script directly, here's what you need to do:

/*
1. Go to Firebase Console (https://console.firebase.google.com)
2. Navigate to your project: omufusion-3bd41  
3. Go to Firestore Database
4. Look for the user document with email: admin@omufusion.com
5. Copy the document ID (this is the UID)
6. Create a new document in the "admins" collection with the following structure:

Document ID: [the UID you copied]
Fields:
- promotedBy: "system" (string)
- promotedAt: [current timestamp]
- email: "admin@omufusion.com" (string)
- loginCount: 0 (number)
- lastLoginAt: null
- createdAt: [current timestamp]

7. Also ensure the user document in "users" collection has:
- role: "admin" (string)
- permissions: [array of permissions] (array)

This will fix the admin permission issue.
*/

// Alternative: Run this in the browser console on your admin page after signing in
window.fixAdminPermissions = async function () {
  try {
    console.log("🔧 Attempting to fix admin permissions...");

    // Get current user
    const auth = firebase.auth();
    const user = auth.currentUser;

    if (!user) {
      console.error("❌ No user signed in");
      return;
    }

    console.log(`👤 Current user: ${user.uid}`);

    // Create admin document
    const db = firebase.firestore();
    const adminRef = db.collection("admins").doc(user.uid);

    await adminRef.set({
      promotedBy: "browser-fix",
      promotedAt: firebase.firestore.Timestamp.now(),
      email: user.email,
      loginCount: 0,
      lastLoginAt: null,
      createdAt: firebase.firestore.Timestamp.now(),
    });

    console.log("✅ Admin document created successfully");

    // Reload the page
    window.location.reload();
  } catch (error) {
    console.error("❌ Error fixing admin permissions:", error);
  }
};
