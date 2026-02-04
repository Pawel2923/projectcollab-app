import type { ChatRole, OrganizationRole, ProjectRole } from "./roleHierarchy";

/**
 * Permission descriptions for each role
 */
export const PROJECT_ROLE_PERMISSIONS: Record<
  ProjectRole,
  { base: string[]; inherited?: string[] }
> = {
  CREATOR: {
    base: [
      "Pełna własność projektu",
      "Usuwanie projektu",
      "Przenoszenie własności",
    ],
    inherited: ["Wszystkie uprawnienia roli ADMIN"],
  },
  ADMIN: {
    base: [
      "Zarządzanie ustawieniami projektu",
      "Zarządzanie członkami i rolami",
      "Usuwanie zgłoszeń i sprintów",
      "Archiwizacja projektu",
    ],
    inherited: ["Wszystkie uprawnienia ról PRODUCT_OWNER i SCRUM_MASTER"],
  },
  PRODUCT_OWNER: {
    base: [
      "Zarządzanie backlogiem produktu",
      "Priorytetyzacja zgłoszeń",
      "Tworzenie i zarządzanie sprintami",
      "Akceptowanie/Odrzucanie rezultatów",
    ],
    inherited: ["Wszystkie uprawnienia ról EDITOR i MEMBER"],
  },
  SCRUM_MASTER: {
    base: [
      "Prowadzenie ceremonii sprintu",
      "Zarządzanie aktywnościami sprintu",
      "Usuwanie blokad",
      "Wspieranie zespołu",
    ],
    inherited: ["Wszystkie uprawnienia ról EDITOR i MEMBER"],
  },
  DEVELOPER: {
    base: [
      "Tworzenie zgłoszeń",
      "Edycja własnych zgłoszeń",
      "Rejestrowanie czasu",
      "Aktualizacja statusu zgłoszeń",
    ],
    inherited: ["Wszystkie uprawnienia roli MEMBER"],
  },
  EDITOR: {
    base: [
      "Edycja wszystkich zgłoszeń",
      "Zarządzanie tagami i etykietami",
      "Przypisywanie zgłoszeń",
    ],
    inherited: ["Wszystkie uprawnienia roli MEMBER"],
  },
  MEMBER: {
    base: ["Podgląd projektu", "Komentowanie zgłoszeń", "Podgląd sprintów"],
    inherited: ["Wszystkie uprawnienia roli VIEWER"],
  },
  VIEWER: {
    base: [
      "Podgląd projektu",
      "Podgląd zgłoszeń (tylko odczyt)",
      "Podgląd sprintów (tylko odczyt)",
    ],
  },
};

export const ORGANIZATION_ROLE_PERMISSIONS: Record<
  OrganizationRole,
  { base: string[]; inherited?: string[] }
> = {
  CREATOR: {
    base: [
      "Pełna własność organizacji",
      "Usuwanie organizacji",
      "Przenoszenie własności",
    ],
    inherited: ["Wszystkie uprawnienia roli ADMIN"],
  },
  ADMIN: {
    base: [
      "Zarządzanie ustawieniami organizacji",
      "Zarządzanie członkami i rolami",
      "Tworzenie i usuwanie projektów",
      "Dostęp do wszystkich projektów",
    ],
    inherited: ["Wszystkie uprawnienia roli MEMBER"],
  },
  MEMBER: {
    base: [
      "Podgląd organizacji",
      "Tworzenie projektów",
      "Dostęp do przypisanych projektów",
      "Uczestnictwo w czatach organizacji",
    ],
  },
};

export const CHAT_ROLE_PERMISSIONS: Record<
  ChatRole,
  { base: string[]; inherited?: string[] }
> = {
  CREATOR: {
    base: ["Usuwanie czatu", "Zarządzanie ustawieniami czatu"],
    inherited: ["Wszystkie uprawnienia roli ADMIN"],
  },
  ADMIN: {
    base: [
      "Zarządzanie ustawieniami czatu",
      "Usuwanie członków",
      "Zmiana ról członków",
    ],
    inherited: ["Wszystkie uprawnienia roli MODERATOR"],
  },
  MODERATOR: {
    base: [
      "Zapraszanie członków",
      "Usuwanie wiadomości",
      "Przypinanie wiadomości",
    ],
    inherited: ["Wszystkie uprawnienia roli MEMBER"],
  },
  MEMBER: {
    base: [
      "Wysyłanie wiadomości",
      "Podgląd historii czatu",
      "Edycja własnych wiadomości",
    ],
  },
};

/**
 * Get all permissions for a role (base + inherited)
 */
export function getAllPermissions(
  role: ProjectRole | OrganizationRole | ChatRole,
  entityType: "project" | "organization" | "chat",
): string[] {
  const permissions =
    entityType === "project"
      ? PROJECT_ROLE_PERMISSIONS[role as ProjectRole]
      : entityType === "organization"
        ? ORGANIZATION_ROLE_PERMISSIONS[role as OrganizationRole]
        : CHAT_ROLE_PERMISSIONS[role as ChatRole];

  if (!permissions) return [];

  return [...permissions.base];
}

/**
 * Get permission description for tooltip
 */
export function getPermissionDescription(
  role: ProjectRole | OrganizationRole | ChatRole,
  entityType: "project" | "organization" | "chat",
): { base: string[]; inherited?: string[] } {
  if (entityType === "project") {
    return PROJECT_ROLE_PERMISSIONS[role as ProjectRole] || { base: [] };
  } else if (entityType === "organization") {
    return (
      ORGANIZATION_ROLE_PERMISSIONS[role as OrganizationRole] || { base: [] }
    );
  } else {
    return CHAT_ROLE_PERMISSIONS[role as ChatRole] || { base: [] };
  }
}
