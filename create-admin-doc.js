// Admin document creation using Web Firebase SDK
// This should work because we're creating the document that will give us admin privileges

import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc, Timestamp } from "firebase/firestore";

// Firebase config (same as in your web app)
const firebaseConfig = {
  // You'll need to get these from your Firebase console
  // For now, this is a template - we'll use the existing firebase.ts config
};

// This script should be run in the browser console or with proper Firebase config
const createAdminDocument = async () => {
  try {
    console.log("🔧 Creating admin document...");

    // Initialize Firebase (using existing config from your app)
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    // Sign in as the admin first
    const email = "admin@omufusion.com";
    const password = prompt("Enter admin password:");

    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    console.log("✅ Signed in successfully:", user.uid);

    // Create admin document in admins collection
    const adminDocRef = doc(db, "admins", user.uid);
    await setDoc(adminDocRef, {
      email: user.email,
      promotedAt: Timestamp.now(),
      promotedBy: "system",
      loginCount: 0,
      lastLoginAt: Timestamp.now(),
      lastUpdated: Timestamp.now(),
    });

    console.log("✅ Admin document created successfully!");
    console.log("🎉 You should now be able to log in to the admin dashboard");
  } catch (error) {
    console.error("❌ Error:", error);
  }
};

// Instructions for running this
console.log(`
To create the admin document:

1. Open your browser
2. Go to: http://localhost:3001
3. Open Developer Tools (F12)
4. Go to Console tab
5. Paste this entire script and run it

Alternative: Run this as a Node.js script with proper Firebase config
`);
