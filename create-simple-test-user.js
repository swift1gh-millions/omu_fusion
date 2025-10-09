import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc, Timestamp } from "firebase/firestore";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyC-rq5mAMEfx4JAgIMnGDNGfKXbWFRqW_c",
  authDomain: "omu-fusion.firebaseapp.com",
  projectId: "omu-fusion",
  storageBucket: "omu-fusion.firebasestorage.app",
  messagingSenderId: "262096243067",
  appId: "1:262096243067:web:600538f542dda81feb55de",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const createSimpleTestUser = async () => {
  try {
    console.log("Creating simple test user...");

    const email = "test@example.com";
    const password = "Test123456"; // Simple test password

    // Create the user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    console.log("Firebase user created:", user.uid);

    // Create user profile in Firestore
    const userProfile = {
      uid: user.uid,
      email: user.email,
      firstName: "Test",
      lastName: "User",
      phoneNumber: "",
      addresses: [],
      preferences: {
        newsletter: false,
        smsNotifications: false,
        orderUpdates: true,
        promotions: false,
        language: "en",
        currency: "USD",
        theme: "light",
      },
      role: "customer",
      permissions: [],
      accountStatus: "active",
      loginCount: 0,
      metadata: {
        registrationSource: "script",
      },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await setDoc(doc(db, "users", user.uid), userProfile);

    console.log("✅ Test user created successfully!");
    console.log("📧 Email: test@example.com");
    console.log("🔑 Password: Test123456");
    console.log("You can now sign in with these credentials.");
  } catch (error) {
    console.error("❌ Error creating test user:", error);
  }
};

createSimpleTestUser();
