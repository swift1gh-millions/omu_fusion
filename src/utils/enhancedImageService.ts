import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "./firebase";
import ErrorService from "./errorService";
import CacheService from "./cacheService";

export interface ImageUploadOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: "webp" | "jpeg" | "png";
  generateThumbnail?: boolean;
  thumbnailSize?: { width: number; height: number };
}

export interface ImageResizeOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: "webp" | "jpeg" | "png";
}

export interface OptimizedImage {
  original: string;
  optimized: string;
  thumbnail?: string;
  metadata: {
    originalSize: number;
    optimizedSize: number;
    compressionRatio: number;
    dimensions: { width: number; height: number };
    format: string;
  };
}

class EnhancedImageService {
  private readonly CACHE_PREFIX = "enhanced_image_service";
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly SUPPORTED_FORMATS = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];
  private readonly CDN_BASE_URL = "https://cdn.omu-fusion.com"; // Replace with your CDN URL

  /**
   * Upload and optimize image with various options
   */
  async uploadAndOptimizeImage(
    file: File,
    path: string,
    options: ImageUploadOptions = {}
  ): Promise<OptimizedImage> {
    try {
      // Validate file
      this.validateFile(file);

      // Set default options
      const defaultOptions: Required<ImageUploadOptions> = {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.8,
        format: "webp",
        generateThumbnail: true,
        thumbnailSize: { width: 300, height: 300 },
      };

      const finalOptions = { ...defaultOptions, ...options };

      // Process image
      const processedImage = await this.processImage(file, finalOptions);

      // Upload original and optimized versions
      const [originalUrl, optimizedUrl, thumbnailUrl] = await Promise.all([
        this.uploadFile(file, `${path}/original`),
        this.uploadFile(processedImage.optimized, `${path}/optimized`),
        finalOptions.generateThumbnail && processedImage.thumbnail
          ? this.uploadFile(processedImage.thumbnail, `${path}/thumbnail`)
          : Promise.resolve(undefined),
      ]);

      const result: OptimizedImage = {
        original: originalUrl,
        optimized: optimizedUrl,
        thumbnail: thumbnailUrl,
        metadata: processedImage.metadata,
      };

      // Cache the result
      await CacheService.set(
        `${this.CACHE_PREFIX}:${path}`,
        result,
        60 * 60 * 24 // 24 hours
      );

      return result;
    } catch (error) {
      ErrorService.logError(error as Error, { action: "Image upload failed" });
      throw new Error("Failed to upload and optimize image");
    }
  }

  /**
   * Generate responsive image URLs with different sizes
   */
  generateResponsiveUrls(baseUrl: string): Record<string, string> {
    const sizes = {
      thumbnail: { width: 150, height: 150 },
      small: { width: 300, height: 300 },
      medium: { width: 600, height: 600 },
      large: { width: 1200, height: 1200 },
      xlarge: { width: 1920, height: 1080 },
    };

    const responsiveUrls: Record<string, string> = {};

    Object.entries(sizes).forEach(([size, dimensions]) => {
      responsiveUrls[size] = this.buildCDNUrl(baseUrl, {
        width: dimensions.width,
        height: dimensions.height,
        quality: 80,
        format: "webp",
      });
    });

    return responsiveUrls;
  }

  /**
   * Build optimized CDN URL with query parameters
   */
  buildCDNUrl(baseUrl: string, options: ImageResizeOptions): string {
    const url = new URL(baseUrl);

    if (options.width) url.searchParams.set("w", options.width.toString());
    if (options.height) url.searchParams.set("h", options.height.toString());
    if (options.quality) url.searchParams.set("q", options.quality.toString());
    if (options.format) url.searchParams.set("f", options.format);

    // Add auto optimization
    url.searchParams.set("auto", "compress,format");

    return url.toString();
  }

  /**
   * Get optimized image URLs from cache or generate new ones
   */
  async getOptimizedImageUrls(path: string): Promise<OptimizedImage | null> {
    try {
      // Try to get from cache first
      const cached = await CacheService.get<OptimizedImage>(
        `${this.CACHE_PREFIX}:${path}`
      );
      if (cached) return cached;

      return null;
    } catch (error) {
      ErrorService.logError(error as Error, {
        action: "Failed to get optimized image URLs",
      });
      return null;
    }
  }

  /**
   * Delete image and all its variants
   */
  async deleteImage(path: string): Promise<void> {
    try {
      const deletePromises = [
        this.deleteFile(`${path}/original`),
        this.deleteFile(`${path}/optimized`),
        this.deleteFile(`${path}/thumbnail`),
      ];

      await Promise.all(deletePromises);

      // Remove from cache
      CacheService.invalidate(`${this.CACHE_PREFIX}:${path}`);
    } catch (error) {
      ErrorService.logError(error as Error, {
        action: "Failed to delete image",
      });
      throw new Error("Failed to delete image");
    }
  }

  /**
   * Bulk upload and optimize multiple images
   */
  async bulkUploadImages(
    files: File[],
    basePath: string,
    options: ImageUploadOptions = {}
  ): Promise<OptimizedImage[]> {
    try {
      const uploadPromises = files.map((file, index) =>
        this.uploadAndOptimizeImage(file, `${basePath}/${index}`, options)
      );

      return await Promise.all(uploadPromises);
    } catch (error) {
      ErrorService.logError(error as Error, {
        action: "Bulk image upload failed",
      });
      throw new Error("Failed to upload multiple images");
    }
  }

  /**
   * Generate image placeholder/blur data URL
   */
  async generatePlaceholder(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        // Create small blurred version
        canvas.width = 20;
        canvas.height = 20;

        ctx?.drawImage(img, 0, 0, 20, 20);

        // Apply blur effect
        ctx!.filter = "blur(4px)";
        ctx?.drawImage(canvas, 0, 0);

        resolve(canvas.toDataURL("image/jpeg", 0.1));
      };

      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Validate uploaded file
   */
  private validateFile(file: File): void {
    if (!this.SUPPORTED_FORMATS.includes(file.type)) {
      throw new Error(`Unsupported file format: ${file.type}`);
    }

    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error(`File size too large: ${file.size} bytes`);
    }
  }

  /**
   * Process image with optimization options
   */
  private async processImage(
    file: File,
    options: Required<ImageUploadOptions>
  ): Promise<{
    optimized: File;
    thumbnail?: File;
    metadata: OptimizedImage["metadata"];
  }> {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d")!;

          // Calculate new dimensions
          const { width: newWidth, height: newHeight } =
            this.calculateDimensions(
              img.width,
              img.height,
              options.maxWidth,
              options.maxHeight
            );

          canvas.width = newWidth;
          canvas.height = newHeight;

          // Draw and compress
          ctx.drawImage(img, 0, 0, newWidth, newHeight);

          // Create optimized version
          canvas.toBlob(
            (optimizedBlob) => {
              if (!optimizedBlob) {
                reject(new Error("Failed to create optimized image"));
                return;
              }

              const optimizedFile = new File([optimizedBlob], file.name, {
                type: `image/${options.format}`,
              });

              let thumbnailFile: File | undefined;

              // Create thumbnail if requested
              if (options.generateThumbnail) {
                const thumbCanvas = document.createElement("canvas");
                const thumbCtx = thumbCanvas.getContext("2d")!;

                thumbCanvas.width = options.thumbnailSize.width;
                thumbCanvas.height = options.thumbnailSize.height;

                thumbCtx.drawImage(
                  img,
                  0,
                  0,
                  options.thumbnailSize.width,
                  options.thumbnailSize.height
                );

                thumbCanvas.toBlob(
                  (thumbBlob) => {
                    if (thumbBlob) {
                      thumbnailFile = new File(
                        [thumbBlob],
                        `thumb_${file.name}`,
                        {
                          type: `image/${options.format}`,
                        }
                      );
                    }

                    resolve({
                      optimized: optimizedFile,
                      thumbnail: thumbnailFile,
                      metadata: {
                        originalSize: file.size,
                        optimizedSize: optimizedFile.size,
                        compressionRatio:
                          (file.size - optimizedFile.size) / file.size,
                        dimensions: { width: newWidth, height: newHeight },
                        format: options.format,
                      },
                    });
                  },
                  `image/${options.format}`,
                  options.quality
                );
              } else {
                resolve({
                  optimized: optimizedFile,
                  metadata: {
                    originalSize: file.size,
                    optimizedSize: optimizedFile.size,
                    compressionRatio:
                      (file.size - optimizedFile.size) / file.size,
                    dimensions: { width: newWidth, height: newHeight },
                    format: options.format,
                  },
                });
              }
            },
            `image/${options.format}`,
            options.quality
          );
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Calculate optimal dimensions while maintaining aspect ratio
   */
  private calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    const aspectRatio = originalWidth / originalHeight;

    let newWidth = originalWidth;
    let newHeight = originalHeight;

    if (newWidth > maxWidth) {
      newWidth = maxWidth;
      newHeight = newWidth / aspectRatio;
    }

    if (newHeight > maxHeight) {
      newHeight = maxHeight;
      newWidth = newHeight * aspectRatio;
    }

    return {
      width: Math.round(newWidth),
      height: Math.round(newHeight),
    };
  }

  /**
   * Upload file to Firebase Storage
   */
  private async uploadFile(file: File, path: string): Promise<string> {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  }

  /**
   * Delete file from Firebase Storage
   */
  private async deleteFile(path: string): Promise<void> {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
    } catch (error) {
      // File might not exist, which is OK
      if ((error as any).code !== "storage/object-not-found") {
        throw error;
      }
    }
  }
}

export default new EnhancedImageService();
