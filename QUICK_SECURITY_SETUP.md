# 🚀 Quick Security Setup Guide

**Project**: OMU FUSION  
**Developer**: Prince Yekunya  
**Portfolio**: https://swift1dev.netlify.app

---

## ⚡ 5-Minute Security Setup

### Step 1: Environment Variables (2 minutes)

1. **Copy the template:**

   ```powershell
   Copy-Item .env.example .env
   ```

2. **Fill in your Firebase credentials:**

   - Open `.env` in your editor
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Navigate to Project Settings > General > Your apps
   - Copy each value and paste into `.env`

3. **Verify .env is ignored:**
   ```powershell
   git status
   # .env should NOT appear in the list
   ```

---

### Step 2: Firebase Security Rules (2 minutes)

1. **Deploy Firestore rules:**

   ```powershell
   firebase deploy --only firestore:rules
   ```

2. **Deploy Storage rules:**

   ```powershell
   firebase deploy --only storage:rules
   ```

3. **Verify in Firebase Console:**
   - Check Firestore Database > Rules
   - Check Storage > Rules
   - Both should show your deployed rules

---

### Step 3: Build & Test (1 minute)

1. **Install dependencies:**

   ```powershell
   npm install
   ```

2. **Test production build:**

   ```powershell
   npm run build
   npm run preview
   ```

3. **Run security audit:**
   ```powershell
   .\security-audit.ps1
   ```

---

## ✅ Verification Checklist

After setup, verify these items:

- [ ] `.env` file exists and has your credentials
- [ ] `.env` is listed in `.gitignore`
- [ ] Firebase rules deployed successfully
- [ ] Production build completes without errors
- [ ] Security audit passes (0 critical issues)
- [ ] Site loads at `http://localhost:4173` (preview)

---

## 🚀 Deploy to Netlify

### Option 1: GitHub Auto-Deploy

1. **Push to GitHub:**

   ```powershell
   git add .
   git commit -m "Initial commit with security"
   git push origin main
   ```

2. **Connect to Netlify:**

   - Go to [Netlify](https://app.netlify.com)
   - Click "New site from Git"
   - Select your repository
   - Netlify will auto-deploy

3. **Set environment variables:**
   - Site settings > Build & deploy > Environment
   - Add each variable from your `.env` file
   - Click "Save"

### Option 2: Manual Deploy

1. **Build for production:**

   ```powershell
   npm run build
   ```

2. **Deploy the dist folder:**
   - Drag `dist` folder to [Netlify Drop](https://app.netlify.com/drop)
   - Or use CLI: `netlify deploy --prod`

---

## 🔒 Security Status

After deployment, your site will have:

- ✅ **Environment variables protected** - Not in Git
- ✅ **Code obfuscated** - Minified and mangled
- ✅ **Security headers active** - CSP, HSTS, etc.
- ✅ **Firebase rules enforced** - Data protected
- ✅ **Rate limiting enabled** - Prevents abuse
- ✅ **HTTPS enforced** - Secure connections only
- ✅ **Developer attribution** - Credits preserved

---

## 📚 Next Steps

1. **Create admin account:**

   - Register a user account
   - Add user UID to `/admins` collection in Firestore
   - Test admin access at `/admin`

2. **Configure Paystack (if using payments):**

   - Get API keys from [Paystack Dashboard](https://dashboard.paystack.com)
   - Add `VITE_PAYSTACK_PUBLIC_KEY` to environment variables
   - Test payment flow

3. **Review documentation:**
   - Read `SECURITY.md` for detailed security info
   - Check `DEPLOYMENT_CHECKLIST.md` before production deploy
   - Review `SECURITY_FEATURES.md` for all security measures

---

## 🆘 Troubleshooting

### Build Fails

```powershell
# Clear cache and rebuild
Remove-Item -Recurse -Force node_modules, dist
npm install
npm run build
```

### Environment Variables Not Working

```powershell
# Restart development server after .env changes
# Ctrl+C to stop, then:
npm run dev
```

### Firebase Rules Errors

```powershell
# Check Firebase login
firebase login

# Re-deploy rules
firebase deploy --only firestore:rules,storage:rules
```

### Security Audit Fails

```powershell
# View detailed output
.\security-audit.ps1

# Fix issues one by one
# Re-run audit after fixes
```

---

## 💡 Pro Tips

1. **Never commit `.env`** - Always double-check before pushing to Git
2. **Test locally first** - Run `npm run preview` before deploying
3. **Use test keys** - Use Paystack test keys during development
4. **Regular audits** - Run `security-audit.ps1` before every deploy
5. **Keep updated** - Run `npm update` monthly to patch vulnerabilities

---

## 📞 Need Help?

**Developer**: Prince Yekunya  
**Portfolio**: https://swift1dev.netlify.app

For support or questions about the security setup, visit the portfolio website.

---

## 🎉 You're All Set!

Your website is now secured with enterprise-grade protection. The security measures will:

- Protect your data from unauthorized access
- Make it difficult for others to copy your code
- Defend against common web attacks
- Ensure compliance with security best practices

**Happy coding! 🚀**

---

**Built with 🔒 by Prince Yekunya**  
https://swift1dev.netlify.app
