import { useState, useCallback } from "react";
import EnhancedImageService, {
  ImageUploadOptions,
  OptimizedImage,
} from "../utils/enhancedImageService";

interface UseImageUploadReturn {
  uploadImage: (
    file: File,
    path: string,
    options?: ImageUploadOptions
  ) => Promise<OptimizedImage>;
  uploadImages: (
    files: File[],
    basePath: string,
    options?: ImageUploadOptions
  ) => Promise<OptimizedImage[]>;
  deleteImage: (path: string) => Promise<void>;
  generatePlaceholder: (file: File) => Promise<string>;
  isUploading: boolean;
  error: string | null;
  clearError: () => void;
}

export const useImageUpload = (): UseImageUploadReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const uploadImage = useCallback(
    async (
      file: File,
      path: string,
      options?: ImageUploadOptions
    ): Promise<OptimizedImage> => {
      setIsUploading(true);
      setError(null);

      try {
        const result = await EnhancedImageService.uploadAndOptimizeImage(
          file,
          path,
          options
        );
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to upload image";
        setError(errorMessage);
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    []
  );

  const uploadImages = useCallback(
    async (
      files: File[],
      basePath: string,
      options?: ImageUploadOptions
    ): Promise<OptimizedImage[]> => {
      setIsUploading(true);
      setError(null);

      try {
        const results = await EnhancedImageService.bulkUploadImages(
          files,
          basePath,
          options
        );
        return results;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to upload images";
        setError(errorMessage);
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    []
  );

  const deleteImage = useCallback(async (path: string): Promise<void> => {
    setError(null);

    try {
      await EnhancedImageService.deleteImage(path);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete image";
      setError(errorMessage);
      throw err;
    }
  }, []);

  const generatePlaceholder = useCallback(
    async (file: File): Promise<string> => {
      try {
        const placeholder = await EnhancedImageService.generatePlaceholder(
          file
        );
        return placeholder;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to generate placeholder";
        setError(errorMessage);
        throw err;
      }
    },
    []
  );

  return {
    uploadImage,
    uploadImages,
    deleteImage,
    generatePlaceholder,
    isUploading,
    error,
    clearError,
  };
};

export default useImageUpload;
