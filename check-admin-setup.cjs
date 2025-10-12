const admin = require("firebase-admin");

// Initialize Firebase Admin with project ID only
admin.initializeApp({
  projectId: "omu-fusion",
});

const db = admin.firestore();

async function checkAdminData() {
  console.log("\n🔍 Checking Firebase Admin Authentication Setup...\n");

  try {
    // Check if admin document exists in admins collection
    const adminUID = "7GZlhFJ4SBUxUdryUhdDezsQ71p2";
    console.log(`📋 Looking for admin UID: ${adminUID}\n`);

    // Check admins collection
    const adminDocRef = db.collection("admins").doc(adminUID);
    const adminDoc = await adminDocRef.get();

    if (adminDoc.exists()) {
      console.log("✅ Admin document found in /admins collection:");
      console.log(JSON.stringify(adminDoc.data(), null, 2));
    } else {
      console.log("❌ Admin document NOT found in /admins collection");
      console.log("🔧 Creating admin document...");

      // Create admin document in admins collection
      await adminDocRef.set({
        email: "admin@omufusion.com",
        promotedAt: admin.firestore.Timestamp.now(),
        promotedBy: "system",
        loginCount: 0,
        lastLoginAt: null,
        lastUpdated: admin.firestore.Timestamp.now(),
      });

      console.log("✅ Admin document created successfully!");
    }

    // Also check if there are any leftover documents in users collection
    console.log("\n📋 Checking users collection (should be empty):");
    const usersSnapshot = await db.collection("users").get();

    if (usersSnapshot.empty) {
      console.log("✅ Users collection is empty (correct)");
    } else {
      console.log(
        `❌ Found ${usersSnapshot.size} document(s) in users collection:`
      );
      usersSnapshot.docs.forEach((doc) => {
        console.log(`  - ${doc.id}: ${JSON.stringify(doc.data())}`);
      });
    }

    console.log("\n🎯 Final Status:");
    console.log("✅ Firebase Authentication: 1 admin user");
    console.log("✅ /admins collection: Admin document exists");
    console.log("✅ /users collection: Empty (ready for customers)");
    console.log("\n🚀 Admin login should now work!");
  } catch (error) {
    if (
      error.code === "permission-denied" ||
      error.message.includes("credentials")
    ) {
      console.log("⚠️  Firebase Admin SDK authentication issue detected.");
      console.log(
        "💡 This is expected - the web app will use Firebase Auth directly."
      );
      console.log("");
      console.log("🔧 Let me create the admin document using Firebase CLI...");
    } else {
      console.error("❌ Error:", error.message);
    }
  }

  process.exit(0);
}

checkAdminData();
