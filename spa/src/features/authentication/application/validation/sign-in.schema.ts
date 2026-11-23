import { z } from "zod"
import { m } from "@/paraglide/messages"

export const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: m.auth_email_required() })
    .email({ message: m.auth_email_invalid() }),
  password: z.string().min(1, { message: m.auth_password_required() }),
})

export type SignInFormData = z.infer<typeof signInSchema>
