export function extractIdFromIri(iri?: string | null): string | undefined {
  if (!iri) {
    return undefined;
  }

  const segments = iri.split("/").filter(Boolean);
  return segments[segments.length - 1];
}

const DEFAULT_API_ROUTE_PREFIX = "/core-api";

function normalizeSegment(segment: string): string {
  return segment.replace(/^\/+|\/+$/g, "");
}

export function getApiRoutePrefix(): string {
  const envPrefix = process.env.NEXT_PUBLIC_API_ROUTE_PREFIX;
  if (!envPrefix) {
    return DEFAULT_API_ROUTE_PREFIX;
  }

  const normalizedPrefix = normalizeSegment(envPrefix);
  if (normalizedPrefix.length === 0) {
    return DEFAULT_API_ROUTE_PREFIX;
  }

  return `/${normalizedPrefix}`;
}

export function buildResourceIri(
  resource: string,
  id?: string,
): string | undefined {
  const normalizedResource = normalizeSegment(resource);
  const normalizedId = normalizeSegment(id || "");
  if (!normalizedResource || !normalizedId) {
    return undefined;
  }

  return `${getApiRoutePrefix()}/${normalizedResource}/${normalizedId}`;
}
