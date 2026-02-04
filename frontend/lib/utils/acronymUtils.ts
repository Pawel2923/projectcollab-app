/**
 * Generates a 2-character acronym from a name by taking the first letter of each word.
 * @param name - The name to generate an acronym from
 * @returns Uppercase acronym limited to 2 characters
 * @example
 * generateAcronym("Demo Project") // "DP"
 * generateAcronym("DemoProject") // "D"
 * generateAcronym("My Cool App") // "MC"
 */
export function generateAcronym(name: string): string {
  if (!name || name.trim().length === 0) {
    return "";
  }

  return name
    .split(/\s+/)
    .map((word) => word.replace(/[^A-Za-z0-9]/g, ""))
    .filter((word) => word.length > 0)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
