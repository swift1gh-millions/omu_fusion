// Firebase Connection Test
// Run this in browser console to test Firebase connection

import { db } from "./src/utils/firebase.ts";
import { collection, getDocs } from "firebase/firestore";

export async function testFirebaseConnection() {
  try {
    console.log("🔥 Testing Firebase connection...");

    // Test Firestore connection
    const testCollection = collection(db, "test");
    await getDocs(testCollection);

    console.log("✅ Firebase Firestore connection successful!");
    return { success: true, message: "Firebase is connected and working" };
  } catch (error) {
    console.error("❌ Firebase connection failed:", error);
    return { success: false, error: error.message };
  }
}

// Auto-run test
testFirebaseConnection().then((result) => {
  console.log("Firebase Test Result:", result);
});
