export interface ApiVerifyEmailResponseDto {
  readonly "@context"?: string
  readonly "@id"?: string
  readonly "@type"?: string
  readonly code?: string | null
  readonly isVerified?: boolean | null
}
