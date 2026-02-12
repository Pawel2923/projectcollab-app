export interface User {
  "@id": string;
  "@type": "User";
  "@context"?: "/contexts/User";
  id: number;
  email: string;
  roles: string[];
  username?: string;
  registeredAt?: string;
  isVerified?: boolean;
}

export type UserWithOnlyEmailAndName = Pick<
  User,
  "@id" | "@type" | "id" | "email" | "username"
>;

export interface UserOAuthProviders {
  "@context": "/contexts/UserOAuthProviders";
  "@id": "/users/me/oauth";
  "@type": "UserOAuthProviders";
  providers: string[];
  lastSyncedAt?: string;
}
