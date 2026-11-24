export const CREATED_IDENTITY_STORAGE_KEY = "auth_created_identity"

function getDefaultStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null
  }
  try {
    return window.sessionStorage
  } catch {
    return null
  }
}

export function readCreatedIdentityEmail(
  storage: Storage | null = getDefaultStorage()
): string | null {
  if (!storage) {
    return null
  }
  try {
    const stored = storage.getItem(CREATED_IDENTITY_STORAGE_KEY)
    if (!stored || stored === "null") {
      return null
    }
    const trimmed = stored.trim()
    return trimmed.length > 0 ? trimmed : null
  } catch {
    return null
  }
}

export function saveCreatedIdentityEmail(
  email: string,
  storage: Storage | null = getDefaultStorage()
): void {
  if (!storage) {
    return
  }
  const trimmed = email.trim()
  if (!trimmed) {
    return
  }
  try {
    storage.setItem(CREATED_IDENTITY_STORAGE_KEY, trimmed)
  } catch {
    // Ignore storage access errors (e.g. private browsing restrictions)
  }
}

export function clearCreatedIdentityEmail(
  storage: Storage | null = getDefaultStorage()
): void {
  if (!storage) {
    return
  }
  try {
    storage.removeItem(CREATED_IDENTITY_STORAGE_KEY)
  } catch {
    // Ignore storage access errors
  }
}
