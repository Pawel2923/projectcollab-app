"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface UseMercureObserverOptions<T = unknown> {
  topics: string[];
  onUpdate?: (data: T) => void;
}

import {
  handleSessionExpired,
  refreshSession,
} from "@/services/auth/client-token-refresh";
import { fetchApiLog } from "@/services/log/fetch-api-log";
import { getMercureUrl } from "@/utils/client-env-utils";

const MAX_RETRIES = 5;

export function useMercureObserver<T = unknown>({
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

    if (retryCount >= MAX_RETRIES) {
      fetchApiLog({
        level: "error",
        message: "Max Mercure retries reached",
        serviceName: "MercureObserver",
        context: {
          maxRetries: MAX_RETRIES,
          retryCount,
        },
      });
      handleSessionExpired();
      return;
    }

    const url = new URL(getMercureUrl());

    topics.forEach((topic) => {
      url.searchParams.append("topic", topic);
    });

    fetchApiLog({
      level: "debug",
      message: "Connecting Mercure observer",
      serviceName: "MercureObserver",
      context: {
        url: url.toString(),
        topics,
      },
    });

    const eventSource = new EventSource(url.toString(), {
      withCredentials: true,
    });

    eventSource.onmessage = (event) => {
      try {
        fetchApiLog({
          level: "debug",
          message: "Mercure message received",
          serviceName: "MercureObserver",
          context: {
            data: event.data,
          },
        });
        const data = JSON.parse(event.data);

        if (onUpdateRef.current) {
          fetchApiLog({
            level: "debug",
            message: "Calling custom Mercure onUpdate",
            serviceName: "MercureObserver",
          });
          onUpdateRef.current(data as T);
        } else {
          fetchApiLog({
            level: "debug",
            message: "No Mercure onUpdate provided, refreshing router",
            serviceName: "MercureObserver",
          });
          router.refresh();
        }
      } catch (e) {
        fetchApiLog({
          level: "error",
          message: "Error parsing Mercure message",
          serviceName: "MercureObserver",
          context: {
            error: e,
          },
        });
      }
    };

    eventSource.onerror = async (e) => {
      // Don't log error immediately, just warn/debug
      fetchApiLog({
        level: "debug",
        message: "Mercure connection lost, attempting recovery",
        serviceName: "MercureObserver",
      });
      eventSource.close();

      // Attempt silent refresh
      fetchApiLog({
        level: "debug",
        message: "Attempting silent refresh before Mercure reconnect",
        serviceName: "MercureObserver",
      });
      const refreshed = await refreshSession();
      if (refreshed) {
        fetchApiLog({
          level: "debug",
          message: "Mercure refresh successful, retrying connection",
          serviceName: "MercureObserver",
        });
        setRetryCount((c: number) => c + 1);
      } else {
        fetchApiLog({
          level: "error",
          message: "Mercure refresh failed, redirecting",
          serviceName: "MercureObserver",
          context: {
            error: e,
          },
        });
        handleSessionExpired();
      }
    };

    eventSourceRef.current = eventSource;

    return () => {
      fetchApiLog({
        level: "debug",
        message: "Closing Mercure connection",
        serviceName: "MercureObserver",
      });
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [topicsStr, router, retryCount, topics]);
}
