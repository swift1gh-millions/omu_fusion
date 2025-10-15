// Test discount creation script
// This should be run in the browser console or as a simple test

const testDiscountCode = {
  code: "OMUFUSION",
  type: "percentage",
  value: 10,
  description: "10% off for testing",
  minOrderAmount: 50,
  maxUses: 100,
  currentUses: 0,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: "test-admin",
};

// To manually add this to Firestore through Firebase console:
// 1. Go to Firebase Console
// 2. Navigate to Firestore Database
// 3. Create a new collection called "discounts"
// 4. Add a document with the above data structure

console.log("Test discount code data:");
console.log(JSON.stringify(testDiscountCode, null, 2));
console.log("\nCode to test: OMUFUSION");
console.log("Discount: 10% off orders over ₵50");
