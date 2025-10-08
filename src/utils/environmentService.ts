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
