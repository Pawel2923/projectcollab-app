import type { JwtPayload } from "jwt-decode";
import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers";
import NextAuth from "next-auth";
import type { JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import MicrosoftEntraId from "next-auth/providers/microsoft-entra-id";

import { logToServer } from "@/services/log/server-logger";
import { getApiUrl } from "@/utils/get-api-url";
import type { Result } from "@/utils/result";
import { Err, Ok } from "@/utils/result";

import { getApiRoutePrefix } from "./utils/iri-util";

const API_URL = getApiUrl() || `http://api${getApiRoutePrefix()}`;
const AUTH_SERVICE_NAME = "auth.nextauth";

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
        maxAge: 3600,
      });
    }
  }
}

async function exchangeToken(
  provider: string,
  payload: unknown,
): Promise<Result<{ token: string; refresh_token: string }, string>> {
  try {
    const payloadObject = payload as {
      access_token?: string | null;
      refresh_token?: string | null;
      id_token?: string | null;
      expires_at?: number | null;
    };

    await logToServer({
      level: "debug",
      message: "Starting OAuth token exchange",
      serviceName: AUTH_SERVICE_NAME,
      context: {
      provider,
      hasAccessToken: Boolean(payloadObject?.access_token),
      hasRefreshToken: Boolean(payloadObject?.refresh_token),
      hasIdToken: Boolean(payloadObject?.id_token),
      expiresAt: payloadObject?.expires_at,
      },
    });

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

      await logToServer({
        level: "info",
        message: "OAuth token exchange succeeded",
        serviceName: AUTH_SERVICE_NAME,
        context: {
          provider,
          hasToken: Boolean(data?.token),
          hasRefreshToken: Boolean(data?.refresh_token),
        },
      });

      return Ok({ token: data.token, refresh_token: data.refresh_token });
    }

    const errorText = await res.text();
    await logToServer({
      level: "warn",
      message: "OAuth token exchange failed",
      serviceName: AUTH_SERVICE_NAME,
      context: {
        provider,
        status: res.status,
        response: errorText,
      },
    });

    return Err(errorText);
  } catch (error) {
    await logToServer({
      level: "error",
      message: "OAuth token exchange request errored",
      serviceName: AUTH_SERVICE_NAME,
      context: {
        provider,
        error: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
      },
    });

    return Err(
      error instanceof Error ? error.message : "Unknown token exchange error",
    );
  }
}

async function requestTokenRefresh(
  token: string,
): Promise<Result<{ token: string; refresh_token: string }, string>> {
  try {
    await logToServer({
      level: "debug",
      message: "Starting access token refresh",
      serviceName: AUTH_SERVICE_NAME,
      context: {
        hasRefreshToken: Boolean(token),
      },
    });

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

      await logToServer({
        level: "info",
        message: "Access token refresh succeeded",
        serviceName: AUTH_SERVICE_NAME,
        context: {
          hasToken: Boolean(data?.token),
          hasRefreshToken: Boolean(data?.refresh_token),
        },
      });

      return Ok({ token: data.token, refresh_token: data.refresh_token });
    }

    const errorText = await res.text();
    await logToServer({
      level: "warn",
      message: "Access token refresh failed",
      serviceName: AUTH_SERVICE_NAME,
      context: {
        status: res.status,
        response: errorText,
      },
    });

    return Err(errorText);
  } catch (error) {
    await logToServer({
      level: "error",
      message: "Access token refresh request errored",
      serviceName: AUTH_SERVICE_NAME,
      context: {
        error: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
      },
    });

    return Err(
      error instanceof Error ? error.message : "Unknown token refresh error",
    );
  }
}

