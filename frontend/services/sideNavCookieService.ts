"use client";

import { getCookie, setCookie } from "./client-cookie-service";

const SIDE_NAV_EXPANDED_COOKIE = "pc_side_nav_expanded";
const DIRECT_CHATS_EXPANDED_COOKIE = "pc_direct_chats_expanded";
const GROUP_CHATS_EXPANDED_COOKIE = "pc_group_chats_expanded";

const COOKIE_OPTIONS = {
  path: "/",
  maxAge: 31536000, // 1 year
};

/**
 * Get the SideNav expansion state from cookies
 */
export function getSideNavExpanded(): boolean {
  const value = getCookie(SIDE_NAV_EXPANDED_COOKIE);
  if (!value) return true; // Default to expanded

  try {
    return JSON.parse(value);
  } catch {
    return true;
  }
}

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
 * Get a section's expansion state from cookies
 */
export function getSectionExpanded(cookieName: string): boolean {
  const value = getCookie(cookieName);
  if (!value) return true; // Default to expanded

  try {
    return JSON.parse(value);
  } catch {
    return true;
  }
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

/**
 * Get direct chats expansion state from cookies
 */
export function getDirectChatsExpanded(): boolean {
  return getSectionExpanded(DIRECT_CHATS_EXPANDED_COOKIE);
}

/**
 * Set direct chats expansion state in cookies
 */
export function setDirectChatsExpanded(isExpanded: boolean): void {
  setSectionExpanded(DIRECT_CHATS_EXPANDED_COOKIE, isExpanded);
}

/**
 * Get group chats expansion state from cookies
 */
export function getGroupChatsExpanded(): boolean {
  return getSectionExpanded(GROUP_CHATS_EXPANDED_COOKIE);
}

/**
 * Set group chats expansion state in cookies
 */
export function setGroupChatsExpanded(isExpanded: boolean): void {
  setSectionExpanded(GROUP_CHATS_EXPANDED_COOKIE, isExpanded);
}

/**
 * Cookie name constants for external use
 */
export const COOKIE_NAMES = {
  SIDE_NAV_EXPANDED: SIDE_NAV_EXPANDED_COOKIE,
  DIRECT_CHATS_EXPANDED: DIRECT_CHATS_EXPANDED_COOKIE,
  GROUP_CHATS_EXPANDED: GROUP_CHATS_EXPANDED_COOKIE,
} as const;
