"use client";

import { X } from "lucide-react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { dismissAlertCookie } from "@/lib/services/alertCookieService";
import { mapIcon } from "@/lib/utils/iconMapper/iconMapper";

import type { Alert as AlertObject } from "./AlertContext";
import { AlertContext } from "./AlertContext";

export function AlertProvider({
  children,
  initial = [],
}: {
  children: React.ReactNode;
  initial?: AlertObject[];
}) {
  const [items, setItems] = useState<AlertObject[]>(
    initial.map((item) => ({
      ...item,
      icon: typeof item.icon === "string" ? mapIcon(item.icon) : item.icon,
    })),
  );
  const timeoutRefs = useRef<Record<string, number>>({});

  const clearTimeoutFor = (id: string) => {
    const handle = timeoutRefs.current[id];
    if (handle) {
      clearTimeout(handle);
      delete timeoutRefs.current[id];
    }
  };

  const dismiss = useCallback((id: string) => {
    clearTimeoutFor(id);
    setItems((prev) => prev.filter((item) => item.id !== id));
    dismissAlertCookie(id);
  }, []);

  const scheduleDismiss = useCallback(
    (id: string, duration?: number) => {
      if (duration && duration > 0 && !timeoutRefs.current[id]) {
        timeoutRefs.current[id] = window.setTimeout(() => {
          dismiss(id);
        }, duration);
      }
    },
    [dismiss],
  );

  const notify = useCallback(
    (alert: Omit<AlertObject, "id">) => {
      const dismissTime = alert.duration ?? 5000;
      const hasCloseButton = alert.hasCloseButton ?? true;
      alert = { ...alert, duration: dismissTime, hasCloseButton };

      const id =
        Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
      const normalized = {
        ...alert,
        icon: typeof alert.icon === "string" ? mapIcon(alert.icon) : alert.icon,
      } as Omit<AlertObject, "id">;

      setItems((prev) => [...prev, { ...normalized, id }]);
      scheduleDismiss(id, alert.duration);

      return id;
    },
    [scheduleDismiss],
  );

  useEffect(() => {
    items.forEach((item) => {
      if (item.duration && item.duration > 0 && !timeoutRefs.current[item.id]) {
        scheduleDismiss(item.id, item.duration);
      }
    });
  }, [items, scheduleDismiss]);

  useEffect(() => {
    return () => {
      Object.values(timeoutRefs.current).forEach((handle) => {
        clearTimeout(handle);
      });
      timeoutRefs.current = {};
    };
  }, []);

  const value = useMemo(() => ({ notify, dismiss }), [notify, dismiss]);

  return (
    <AlertContext value={value}>
      {children}
      <div className="w-full max-w-xl grid items-start gap-4 fixed top-4 left-1/2 -translate-x-1/2 z-50">
        {items.length > 0 &&
          items.map((item) => (
            <Alert key={item.id} variant={item.type} className="pr-11">
              {item.icon && item.icon}
              <AlertTitle>{item.title}</AlertTitle>
              {item.description && (
                <AlertDescription>{item.description}</AlertDescription>
              )}
              {item.hasCloseButton && (
                <div className="absolute h-full right-1 flex items-center">
                  <Button variant="ghost" onClick={() => dismiss(item.id)}>
                    <X />
                  </Button>
                </div>
              )}
            </Alert>
          ))}
      </div>
    </AlertContext>
  );
}
