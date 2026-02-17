export function extractIdFromIri(iri?: string | null): string | undefined {
  if (!iri) {
    return undefined;
  }

  // Handle case where iri might be an object with @id property
  if (typeof iri !== "string") {
    console.warn("extractIdFromIri received non-string value:", iri);
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
