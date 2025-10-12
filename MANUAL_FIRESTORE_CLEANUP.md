# 🧹 Manual Firestore Cleanup Instructions

## ✅ What You've Done:

- Deleted 4 customer accounts from Firebase Authentication
- **Kept**: admin@omufusion.com (UID: 7GZlhFJ4SBUxUdryUhdDezsQ71p2)

## 🎯 What Needs to be Deleted from Firestore:

### 📋 Based on Your Screenshots:

**From `/users` collection - Delete these 4 documents:**

1. `4SfIigrA6INRID2UU4C...` (princeyekunya523@gmail.com)
2. `B39zTwMt7afcgV0KP4q...` (swift1gh@gmail.com)
3. `HnwrmV7ho6UilPFkr7T...` (testaccount@gmail.com)
4. `ZAuOrcE8JDcbqAOOC6D...` (test@example.com)

**✅ KEEP**: `7GZlhFJ4SBUxUdryUhd...` (admin@omufusion.com)

- ⚠️ **IMPORTANT**: Actually, you should DELETE this too since admin should NOT be a customer!
- Admin data should only exist in the `/admins` collection

---

## 📝 Step-by-Step Manual Deletion:

### 1️⃣ Clean `/users` Collection

```
URL: https://console.firebase.google.com/project/omu-fusion/firestore/data/~2Fusers
```

**Steps:**

1. Click on `/users` collection in left panel
2. You'll see 5 documents listed
3. Click on each document (one at a time)
4. Click the **three dots menu** (⋮) at the top right
5. Select **"Delete document"**
6. Confirm deletion

**Delete ALL 5 documents** (including the admin one since admin shouldn't be a customer)

---

### 2️⃣ Clean `/carts` Collection

```
URL: https://console.firebase.google.com/project/omu-fusion/firestore/data/~2Fcarts
```

**Steps:**

1. Click on `/carts` collection
2. Delete any cart documents that match the customer UIDs
3. If there's a cart for the admin, delete that too

---

### 3️⃣ Clean `/wishlists` Collection

```
URL: https://console.firebase.google.com/project/omu-fusion/firestore/data/~2Fwishlists
```

**Steps:**

1. Click on `/wishlists` collection
2. Delete any wishlist documents that match the customer UIDs
3. If there's a wishlist for the admin, delete that too

---

### 4️⃣ Clean `/orders` Collection (if any)

```
URL: https://console.firebase.google.com/project/omu-fusion/firestore/data/~2Forders
```

**Steps:**

1. Click on `/orders` collection
2. Check the `userId` field of each order
3. Delete orders where `userId` matches any of the deleted customer UIDs

---

## ✅ What to KEEP:

### `/admins` Collection

```
Document ID: 7GZlhFJ4SBUxUdryUhdDezsQ71p2
Fields:
  - email: "admin@omufusion.com"
  - promotedAt: 8 October 2025 at 15:48:55 UTC
  - promotedBy: "system"
```

**This should remain intact!** This is the proper admin data.

### `/categories` Collection

Keep all categories - this is product data, not user data.

### `/products` Collection

Keep all products - this is inventory data, not user data.

---

## 🎯 Final State:

**Authentication:**

- ✅ 1 user: admin@omufusion.com

**Firestore Collections:**

- ✅ `/admins` - 1 document (admin)
- ✅ `/categories` - All kept
- ✅ `/products` - All kept
- ❌ `/users` - 0 documents (delete all 5)
- ❌ `/carts` - 0 documents
- ❌ `/wishlists` - 0 documents
- ❌ `/orders` - 0 documents (or only keep admin orders if needed)

---

## 🚨 Critical Point:

**Admin should NOT be in `/users` collection!**

Your app structure:

- **Customers** → `/users` collection
- **Admins** → `/admins` collection

The admin@omufusion.com account should only exist in:

1. ✅ Firebase Authentication
2. ✅ `/admins` collection in Firestore
3. ❌ NOT in `/users` collection

---

## ⚡ Quick Deletion Checklist:

- [ ] Delete 5 documents from `/users` (including admin)
- [ ] Delete all documents from `/carts`
- [ ] Delete all documents from `/wishlists`
- [ ] Delete customer orders from `/orders`
- [ ] Verify `/admins` collection still has admin document
- [ ] Verify `/categories` and `/products` untouched

---

## 🎉 After Cleanup:

Your database will be clean with:

- 1 admin account for management
- 0 customer accounts (ready for fresh signups)
- All products and categories preserved
- Clean slate for testing

---

**Need help?** The Firebase Console UI makes this easy - just click, delete, confirm. Each document deletion takes ~2 seconds.
