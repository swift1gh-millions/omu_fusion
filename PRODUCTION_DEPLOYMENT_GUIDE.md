# Production Deployment Guide for OMU Fusion

## Issue: Products Not Showing on Netlify

The products appear locally but not on Netlify due to Firebase environment variable configuration issues.

## ✅ Fixes Applied

### 1. Environment Variables Added to netlify.toml

The Firebase configuration has been added directly to `netlify.toml`:

```toml
# Firebase Configuration
VITE_FIREBASE_API_KEY = "AIzaSyC-rq5mAMEfx4JAgIMnGDNGfKXbWFRqW_c"
VITE_FIREBASE_AUTH_DOMAIN = "omu-fusion.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID = "omu-fusion"
VITE_FIREBASE_STORAGE_BUCKET = "omu-fusion.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID = "262096243067"
VITE_FIREBASE_APP_ID = "1:262096243067:web:600538f542dda81feb55de"
```

### 2. Enhanced Error Handling

- Added production-specific error handling
- Improved fallback to mock data when Firebase fails
- Added comprehensive logging for debugging

### 3. Debug Logging

- Enhanced Firebase initialization logging
- Added environment detection
- Better error reporting in production

## 🚀 Deployment Steps

### Option A: Current Fix (Recommended)

1. **Commit and push these changes:**

   ```bash
   git add .
   git commit -m "Fix: Add Firebase environment variables for Netlify deployment"
   git push origin main
   ```

2. **Wait for Netlify auto-deploy** (if auto-deploy is enabled)
   - Check your Netlify dashboard for deployment status
   - Look for the new deployment with your latest commit

### Option B: Alternative - Netlify Dashboard (More Secure)

If you prefer not to have environment variables in the code:

1. **Go to your Netlify Dashboard:**

   - Navigate to your site
   - Go to Site Settings → Environment Variables

2. **Add these variables:**

   ```
   VITE_FIREBASE_API_KEY = AIzaSyC-rq5mAMEfx4JAgIMnGDNGfKXbWFRqW_c
   VITE_FIREBASE_AUTH_DOMAIN = omu-fusion.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID = omu-fusion
   VITE_FIREBASE_STORAGE_BUCKET = omu-fusion.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID = 262096243067
   VITE_FIREBASE_APP_ID = 1:262096243067:web:600538f542dda81feb55de
   VITE_FIREBASE_MEASUREMENT_ID = G-23JNK7ZJ71
   VITE_PAYSTACK_PUBLIC_KEY = pk_test_f7ba2aa066b1833b97f0d0090b10dad7e626b5fe
   ```

3. **Remove the variables from netlify.toml** and redeploy

## 🔍 Debugging

After deployment, check the browser console on your live site for:

1. **Success messages:**

   - `🔥 Firebase initialized successfully`
   - `✅ Firebase is configured and db object exists`

2. **Error messages:**
   - `❌ Firebase environment variables not configured`
   - `🔄 Using mock product service fallback`

## 🧪 Testing

1. **Visit your live site:** `https://yoursite.netlify.app/shop`
2. **Open browser developer tools → Console**
3. **Look for Firebase initialization messages**
4. **Check if products load or if mock data is used**

## 📋 Fallback Behavior

If Firebase still fails in production:

- The app will automatically use mock products
- Users will see sample products instead of empty pages
- Console will show clear error messages for debugging

## 🔒 Security Notes

**Firebase API keys in frontend applications are safe to expose** because:

- They identify your Firebase project, not authenticate users
- Firebase security is handled by Firestore rules (already configured)
- These keys are meant to be public in web applications

## 🆘 If Issues Persist

1. **Check Netlify build logs** for environment variable loading
2. **Verify Firebase project status** in Firebase Console
3. **Check Firestore rules** are deployed and active
4. **Contact support** with console error messages

## 📞 Support

If you continue to have issues:

- Check the browser console for specific error messages
- Verify your Firebase project is active
- Ensure Firestore database is enabled in Firebase Console
