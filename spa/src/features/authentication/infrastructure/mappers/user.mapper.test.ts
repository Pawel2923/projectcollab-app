import { describe, it, expect } from "vitest"
import { UserMapper } from "./user.mapper"
import type { ApiUserDto } from "../dto/user-api.dto"

describe("UserMapper", () => {
  it("maps ApiUserDto to domain User model correctly", () => {
    const apiDto: ApiUserDto = {
      "@id": "/core-api/users/42",
      "@type": "User",
      "@context": "/contexts/User",
      id: 42,
      email: "test@example.com",
      roles: ["ROLE_USER", "ROLE_ADMIN"],
      username: "testuser",
      registeredAt: "2026-01-15T10:00:00Z",
      isVerified: true,
    }

    const domainUser = UserMapper.toDomain(apiDto)

    expect(domainUser).toEqual({
      id: 42,
      email: "test@example.com",
      roles: ["ROLE_USER", "ROLE_ADMIN"],
      username: "testuser",
      registeredAt: "2026-01-15T10:00:00Z",
      isVerified: true,
    })

    // Domain user must NOT contain Hydra JSON-LD metadata
    expect("@id" in domainUser).toBe(false)
    expect("@type" in domainUser).toBe(false)
    expect("@context" in domainUser).toBe(false)
  })

  it("handles null or undefined safely in toDomainOrNull", () => {
    expect(UserMapper.toDomainOrNull(null)).toBeNull()
    expect(UserMapper.toDomainOrNull(undefined)).toBeNull()
  })

  it("maps valid dto in toDomainOrNull", () => {
    const apiDto: ApiUserDto = {
      "@id": "/core-api/users/1",
      "@type": "User",
      id: 1,
      email: "user@example.com",
      roles: ["ROLE_USER"],
    }

    const domainUser = UserMapper.toDomainOrNull(apiDto)
    expect(domainUser).not.toBeNull()
    expect(domainUser?.id).toBe(1)
    expect(domainUser?.email).toBe("user@example.com")
  })
})
