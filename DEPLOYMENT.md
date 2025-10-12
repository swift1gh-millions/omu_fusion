# Deployment Checklist

## Pre-Deployment Checklist

### ✅ Code Quality

- [ ] All TypeScript errors resolved
- [ ] Build completes successfully (`npm run build`)
- [ ] No console errors in production build
- [ ] All tests passing (if applicable)
- [ ] Code reviewed and approved

### ✅ Environment Configuration

- [ ] Production environment variables configured
- [ ] Firebase project set to production mode
- [ ] Paystack keys updated to live keys (if applicable)
- [ ] Domain whitelist updated in Firebase Auth
- [ ] CORS configured properly

### ✅ Firebase Configuration

- [ ] Firestore security rules deployed
- [ ] Storage security rules deployed
- [ ] Firebase indexes created/updated
- [ ] Admin users created in Firestore
- [ ] Test data removed from production database

### ✅ Performance Optimization

- [ ] Images optimized (WebP/AVIF format)
- [ ] Bundle size analyzed and optimized
- [ ] Lazy loading implemented
- [ ] Caching strategies in place
- [ ] SEO meta tags configured

### ✅ Security

- [ ] Environment variables secured
- [ ] API keys restricted by domain/app
- [ ] User authentication tested
- [ ] Admin panel access restricted
- [ ] Payment security verified

## Deployment Steps

### Firebase Hosting

1. **Build the application**

   ```bash
   npm run build
   ```

2. **Deploy to Firebase**

   ```bash
   firebase deploy
   ```

3. **Verify deployment**
   - [ ] Site loads correctly
   - [ ] Authentication works
   - [ ] Payment flow functional
   - [ ] Admin panel accessible

### Alternative Hosting (Netlify/Vercel)

1. **Configure build settings**

   - Build command: `npm run build`
   - Publish directory: `dist`

2. **Set environment variables**

   - [ ] All VITE\_ prefixed variables added

3. **Deploy and test**
   - [ ] Domain configured
   - [ ] SSL certificate active
   - [ ] Site performance tested

## Post-Deployment Checklist

### ✅ Functional Testing

- [ ] User registration/login works
- [ ] Product browsing functional
- [ ] Shopping cart operations
- [ ] Checkout process complete
- [ ] Payment processing works
- [ ] Order management functional
- [ ] Admin panel fully operational

### ✅ Performance Testing

- [ ] Page load speeds acceptable (<3s)
- [ ] Mobile responsiveness verified
- [ ] Core Web Vitals optimized
- [ ] Image loading performance

### ✅ SEO & Analytics

- [ ] Google Search Console configured
- [ ] Analytics tracking active
- [ ] Meta tags and descriptions set
- [ ] Sitemap generated and submitted

### ✅ Monitoring Setup

- [ ] Error tracking configured
- [ ] Performance monitoring active
- [ ] Uptime monitoring setup
- [ ] Firebase usage alerts configured

## Production Environment URLs

- **Main Site**: https://your-domain.com
- **Admin Panel**: https://your-domain.com/admin
- **Firebase Console**: https://console.firebase.google.com/project/your-project-id
- **Analytics**: Your analytics dashboard URL

## Emergency Contacts

- **Developer**: [Your contact info]
- **Firebase Support**: Firebase console support
- **Hosting Support**: Your hosting provider support
- **Payment Support**: Paystack support

## Rollback Plan

1. **Identify issue severity**
2. **Quick fixes**: Deploy hotfix if possible
3. **Major issues**: Rollback to previous version
4. **Communication**: Notify stakeholders
5. **Post-mortem**: Document and learn from issues

## Maintenance Schedule

- **Daily**: Monitor error logs and performance
- **Weekly**: Review analytics and user feedback
- **Monthly**: Update dependencies and security patches
- **Quarterly**: Performance optimization review
