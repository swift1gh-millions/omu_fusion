import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiX,
  HiCheck,
  HiBriefcase,
  HiUser,
  HiColorSwatch,
  HiSparkles,
  HiRefresh,
} from "react-icons/hi";
import { Button } from "./Button";
import { GlassCard } from "./GlassCard";
import {
  AvatarOption,
  AVATAR_COLLECTION,
  AVATAR_CATEGORIES,
  getAvatarsByCategory,
} from "../../utils/avatarCollection";

interface AvatarSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar?: string;
  onAvatarSelect: (avatarUrl: string, avatarId: string) => void;
  isLoading?: boolean;
}

export const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  isOpen,
  onClose,
  currentAvatar,
  onAvatarSelect,
  isLoading = false,
}) => {
  const [selectedCategory, setSelectedCategory] =
    useState<AvatarOption["category"]>("professional");
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "HiBriefcase":
        return <HiBriefcase className="w-4 h-4" />;
      case "HiUser":
        return <HiUser className="w-4 h-4" />;
      case "HiColorSwatch":
        return <HiColorSwatch className="w-4 h-4" />;
      case "HiSparkles":
        return <HiSparkles className="w-4 h-4" />;
      default:
        return <HiUser className="w-4 h-4" />;
    }
  };

  const handleAvatarClick = (avatar: AvatarOption) => {
    setSelectedAvatar(avatar.url);
  };

  const handleConfirm = () => {
    if (selectedAvatar) {
      const avatarData = AVATAR_COLLECTION.find(
        (a: AvatarOption) => a.url === selectedAvatar
      );
      onAvatarSelect(selectedAvatar, avatarData?.id || "");
    }
  };

  const handleImageLoad = (avatarId: string) => {
    setLoadingImages((prev) => {
      const newSet = new Set(prev);
      newSet.delete(avatarId);
      return newSet;
    });
  };

  const handleImageError = (avatarId: string, avatarUrl: string) => {
    console.warn(`Failed to load avatar: ${avatarId}`, avatarUrl);
    setLoadingImages((prev) => {
      const newSet = new Set(prev);
      newSet.delete(avatarId);
      return newSet;
    });
    setFailedImages((prev) => new Set(prev).add(avatarId));
  };

  const handleImageLoadStart = (avatarId: string) => {
    setLoadingImages((prev) => new Set(prev).add(avatarId));
  };

  const retryImage = (avatarId: string) => {
    setFailedImages((prev) => {
      const newSet = new Set(prev);
      newSet.delete(avatarId);
      return newSet;
    });
    setLoadingImages((prev) => new Set(prev).add(avatarId));
  };

  const avatarsInCategory = getAvatarsByCategory(selectedCategory);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="w-full max-w-xs sm:max-w-md lg:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
          <GlassCard className="p-3 sm:p-4 lg:p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                  Choose Your Avatar
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Select from our collection of {AVATAR_COLLECTION.length}{" "}
                  professional avatars
                </p>
              </div>
              <button
                onClick={onClose}
                disabled={isLoading}
                className="p-1 sm:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50">
                <HiX className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
              </button>
            </div>

            {/* Current Avatar Preview */}
            <div className="text-center mb-4 sm:mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-2 sm:mb-3">
                <img
                  src={
                    selectedAvatar ||
                    currentAvatar ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=default`
                  }
                  alt="Selected avatar"
                  className="w-full h-full rounded-full object-cover ring-4 ring-accent-gold/30 shadow-lg"
                />
              </div>
              <p className="text-sm text-gray-600">
                {selectedAvatar ? "New avatar selected" : "Current avatar"}
              </p>
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-1 sm:gap-2 mb-4 sm:mb-6 p-1 bg-gray-100 dark:bg-gray-800/50 rounded-lg">
              {AVATAR_CATEGORIES.map((category) => (
                <Button
                  key={category.id}
                  variant={
                    selectedCategory === category.id ? "primary" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center gap-1 sm:gap-2 flex-1 sm:flex-none text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2">
                  {getIconComponent(category.iconName)}
                  <span className="hidden xs:inline sm:inline">
                    {category.name}
                  </span>
                  <span className="text-xs bg-white/20 px-1 sm:px-1.5 py-0.5 rounded-full ml-0.5 sm:ml-1">
                    {getAvatarsByCategory(category.id).length}
                  </span>
                </Button>
              ))}
            </div>

            {/* Debug Info for Development */}
            {process.env.NODE_ENV === "development" && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-xs">
                <div className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                  🔧 Debug Info:
                </div>
                <div className="text-blue-700 dark:text-blue-300 space-y-1">
                  <div>
                    • Category:{" "}
                    <span className="font-mono">{selectedCategory}</span>
                  </div>
                  <div>
                    • Avatars in category:{" "}
                    <span className="font-mono">
                      {avatarsInCategory.length}
                    </span>
                  </div>
                  <div>
                    • Loading:{" "}
                    <span className="font-mono">
                      {Array.from(loadingImages).join(", ") || "none"}
                    </span>
                  </div>
                  <div>
                    • Failed:{" "}
                    <span className="font-mono text-red-600">
                      {Array.from(failedImages).join(", ") || "none"}
                    </span>
                  </div>
                  <div>
                    • Selected:{" "}
                    <span className="font-mono">
                      {selectedAvatar ? "✓" : "✗"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Avatar Grid */}
            <div className="max-h-64 sm:max-h-80 lg:max-h-96 overflow-y-auto mb-4 sm:mb-6 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
              <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 lg:gap-4 p-1">
                {avatarsInCategory.map((avatar: AvatarOption) => (
                  <motion.div
                    key={avatar.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative cursor-pointer group transition-all duration-200 ${
                      selectedAvatar === avatar.url
                        ? "ring-4 ring-accent-gold shadow-lg"
                        : "hover:ring-2 hover:ring-accent-gold/50 hover:shadow-md"
                    }`}
                    onClick={() => handleAvatarClick(avatar)}
                    title={avatar.name}>
                    <div className="w-full aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 ring-1 ring-gray-200 dark:ring-gray-700 relative">
                      {/* Loading State */}
                      {loadingImages.has(avatar.id) && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700 z-10">
                          <div className="w-6 h-6 border-2 border-accent-gold/30 border-t-accent-gold rounded-full animate-spin" />
                        </div>
                      )}

                      {/* Error State with Retry */}
                      {failedImages.has(avatar.id) ? (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 text-xs text-center p-2 bg-gray-50 dark:bg-gray-800">
                          <HiUser className="w-8 h-8 mb-1 text-gray-400" />
                          <span className="font-medium mb-2">
                            {avatar.name}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              retryImage(avatar.id);
                              // Force re-render by updating the image src
                              const img =
                                e.currentTarget.parentElement?.querySelector(
                                  "img"
                                );
                              if (img) {
                                img.src = avatar.url + "&retry=" + Date.now();
                              }
                            }}
                            className="flex items-center gap-1 px-2 py-1 bg-accent-gold/20 hover:bg-accent-gold/30 rounded text-xs transition-colors">
                            <HiRefresh className="w-3 h-3" />
                            Retry
                          </button>
                        </div>
                      ) : (
                        <img
                          src={avatar.url}
                          alt={avatar.name}
                          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
                          loading="lazy"
                          onLoadStart={() => handleImageLoadStart(avatar.id)}
                          onLoad={() => handleImageLoad(avatar.id)}
                          onError={() =>
                            handleImageError(avatar.id, avatar.url)
                          }
                        />
                      )}
                    </div>

                    {/* Selection Check */}
                    {selectedAvatar === avatar.url && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-accent-gold rounded-full flex items-center justify-center shadow-lg ring-2 ring-white dark:ring-gray-900">
                        <HiCheck className="w-5 h-5 text-white" />
                      </motion.div>
                    )}

                    {/* Hover tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                      {avatar.name}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Empty state */}
              {avatarsInCategory.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-gray-400 dark:text-gray-600 mb-2">
                    <HiUser className="w-12 h-12 mx-auto mb-2" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400">
                    No avatars available in this category
                  </p>
                </div>
              )}
            </div>

            {/* Selected Avatar Info */}
            {selectedAvatar && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-gradient-to-r from-accent-gold/10 to-accent-gold/5 rounded-lg border border-accent-gold/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 ring-2 ring-accent-gold/30">
                    <img
                      src={selectedAvatar}
                      alt="Selected avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {
                        AVATAR_COLLECTION.find((a) => a.url === selectedAvatar)
                          ?.name
                      }
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Ready to update your profile
                    </p>
                  </div>
                  <div className="ml-auto">
                    <div className="w-6 h-6 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                      <HiCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirm}
                disabled={!selectedAvatar || isLoading}
                className="flex-1 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-accent-gold to-accent-gold/80 hover:from-accent-gold/90 hover:to-accent-gold/70 text-white font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <HiCheck className="w-4 h-4" />
                    <span>Update Avatar</span>
                  </>
                )}
              </Button>
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
