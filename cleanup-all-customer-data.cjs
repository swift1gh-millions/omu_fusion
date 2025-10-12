const admin = require("firebase-admin");

// Initialize Firebase Admin
admin.initializeApp({
  projectId: "omu-fusion",
});

const db = admin.firestore();

// Admin UID to KEEP
const ADMIN_UID = "7GZlhFJ4SBUxUdryUhdDezsQ71p2"; // admin@omufusion.com

async function cleanupAllCustomerData() {
  console.log("\n🧹 Starting complete Firestore cleanup...\n");

  let deletedCount = {
    users: 0,
    carts: 0,
    wishlists: 0,
    orders: 0,
  };

  try {
    // 1. Get ALL users from Firestore and delete except admin
    console.log("📝 Scanning users collection...");
    const usersSnapshot = await db.collection("users").get();

    for (const doc of usersSnapshot.docs) {
      const uid = doc.id;
      if (uid !== ADMIN_UID) {
        await doc.ref.delete();
        deletedCount.users++;
        console.log(
          `  ✅ Deleted user: ${uid} (${doc.data().email || "no email"})`
        );
      } else {
        console.log(`  ⏭️  Skipped admin: ${uid} (admin@omufusion.com)`);
      }
    }

    // 2. Get ALL carts and delete except admin
    console.log("\n🛒 Scanning carts collection...");
    const cartsSnapshot = await db.collection("carts").get();

    for (const doc of cartsSnapshot.docs) {
      const uid = doc.id;
      if (uid !== ADMIN_UID) {
        await doc.ref.delete();
        deletedCount.carts++;
        console.log(`  ✅ Deleted cart: ${uid}`);
      } else {
        console.log(`  ⏭️  Skipped admin cart: ${uid}`);
      }
    }

    // 3. Get ALL wishlists and delete except admin
    console.log("\n❤️  Scanning wishlists collection...");
    const wishlistsSnapshot = await db.collection("wishlists").get();

    for (const doc of wishlistsSnapshot.docs) {
      const uid = doc.id;
      if (uid !== ADMIN_UID) {
        await doc.ref.delete();
        deletedCount.wishlists++;
        console.log(`  ✅ Deleted wishlist: ${uid}`);
      } else {
        console.log(`  ⏭️  Skipped admin wishlist: ${uid}`);
      }
    }

    // 4. Get ALL orders and delete those not from admin
    console.log("\n📦 Scanning orders collection...");
    const ordersSnapshot = await db.collection("orders").get();

    for (const doc of ordersSnapshot.docs) {
      const orderData = doc.data();
      const userId = orderData.userId;

      if (userId !== ADMIN_UID) {
        await doc.ref.delete();
        deletedCount.orders++;
        console.log(`  ✅ Deleted order: ${doc.id} (user: ${userId})`);
      } else {
        console.log(`  ⏭️  Skipped admin order: ${doc.id}`);
      }
    }

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("✅ CLEANUP COMPLETE!");
    console.log("=".repeat(60));
    console.log(`📊 Summary:`);
    console.log(`   Users deleted:     ${deletedCount.users}`);
    console.log(`   Carts deleted:     ${deletedCount.carts}`);
    console.log(`   Wishlists deleted: ${deletedCount.wishlists}`);
    console.log(`   Orders deleted:    ${deletedCount.orders}`);
    console.log("\n✅ Preserved data for admin@omufusion.com:");
    console.log(`   - Authentication: ✅ Kept`);
    console.log(`   - Firestore /admins/${ADMIN_UID}: ✅ Kept`);
    console.log(
      `   - Firestore /users/${ADMIN_UID}: ❌ Deleted (not a customer)`
    );
    console.log(
      "\n🎉 Database is now clean! Ready for fresh customer accounts.\n"
    );
  } catch (error) {
    console.error("\n❌ Error during cleanup:", error.message);
    console.error(error);
    process.exit(1);
  }

  process.exit(0);
}

cleanupAllCustomerData();
