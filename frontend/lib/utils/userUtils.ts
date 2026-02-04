import type { User } from "../types/api";

type UserLike = {
  "@id": string;
  "@type": string;
  username?: string;
  email?: string;
};

export function getUserInitials(user?: User | UserLike | null): string {
  return (
    user?.username?.slice(0, 1).toUpperCase() ||
    user?.email?.slice(0, 1).toUpperCase() ||
    "U"
  );
}
