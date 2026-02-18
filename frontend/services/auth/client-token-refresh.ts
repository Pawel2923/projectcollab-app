export async function refreshSession(): Promise<boolean> {
  try {
    const res = await fetch("/api/auth/refresh-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (res.ok) {
      return true;
    }
  } catch (error) {
    console.error("Silent refresh failed:", error);
  }
  return false;
}

export function handleSessionExpired() {
  if (typeof window !== "undefined") {
    // Current path as redirect target
    const currentPath = window.location.pathname + window.location.search;
    window.location.href = `/api/auth/session-expired?redirect=${encodeURIComponent(currentPath)}`;
  }
}
