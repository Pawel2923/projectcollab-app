export interface User {
  readonly id: number
  readonly email: string
  readonly roles: readonly string[]
  readonly username?: string
  readonly registeredAt?: string
  readonly isVerified?: boolean
}

export type UserLike = {
  readonly username?: string
  readonly email?: string
}
