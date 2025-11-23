declare global {
  interface ImportMetaEnv {
    readonly MODE: string;
    readonly VITE_FIREBASE_API_KEY: string;
    readonly VITE_FIREBASE_AUTH_DOMAIN: string;
    readonly VITE_FIREBASE_PROJECT_ID: string;
    readonly VITE_FIREBASE_STORAGE_BUCKET: string;
    readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
    readonly VITE_FIREBASE_APP_ID: string;
    readonly VITE_PAYSTACK_PUBLIC_KEY?: string;
    readonly VITE_PAYSTACK_SECRET_KEY?: string;
  }
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import EnvironmentService from "./environmentService";

// Validate environment and get Firebase config
let firebaseConfig;
let app;
let db;
let auth;
let storage;

try {
  firebaseConfig = EnvironmentService.getFirebaseConfig();

  // Initialize Firebase
  app = initializeApp(firebaseConfig);

  // Initialize Firebase services
  db = getFirestore(app);
  auth = getAuth(app);
  storage = getStorage(app);

  console.log("🔥 Firebase initialized successfully");
} catch (error) {
  console.warn("⚠️ Firebase initialization failed:", error);
  console.warn("📱 Application will run in mock mode");

  // Create mock objects to prevent app crashes
  db = null as any;
  auth = null as any;
  storage = null as any;
  app = null as any;
}

export { db, auth, storage };
export default app;
