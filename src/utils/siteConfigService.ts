import { db } from "./firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

export interface SiteConfig {
  id?: string;
  siteName: string;
  tagline: string;
  description: string;
  logo: {
    light: string;
    dark: string;
  };
  contact: {
    email: string;
    phone: string;
    address: string;
  };
  social: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
  features: {
    enableWishlist: boolean;
    enableReviews: boolean;
    enableChat: boolean;
    enableNewsletter: boolean;
  };
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  };
  updatedAt: Date;
}

export class SiteConfigService {
  private static readonly COLLECTION_NAME = "site_config";
  private static readonly DOC_ID = "main";
  private static cache: SiteConfig | null = null;
  private static cacheExpiry: number = 0;
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Get site configuration
  static async getSiteConfig(): Promise<SiteConfig> {
    try {
      // Check cache first
      if (this.cache && Date.now() < this.cacheExpiry) {
        return this.cache;
      }

      console.log("📖 Fetching site configuration from database...");
      const docRef = doc(db, this.COLLECTION_NAME, this.DOC_ID);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const config = {
          id: docSnap.id,
          ...docSnap.data(),
          updatedAt: docSnap.data().updatedAt?.toDate() || new Date(),
        } as SiteConfig;

        // Cache the result
        this.cache = config;
        this.cacheExpiry = Date.now() + this.CACHE_DURATION;

        console.log("✅ Site configuration loaded successfully");
        return config;
      } else {
        console.log("⚠️ No site configuration found, creating default...");
        const defaultConfig = this.getDefaultConfig();
        await this.updateSiteConfig(defaultConfig);
        return defaultConfig;
      }
    } catch (error) {
      console.error("❌ Error fetching site configuration:", error);
      return this.getDefaultConfig();
    }
  }

  // Update site configuration
  static async updateSiteConfig(config: Partial<SiteConfig>): Promise<void> {
    try {
      console.log("💾 Updating site configuration...");
      const docRef = doc(db, this.COLLECTION_NAME, this.DOC_ID);

      const updateData = {
        ...config,
        updatedAt: new Date(),
      };

      await setDoc(docRef, updateData, { merge: true });

      // Clear cache
      this.cache = null;
      this.cacheExpiry = 0;

      console.log("✅ Site configuration updated successfully");
    } catch (error) {
      console.error("❌ Error updating site configuration:", error);
      throw error;
    }
  }

  // Get specific config value
  static async getConfigValue<K extends keyof SiteConfig>(
    key: K
  ): Promise<SiteConfig[K]> {
    const config = await this.getSiteConfig();
    return config[key];
  }

  // Clear cache (useful for testing or manual refresh)
  static clearCache(): void {
    this.cache = null;
    this.cacheExpiry = 0;
  }

  // Get default configuration
  private static getDefaultConfig(): SiteConfig {
    return {
      siteName: "OMU Fusion",
      tagline: "Premium Fashion & Lifestyle",
      description:
        "Discover premium fashion and lifestyle products at OMU Fusion. Quality, style, and comfort combined.",
      logo: {
        light: "/logo_black.png",
        dark: "/logo_white.png",
      },
      contact: {
        email: "contact@omufusion.com",
        phone: "+233 248 397 962",
        address: "123 Fashion Street, Style City, SC 12345",
      },
      social: {
        facebook: "https://facebook.com/omufusion",
        twitter: "https://twitter.com/omufusion",
        instagram: "https://instagram.com/omufusion",
        linkedin: "https://linkedin.com/company/omufusion",
      },
      seo: {
        metaTitle: "OMU Fusion - Premium Fashion & Lifestyle",
        metaDescription:
          "Discover premium fashion and lifestyle products at OMU Fusion. Quality, style, and comfort combined in every piece.",
        keywords: [
          "fashion",
          "lifestyle",
          "premium",
          "clothing",
          "accessories",
          "style",
        ],
      },
      features: {
        enableWishlist: true,
        enableReviews: true,
        enableChat: true,
        enableNewsletter: true,
      },
      theme: {
        primaryColor: "#1F2937",
        secondaryColor: "#F3F4F6",
        accentColor: "#F59E0B",
      },
      updatedAt: new Date(),
    };
  }
}
