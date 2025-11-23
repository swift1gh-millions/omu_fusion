// Performance Monitor Component
// Shows caching and preloading status for debugging

import React, { useState, useEffect } from "react";
import ProductPreloader from "../../utils/productPreloader";

interface PerformanceInfo {
  isPreloaded: boolean;
  isCached: boolean;
  isPreloading: boolean;
  cacheAge: number;
  loadTime?: number;
}

export const PerformanceMonitor: React.FC = () => {
  const [info, setInfo] = useState<PerformanceInfo | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateInfo = () => {
      setInfo(ProductPreloader.getCacheInfo());
    };

    updateInfo();
    const interval = setInterval(updateInfo, 1000);

    return () => clearInterval(interval);
  }, []);

  // Toggle visibility with keyboard shortcut (Ctrl+Shift+P)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "P") {
        setIsVisible(!isVisible);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isVisible]);

  if (!isVisible || !info) return null;

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg text-xs font-mono z-50">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Performance Monitor</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white">
          ×
        </button>
      </div>

      <div className="space-y-1">
        <div
          className={`flex justify-between ${
            info.isPreloaded ? "text-green-400" : "text-yellow-400"
          }`}>
          <span>Preloaded:</span>
          <span>{info.isPreloaded ? "✓" : "✗"}</span>
        </div>

        <div
          className={`flex justify-between ${
            info.isCached ? "text-green-400" : "text-red-400"
          }`}>
          <span>Cached:</span>
          <span>{info.isCached ? "✓" : "✗"}</span>
        </div>

        <div
          className={`flex justify-between ${
            info.isPreloading ? "text-blue-400" : "text-gray-400"
          }`}>
          <span>Preloading:</span>
          <span>{info.isPreloading ? "⏳" : "✗"}</span>
        </div>

        {info.cacheAge > 0 && (
          <div className="flex justify-between text-gray-300">
            <span>Cache Age:</span>
            <span>{formatTime(info.cacheAge)}</span>
          </div>
        )}

        {info.loadTime && (
          <div className="flex justify-between text-gray-300">
            <span>Load Time:</span>
            <span>{formatTime(info.loadTime)}</span>
          </div>
        )}
      </div>

      <div className="mt-2 text-gray-400 text-[10px]">
        Ctrl+Shift+P to toggle
      </div>
    </div>
  );
};

// Note: useLoadTime hook moved to separate file for better Fast Refresh compatibility
