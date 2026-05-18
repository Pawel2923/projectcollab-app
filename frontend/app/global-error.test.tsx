/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";

import GlobalError from "../app/global-error";

describe("GlobalError", () => {
  const mockReset = vi.fn();
  const mockError = Object.assign(new Error("Test error message"), {
    digest: "test-digest-123",
  });

  const mockFetch = vi.fn();

  beforeEach(() => {
    global.fetch = mockFetch;
    delete (window as any).location;
    window.location = { href: "" } as any;
  });

  test("should render error screen with icon and messages", () => {
    mockFetch.mockResolvedValueOnce({ ok: true });

    render(<GlobalError error={mockError} reset={mockReset} />);

    expect(screen.getByRole("heading")).toHaveTextContent(
      "Wystąpił krytyczny błąd aplikacji",
    );

    expect(
      screen.getByText(/Przepraszamy, wystąpił nieoczekiwany błąd/),
    ).toBeInTheDocument();
  });

  test("should log error to server on mount", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true });

    render(<GlobalError error={mockError} reset={mockReset} />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/log", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({
          level: "error",
          message: "Test error message",
          errorCode: "test-digest-123",
        }),
      });
    });
  });

  test("should handle fetch failure gracefully", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));
    const consoleWarnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => {});

    render(<GlobalError error={mockError} reset={mockReset} />);

    await waitFor(() => {
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "Failed to log error to server",
      );
    });

    consoleWarnSpy.mockRestore();
  });

  test("should call reset function when retry button is clicked", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true });
    const user = userEvent.setup();

    render(<GlobalError error={mockError} reset={mockReset} />);

    const retryButton = screen.getByRole("button", {
      name: /Spróbuj ponownie/,
    });
    await user.click(retryButton);

    expect(mockReset).toHaveBeenCalled();
  });

  test("should navigate to home when home button is clicked", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true });
    const user = userEvent.setup();

    render(<GlobalError error={mockError} reset={mockReset} />);

    const homeButton = screen.getByRole("button", {
      name: /Wróć do strony głównej/,
    });
    await user.click(homeButton);

    expect(window.location.href).toBe("/");
  });

  test("should display error details in development mode", () => {
    vi.stubEnv("NODE_ENV", "development");

    mockFetch.mockResolvedValueOnce({ ok: true });
    render(<GlobalError error={mockError} reset={mockReset} />);

    expect(screen.getByText("Test error message")).toBeInTheDocument();
    expect(screen.getByText(/Error ID: test-digest-123/)).toBeInTheDocument();
  });

  test("should hide error details in production mode", () => {
    vi.stubEnv("NODE_ENV", "production");

    mockFetch.mockResolvedValueOnce({ ok: true });
    render(<GlobalError error={mockError} reset={mockReset} />);

    expect(screen.queryByText("Test error message")).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Error ID: test-digest-123/),
    ).not.toBeInTheDocument();
  });

  test("should render all action buttons", () => {
    mockFetch.mockResolvedValueOnce({ ok: true });
    render(<GlobalError error={mockError} reset={mockReset} />);

    expect(
      screen.getByRole("button", { name: /Spróbuj ponownie/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Wróć do strony głównej/ }),
    ).toBeInTheDocument();
  });

  test("should handle error without digest property", async () => {
    const errorWithoutDigest = new Error("Simple error");
    mockFetch.mockResolvedValueOnce({ ok: true });

    render(<GlobalError error={errorWithoutDigest} reset={mockReset} />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/log", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({
          level: "error",
          message: "Simple error",
        }),
      });
    });
  });
});
