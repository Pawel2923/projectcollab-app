"use client";

export function getMercureUrl(): string {
  const hubUrl = process.env.NEXT_PUBLIC_MERCURE_URL;
  if (!hubUrl) {
    throw new Error("NEXT_PUBLIC_MERCURE_URL environment variable is not set");
  }

  return hubUrl;
}

export function getApiUrlForClient(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL environment variable is not set");
  }

  return apiUrl;
}
