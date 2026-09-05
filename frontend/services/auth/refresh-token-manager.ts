import { getApiUrl } from "@/utils/get-api-url";
import { getApiRoutePrefix } from "@/utils/iri-util";
import type { Result } from "@/utils/result";
import { Err, Ok } from "@/utils/result";

import { logToServer } from "../log/server-logger";

const AUTH_SERVICE_NAME = "auth.refresh-manager";

let activeRefreshPromise: Promise<
  Result<{ token: string; refresh_token: string }, string>
> | null = null;
let activeRefreshToken: string | null = null;

export async function requestTokenRefresh(
  token: string,
  apiUrlOverride?: string,
  onSuccessCaptureCookie?: (res: Response) => Promise<void>,
): Promise<Result<{ token: string; refresh_token: string }, string>> {
  if (!token) {
    return Err("No refresh token provided");
  }

  if (activeRefreshPromise && activeRefreshToken === token) {
    await logToServer({
      level: "debug",
      message: "Reusing active in-flight access token refresh promise",
      serviceName: AUTH_SERVICE_NAME,
    });
    return activeRefreshPromise;
  }

  activeRefreshToken = token;
  activeRefreshPromise = (async () => {
    try {
      await logToServer({
        level: "debug",
        message: "Starting access token refresh",
        serviceName: AUTH_SERVICE_NAME,
        context: {
          hasRefreshToken: Boolean(token),
        },
      });

      const apiUrl =
        apiUrlOverride || getApiUrl() || `http://api${getApiRoutePrefix()}`;

      const res = await fetch(`${apiUrl}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refresh_token: token,
        }),
      });

      if (res.ok) {
        if (onSuccessCaptureCookie) {
          await onSuccessCaptureCookie(res);
        }
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
    } finally {
      activeRefreshPromise = null;
      activeRefreshToken = null;
    }
  })();

  return activeRefreshPromise;
}

export function resetActiveRefreshForTests() {
  activeRefreshPromise = null;
  activeRefreshToken = null;
}
