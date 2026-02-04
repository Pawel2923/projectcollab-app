"use client";

import type React from "react";
import { createContext } from "react";

export type AlertType = "default" | "destructive";

export type Alert = {
  id: string;
  type: AlertType;
  title: string;
  icon?: string | React.ReactNode;
  description?: string | React.ReactNode;
  duration?: number;
  hasCloseButton?: boolean;
};

export type Ctx = {
  notify: (alert: Omit<Alert, "id">) => string;
  dismiss: (id: string) => void;
};

export const AlertContext = createContext<Ctx | null>(null);
