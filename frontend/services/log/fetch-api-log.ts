import type { LogEntry } from "@/types/log/log-entry";

export function fetchApiLog(logEntry: LogEntry) {
  try {
    fetch("/api/log", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify(logEntry),
    }).catch(() => {
      console.warn("Failed to log error to server");
    });
  } catch (error) {
    console.warn("Failed to log error to server", error);
  }
}
