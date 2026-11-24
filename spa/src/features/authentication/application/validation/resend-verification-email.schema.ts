import { z } from "zod"
import { m } from "@/paraglide/messages"

export const resendVerificationEmailSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: m.auth_email_required() })
    .email({ message: m.auth_email_invalid() }),
})

export type ResendVerificationEmailFormData = z.infer<
  typeof resendVerificationEmailSchema
>