async function refreshAccessToken(token: JWT): Promise<JWT> {
  await logToServer({
    level: "debug",
    message: "Refreshing session access token",
    serviceName: AUTH_SERVICE_NAME,
    context: {
      hasRefreshToken: Boolean(token.refreshToken),
      expiresAt: token.expiresAt,
    },
  });

  const refreshResult = await requestTokenRefresh(token.refreshToken ?? "");

  if (!refreshResult.ok) {
    await logToServer({
      level: "error",
      message: "Session access token refresh failed",
      serviceName: AUTH_SERVICE_NAME,
      context: {
        error: refreshResult.error,
      },
    });

    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }

  const { token: newToken, refresh_token: newRefreshToken } =
    refreshResult.value;
  const decoded = jwtDecode<JwtPayload>(newToken);

  await logToServer({
    level: "info",
    message: "Session access token refreshed",
    serviceName: AUTH_SERVICE_NAME,
    context: {
      expiresAt: decoded.exp,
      hasRefreshToken: Boolean(newRefreshToken ?? token.refreshToken),
    },
  });

  return {
    ...token,
    accessToken: newToken,
    expiresAt: decoded.exp,
    refreshToken: newRefreshToken ?? token.refreshToken,
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
      issuer: `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID}/v2.0`,
      authorization: {
        url: `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID}/oauth2/v2.0/authorize`,
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
          await logToServer({
            level: "warn",
            message: "Credentials sign-in rejected: missing fields",
            serviceName: AUTH_SERVICE_NAME,
            context: {
              hasEmail: Boolean(credentials?.email),
              hasPassword: Boolean(credentials?.password),
            },
          });

          return null;
        }

        try {
          await logToServer({
            level: "debug",
            message: "Credentials sign-in request started",
            serviceName: AUTH_SERVICE_NAME,
            context: {
              email: credentials.email,
            },
          });

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
            const responseText = await res.text();
            await logToServer({
              level: "warn",
              message: "Credentials sign-in failed",
              serviceName: AUTH_SERVICE_NAME,
              context: {
                email: credentials.email,
                status: res.status,
                response: responseText,
              },
            });

            return null;
          }

          await captureMercureCookie(res);

          const user = await res.json();

          if (user.token) {
            await logToServer({
              level: "info",
              message: "Credentials sign-in response received",
              serviceName: AUTH_SERVICE_NAME,
              context: {
                userId: user.id || "unknown",
                email: credentials.email,
                hasRefreshToken: Boolean(user.refresh_token),
              },
            });

            return {
              id: user.id || "unknown",
              email: credentials.email as string,
              accessToken: user.token,
              refreshToken: user.refresh_token,
            };
          }

          await logToServer({
            level: "warn",
            message: "Credentials sign-in response missing token",
            serviceName: AUTH_SERVICE_NAME,
            context: {
              email: credentials.email,
            },
          });

          return null;
        } catch (error) {
          await logToServer({
            level: "error",
            message: "Credentials sign-in request errored",
            serviceName: AUTH_SERVICE_NAME,
            context: {
              email: credentials.email,
              error: error instanceof Error ? error.message : String(error),
              errorStack: error instanceof Error ? error.stack : undefined,
            },
          });

          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      await logToServer({
        level: "debug",
        message: "JWT callback invoked",
        serviceName: AUTH_SERVICE_NAME,
        context: {
          hasAccount: Boolean(account),
          hasUser: Boolean(user),
          hasExistingToken: Boolean(token.accessToken),
          expiresAt: token.expiresAt,
          provider: account?.provider,
        },
      });

      if (account && user) {
        let accessToken = "";
        let refreshToken = "";

        if (account.provider !== "credentials") {
          await logToServer({
            level: "debug",
            message: "Exchanging provider token for app JWT",
            serviceName: AUTH_SERVICE_NAME,
            context: {
              provider: account.provider,
            },
          });

          const exchangeResult = await exchangeToken(account.provider, {
            access_token: account.access_token,
            refresh_token: account.refresh_token,
            id_token: account.id_token,
            expires_at: account.expires_at,
          });

          if (exchangeResult.ok) {
            accessToken = exchangeResult.value.token;
            refreshToken = exchangeResult.value.refresh_token;
          } else {
            await logToServer({
              level: "error",
              message: "Failed to exchange provider token",
              serviceName: AUTH_SERVICE_NAME,
              context: {
                provider: account.provider,
                error: exchangeResult.error,
              },
            });
          }
        } else {
          accessToken = (user as User).accessToken;
          refreshToken = (user as User).refreshToken || "";

          await logToServer({
            level: "info",
            message: "Credentials sign-in succeeded",
            serviceName: AUTH_SERVICE_NAME,
            context: {
              userId: (user as User).id,
              email: (user as User).email,
              hasRefreshToken: Boolean(refreshToken),
            },
          });
        }

        if (accessToken) {
          const decoded = jwtDecode<JwtPayload>(accessToken);
          token.accessToken = accessToken;
          token.refreshToken = refreshToken;
          token.expiresAt = decoded.exp;

          await logToServer({
            level: "info",
            message: "JWT callback stored session tokens",
            serviceName: AUTH_SERVICE_NAME,
            context: {
              provider: account.provider,
              expiresAt: decoded.exp,
              hasRefreshToken: Boolean(refreshToken),
            },
          });
          return token;
        }

        await logToServer({
          level: "warn",
          message: "JWT callback did not receive access token",
          serviceName: AUTH_SERVICE_NAME,
          context: {
            provider: account.provider,
          },
        });
      }

      const expiresAt = typeof token.expiresAt === "number" ? token.expiresAt : 0;
      if (Date.now() < expiresAt * 1000 - 10000) {
        await logToServer({
          level: "debug",
          message: "JWT callback returned cached token",
          serviceName: AUTH_SERVICE_NAME,
          context: {
            expiresAt: token.expiresAt,
          },
        });
        return token;
      }

      await logToServer({
        level: "debug",
        message: "Access token expired, refreshing session",
        serviceName: AUTH_SERVICE_NAME,
        context: {
          expiresAt: token.expiresAt,
        },
      });
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      await logToServer({
        level: "debug",
        message: "Session callback invoked",
        serviceName: AUTH_SERVICE_NAME,
        context: {
          hasAccessToken: Boolean(token.accessToken),
          hasRefreshToken: Boolean(token.refreshToken),
          hasError: Boolean(token.error),
        },
      });

      if (token.accessToken) {
        session.accessToken = token.accessToken;
      }
      if (token.refreshToken) {
        session.refreshToken = token.refreshToken;
      }
      if (token.error) {
        session.error = token.error;

        await logToServer({
          level: "warn",
          message: "Session callback propagated auth error",
          serviceName: AUTH_SERVICE_NAME,
          context: {
            error: token.error,
          },
        });
      }

      await logToServer({
        level: "debug",
        message: "Session callback completed",
        serviceName: AUTH_SERVICE_NAME,
        context: {
          hasAccessToken: Boolean(session.accessToken),
          hasRefreshToken: Boolean(session.refreshToken),
          hasError: Boolean(session.error),
        },
      });

      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
});
