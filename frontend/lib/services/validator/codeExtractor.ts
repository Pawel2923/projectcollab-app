export function extractCodeFromJsonError(
  jsonString?: string | null,
): string | null {
  try {
    if (!jsonString) {
      return null;
    }

    const parsed = JSON.parse(jsonString);

    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "code" in parsed &&
      typeof parsed.code === "string"
    ) {
      return parsed.code;
    } else {
      console.error("Parsed object does not contain a valid 'code' field");
      return null;
    }
  } catch (e) {
    console.error(`Error parsing JSON: ${e}`);
    return null;
  }
}
