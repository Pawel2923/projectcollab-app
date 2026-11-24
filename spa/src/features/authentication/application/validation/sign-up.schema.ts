import { z } from "zod"
import { m } from "@/paraglide/messages"

export const signUpSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: m.auth_email_required() })
    .email({ message: m.auth_email_invalid() }),
  password: z.string().min(1, { message: m.auth_password_required() }),
})

export type SignUpFormData = z.infer<typeof signUpSchema>
