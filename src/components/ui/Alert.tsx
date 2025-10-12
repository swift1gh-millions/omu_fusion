import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiXCircle,
  HiExclamationCircle,
  HiCheckCircle,
  HiInformationCircle,
  HiX,
} from "react-icons/hi";

export type AlertType = "error" | "warning" | "success" | "info";

interface AlertProps {
  type: AlertType;
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
  dismissible?: boolean;
}

const alertConfig = {
  error: {
    icon: HiXCircle,
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    iconColor: "text-red-400",
    titleColor: "text-red-300",
    textColor: "text-red-200",
    closeHoverBg: "hover:bg-red-500/20",
  },
  warning: {
    icon: HiExclamationCircle,
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/30",
    iconColor: "text-yellow-400",
    titleColor: "text-yellow-300",
    textColor: "text-yellow-200",
    closeHoverBg: "hover:bg-yellow-500/20",
  },
  success: {
    icon: HiCheckCircle,
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
    iconColor: "text-green-400",
    titleColor: "text-green-300",
    textColor: "text-green-200",
    closeHoverBg: "hover:bg-green-500/20",
  },
  info: {
    icon: HiInformationCircle,
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    iconColor: "text-blue-400",
    titleColor: "text-blue-300",
    textColor: "text-blue-200",
    closeHoverBg: "hover:bg-blue-500/20",
  },
};

export const Alert: React.FC<AlertProps> = ({
  type,
  title,
  message,
  onClose,
  className = "",
  dismissible = true,
}) => {
  const config = alertConfig[type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`${config.bgColor} ${config.borderColor} border-2 rounded-xl p-4 backdrop-blur-sm ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Icon className={`h-6 w-6 ${config.iconColor}`} />
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-semibold ${config.titleColor} mb-1`}>
              {title}
            </h3>
          )}
          <p className={`text-sm ${config.textColor} leading-relaxed`}>
            {message}
          </p>
        </div>
        {dismissible && onClose && (
          <button
            onClick={onClose}
            className={`ml-3 flex-shrink-0 inline-flex rounded-lg p-1.5 ${config.iconColor} ${config.closeHoverBg} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-${type}-500 transition-colors duration-200`}
            aria-label="Close">
            <HiX className="h-5 w-5" />
          </button>
        )}
      </div>
    </motion.div>
  );
};

interface AlertContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const AlertContainer: React.FC<AlertContainerProps> = ({
  children,
  className = "",
}) => {
  return (
    <AnimatePresence mode="wait">
      <div className={`space-y-3 ${className}`}>{children}</div>
    </AnimatePresence>
  );
};

// Hook to manage alerts
export const useAlert = () => {
  const [alerts, setAlerts] = React.useState<
    Array<{ id: string; type: AlertType; title?: string; message: string }>
  >([]);

  const showAlert = (
    type: AlertType,
    message: string,
    title?: string,
    duration?: number
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    setAlerts((prev) => [...prev, { id, type, message, title }]);

    if (duration) {
      setTimeout(() => {
        removeAlert(id);
      }, duration);
    }
  };

  const removeAlert = (id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  return {
    alerts,
    showAlert,
    removeAlert,
    error: (message: string, title?: string, duration?: number) =>
      showAlert("error", message, title, duration),
    warning: (message: string, title?: string, duration?: number) =>
      showAlert("warning", message, title, duration),
    success: (message: string, title?: string, duration?: number) =>
      showAlert("success", message, title, duration),
    info: (message: string, title?: string, duration?: number) =>
      showAlert("info", message, title, duration),
  };
};
