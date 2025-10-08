// Test script to add sample data for the admin user
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  setDoc,
  doc,
  Timestamp,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBOcGvmGvWNtYL21FVpA5L1Dd0A9vTJK9E",
  authDomain: "omu-fusion.firebaseapp.com",
  projectId: "omu-fusion",
  storageBucket: "omu-fusion.firebasestorage.app",
  messagingSenderId: "236077798370",
  appId: "1:236077798370:web:7ac6b7ab9e7b9d8c8c8f27",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function addSampleData() {
  try {
    console.log("Adding sample orders for admin user...");

    // Sample orders for the admin user
    const adminUserId = "admin"; // This should match your admin user ID

    const orders = [
      {
        userId: adminUserId,
        items: [
          {
            productId: "cap-1",
            productName: "Premium Baseball Cap",
            productImage:
              "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400",
            price: 29.99,
            quantity: 2,
          },
        ],
        total: 59.98,
        status: "delivered",
        createdAt: Timestamp.fromDate(new Date("2024-09-15")),
      },
      {
        userId: adminUserId,
        items: [
          {
            productId: "hoodie-1",
            productName: "Cozy Hoodie",
            productImage:
              "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400",
            price: 79.99,
            quantity: 1,
          },
        ],
        total: 79.99,
        status: "delivered",
        createdAt: Timestamp.fromDate(new Date("2024-09-20")),
      },
      {
        userId: adminUserId,
        items: [
          {
            productId: "cap-2",
            productName: "Classic Snapback",
            productImage:
              "https://images.unsplash.com/photo-1575428652377-a0d1c006b9da?w=400",
            price: 39.99,
            quantity: 1,
          },
        ],
        total: 39.99,
        status: "shipped",
        createdAt: Timestamp.fromDate(new Date("2024-10-01")),
      },
    ];

    // Add orders
    for (const order of orders) {
      const docRef = await addDoc(collection(db, "orders"), order);
      console.log("Created order:", docRef.id);
    }

    // Add wishlist
    console.log("Adding sample wishlist...");
    const wishlist = {
      userId: adminUserId,
      items: [
        {
          productId: "hoodie-2",
          productName: "Winter Hoodie",
          productImage:
            "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
          price: 89.99,
          addedAt: Timestamp.now(),
        },
        {
          productId: "cap-3",
          productName: "Vintage Cap",
          productImage:
            "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400",
          price: 34.99,
          addedAt: Timestamp.now(),
        },
      ],
      updatedAt: Timestamp.now(),
    };

    await setDoc(doc(db, "wishlists", adminUserId), wishlist);
    console.log("Created wishlist");

    console.log("Sample data added successfully!");
  } catch (error) {
    console.error("Error adding sample data:", error);
  }
}

addSampleData();
