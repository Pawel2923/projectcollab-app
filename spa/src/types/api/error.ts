export interface ApiPlatformViolation {
  readonly propertyPath: string
  readonly message: string
}

export interface ApiPlatformErrorPayload {
  readonly "@context"?: string
  readonly "@type"?: string
  readonly "hydra:title"?: string
  readonly "hydra:description"?: string
  readonly violations?: readonly ApiPlatformViolation[]
  readonly message?: string
  readonly detail?: string
  readonly title?: string
  readonly status?: number
}
