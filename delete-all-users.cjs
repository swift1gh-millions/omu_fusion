// Delete all Firebase Authentication users
const admin = require("firebase-admin");

// Initialize with project ID
admin.initializeApp({
  projectId: "omu-fusion",
});

async function deleteAllUsers() {
  try {
    console.log("Starting to delete all users...");

    const listAllUsers = async (nextPageToken) => {
      const listUsersResult = await admin.auth().listUsers(1000, nextPageToken);

      // Delete all users in this batch
      const deletePromises = listUsersResult.users.map((userRecord) => {
        console.log(`Deleting user: ${userRecord.email || userRecord.uid}`);
        return admin.auth().deleteUser(userRecord.uid);
      });

      await Promise.all(deletePromises);
      console.log(
        `Deleted ${listUsersResult.users.length} users in this batch`
      );

      // If there are more users, continue to next page
      if (listUsersResult.pageToken) {
        await listAllUsers(listUsersResult.pageToken);
      }
    };

    await listAllUsers();
    console.log("✅ All users deleted successfully!");
  } catch (error) {
    console.error("Error deleting users:", error);
  } finally {
    process.exit();
  }
}

deleteAllUsers();
