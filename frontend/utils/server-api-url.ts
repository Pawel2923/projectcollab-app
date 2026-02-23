import "server-only";

export function getServerApiUrl(): string | undefined {
  return process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL;
}
