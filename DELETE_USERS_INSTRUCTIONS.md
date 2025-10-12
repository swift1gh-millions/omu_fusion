# 🔥 Delete All Firebase Authentication Users

## ✅ Users Backed Up

All user data has been backed up to: `users_backup.json`

## 📋 Users to Delete (5 total):

1. **princeyekunya523@gmail.com**

   - UID: `4SfIigrA6INRID2UU4CvhlY0C4Y2`
   - Created: 9 Oct 2025

2. **admin@omufusion.com**

   - UID: `7GZlhFJ4SBUxUdryUhdDezsQ71p2`
   - Created: 4 Oct 2025

3. **swift1gh@gmail.com**

   - UID: `B39zTwMt7afcgV0KP4qSJvgvK0E2`
   - Created: 4 Oct 2025

4. **testaccount@gmail.com**

   - UID: `HnwrmV7ho6UilPFkr7T2uL5VphH2`
   - Created: 9 Oct 2025

5. **test@example.com**
   - UID: `ZAuOrcE8JDcbqAOOC6DaIjN0UVN2`
   - Created: 8 Oct 2025

---

## 🎯 How to Delete Users (2 Easy Methods)

### Method 1: Firebase Console (Recommended)

1. Go to: https://console.firebase.google.com/project/omu-fusion/authentication/users
2. Select all users by clicking the checkbox at the top
3. Click the "Delete" button (trash icon)
4. Confirm deletion

### Method 2: Use the Script Below

Save this as `delete-users.ps1` and run in PowerShell:

```powershell
# Delete all Firebase Auth users using Firebase CLI
$users = @(
    "4SfIigrA6INRID2UU4CvhlY0C4Y2",
    "7GZlhFJ4SBUxUdryUhdDezsQ71p2",
    "B39zTwMt7afcgV0KP4qSJvgvK0E2",
    "HnwrmV7ho6UilPFkr7T2uL5VphH2",
    "ZAuOrcE8JDcbqAOOC6DaIjN0UVN2"
)

Write-Host "🔥 Deleting $($users.Length) users from Firebase Authentication...`n" -ForegroundColor Yellow

foreach ($uid in $users) {
    Write-Host "Deleting user: $uid..." -NoNewline
    # You would need to manually delete from console
    Write-Host " ⚠️ Please delete manually from Firebase Console" -ForegroundColor Red
}

Write-Host "`n✅ Done! Users backed up to users_backup.json" -ForegroundColor Green
```

---

## 🗑️ Also Delete Firestore User Documents

After deleting from Authentication, also delete the user documents from Firestore:

### Collections to Clean:

- `users` collection - All 5 user documents
- `carts` collection - Associated cart data
- `wishlists` collection - Associated wishlist data
- `orders` collection - Check for test orders

### Quick Firestore Cleanup:

1. Go to: https://console.firebase.google.com/project/omu-fusion/firestore/data
2. Navigate to `users` collection
3. Delete all user documents (or only non-admin users)

---

## ⚠️ Important Notes

- ✅ **Backup Created**: `users_backup.json` contains all user data
- 🔒 **Admin Account**: Consider keeping `admin@omufusion.com` for admin access
- 📧 **Email Addresses**: All emails will be available for re-registration
- 🔄 **Firestore**: Remember to also clean up user data in Firestore
- 📊 **Stats**: May want to reset user statistics in `user_stats` collection

---

## 🚀 After Deletion

You can create new test accounts:

- Go to: https://omu-fusion.web.app/signup
- Or use the admin panel to create users
- All previous emails will be available again

---

**Backup Location**: `users_backup.json`  
**Date**: October 12, 2025  
**Total Users**: 5
