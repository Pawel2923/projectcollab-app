export function extractIdFromIri(iri?: string | null): string | undefined {
  if (!iri) {
    return undefined;
  }

  const segments = iri.split("/").filter(Boolean);
  return segments[segments.length - 1];
}

export function buildResourceIri(
  resource: string,
  id?: string,
): string | undefined {
  if (!resource || !id) {
    return undefined;
  }

  return `/${resource}/${id}`;
}
