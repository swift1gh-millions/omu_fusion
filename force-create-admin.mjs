// Create admin document using any authentication
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyC-rq5mAMEfx4JAgIMnGDNGfKXbWFRqW_c",
  authDomain: "omu-fusion.firebaseapp.com",
  projectId: "omu-fusion",
  storageBucket: "omu-fusion.firebasestorage.app",
  messagingSenderId: "262096243067",
  appId: "1:262096243067:web:600538f542dda81feb55de",
};

const createAdminDocumentAnyUser = async () => {
  try {
    console.log("🔧 Creating admin document using temporary user...\n");

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    // Create a temporary user to get authenticated
    const tempEmail = "temp@setup.com";
    const tempPassword = "TempPassword123!";

    let tempUser;
    try {
      console.log("👤 Creating temporary user for authentication...");
      const tempCredential = await createUserWithEmailAndPassword(
        auth,
        tempEmail,
        tempPassword
      );
      tempUser = tempCredential.user;
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        console.log("👤 Temporary user exists, signing in...");
        const tempCredential = await signInWithEmailAndPassword(
          auth,
          tempEmail,
          tempPassword
        );
        tempUser = tempCredential.user;
      } else {
        throw error;
      }
    }

    console.log("✅ Authenticated as temporary user");

    // Now create the admin document for the admin UID
    const adminUID = "7GZlhFJ4SBUxUdryUhdDezsQ71p2"; // From the exported auth data
    const adminEmail = "admin@omufusion.com";

    console.log("📄 Creating admin document...");
    console.log("🆔 Admin UID:", adminUID);

    const adminDocRef = doc(db, "admins", adminUID);
    await setDoc(adminDocRef, {
      email: adminEmail,
      promotedAt: serverTimestamp(),
      promotedBy: "system-repair",
      loginCount: 0,
      lastLoginAt: null,
      lastUpdated: serverTimestamp(),
      status: "active",
      role: "admin",
    });

    console.log("✅ Admin document created successfully!");
    console.log("📍 Location: /admins/" + adminUID);

    // Clean up: delete temporary user (optional)
    console.log("🧹 Cleaning up temporary user...");
    try {
      await tempUser.delete();
      console.log("✅ Temporary user deleted");
    } catch (error) {
      console.log("⚠️  Could not delete temp user (not critical)");
    }

    console.log("\n🎉 ADMIN DOCUMENT CREATED!");
    console.log("🔑 Now reset the admin password via email");
    console.log("📧 Check admin@omufusion.com for reset email");
    console.log("🔗 Then try: http://localhost:3001/admin/login");
    console.log("\n✅ Setup should be complete after password reset!");
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error);
  }
};

createAdminDocumentAnyUser();
