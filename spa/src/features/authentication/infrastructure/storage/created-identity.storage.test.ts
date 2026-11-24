import { describe, it, expect } from "vitest"
import {
  CREATED_IDENTITY_STORAGE_KEY,
  clearCreatedIdentityEmail,
  readCreatedIdentityEmail,
  saveCreatedIdentityEmail,
} from "./created-identity.storage"

function createMemoryStorage(): Storage {
  const store = new Map<string, string>()
  return {
    get length() {
      return store.size
    },
    clear: () => store.clear(),
    getItem: (key: string) => store.get(key) ?? null,
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    removeItem: (key: string) => {
      store.delete(key)
    },
    setItem: (key: string, value: string) => {
      store.set(key, value)
    },
  }
}

describe("created-identity storage", () => {
  it("saves, trims, reads, and clears the created identity email", () => {
    const storage = createMemoryStorage()

    saveCreatedIdentityEmail("  user@example.com  ", storage)
    expect(storage.getItem(CREATED_IDENTITY_STORAGE_KEY)).toBe(
      "user@example.com"
    )
    expect(readCreatedIdentityEmail(storage)).toBe("user@example.com")

    clearCreatedIdentityEmail(storage)
    expect(readCreatedIdentityEmail(storage)).toBeNull()
  })

  it("returns null for empty, whitespace, or literal 'null' values", () => {
    const storage = createMemoryStorage()

    expect(readCreatedIdentityEmail(storage)).toBeNull()

    storage.setItem(CREATED_IDENTITY_STORAGE_KEY, "null")
    expect(readCreatedIdentityEmail(storage)).toBeNull()

    storage.setItem(CREATED_IDENTITY_STORAGE_KEY, "   ")
    expect(readCreatedIdentityEmail(storage)).toBeNull()
  })

  it("handles storage errors gracefully without throwing", () => {
    const throwingStorage = {
      getItem: () => {
        throw new Error("SecurityError")
      },
      setItem: () => {
        throw new Error("QuotaExceededError")
      },
      removeItem: () => {
        throw new Error("SecurityError")
      },
    } as unknown as Storage

    expect(() =>
      saveCreatedIdentityEmail("user@example.com", throwingStorage)
    ).not.toThrow()
    expect(readCreatedIdentityEmail(throwingStorage)).toBeNull()
    expect(() => clearCreatedIdentityEmail(throwingStorage)).not.toThrow()
  })
})
