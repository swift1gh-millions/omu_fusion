import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  Timestamp,
} from "firebase/firestore";

// Firebase config - you might need to adjust this based on your config
const firebaseConfig = {
  // Add your Firebase config here
  // This is just for testing, you can get this from your Firebase console
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function createTestDiscountCode() {
  try {
    const testDiscount = {
      code: "OMUFUSION",
      type: "percentage",
      value: 10,
      description: "10% off for testing",
      minOrderAmount: 50,
      maxUses: 100,
      currentUses: 0,
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      createdBy: "test-admin",
    };

    const docRef = await addDoc(collection(db, "discounts"), testDiscount);
    console.log("✅ Test discount code created with ID:", docRef.id);
    console.log("🎫 Code: OMUFUSION (10% off orders over ₵50)");
  } catch (error) {
    console.error("❌ Error creating test discount:", error);
  }
}

createTestDiscountCode();
