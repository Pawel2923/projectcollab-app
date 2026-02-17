import type { JwtPayload } from "jwt-decode";
import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers";
import NextAuth from "next-auth";
import type { JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import MicrosoftEntraId from "next-auth/providers/microsoft-entra-id";

import type { Result } from "@/utils/result";
import { Err, Ok } from "@/utils/result";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://api";

interface User {
  id: string;
  email: string;
  accessToken: string;
  refreshToken?: string;
}

async function captureMercureCookie(res: Response) {
  const setCookie = res.headers.get("set-cookie");
  if (setCookie) {
    const match = setCookie.match(/mercureAuthorization=([^;]+)/);
    if (match) {
      (await cookies()).set("mercureAuthorization", match[1], {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60, // 1 hour
      });
    }
  }
}

async function exchangeToken(
  provider: string,
  payload: unknown,
): Promise<Result<{ token: string; refresh_token: string }, string>> {
  try {
    const res = await fetch(`${API_URL}/auth/oauth/${provider}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      await captureMercureCookie(res);
      const data = await res.json();
      return Ok({ token: data.token, refresh_token: data.refresh_token });
    }

    return Err(await res.text());
  } catch (error) {
    return Err(
      error instanceof Error ? error.message : "Unknown token exchange error",
    );
  }
}

async function requestTokenRefresh(
  token: string,
): Promise<Result<{ token: string; refresh_token: string }, string>> {
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refresh_token: token,
      }),
    });

    if (res.ok) {
      await captureMercureCookie(res);
      const data = await res.json();
      return Ok({ token: data.token, refresh_token: data.refresh_token });
    }

    return Err(await res.text());
  } catch (error) {
    return Err(
      error instanceof Error ? error.message : "Unknown token refresh error",
    );
  }
}

async function refreshAccessToken(token: JWT): Promise<JWT> {
  const refreshResult = await requestTokenRefresh(token.refreshToken ?? "");

  if (!refreshResult.ok) {
    console.error("RefreshAccessTokenError", refreshResult.error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }

  const { token: newToken, refresh_token: newRefreshToken } =
    refreshResult.value;
  const decoded = jwtDecode<JwtPayload>(newToken);

  return {
    ...token,
    accessToken: newToken,
    expiresAt: decoded.exp,
    refreshToken: newRefreshToken ?? token.refreshToken, // Fallback to old refresh token if not rotated
  };
}

export const { handlers, auth, signOut } = NextAuth({
  basePath: "/api/auth",
  trustHost: true,
  useSecureCookies: process.env.NODE_ENV === "production",
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope:
            "openid email profile https://www.googleapis.com/auth/calendar.events",
        },
      },
    }),
    MicrosoftEntraId({
      clientId: process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid profile email offline_access Calendars.ReadWrite",
        },
      },
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const res = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!res.ok) {
            return null;
          }

          await captureMercureCookie(res);

          const user = await res.json();

          if (user.token) {
            return {
              id: user.id || "unknown",
              email: credentials.email as string,
              accessToken: user.token,
              refreshToken: user.refresh_token,
            };
          }

          return null;
        } catch (e) {
          console.error("Auth error:", e);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      if (account && user) {
        // Initial sign-in
        let accessToken = "";
        let refreshToken = "";

        if (account.provider !== "credentials") {
          console.log(
            `Exchanging ${account.provider} token for Symfony JWT...`,
          );

          const exchangeResult = await exchangeToken(account.provider, {
            access_token: account.access_token,
            refresh_token: account.refresh_token,
            id_token: account.id_token,
            expires_at: account.expires_at,
          });

          if (exchangeResult.ok) {
            console.log("Token exchange successful. Token received.");
            accessToken = exchangeResult.value.token;
            refreshToken = exchangeResult.value.refresh_token;
          } else {
            console.error(
              "Failed to exchange token with backend",
              exchangeResult.error,
            );
          }
        } else {
          accessToken = (user as User).accessToken;
          refreshToken = (user as User).refreshToken || "";
        }

        if (accessToken) {
          const decoded = jwtDecode<JwtPayload>(accessToken);
          token.accessToken = accessToken;
          token.refreshToken = refreshToken;
          token.expiresAt = decoded.exp; // Seconds since epoch
          return token;
        }
      }

      // Return previous token if the access token has not expired yet
      // buffer time: 10 seconds
      if (Date.now() < (token.expiresAt as number) * 1000 - 10000) {
        return token;
      }

      // Access token has expired, try to refresh it
      console.log("Access token expired, refreshing...");
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (token.accessToken) {
        session.accessToken = token.accessToken;
      }
      if (token.refreshToken) {
        session.refreshToken = token.refreshToken;
      }
      if (token.error) {
        session.error = token.error;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
});
