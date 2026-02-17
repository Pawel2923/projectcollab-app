"use client";

import { setCookie } from "../client-cookie-service";

const SIDE_NAV_EXPANDED_COOKIE = "pc_side_nav_expanded";
const COOKIE_OPTIONS = {
  path: "/",
  maxAge: 31536000, // 1 year
};

/**
 * Set the SideNav expansion state in cookies
 */
export function setSideNavExpanded(isExpanded: boolean): void {
  setCookie(
    SIDE_NAV_EXPANDED_COOKIE,
    JSON.stringify(isExpanded),
    COOKIE_OPTIONS,
  );
}

/**
 * Set a section's expansion state in cookies
 */
export function setSectionExpanded(
  cookieName: string,
  isExpanded: boolean,
): void {
  setCookie(cookieName, JSON.stringify(isExpanded), COOKIE_OPTIONS);
}
