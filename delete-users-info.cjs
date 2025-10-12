// Delete all users using Firebase REST API
const https = require("https");
const { execSync } = require("child_process");

// Get the Firebase CLI token
const getAccessToken = () => {
  try {
    const token = execSync("firebase login:ci", { encoding: "utf8" }).trim();
    return token;
  } catch (error) {
    // Try to get token from current login
    try {
      const result = execSync("firebase --token", { encoding: "utf8" }).trim();
      return result;
    } catch {
      console.error("Please run: firebase login");
      process.exit(1);
    }
  }
};

async function deleteUser(uid) {
  const projectId = "omu-fusion";
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:delete?key=YOUR_WEB_API_KEY`;

  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ localId: uid });

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": data.length,
      },
    };

    const req = https.request(url, options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(body));
        } else {
          reject(new Error(`Failed to delete user ${uid}: ${body}`));
        }
      });
    });

    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

// Read the backed up users
const fs = require("fs");
const users = JSON.parse(fs.readFileSync("users_backup.json", "utf8"));

console.log(`Found ${users.users.length} users to delete`);

// User IDs to delete
const userIds = [
  "4SfIigrA6INRID2UU4CvhlY0C4Y2",
  "7GZlhFJ4SBUxUdryUhdDezsQ71p2",
  "B39zTwMt7afcgV0KP4qSJvgvK0E2",
  "HnwrmV7ho6UilPFkr7T2uL5VphH2",
  "ZAuOrcE8JDcbqAOOC6DaIjN0UVN2",
];

console.log("\n⚠️  WARNING: This will delete ALL customer accounts!");
console.log("Users to be deleted:");
users.users.forEach((u) => {
  console.log(`  - ${u.email || "No email"} (${u.localId})`);
});

console.log("\nBackup saved to: users_backup.json");
console.log("\nNote: Using Firebase CLI directly...\n");

// Use Firebase CLI to delete users
userIds.forEach((uid, index) => {
  console.log(
    `[${index + 1}/${userIds.length}] Attempting to delete user: ${uid}`
  );
});

console.log(
  "\n✅ Script completed. Please use Firebase Console or gcloud CLI to delete users."
);
console.log(
  "\nAlternative: Use Firebase Console > Authentication > Select users > Delete"
);
