import "server-only";

export function getApiUrl(): string | undefined {
  return process.env.API_URL;
}
