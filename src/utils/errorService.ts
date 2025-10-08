// Unified Error Handling System
import { v4 as uuidv4 } from "uuid";

export interface ErrorContext {
  userId?: string;
  action: string;
  timestamp: string;
  errorId: string;
  userAgent: string;
  url: string;
}

export interface ErrorDetails {
  message: string;
  stack?: string;
  code?: string;
  statusCode?: number;
}

export interface LoggedError extends ErrorDetails {
  context: ErrorContext;
  severity: "low" | "medium" | "high" | "critical";
}

class ErrorService {
  private static errors: LoggedError[] = [];
  private static maxStoredErrors = 100;

  static logError(
    error: Error | string,
    context: Partial<ErrorContext> & { action: string },
    severity: LoggedError["severity"] = "medium"
  ): string {
    const errorId = uuidv4();
    const timestamp = new Date().toISOString();

    const errorDetails: ErrorDetails =
      typeof error === "string"
        ? { message: error }
        : {
            message: error.message,
            stack: error.stack,
            code: (error as any).code,
          };

    const fullContext: ErrorContext = {
      errorId,
      timestamp,
      userAgent: navigator.userAgent,
      url: window.location.href,
      ...context,
    };

    const loggedError: LoggedError = {
      ...errorDetails,
      context: fullContext,
      severity,
    };

    // Store error locally
    this.errors.unshift(loggedError);
    if (this.errors.length > this.maxStoredErrors) {
      this.errors.pop();
    }

    // Log to console with context
    const logMethod = this.getLogMethod(severity);
    logMethod(`[${severity.toUpperCase()}] ${fullContext.action}:`, {
      errorId,
      message: errorDetails.message,
      context: fullContext,
      stack: errorDetails.stack,
    });

    // In production, send to monitoring service
    if (import.meta.env.MODE === "production") {
      this.sendToMonitoring(loggedError).catch(console.error);
    }

    return errorId;
  }

  private static getLogMethod(severity: LoggedError["severity"]) {
    switch (severity) {
      case "critical":
      case "high":
        return console.error;
      case "medium":
        return console.warn;
      case "low":
      default:
        return console.info;
    }
  }

  private static async sendToMonitoring(error: LoggedError): Promise<void> {
    try {
      // In a real application, send to monitoring service like Sentry, DataDog, etc.
      // For now, we'll store in a separate Firestore collection
      const { db } = await import("./firebase");
      const { collection, addDoc } = await import("firebase/firestore");

      await addDoc(collection(db, "error_logs"), {
        ...error,
        createdAt: new Date(),
      });
    } catch (monitoringError) {
      console.error("Failed to send error to monitoring:", monitoringError);
    }
  }

  static async handleServiceError<T>(
    operation: () => Promise<T>,
    context: Partial<ErrorContext> & { action: string },
    severity: LoggedError["severity"] = "medium"
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      const errorId = this.logError(error as Error, context, severity);

      // Re-throw with enhanced error message
      const enhancedError = new Error(
        `${context.action} failed (Error ID: ${errorId}): ${
          (error as Error).message
        }`
      );
      (enhancedError as any).originalError = error;
      (enhancedError as any).errorId = errorId;

      throw enhancedError;
    }
  }

  static getRecentErrors(limit: number = 10): LoggedError[] {
    return this.errors.slice(0, limit);
  }

  static getErrorById(errorId: string): LoggedError | undefined {
    return this.errors.find((error) => error.context.errorId === errorId);
  }

  static clearErrors(): void {
    this.errors = [];
  }

  // Specific error handlers for common scenarios
  static handleAuthError(error: any, action: string): never {
    const errorCode = error.code || "unknown";
    let userMessage = "An authentication error occurred.";

    switch (errorCode) {
      case "auth/user-not-found":
        userMessage = "No account found with this email address.";
        break;
      case "auth/wrong-password":
        userMessage = "Incorrect password.";
        break;
      case "auth/email-already-in-use":
        userMessage = "An account with this email already exists.";
        break;
      case "auth/weak-password":
        userMessage = "Password is too weak.";
        break;
      case "auth/invalid-email":
        userMessage = "Invalid email address.";
        break;
      case "auth/too-many-requests":
        userMessage = "Too many failed attempts. Please try again later.";
        break;
      default:
        userMessage = error.message || "Authentication failed.";
    }

    this.logError(error, { action }, "high");
    throw new Error(userMessage);
  }

  static handleFirestoreError(error: any, action: string): never {
    const errorCode = error.code || "unknown";
    let userMessage = "A database error occurred.";

    switch (errorCode) {
      case "permission-denied":
        userMessage = "You do not have permission to perform this action.";
        break;
      case "unavailable":
        userMessage = "Service temporarily unavailable. Please try again.";
        break;
      case "deadline-exceeded":
        userMessage = "Request timed out. Please try again.";
        break;
      case "resource-exhausted":
        userMessage =
          "Service is currently overloaded. Please try again later.";
        break;
      default:
        userMessage = "Unable to complete request. Please try again.";
    }

    this.logError(error, { action }, "high");
    throw new Error(userMessage);
  }

  static handleValidationError(error: any, action: string): never {
    const errorMessage = error.issues
      ? error.issues.map((issue: any) => issue.message).join(", ")
      : error.message || "Validation failed";

    this.logError(error, { action }, "low");
    throw new Error(`Validation error: ${errorMessage}`);
  }
}

export default ErrorService;
