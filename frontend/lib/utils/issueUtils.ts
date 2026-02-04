export function formatTimestamp(timestamp: string, locale?: string): string {
  const date = new Date(timestamp);
  const currentYear = new Date().getFullYear();
  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: currentYear === date.getFullYear() ? undefined : "numeric",
  };
  return date.toLocaleDateString(locale, options);
}

export function formatEstimatedTime(estimated: number): string {
  const weeks = Math.floor(estimated / (60 * 8 * 5));
  const days = Math.floor((estimated % (60 * 8 * 5)) / (60 * 8));
  const hours = Math.floor((estimated % (60 * 8)) / 60);
  const minutes = estimated % 60;

  let result = "";
  if (weeks > 0) {
    result += `${weeks}w `;
  }
  if (days > 0) {
    result += `${days}d `;
  }
  if (hours > 0) {
    result += `${hours}h `;
  }
  if (minutes > 0) {
    result += `${minutes}m`;
  }

  return result.trim() || "0m";
}

export function parseEstimatedTime(estimatedStr: string): number {
  if (!estimatedStr) return 0;

  const timeUnits = {
    w: 60 * 8 * 5,
    d: 60 * 8,
    h: 60,
    m: 1,
  };

  let totalMinutes = 0;
  const normalized = estimatedStr.trim().toLowerCase();
  const regex = /(\d+)([wdhm])/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(normalized)) !== null) {
    const value = parseInt(match[1], 10);
    const unit = match[2] as keyof typeof timeUnits;
    totalMinutes += value * timeUnits[unit];
  }

  return totalMinutes;
}

/**
 * Validates that a value is a sequence of number+unit tokens (w,d,h,m), optionally separated by spaces.
 * Examples: "1w 2d 3h 30m", "3h30m", "45m".
 */
export function isValidTimeString(value?: string | null): boolean {
  if (!value) return false;
  const trimmed = value.trim();
  if (trimmed === "") return false;
  const fullRegex = /^(\d+[wdhm]\s*)+$/i;
  return fullRegex.test(trimmed);
}

export function mapPriorityColor(priority: string | undefined): string {
  switch (priority) {
    case "low":
      return "priority-low";
    case "medium":
      return "priority-medium";
    case "high":
      return "priority-high";
    case "critical":
      return "priority-critical";
    default:
      return "muted-foreground";
  }
}

export function formatDateTime(
  value?: string | null,
  skipTime = false,
  locale: string = "pl-PL",
) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleString(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: skipTime ? undefined : "2-digit",
    minute: skipTime ? undefined : "2-digit",
  });
}
