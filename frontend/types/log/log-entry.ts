export interface LogEntry {
  level: "info" | "warn" | "debug" | "error";
  message: string;
  /** Name of the service or component that generated the log */
  serviceName?: string;
  /** Arbitrary additional context or variables related to the log */
  context?: object;
  errorCode?: string;
  errorStack?: string;
  /** Trace ID for request tracing */
  requestId?: string;
  userId?: string;
  statusCode?: number;
  environment?: "development" | "production" | "test";
}
