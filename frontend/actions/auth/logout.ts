"use server";

import { redirect } from "next/navigation";

/**
 * Canonical logout is handled by `/logout` route.
 * Keep this action for backward compatibility by delegating to the route.
 */
export default async function logout() {
  redirect("/logout");
}
