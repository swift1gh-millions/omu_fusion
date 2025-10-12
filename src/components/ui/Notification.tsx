import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiXCircle,
  HiExclamationCircle,
  HiCheckCircle,
  HiInformationCircle,
  HiX,
} from "react-icons/hi";

export type NotificationType = "error" | "warning" | "success" | "info";

interface Notification {
  id: string;
  type: NotificationType;
  title?: string;
  message: string;
  duration?: number;
}

interface NotificationContextType {
  showNotification: (
    type: NotificationType,
    message: string,
    title?: string,
    duration?: number
  ) => void;
  error: (message: string, title?: string, duration?: number) => void;
  warning: (message: string, title?: string, duration?: number) => void;
  success: (message: string, title?: string, duration?: number) => void;
  info: (message: string, title?: string, duration?: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
};

const notificationConfig = {
  error: {
    icon: HiXCircle,
    bgGradient: "from-red-500/20 to-red-600/20",
    borderColor: "border-red-500/40",
    iconBg: "bg-red-500/20",
    iconColor: "text-red-400",
    titleColor: "text-red-100",
    textColor: "text-red-200",
    progressBg: "bg-red-500",
  },
  warning: {
    icon: HiExclamationCircle,
    bgGradient: "from-yellow-500/20 to-yellow-600/20",
    borderColor: "border-yellow-500/40",
    iconBg: "bg-yellow-500/20",
    iconColor: "text-yellow-400",
    titleColor: "text-yellow-100",
    textColor: "text-yellow-200",
    progressBg: "bg-yellow-500",
  },
  success: {
    icon: HiCheckCircle,
    bgGradient: "from-green-500/20 to-green-600/20",
    borderColor: "border-green-500/40",
    iconBg: "bg-green-500/20",
    iconColor: "text-green-400",
    titleColor: "text-green-100",
    textColor: "text-green-200",
    progressBg: "bg-green-500",
  },
  info: {
    icon: HiInformationCircle,
    bgGradient: "from-blue-500/20 to-blue-600/20",
    borderColor: "border-blue-500/40",
    iconBg: "bg-blue-500/20",
    iconColor: "text-blue-400",
    titleColor: "text-blue-100",
    textColor: "text-blue-200",
    progressBg: "bg-blue-500",
  },
};

interface NotificationItemProps {
  notification: Notification;
  onClose: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onClose,
}) => {
  const config = notificationConfig[notification.type];
  const Icon = config.icon;
  const duration = notification.duration || 5000;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.9 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={`w-full max-w-md bg-gradient-to-r ${config.bgGradient} backdrop-blur-xl border-2 ${config.borderColor} rounded-2xl shadow-2xl overflow-hidden`}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div
            className={`flex-shrink-0 ${config.iconBg} rounded-xl p-2.5 shadow-lg`}>
            <Icon className={`h-6 w-6 ${config.iconColor}`} />
          </div>
          <div className="flex-1 min-w-0">
            {notification.title && (
              <h3
                className={`text-sm font-bold ${config.titleColor} mb-1 tracking-wide`}>
                {notification.title}
              </h3>
            )}
            <p
              className={`text-sm ${config.textColor} leading-relaxed break-words`}>
              {notification.message}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`flex-shrink-0 ${config.iconColor} hover:opacity-70 transition-opacity duration-200 p-1 rounded-lg hover:bg-white/10`}
            aria-label="Close notification">
            <HiX className="h-5 w-5" />
          </button>
        </div>
      </div>
      {duration > 0 && (
        <motion.div
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: duration / 1000, ease: "linear" }}
          className={`h-1 ${config.progressBg} opacity-60`}
        />
      )}
    </motion.div>
  );
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback(
    (
      type: NotificationType,
      message: string,
      title?: string,
      duration: number = 5000
    ) => {
      const id = `notification-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      const notification: Notification = {
        id,
        type,
        title,
        message,
        duration,
      };

      setNotifications((prev) => [...prev, notification]);

      if (duration > 0) {
        setTimeout(() => {
          removeNotification(id);
        }, duration);
      }
    },
    []
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const contextValue: NotificationContextType = {
    showNotification,
    error: (message: string, title?: string, duration?: number) =>
      showNotification("error", message, title || "Error", duration),
    warning: (message: string, title?: string, duration?: number) =>
      showNotification("warning", message, title || "Warning", duration),
    success: (message: string, title?: string, duration?: number) =>
      showNotification("success", message, title || "Success", duration),
    info: (message: string, title?: string, duration?: number) =>
      showNotification("info", message, title, duration),
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] space-y-3 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {notifications.map((notification) => (
            <div key={notification.id} className="pointer-events-auto">
              <NotificationItem
                notification={notification}
                onClose={() => removeNotification(notification.id)}
              />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};
