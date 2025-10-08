// Alternative Image Storage Service
// Uses multiple methods for storing images without Firebase Storage

export interface ImageUploadResult {
  url: string;
  publicId?: string;
  format: string;
  size: number;
  method: "base64" | "cloudinary" | "imgur" | "filestack";
}

export class ImageStorageService {
  // Main upload method - tries multiple services
  static async uploadImages(images: File[]): Promise<ImageUploadResult[]> {
    const uploadResults: ImageUploadResult[] = [];

    for (let i = 0; i < images.length; i++) {
      const image = images[i];

      try {
        // Validate image
        const validation = this.validateImage(image);
        if (!validation.valid) {
          throw new Error(validation.error!);
        }

        // Try different upload methods in order of preference
        let result: ImageUploadResult | null = null;

        // Method 1: Try Cloudinary (free tier: 25GB storage, 25GB bandwidth)
        try {
          console.log(`Attempting Cloudinary upload for image ${i + 1}...`);
          result = await this.uploadToCloudinary(image);
          console.log(`✅ Cloudinary upload successful for image ${i + 1}`);
        } catch (error: any) {
          console.warn(
            `❌ Cloudinary upload failed for image ${i + 1}:`,
            error.message
          );
        }

        // Method 2: Try Imgur (fallback)
        if (!result) {
          try {
            console.log(`Attempting Imgur upload for image ${i + 1}...`);
            result = await this.uploadToImgur(image);
            console.log(`✅ Imgur upload successful for image ${i + 1}`);
          } catch (error: any) {
            console.warn(
              `❌ Imgur upload failed for image ${i + 1}:`,
              error.message
            );
          }
        }

        // Method 3: Convert to optimized base64 (final fallback)
        if (!result) {
          console.log(`Using base64 fallback for image ${i + 1}...`);
          result = await this.convertToOptimizedBase64(image);
          console.log(`✅ Base64 conversion successful for image ${i + 1}`);
        }

        uploadResults.push(result);
      } catch (error: any) {
        throw new Error(`Failed to upload image ${i + 1}: ${error.message}`);
      }
    }

    return uploadResults;
  }

  // Cloudinary upload (using user's account)
  private static async uploadToCloudinary(
    file: File
  ): Promise<ImageUploadResult> {
    // Using user's Cloudinary account: diolmmp8o
    const CLOUDINARY_URL =
      "https://api.cloudinary.com/v1_1/diolmmp8o/image/upload";
    const UPLOAD_PRESET = "omu_fusion_preset"; // User needs to create this preset

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("folder", "omu-fusion-products"); // Organize images in folder

    const response = await fetch(CLOUDINARY_URL, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Cloudinary upload failed: ${response.status} - ${errorText}`
      );
    }

    const data = await response.json();

    return {
      url: data.secure_url,
      publicId: data.public_id,
      format: data.format,
      size: data.bytes,
      method: "cloudinary",
    };
  }

  // Imgur upload (fallback)
  private static async uploadToImgur(file: File): Promise<ImageUploadResult> {
    // Convert file to base64 for Imgur
    const base64Data = await this.fileToBase64(file);

    const response = await fetch("https://api.imgur.com/3/image", {
      method: "POST",
      headers: {
        Authorization: "Client-ID 546c25a59c58ad7", // Demo client ID
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image: base64Data.split(",")[1], // Remove data:image/jpeg;base64, prefix
        type: "base64",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Imgur upload failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(
        `Imgur upload failed: ${data.data?.error || "Unknown error"}`
      );
    }

    return {
      url: data.data.link,
      publicId: data.data.id,
      format: file.type.split("/")[1],
      size: file.size,
      method: "imgur",
    };
  }

  // Helper method to convert file to base64
  private static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  }

  // Convert to optimized base64 (final fallback)
  private static async convertToOptimizedBase64(
    file: File
  ): Promise<ImageUploadResult> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        // Calculate optimal dimensions (max 800px width/height)
        const maxSize = 800;
        let { width, height } = img;

        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);

        // Convert to base64 with compression
        const base64Url = canvas.toDataURL("image/jpeg", 0.8);

        resolve({
          url: base64Url,
          format: "jpeg",
          size: base64Url.length,
          method: "base64",
        });
      };

      img.onerror = () => reject(new Error("Failed to process image"));
      img.src = URL.createObjectURL(file);
    });
  }

  // Helper method to get file size string
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  // Delete image (only works for some services)
  static async deleteImage(
    imageUrl: string,
    method: string,
    publicId?: string
  ): Promise<void> {
    try {
      if (method === "cloudinary" && publicId) {
        // Note: Deletion requires authentication, this is just a placeholder
        console.log(`Would delete Cloudinary image: ${publicId}`);
      } else if (method === "imgur" && publicId) {
        // Note: Deletion requires authentication, this is just a placeholder
        console.log(`Would delete Imgur image: ${publicId}`);
      }
      // Base64 images don't need deletion
    } catch (error) {
      console.warn("Failed to delete image:", error);
    }
  }

  // Validate image file
  static validateImage(file: File): { valid: boolean; error?: string } {
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Invalid file type: ${file.type}. Please use JPEG, PNG, GIF, or WebP.`,
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File too large: ${this.formatFileSize(
          file.size
        )}. Maximum size is 10MB.`,
      };
    }

    return { valid: true };
  }
}
