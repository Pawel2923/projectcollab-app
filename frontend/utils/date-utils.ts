/**
 * Formats a date to a relative time string (e.g., "2 hours ago", "3 days ago")
 * Note: This should ideally be used in Client Components to avoid hydration mismatches
 * if the server time differs significantly or if "now" shifts.
 */
export function formatDistanceToNow(date: Date, locale?: string): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (diffInSeconds < 60) {
    return rtf.format(-diffInSeconds, "second");
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return rtf.format(-diffInMinutes, "minute");
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return rtf.format(-diffInHours, "hour");
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return rtf.format(-diffInDays, "day");
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return rtf.format(-diffInMonths, "month");
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return rtf.format(-diffInYears, "year");
}

/**
 * Formats a date to a localized string with time
 * @throws Will throw RangeError if date is not a valid Date object
 */
export function formatDateTime(date: Date, locale: string = "pl-PL"): string {
  if (Number.isNaN(date.getTime())) {
    throw new RangeError(
      `Invalid date provided to formatDateTime: ${date}. Expected a valid Date object.`,
    );
  }

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
