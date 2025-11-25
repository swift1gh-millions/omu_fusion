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

  console.log("🔧 Firebase Config Retrieved:", {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    hasApiKey: !!firebaseConfig.apiKey,
    environment: import.meta.env.MODE,
  });

  // Initialize Firebase
  app = initializeApp(firebaseConfig);

  // Initialize Firebase services
  db = getFirestore(app);
  auth = getAuth(app);
  storage = getStorage(app);

  console.log("🔥 Firebase initialized successfully");
  console.log("📊 Environment:", import.meta.env.MODE);
  console.log("🌐 Production build:", import.meta.env.PROD);
} catch (error) {
  console.warn("⚠️ Firebase initialization failed:", error);
  console.warn("📱 Application will run in mock mode");
  console.log("🔧 Environment details:", {
    MODE: import.meta.env.MODE,
    PROD: import.meta.env.PROD,
    hasApiKey: !!import.meta.env.VITE_FIREBASE_API_KEY,
    hasProjectId: !!import.meta.env.VITE_FIREBASE_PROJECT_ID,
  });

  // Create mock objects to prevent app crashes
  db = null as any;
  auth = null as any;
  storage = null as any;
  app = null as any;
}

export { db, auth, storage };
export default app;
