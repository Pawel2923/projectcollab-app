import type { User } from "@/types/api/user";

interface UserLike {
  "@id": string;
  "@type": string;
  username?: string;
  email?: string;
}

/**
 * Generates user's initials based on username or email
 * @param user
 * @returns First letter of username or email in uppercase; U if both undefined
 */
export function generateUserInitials(user?: User | UserLike | null): string {
  return (
    user?.username?.slice(0, 1).toUpperCase() ||
    user?.email?.slice(0, 1).toUpperCase() ||
    "U"
  );
}
