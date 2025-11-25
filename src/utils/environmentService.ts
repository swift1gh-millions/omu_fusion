// Environment validation and configuration
import { EnvironmentSchema, type EnvironmentConfig } from "./validationSchemas";

class EnvironmentService {
  private static config: EnvironmentConfig | null = null;

  static validateAndGetConfig(): EnvironmentConfig {
    if (this.config) {
      return this.config;
    }

    try {
      const envVars = {
        VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY,
        VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        VITE_FIREBASE_STORAGE_BUCKET: import.meta.env
          .VITE_FIREBASE_STORAGE_BUCKET,
        VITE_FIREBASE_MESSAGING_SENDER_ID: import.meta.env
          .VITE_FIREBASE_MESSAGING_SENDER_ID,
        VITE_FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID,
      };

      // Debug: Log all environment variables with lengths but not actual values
      console.log("🔍 DEBUG: Environment variables check:", {
        VITE_FIREBASE_API_KEY: envVars.VITE_FIREBASE_API_KEY ? `***${envVars.VITE_FIREBASE_API_KEY.length} chars***` : 'MISSING',
        VITE_FIREBASE_AUTH_DOMAIN: envVars.VITE_FIREBASE_AUTH_DOMAIN || 'MISSING',
        VITE_FIREBASE_PROJECT_ID: envVars.VITE_FIREBASE_PROJECT_ID || 'MISSING',
        VITE_FIREBASE_STORAGE_BUCKET: envVars.VITE_FIREBASE_STORAGE_BUCKET || 'MISSING',
        VITE_FIREBASE_MESSAGING_SENDER_ID: envVars.VITE_FIREBASE_MESSAGING_SENDER_ID || 'MISSING',
        VITE_FIREBASE_APP_ID: envVars.VITE_FIREBASE_APP_ID ? `***${envVars.VITE_FIREBASE_APP_ID.length} chars***` : 'MISSING',
        totalEnvVars: Object.keys(import.meta.env).length,
        allEnvKeys: Object.keys(import.meta.env).filter(k => k.startsWith('VITE_')),
        timestamp: new Date().toISOString()
      });

      // Check if any required environment variables are missing
      const missingVars = Object.entries(envVars)
        .filter(([key, value]) => !value)
        .map(([key]) => key);

      if (missingVars.length > 0) {
        console.error("❌ Missing environment variables:", missingVars);
        console.error("🔍 DEBUG: Available VITE_ env vars:", Object.keys(import.meta.env).filter(k => k.startsWith('VITE_')));
        console.error("\n🔥 FIREBASE SETUP REQUIRED 🔥");
        console.error(
          "Please create a .env file in your project root with the following variables:"
        );
        console.error("VITE_FIREBASE_API_KEY=your_api_key");
        console.error("VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com");
        console.error("VITE_FIREBASE_PROJECT_ID=your_project_id");
        console.error("VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com");
        console.error("VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id");
        console.error("VITE_FIREBASE_APP_ID=your_app_id");
        console.error("\nGet these from: https://console.firebase.google.com");
        console.error(
          "Go to Project Settings > General > Your apps > SDK setup\n"
        );

        throw new Error(
          `Missing Firebase environment variables: ${missingVars.join(
            ", "
          )}. Please check your .env file.`
        );
      }

      this.config = EnvironmentSchema.parse(envVars);
      return this.config;
    } catch (error) {
      console.error("Environment validation failed:", error);
      throw new Error(
        "Invalid environment configuration. Please check your .env file."
      );
    }
  }

  static getFirebaseConfig() {
    const config = this.validateAndGetConfig();
    return {
      apiKey: config.VITE_FIREBASE_API_KEY,
      authDomain: config.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: config.VITE_FIREBASE_PROJECT_ID,
      storageBucket: config.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: config.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: config.VITE_FIREBASE_APP_ID,
    };
  }

  static isDevelopment(): boolean {
    return import.meta.env.MODE === "development";
  }

  static isProduction(): boolean {
    return import.meta.env.MODE === "production";
  }
}

export default EnvironmentService;
