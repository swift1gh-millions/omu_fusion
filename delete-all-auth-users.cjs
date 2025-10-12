const { execSync } = require("child_process");
const fs = require("fs");

// Read the backed up users
const users = JSON.parse(fs.readFileSync("users_backup.json", "utf8"));

console.log("🔥 Firebase User Deletion Script");
console.log("================================\n");
console.log(`Found ${users.users.length} users to delete:\n`);

users.users.forEach((u, i) => {
  console.log(`${i + 1}. ${u.email || "No email"} (UID: ${u.localId})`);
});

console.log("\n⚠️  WARNING: This will permanently delete these accounts!");
console.log("📁 Backup saved to: users_backup.json\n");

// Delete each user using Firebase CLI
const userIds = users.users.map((u) => u.localId);

console.log("Starting deletion process...\n");

let successCount = 0;
let failCount = 0;

userIds.forEach((uid, index) => {
  try {
    console.log(`[${index + 1}/${userIds.length}] Deleting user: ${uid}...`);

    // Use gcloud to delete the user
    const command = `gcloud identity platform users delete ${uid} --project=omu-fusion --quiet`;
    execSync(command, { encoding: "utf8", stdio: "pipe" });

    console.log(`✅ Successfully deleted user: ${uid}`);
    successCount++;
  } catch (error) {
    console.log(`❌ Failed to delete user: ${uid}`);
    console.log(`   Error: ${error.message}`);
    failCount++;
  }
  console.log("");
});

console.log("\n================================");
console.log("📊 Summary:");
console.log(`   ✅ Successfully deleted: ${successCount}`);
console.log(`   ❌ Failed: ${failCount}`);
console.log(`   📁 Total: ${userIds.length}`);
console.log("\n🎉 Deletion process completed!");
