import { useToast } from "@/hooks/use-toast";

/**
 * Standardized error types for the application
 */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode?: number,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class NetworkError extends AppError {
  constructor(message = "Network error. Please check your connection.", originalError?: Error) {
    super(message, "NETWORK_ERROR", 0, originalError);
    this.name = "NetworkError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public readonly field?: string, originalError?: Error) {
    super(message, "VALIDATION_ERROR", 400, originalError);
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "Authentication required.", originalError?: Error) {
    super(message, "AUTH_ERROR", 401, originalError);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends AppError {
  constructor(message = "You don't have permission to perform this action.", originalError?: Error) {
    super(message, "FORBIDDEN", 403, originalError);
    this.name = "AuthorizationError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Resource", originalError?: Error) {
    super(`${resource} not found.`, "NOT_FOUND", 404, originalError);
    this.name = "NotFoundError";
  }
}

export class ServerError extends AppError {
  constructor(message = "Server error. Please try again later.", originalError?: Error) {
    super(message, "SERVER_ERROR", 500, originalError);
    this.name = "ServerError";
  }
}

/**
 * Type guard to check if error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Convert unknown error to AppError
 */
export function toAppError(error: unknown): AppError {
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof Response) {
    return new AppError(
      `HTTP ${error.status}: ${error.statusText}`,
      "HTTP_ERROR",
      error.status
    );
  }

  if (error instanceof TypeError && error.message.includes("fetch")) {
    return new NetworkError("Network error. Please check your connection.", error);
  }

  if (error instanceof Error) {
    // Check for common error patterns
    if (error.message.includes("401") || error.message.includes("Unauthorized")) {
      return new AuthenticationError(undefined, error);
    }
    if (error.message.includes("403") || error.message.includes("Forbidden")) {
      return new AuthorizationError(undefined, error);
    }
    if (error.message.includes("404") || error.message.includes("Not Found")) {
      return new NotFoundError(undefined, error);
    }
    if (error.message.includes("500") || error.message.includes("502") || error.message.includes("503")) {
      return new ServerError(undefined, error);
    }
    return new AppError(error.message, "UNKNOWN_ERROR", undefined, error);
  }

  return new AppError("An unknown error occurred", "UNKNOWN_ERROR");
}

/**
 * Hook for consistent error handling in components
 */
export function useErrorHandler() {
  const { toast } = useToast();

  const handleError = (error: unknown, context?: string) => {
    const appError = toAppError(error);
    const message = appError.message;

    console.error(`Error${context ? ` in ${context}` : ""}:`, appError);

    // Don't show toast for network errors if offline
    if (appError instanceof NetworkError && !navigator.onLine) {
      return;
    }

    toast({
      title: "Error",
      description: message,
      variant: "destructive",
    });
  };

  const handleAsyncError = async <T>(
    promise: Promise<T>,
    context?: string
  ): Promise<T | null> => {
    try {
      return await promise;
    } catch (error) {
      handleError(error, context);
      return null;
    }
  };

  return { handleError, handleAsyncError };
}

/**
 * Wrapper for API calls that handles common error cases
 */
export async function safeApiCall<T>(
  apiCall: () => Promise<T>,
  options?: {
    onError?: (error: AppError) => void;
    showToast?: boolean;
    context?: string;
  }
): Promise<{ data: T | null; error: AppError | null }> {
  try {
    const data = await apiCall();
    return { data, error: null };
  } catch (error) {
    const appError = toAppError(error);

    if (options?.onError) {
      options.onError(appError);
    }

    if (options?.showToast !== false) {
      const { toast } = await import("@/hooks/use-toast");
      toast({
        title: "Error",
        description: appError.message,
        variant: "destructive",
      });
    }

    console.error(`API Error${options?.context ? ` in ${options.context}` : ""}:`, appError);

    return { data: null, error: appError };
  }
}

/**
 * Retry utility for failed operations
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    delayMs?: number;
    backoff?: number;
    shouldRetry?: (error: AppError) => boolean;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    delayMs = 1000,
    backoff = 2,
    shouldRetry = (error) => error instanceof NetworkError || (error.statusCode && error.statusCode >= 500),
  } = options;

  let lastError: AppError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = toAppError(error);

      if (attempt === maxRetries || !shouldRetry(lastError)) {
        throw lastError;
      }

      // Wait before retry with exponential backoff
      await new Promise((resolve) => setTimeout(resolve, delayMs * Math.pow(backoff, attempt)));
    }
  }

  throw lastError!;
}

/**
 * Error boundary error info type
 */
export interface ErrorBoundaryErrorInfo {
  componentStack: string;
  error: Error;
}