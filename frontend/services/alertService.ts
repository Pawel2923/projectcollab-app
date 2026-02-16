"use server";

import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

import type { Alert } from "@/store/AlertContext";

export async function getAlerts(): Promise<Alert[]> {
  try {
    const existingAlerts = (await cookies()).get("pc_alerts");
    if (!existingAlerts) {
      return [];
    }

    return JSON.parse(existingAlerts.value);
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function addAlertAndGetResponse(
  res: NextResponse,
  alert: Omit<Alert, "id">,
): Promise<NextResponse> {
  const alerts = await getAlerts();
  alerts.push({
    ...alert,
    id: crypto.randomUUID(),
  });

  res.cookies.set("pc_alerts", JSON.stringify(alerts));
  return res;
}
