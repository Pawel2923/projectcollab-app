"use client";

import {
  AlertCircle,
  AlertTriangle,
  Lock,
  Search,
  WifiOff,
  XCircle,
} from "lucide-react";
import React, { useCallback } from "react";

import type { ErrorCode } from "@/error/app-error";
import { AppError } from "@/error/app-error";
import { useAlert } from "@/hooks/useAlert";
import {
  formatValidationErrors,
  getErrorTitle,
} from "@/lib/utils/errorHandler";
import { messageMap } from "@/lib/utils/messageMapper/messageMap";

export function useErrorHandler() {
  const alert = useAlert();

  const showError = useCallback(
    (
      error: unknown,
      options?: {
        duration?: number;
        customMessage?: string;
        showDetails?: boolean;
      },
    ) => {
      let appError: AppError;

      if (error instanceof AppError) {
        appError = error;
      } else if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        "status" in error &&
        "message" in error
      ) {
        // Handle serialized AppError (e.g. from server action)
        const err = error as AppError;
        appError = new AppError({
          message: err.message,
          code: err.code,
          status: err.status,
          violations: err.violations,
          context: err.context,
        });
      } else if (typeof error === "string") {
        appError = new AppError({
          message: error,
          code: "UNKNOWN_ERROR",
          status: 500,
        });
      } else {
        appError = new AppError({
          message:
            error instanceof Error
              ? error.message
              : "Wystąpił nieoczekiwany błąd",
          code: "UNKNOWN_ERROR",
          status: 500,
        });
      }

      const icon = getErrorIcon(appError.code);
      const title = getErrorTitle(appError.code);

      // Prefer mapped message if available, otherwise use server message
      const mapped = messageMap[appError.code];
      const mappedMessage = mapped ? mapped.description || mapped.title : null;

      const message =
        options?.customMessage || mappedMessage || appError.message;

      if (appError.violations && appError.violations.length > 0) {
        const formattedErrors = formatValidationErrors(appError.violations);
        const errorList = Object.entries(formattedErrors)
          .map(([field, messages]) => {
            const fieldName = field === "form" ? "" : `${field}: `;
            return messages.map((msg) => `${fieldName}${msg}`).join("\n");
          })
          .join("\n");

        const description = options?.showDetails
          ? `${message}\n\n${errorList}`
          : message;

        alert.notify({
          type: "destructive",
          title,
          icon,
          description,
          duration: options?.duration || 8000,
          hasCloseButton: true,
        });
      } else {
        alert.notify({
          type: "destructive",
          title,
          icon,
          description: message,
          duration: options?.duration || 6000,
          hasCloseButton: true,
        });
      }
    },
    [alert],
  );

  const showWarning = useCallback(
    (message: string, title: string = "Ostrzeżenie") => {
      alert.notify({
        type: "default",
        title,
        icon: React.createElement(AlertTriangle, {
          className: "text-yellow-600",
        }),
        description: message,
        duration: 5000,
        hasCloseButton: true,
      });
    },
    [alert],
  );

  const showSuccess = useCallback(
    (message: string, title: string = "Sukces") => {
      alert.notify({
        type: "default",
        title,
        icon: React.createElement(AlertCircle, { className: "text-green-600" }),
        description: message,
        duration: 4000,
        hasCloseButton: true,
      });
    },
    [alert],
  );

  return {
    showError,
    showWarning,
    showSuccess,
  };
}

function getErrorIcon(code: ErrorCode) {
  switch (code) {
    case "NETWORK_ERROR":
    case "TIMEOUT_ERROR":
      return React.createElement(WifiOff);
    case "UNAUTHORIZED":
    case "FORBIDDEN":
      return React.createElement(Lock);
    case "NOT_FOUND":
      return React.createElement(Search);
    case "VALIDATION_ERROR":
      return React.createElement(AlertTriangle);
    default:
      return React.createElement(XCircle);
  }
}
