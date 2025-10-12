const admin = require("firebase-admin");

// Initialize Firebase Admin
admin.initializeApp({
  projectId: "omu-fusion",
});

const db = admin.firestore();

// UIDs to delete (customers only, not admin)
const customerUIDs = [
  "4SfIigrA6INRID2UU4CvhlY0C4Y2", // princeyekunya523@gmail.com
  "B39zTwMt7afcgV0KP4qSJvgvK0E2", // swift1gh@gmail.com
  "HnwrmV7ho6UilPFkr7T2uL5VphH2", // testaccount@gmail.com
  "ZAuOrcE8JDcbqAOOC6DaIjN0UVN2", // test@example.com
];

// Keep admin UID: 7GZlhFJ4SBUxUdryUhdDezsQ71p2 (admin@omufusion.com)

async function cleanupFirestoreData() {
  console.log("\n🧹 Starting Firestore cleanup...\n");

  let deletedCount = {
    users: 0,
    carts: 0,
    wishlists: 0,
    orders: 0,
  };

  try {
    // 1. Delete user documents from 'users' collection
    console.log("📝 Deleting user documents...");
    for (const uid of customerUIDs) {
      try {
        await db.collection("users").doc(uid).delete();
        deletedCount.users++;
        console.log(`  ✅ Deleted user: ${uid}`);
      } catch (error) {
        console.log(`  ⚠️  User ${uid} not found or already deleted`);
      }
    }

    // 2. Delete cart documents
    console.log("\n🛒 Deleting cart documents...");
    for (const uid of customerUIDs) {
      try {
        await db.collection("carts").doc(uid).delete();
        deletedCount.carts++;
        console.log(`  ✅ Deleted cart: ${uid}`);
      } catch (error) {
        console.log(`  ⚠️  Cart ${uid} not found or already deleted`);
      }
    }

    // 3. Delete wishlist documents
    console.log("\n❤️  Deleting wishlist documents...");
    for (const uid of customerUIDs) {
      try {
        await db.collection("wishlists").doc(uid).delete();
        deletedCount.wishlists++;
        console.log(`  ✅ Deleted wishlist: ${uid}`);
      } catch (error) {
        console.log(`  ⚠️  Wishlist ${uid} not found or already deleted`);
      }
    }

    // 4. Query and delete orders by these users
    console.log("\n📦 Checking for orders...");
    for (const uid of customerUIDs) {
      try {
        const ordersSnapshot = await db
          .collection("orders")
          .where("userId", "==", uid)
          .get();

        if (!ordersSnapshot.empty) {
          const batch = db.batch();
          ordersSnapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
          });
          await batch.commit();
          deletedCount.orders += ordersSnapshot.size;
          console.log(
            `  ✅ Deleted ${ordersSnapshot.size} order(s) for user: ${uid}`
          );
        }
      } catch (error) {
        console.log(`  ⚠️  Error checking orders for ${uid}`);
      }
    }

    // Summary
    console.log("\n" + "=".repeat(50));
    console.log("✅ CLEANUP COMPLETE!");
    console.log("=".repeat(50));
    console.log(`📊 Summary:`);
    console.log(`   Users deleted:     ${deletedCount.users}`);
    console.log(`   Carts deleted:     ${deletedCount.carts}`);
    console.log(`   Wishlists deleted: ${deletedCount.wishlists}`);
    console.log(`   Orders deleted:    ${deletedCount.orders}`);
    console.log("\n✅ Admin account preserved (admin@omufusion.com)");
    console.log("   - Authentication: ✅ Kept");
    console.log("   - Firestore admins collection: ✅ Kept");
    console.log(
      "   - Firestore users collection: ❌ Removed (admin not a customer)"
    );
    console.log(
      "\n🎉 Database is now clean! Ready for fresh customer accounts.\n"
    );
  } catch (error) {
    console.error("\n❌ Error during cleanup:", error.message);
    process.exit(1);
  }

  process.exit(0);
}

cleanupFirestoreData();
