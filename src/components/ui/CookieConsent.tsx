import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiX, HiShieldCheck, HiCog } from "react-icons/hi";
import { useCookieConsent } from "../../hooks/useCaching";

export const CookieConsentBanner: React.FC = () => {
  const { hasConsent, isLoading, acceptCookies, declineCookies } =
    useCookieConsent();

  // Don't show banner if loading or consent already given
  if (isLoading || hasConsent !== null) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-gray-200 shadow-2xl"
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Cookie Icon and Text */}
            <div className="flex items-start gap-3 flex-1">
              <div className="flex-shrink-0 mt-0.5">
                <HiShieldCheck className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  We use cookies to enhance your experience
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  We use essential cookies for website functionality and
                  optional cookies to improve performance, analyze traffic, and
                  personalize content. Your preferences help us load images
                  faster and remember your settings.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <button
                onClick={declineCookies}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 w-full sm:w-auto">
                Decline Optional
              </button>
              <button
                onClick={acceptCookies}
                className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg w-full sm:w-auto">
                Accept All
              </button>
            </div>
          </div>

          {/* Privacy Policy Link */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              By continuing to use our site, you consent to our use of essential
              cookies. Learn more about our{" "}
              <a
                href="/privacy"
                className="text-blue-600 hover:text-blue-700 underline">
                Privacy Policy
              </a>{" "}
              and{" "}
              <a
                href="/cookies"
                className="text-blue-600 hover:text-blue-700 underline">
                Cookie Policy
              </a>
              .
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// Performance Settings Modal
interface PerformanceSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PerformanceSettingsModal: React.FC<PerformanceSettingsProps> = ({
  isOpen,
  onClose,
}) => {
  const { preferences, updateImageQuality, updateDataSaver } =
    require("../../hooks/useCaching").useUserPreferences();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}>
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Modal */}
        <motion.div
          className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <HiCog className="h-6 w-6 text-gray-700" />
              <h2 className="text-xl font-semibold text-gray-900">
                Performance Settings
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200">
              <HiX className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Image Quality */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">
                Image Quality
              </label>
              <div className="space-y-2">
                {(["low", "medium", "high"] as const).map((quality) => (
                  <label key={quality} className="flex items-center">
                    <input
                      type="radio"
                      name="imageQuality"
                      value={quality}
                      checked={preferences.imageQuality === quality}
                      onChange={() => updateImageQuality(quality)}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm text-gray-700 capitalize">
                      {quality}
                      {quality === "low" && " (Faster loading, lower quality)"}
                      {quality === "medium" && " (Balanced)"}
                      {quality === "high" && " (Best quality, slower loading)"}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Data Saver */}
            <div>
              <label className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-900">
                    Data Saver Mode
                  </span>
                  <p className="text-sm text-gray-500">
                    Reduces image sizes and limits animations
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.dataSaver}
                  onChange={(e) => updateDataSaver(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </label>
            </div>

            {/* Cache Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                Cache & Storage
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                We cache images and preferences locally to improve loading times
                on repeat visits.
              </p>
              <CacheInfoComponent />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Cache Information Component
const CacheInfoComponent: React.FC = () => {
  const { cacheStats, clearCache } =
    require("../../hooks/useCaching").useCacheManagement();

  return (
    <div className="space-y-3">
      <div className="text-xs text-gray-500">
        <div>Memory cache: {cacheStats.size} items</div>
        <div>
          Persistent cache: {cacheStats.persistent.items} items (
          {cacheStats.persistent.size} KB)
        </div>
      </div>
      <button
        onClick={clearCache}
        className="text-xs text-red-600 hover:text-red-700 font-medium">
        Clear All Cache
      </button>
    </div>
  );
};
