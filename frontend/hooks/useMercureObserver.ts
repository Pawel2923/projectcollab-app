"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface UseMercureObserverOptions<T = unknown> {
  hubUrl?: string;
  topics: string[];
  onUpdate?: (data: T) => void;
}

import {
  handleSessionExpired,
  refreshSession,
} from "@/lib/utils/clientTokenRefresh";

export function useMercureObserver<T = unknown>({
  hubUrl,
  topics,
  onUpdate,
}: UseMercureObserverOptions<T>) {
  const router = useRouter();
  const eventSourceRef = useRef<EventSource | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const onUpdateRef = useRef(onUpdate);
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  const topicsStr = JSON.stringify(topics);

  useEffect(() => {
    if (!topics || topics.length === 0) {
      return;
    }

    const url = new URL(
      hubUrl ||
        process.env.NEXT_PUBLIC_MERCURE_URL ||
        "http://localhost:80/.well-known/mercure",
    );

    topics.forEach((topic) => {
      url.searchParams.append("topic", topic);
    });

    console.log(
      `[MercureObserver] Connecting to ${url.toString()} with topics:`,
      topics,
    );

    const eventSource = new EventSource(url.toString(), {
      withCredentials: true,
    });

    eventSource.onmessage = (event) => {
      try {
        console.log("[MercureObserver] Received message:", event.data);
        const data = JSON.parse(event.data);

        if (onUpdateRef.current) {
          console.log("[MercureObserver] Calling custom onUpdate");
          onUpdateRef.current(data as T);
        } else {
          console.log(
            "[MercureObserver] No onUpdate provided, triggering router.refresh()",
          );
          router.refresh();
        }
      } catch (e) {
        console.error("[MercureObserver] Error parsing message:", e);
      }
    };

    eventSource.onerror = async (e) => {
      // Don't log error immediately, just warn/debug
      console.debug(
        "[MercureObserver] Connection lost, attempting recovery...",
      );
      eventSource.close();

      // Attempt silent refresh
      console.log(
        "[MercureObserver] Attempting silent refresh before reconnect...",
      );
      const refreshed = await refreshSession();
      if (refreshed) {
        console.log(
          "[MercureObserver] Refresh successful, retrying connection...",
        );
        setRetryCount((c: number) => c + 1);
      } else {
        console.error("[MercureObserver] Refresh failed, redirecting...", e);
        handleSessionExpired();
      }
    };

    eventSourceRef.current = eventSource;

    return () => {
      console.log("[MercureObserver] Closing connection");
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [hubUrl, topicsStr, router, topics, retryCount]);
}
