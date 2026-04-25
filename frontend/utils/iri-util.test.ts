import { describe, expect, test } from "vitest";

import { buildEndpointUriFromIri } from "./iri-util";

describe("buildEndpointUriFromIri", () => {
  const cases = [
    {
      description: "returns a single slash when both inputs are empty",
      baseUrl: "",
      resourceIri: "",
      expected: "/",
    },
    {
      description:
        "returns only normalized base URL when resource IRI is empty",
      baseUrl: "http://localhost/core-api",
      resourceIri: "",
      expected: "http://localhost/core-api/",
    },
    {
      description: "joins localhost base URL with resource IRI",
      baseUrl: "http://localhost",
      resourceIri: "/users/1",
      expected: "http://localhost/users/1",
    },
    {
      description: "joins localhost base URL with a nested resource IRI",
      baseUrl: "http://localhost",
      resourceIri: "/projects/42/tasks/9",
      expected: "http://localhost/projects/42/tasks/9",
    },
    {
      description: "joins example.com base URL with resource IRI",
      baseUrl: "http://example.com",
      resourceIri: "/users/1",
      expected: "http://example.com/users/1",
    },
    {
      description: "keeps deeper resource path segments intact",
      baseUrl: "http://example.com",
      resourceIri: "/users/1/details",
      expected: "http://example.com/users/1/details",
    },
    {
      description: "preserves query string in resource IRI",
      baseUrl: "http://example.com",
      resourceIri: "/users/1?include=projects",
      expected: "http://example.com/users/1?include=projects",
    },
    {
      description: "preserves hash fragment in resource IRI",
      baseUrl: "http://example.com",
      resourceIri: "/users/1#details",
      expected: "http://example.com/users/1#details",
    },
    {
      description: "joins https example.com base URL with resource IRI",
      baseUrl: "https://example.com",
      resourceIri: "/users/1",
      expected: "https://example.com/users/1",
    },
    {
      description: "handles https base URL with trailing slash",
      baseUrl: "https://example.com/",
      resourceIri: "/users/1/",
      expected: "https://example.com/users/1",
    },
    {
      description: "joins normalized base URL and resource IRI",
      baseUrl: "http://app/core-api",
      resourceIri: "/users/1",
      expected: "http://app/core-api/users/1",
    },
    {
      description: "normalizes trailing and leading slashes",
      baseUrl: "http://app/core-api/",
      resourceIri: "/users/1/",
      expected: "http://app/core-api/users/1",
    },
    {
      description: "removes leading core-api prefix from resource IRI",
      baseUrl: "http://app/core-api",
      resourceIri: "/core-api/users/1",
      expected: "http://app/core-api/users/1",
    },
    {
      description:
        "removes repeated leading core-api segments from resource IRI",
      baseUrl: "http://app/core-api",
      resourceIri: "/core-api/core-api/users/1",
      expected: "http://app/core-api/core-api/users/1",
    },
    {
      description: "handles resource IRI without leading slash",
      baseUrl: "http://app/core-api",
      resourceIri: "core-api/users/1",
      expected: "http://app/core-api/users/1",
    },
    {
      description:
        "strips core-api from a resource IRI that contains extra leading slashes",
      baseUrl: "http://app/core-api",
      resourceIri: "///core-api/users/1///",
      expected: "http://app/core-api/users/1",
    },
    {
      description: "supports empty base URL with non-empty resource IRI",
      baseUrl: "",
      resourceIri: "core-api/users/1",
      expected: "/users/1",
    },
    {
      description: "supports empty base URL with a nested resource IRI",
      baseUrl: "",
      resourceIri: "/projects/42/tasks/9",
      expected: "/projects/42/tasks/9",
    },
    {
      description: "returns trailing slash when resource IRI is empty",
      baseUrl: "http://app/core-api",
      resourceIri: "",
      expected: "http://app/core-api/",
    },
    {
      description: "preserves deeper base URL paths",
      baseUrl: "http://app/v2/core-api",
      resourceIri: "/users/1",
      expected: "http://app/v2/core-api/users/1",
    },
    {
      description: "keeps core-api segment when it appears in the middle",
      baseUrl: "http://app",
      resourceIri: "v1/core-api/users/1",
      expected: "http://app/v1/core-api/users/1",
    },
    {
      description:
        "does not alter resource IRI values that do not include core-api",
      baseUrl: "http://app",
      resourceIri: "v1/users/1",
      expected: "http://app/v1/users/1",
    },
    {
      description: "strips core-api when it is the only path segment",
      baseUrl: "http://app",
      resourceIri: "core-api",
      expected: "http://app/",
    },
    {
      description: "keeps core-api when it appears at the end of a longer path",
      baseUrl: "http://app",
      resourceIri: "issue_statuses/core-api",
      expected: "http://app/issue_statuses/core-api",
    },
    {
      description:
        "does not strip core-api when it appears inside a segment without a slash",
      baseUrl: "http://app",
      resourceIri: "my-core-api-user/1",
      expected: "http://app/my-core-api-user/1",
    },
  ];

  test.each(cases)("$description", ({ baseUrl, resourceIri, expected }) => {
    const result = buildEndpointUriFromIri(baseUrl, resourceIri);
    expect(result).toBe(expected);
  });
});
