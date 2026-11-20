export interface ApiUserDto {
  readonly "@id": string
  readonly "@type": string
  readonly "@context"?: string
  readonly id: number
  readonly email: string
  readonly roles: readonly string[]
  readonly username?: string
  readonly registeredAt?: string
  readonly isVerified?: boolean
}

export interface ApiOAuthProvidersDto {
  readonly "@context"?: string
  readonly "@id"?: string
  readonly "@type"?: string
  readonly providers: readonly string[]
  readonly lastSyncedAt?: string
}
