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

const createAdminUser = async () => {
  try {
    console.log("Creating admin user...");

    const email = "admin@omufusion.com";
    const password = "Admin123!"; // Change this to your desired password

    // Create the user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    console.log("Firebase user created:", user.uid);

    // Create admin profile in Firestore
    const adminProfile = {
      uid: user.uid,
      email: user.email,
      firstName: "Admin",
      lastName: "User",
      phoneNumber: "",
      addresses: [],
      preferences: {
        newsletter: false,
        smsNotifications: false,
        orderUpdates: true,
        promotions: false,
        language: "en",
        currency: "GHS",
        sizePreference: [],
        favoriteCategories: [],
      },
      role: "admin",
      permissions: [
        "user:read",
        "user:write",
        "user:delete",
        "product:read",
        "product:write",
        "product:delete",
        "order:read",
        "order:write",
        "order:delete",
        "analytics:read",
        "category:read",
        "category:write",
        "category:delete",
        "admin:access",
      ],
      loginCount: 0,
      accountStatus: "active",
      metadata: {
        userAgent: "Admin Setup Script",
        registrationSource: "setup",
      },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      emailVerified: false,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
    };

    await setDoc(doc(db, "users", user.uid), adminProfile);
    console.log("Admin profile created in Firestore");

    // Add to admins collection
    await setDoc(doc(db, "admins", user.uid), {
      promotedBy: "system",
      promotedAt: Timestamp.now(),
      email: user.email,
    });

    console.log("✅ Admin user created successfully!");
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log("You can now log in to the admin panel.");
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
  }
};

// Run the function
createAdminUser();
