// Quick script to create admin user
// Run this in the browser console on your app

const createAdminUser = async () => {
  try {
    console.log("Creating admin user...");

    // Import the auth context
    const authService = window.enhancedAuthService;

    if (!authService) {
      console.error("Auth service not available. Make sure the app is loaded.");
      return;
    }

    const adminData = {
      firstName: "Admin",
      lastName: "User",
      email: "admin@omufusion.com",
      password: "Admin123!", // Change this to your desired password
      agreeToTerms: true,
    };

    const result = await authService.signUp(adminData);
    console.log("Admin user created successfully:", result);

    // Now manually set admin role in Firestore
    console.log("Please set admin role manually in Firebase Console");
  } catch (error) {
    console.error("Error creating admin user:", error);
  }
};

// Call the function
createAdminUser();
