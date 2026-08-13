/**
 * Global error handling setup for the application
 * Call this once at app initialization (e.g., in main.tsx)
 */

// Track if handlers are already registered
let handlersRegistered = false;

export function setupGlobalErrorHandling() {
  if (handlersRegistered) {
    return;
  }
  handlersRegistered = true;

  // Handle unhandled promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    console.error("Unhandled Promise Rejection:", event.reason);

    // Prevent default browser behavior (logging to console)
    event.preventDefault();

    // Report to error tracking service in production
    if (import.meta.env.PROD) {
      // Sentry?.captureException(event.reason);
      // LogRocket?.captureException(event.reason);
    }

    // Show user-friendly toast for critical errors
    if (event.reason?.message?.includes("Network") || event.reason?.message?.includes("fetch")) {
      // Could show a non-intrusive notification about connectivity
    }
  });

  // Handle global JavaScript errors
  window.addEventListener("error", (event) => {
    console.error("Global Error:", event.error);

    // Report to error tracking service in production
    if (import.meta.env.PROD) {
      // Sentry?.captureException(event.error);
    }

    // Prevent default browser error handling for certain errors
    if (event.error?.message?.includes("ResizeObserver")) {
      // Known benign error in some browsers
      event.preventDefault();
    }
  });

  // Handle resource loading errors (images, scripts, stylesheets)
  window.addEventListener(
    "error",
    (event) => {
      if (event.target !== window) {
        const target = event.target as HTMLElement;
        console.warn(`Resource failed to load: ${target.tagName} - ${(target as HTMLImageElement).src || (target as HTMLScriptElement).src || (target as HTMLLinkElement).href}`);

        // For images, we could trigger a fallback
        if (target.tagName === "IMG") {
          const img = target as HTMLImageElement;
          if (!img.dataset.fallbackAttempted) {
            img.dataset.fallbackAttempted = "true";
            img.src = "/placeholder.svg";
          }
        }
      }
    },
    true // Use capture phase to catch resource errors
  );
}

/**
 * Report error to external tracking service
 */
export function reportError(error: Error, context?: Record<string, unknown>) {
  console.error("Reported error:", error, context);

  if (import.meta.env.PROD) {
    // Sentry?.captureException(error, { extra: context });
    // LogRocket?.captureException(error, { extra: context });
  }
}

/**
 * Report message to external tracking service
 */
export function reportMessage(message: string, level: "info" | "warn" | "error" = "info", context?: Record<string, unknown>) {
  const consoleMethod = level === "warn" ? "warn" : level;
  console[consoleMethod](message, context);

  if (import.meta.env.PROD) {
    // Sentry?.captureMessage(message, level, { extra: context });
  }
}

/**
 * Measure and report performance
 */
export function measurePerformance(name: string, fn: () => Promise<void> | void): Promise<void> {
  const start = performance.now();

  const result = fn();

  if (result instanceof Promise) {
    return result.finally(() => {
      const duration = performance.now() - start;
      reportMessage(`${name} took ${duration.toFixed(2)}ms`, "info", { duration, name });
    });
  } else {
    const duration = performance.now() - start;
    reportMessage(`${name} took ${duration.toFixed(2)}ms`, "info", { duration, name });
    return Promise.resolve();
  }
}

/**
 * Create a component error boundary error handler
 */
export function createComponentErrorHandler(componentName: string) {
  return (error: Error, errorInfo: React.ErrorInfo) => {
    console.error(`Error in ${componentName}:`, error, errorInfo);

    reportError(error, {
      component: componentName,
      componentStack: errorInfo.componentStack,
    });
  };
}