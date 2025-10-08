import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === "production";

  return {
    plugins: [react()],
    server: {
      port: 3000,
      open: true,
      host: true,
    },
    build: {
      target: "esnext",
      sourcemap: true,
      outDir: "dist",
      assetsDir: "assets",
      minify: isProduction ? "esbuild" : false,
      rollupOptions: {
        output: {
          manualChunks: {
            // Core React dependencies
            "react-vendor": ["react", "react-dom"],
            router: ["react-router-dom"],

            // Animation libraries
            animation: ["framer-motion", "gsap", "@gsap/react"],

            // Firebase services
            firebase: [
              "firebase/app",
              "firebase/auth",
              "firebase/firestore",
              "firebase/storage",
            ],

            // UI and utility libraries
            "ui-vendor": ["lucide-react", "react-icons", "react-hot-toast"],

            // Charts and data visualization
            charts: ["recharts"],

            // Admin pages (separate chunk for admin functionality)
            admin: [
              "/src/pages/admin/AdminDashboardPage",
              "/src/pages/admin/ProductUploadPage",
              "/src/pages/admin/ProductManagementPage",
              "/src/pages/admin/OrderManagementPage",
              "/src/pages/admin/UserManagementPage",
              "/src/pages/admin/AnalyticsPage",
            ],

            // Validation and error handling
            utils: ["zod", "uuid"],
          },
        },
        chunkSizeWarningLimit: 1000,
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@components": path.resolve(__dirname, "./src/components"),
        "@pages": path.resolve(__dirname, "./src/pages"),
        "@utils": path.resolve(__dirname, "./src/utils"),
        "@hooks": path.resolve(__dirname, "./src/hooks"),
        "@assets": path.resolve(__dirname, "./src/assets"),
      },
    },
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-router-dom",
        "framer-motion",
        "firebase/app",
        "firebase/auth",
        "firebase/firestore",
        "zod",
        "uuid",
      ],
    },
    // Performance optimizations
    esbuild: {
      drop: isProduction ? ["console", "debugger"] : [],
    },
  };
});
