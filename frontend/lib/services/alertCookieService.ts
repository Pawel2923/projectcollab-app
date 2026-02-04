"use client";

import type { Alert } from "@/store/AlertContext";

import { getCookie } from "../utils/cookieUtil";

const ALERT_COOKIE = "pc_alerts";

export function dismissAlertCookie(id: string): boolean {
  try {
    const cookiePair = getCookie(ALERT_COOKIE);
    if (!cookiePair) {
      return false;
    }

    const alerts: Alert[] = JSON.parse(decodeURIComponent(cookiePair));
    if (!Array.isArray(alerts)) {
      return false;
    }

    const updatedAlerts = alerts.filter((item) => item.id !== id);

    if (alerts.length === updatedAlerts.length) {
      return false;
    }

    if (updatedAlerts.length === 0) {
      document.cookie = `${ALERT_COOKIE}=; path=/; Max-Age=0`;
    } else {
      document.cookie = `${ALERT_COOKIE}=${encodeURIComponent(JSON.stringify(updatedAlerts))}; path=/;}`;
    }

    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}
