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
const firebaseConfig = EnvironmentService.getFirebaseConfig();

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
