"use client";

import { AlertTriangleIcon, Lock, WifiOff, XCircle } from "lucide-react";
import type { ErrorInfo, ReactNode } from "react";
import React, { Component } from "react";

import { Button } from "@/components/ui/button";
import type { ErrorCode } from "@/error/app-error";
import { AppError } from "@/error/app-error";
import { getErrorTitle } from "@/lib/utils/errorHandler";
import { translateSymfonyValidation } from "@/lib/utils/messageMapper/messageMapper";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  appError?: AppError;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    const appError = error instanceof AppError ? error : undefined;
    return { hasError: true, error, appError };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);

    // Log AppError details if available
    if (error instanceof AppError) {
      console.error("AppError details:", {
        code: error.code,
        status: error.status,
        message: error.message,
        violations: error.violations,
        context: error.context,
      });
    }

    this.props.onError?.(error, errorInfo);
  }

  private getErrorIcon(code?: ErrorCode) {
    if (!code)
      return <AlertTriangleIcon className="w-12 h-12 text-destructive mb-4" />;

    switch (code) {
      case "NETWORK_ERROR":
      case "TIMEOUT_ERROR":
        return <WifiOff className="w-12 h-12 text-destructive mb-4" />;
      case "UNAUTHORIZED":
      case "FORBIDDEN":
        return <Lock className="w-12 h-12 text-destructive mb-4" />;
      default:
        return <XCircle className="w-12 h-12 text-destructive mb-4" />;
    }
  }

  private getErrorMessage(): { title: string; description: string } {
    const { appError, error } = this.state;

    if (appError) {
      return {
        title: getErrorTitle(appError.code),
        description: appError.message || "Wystąpił błąd. Spróbuj ponownie.",
      };
    }

    return {
      title: "Wystąpił błąd",
      description:
        error?.message ||
        "Wystąpił nieoczekiwany błąd. Spróbuj odświeżyć stronę lub skontaktuj się z pomocą techniczną, jeśli problem będzie się powtarzał.",
    };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { title, description } = this.getErrorMessage();
      const { appError, error } = this.state;

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
          {this.getErrorIcon(appError?.code)}
          <h2 className="text-lg font-semibold mb-2">{title}</h2>
          <p className="text-muted-foreground mb-4 max-w-md">{description}</p>

          {/* Show validation errors if available */}
          {appError?.violations && appError.violations.length > 0 && (
            <div className="mb-4 p-4 bg-destructive/10 rounded-md max-w-md">
              <h3 className="text-sm font-semibold mb-2">Błędy walidacji:</h3>
              <ul className="text-sm text-left space-y-1">
                {appError.violations.map((violation, index) => {
                  const translatedMessage = translateSymfonyValidation(
                    violation.message,
                    undefined,
                    violation.propertyPath, // Pass property path for context-specific translations
                  );
                  return (
                    <li key={index}>
                      <span className="font-medium">
                        {violation.propertyPath}:
                      </span>{" "}
                      {translatedMessage}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={() =>
                this.setState({
                  hasError: false,
                  error: undefined,
                  appError: undefined,
                })
              }
              variant="outline"
            >
              Spróbuj ponownie
            </Button>
            <Button onClick={() => window.location.reload()} variant="default">
              Odśwież stronę
            </Button>
          </div>

          {process.env.NODE_ENV === "development" && error && (
            <details className="mt-4 text-left max-w-2xl">
              <summary className="cursor-pointer text-sm font-medium">
                Szczegóły błędu (tylko w trybie deweloperskim)
              </summary>
              <pre className="mt-2 p-4 bg-muted rounded text-xs overflow-auto">
                {appError
                  ? JSON.stringify(
                      {
                        code: appError.code,
                        status: appError.status,
                        message: appError.message,
                        violations: appError.violations,
                        context: appError.context,
                        timestamp: appError.timestamp,
                      },
                      null,
                      2,
                    )
                  : error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
