import { db } from "./src/utils/firebase.ts";
import { collection, addDoc, Timestamp, setDoc, doc } from "firebase/firestore";

// Admin user ID (update this with your actual admin user ID)
const ADMIN_USER_ID = "admin"; // You might need to update this

async function createSampleData() {
  try {
    console.log("Creating sample orders...");

    // Sample orders
    const sampleOrders = [
      {
        userId: ADMIN_USER_ID,
        items: [
          {
            productId: "product1",
            productName: "Premium Cotton T-Shirt",
            productImage:
              "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
            price: 49.99,
            quantity: 2,
          },
          {
            productId: "product2",
            productName: "Designer Jeans",
            productImage:
              "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400",
            price: 159.99,
            quantity: 1,
          },
        ],
        total: 259.97,
        status: "delivered",
        createdAt: Timestamp.fromDate(new Date("2024-09-15")),
      },
      {
        userId: ADMIN_USER_ID,
        items: [
          {
            productId: "product3",
            productName: "Casual Sneakers",
            productImage:
              "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400",
            price: 89.99,
            quantity: 1,
          },
        ],
        total: 89.99,
        status: "shipped",
        createdAt: Timestamp.fromDate(new Date("2024-09-28")),
      },
      {
        userId: ADMIN_USER_ID,
        items: [
          {
            productId: "product4",
            productName: "Winter Jacket",
            productImage:
              "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400",
            price: 199.98,
            quantity: 1,
          },
        ],
        total: 199.98,
        status: "processing",
        createdAt: Timestamp.fromDate(new Date("2024-10-01")),
      },
    ];

    // Add orders to Firestore
    for (const order of sampleOrders) {
      const docRef = await addDoc(collection(db, "orders"), order);
      console.log("Order created with ID:", docRef.id);
    }

    // Create sample wishlist
    console.log("Creating sample wishlist...");
    const sampleWishlist = {
      userId: ADMIN_USER_ID,
      items: [
        {
          productId: "product5",
          productName: "Leather Wallet",
          productImage:
            "https://images.unsplash.com/photo-1627123424574-724758594e93?w=400",
          price: 79.99,
          addedAt: Timestamp.now(),
        },
        {
          productId: "product6",
          productName: "Wireless Headphones",
          productImage:
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
          price: 149.99,
          addedAt: Timestamp.now(),
        },
      ],
      updatedAt: Timestamp.now(),
    };

    await setDoc(doc(db, "wishlists", ADMIN_USER_ID), sampleWishlist);
    console.log("Wishlist created successfully");

    console.log("Sample data created successfully!");
  } catch (error) {
    console.error("Error creating sample data:", error);
  }
}

createSampleData();
