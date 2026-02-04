import { useContext } from "react";

import type { Ctx } from "@/store/AlertContext";
import { AlertContext } from "@/store/AlertContext";

export function useAlert(): Ctx {
  const ctx = useContext(AlertContext);
  if (!ctx) {
    throw new Error("useAlert hook must be used within an AlertProvider");
  }

  return ctx;
}
