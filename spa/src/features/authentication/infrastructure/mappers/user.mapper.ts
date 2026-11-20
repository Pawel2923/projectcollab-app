import type { User } from "../../domain/models/user"
import type { ApiUserDto } from "../dto/user-api.dto"

export class UserMapper {
  public static toDomain(dto: ApiUserDto): User {
    return {
      id: dto.id,
      email: dto.email,
      roles: Object.freeze([...dto.roles]),
      username: dto.username,
      registeredAt: dto.registeredAt,
      isVerified: dto.isVerified,
    }
  }

  public static toDomainOrNull(
    dto: ApiUserDto | null | undefined
  ): User | null {
    if (!dto) {
      return null
    }
    return UserMapper.toDomain(dto)
  }
}
