import type { AppError } from "@/services/error/app-error";
import type { ServerLogEntry } from "@/types/log/log-entry";

export function logError(error: AppError): void {
  const errorLog: ServerLogEntry = {
    message: error.message,
    level: "error",
    timestamp: error.timestamp.toISOString(),
    serviceName: "frontend",
    context: {
      code: error.code,
      status: error.status,
      severity: error.severity,
      context: error.context,
      violations: error.violations,
    },
    errorStack: error.stack,
    errorCode: error.code,
  };
  const ndjson = `${JSON.stringify(errorLog)}\n`;

  process.stdout.write(ndjson);
}
