import type { AppError } from "@/services/error/app-error";

export function logError(error: AppError): void {
  const isDev = process.env.NODE_ENV === "development";

  if (isDev) {
    console.group(
      `%c[${error.severity.toUpperCase()}] ${error.code}`,
      `color: ${error.severity === "error" ? "red" : "orange"}; font-weight: bold`,
    );
    console.log("Message:", error.message);
    console.log("Context:", error.context);
    console.log("Status:", error.status);
    console.log("Timestamp:", error.timestamp.toISOString());
    if (error.violations) {
      console.log("Violations:", error.violations);
    }
    if (error.originalError) {
      console.log("Original error:", error.originalError);
    }
    if (error.stack) {
      console.log("Stack:", error.stack);
    }
    console.groupEnd();
  } else {
    // In production, log structured data
    console.error(JSON.stringify(error.toJSON()));
  }
}
