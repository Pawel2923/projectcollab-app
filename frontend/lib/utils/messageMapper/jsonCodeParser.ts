import { messageMap } from "./messageMap";

export function parseJsonCode(jsonString: string): string | undefined {
  try {
    const parsed = JSON.parse(jsonString);
    if (typeof parsed.code === "string" && parsed.code in messageMap) {
      return parsed.code;
    }
  } catch (e) {
    console.error(e);
  }
}
