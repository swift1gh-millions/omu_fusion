# OMU Fusion E-Commerce Platform

A modern, full-featured e-commerce platform built with React, TypeScript, Firebase, and Tailwind CSS.

## 🚀 Features

### **Customer Features**

- **Shopping Experience**: Browse products, add to cart, wishlist functionality
- **Secure Checkout**: 3-step checkout process with Paystack payment integration
- **User Profiles**: Account management with order history and analytics
- **Order Tracking**: Real-time order status updates
- **Responsive Design**: Mobile-first design with dark/light themes

### **Admin Features**

- **Dashboard**: Comprehensive analytics and insights
- **Product Management**: Full CRUD operations for products and categories
- **Order Management**: Track and update order statuses
- **User Management**: Customer analytics and management
- **Discount Management**: Create and manage promotional codes
- **Real-time Analytics**: Sales, revenue, and customer insights

### **Technical Features**

- **Modern Architecture**: React 19, TypeScript, Vite
- **Performance Optimized**: Code splitting, lazy loading, caching
- **Secure Authentication**: Role-based access control
- **Real-time Database**: Firebase Firestore integration
- **File Storage**: Firebase Storage for images
- **Error Handling**: Comprehensive error management
- **SEO Optimized**: Meta tags and semantic HTML

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Build Tool**: Vite with optimized configurations
- **Backend**: Firebase (Firestore, Auth, Storage)
- **Payments**: Paystack integration for Ghana
- **Animations**: Framer Motion, GSAP
- **State Management**: Context API with reducers
- **Validation**: Zod for runtime validation
- **Icons**: Lucide React, React Icons

## 🚀 Quick Start

### **Prerequisites**

- Node.js 18+ and npm 8+
- Firebase project with Firestore, Auth, and Storage enabled
- Paystack account (for Ghana payments)

### **Installation**

1. **Clone the repository**

   ```bash
   git clone https://github.com/swift1gh-millions/omu_fusion.git
   cd omu_fusion
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Firebase and Paystack credentials
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

5. **Open in browser**: `http://localhost:3000`

## 🔧 Environment Setup

Create a `.env.local` file with your configuration:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Paystack Configuration (for Ghana payments)
VITE_PAYSTACK_PUBLIC_KEY=pk_live_your_public_key
VITE_PAYSTACK_SECRET_KEY=sk_live_your_secret_key
```

## 📜 Available Scripts

- `npm run dev` - Start development server (port 3000)
- `npm run build` - Build optimized production bundle
- `npm run preview` - Preview production build locally

## 🚀 Deployment

### **Firebase Hosting (Recommended)**

1. **Install Firebase CLI**

   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**

   ```bash
   firebase login
   ```

3. **Initialize Firebase Hosting**

   ```bash
   firebase init hosting
   # Select your project
   # Set public directory to: dist
   # Configure as SPA: Yes
   # Set up automatic builds: Optional
   ```

4. **Build and Deploy**
   ```bash
   npm run build
   firebase deploy
   ```

### **Netlify Deployment**

1. **Build the project**

   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   - Connect your GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Add environment variables in Netlify dashboard

### **Vercel Deployment**

1. **Install Vercel CLI**

   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   npm run build
   vercel --prod
   ```

## 🔒 Security Configuration

### **Firestore Rules**

Ensure your Firestore rules are properly configured:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Products are publicly readable
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null &&
        exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }

    // Orders are user-specific
    match /orders/{orderId} {
      allow read, write: if request.auth != null &&
        (request.auth.uid == resource.data.userId ||
         exists(/databases/$(database)/documents/admins/$(request.auth.uid)));
    }
  }
}
```

### **Storage Rules**

Configure Firebase Storage rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI elements
│   ├── layout/         # Layout components
│   └── sections/       # Page sections
├── pages/              # Page components
│   ├── admin/          # Admin panel pages
│   └── ...            # Customer pages
├── utils/              # Utility functions and services
├── hooks/              # Custom React hooks
├── context/            # Context providers
└── assets/            # Static assets
```

## 🎯 Performance Optimizations

- **Code Splitting**: Automatic route-based and manual chunk splitting
- **Image Optimization**: WebP/AVIF formats with lazy loading
- **Caching**: Service-level caching for frequently accessed data
- **Bundle Analysis**: Optimized vendor chunks and tree shaking
- **Minification**: Production builds are fully minified

## 🐛 Troubleshooting

### **Common Issues**

1. **Firebase Connection**

   - Verify environment variables are correctly set
   - Check Firebase project permissions
   - Ensure Firestore indexes are created

2. **Build Failures**

   - Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
   - Check for TypeScript errors: `npm run build`

3. **Payment Issues**
   - Verify Paystack keys are correct (test vs live)
   - Check Paystack webhook configuration

## 📞 Support

- **Email**: support@omu-fusion.com
- **GitHub Issues**: [Create an issue](https://github.com/swift1gh-millions/omu_fusion/issues)
- **Documentation**: See `/docs` folder for detailed guides

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
