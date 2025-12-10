import { parseISO } from "date-fns";
import { format, toZonedTime } from "date-fns-tz";

/**
 * Converts a UTC datetime string to the local timezone and formats it.
 * e.g., "2025-12-04 04:27:32" → "2025-12-04 13:27:32" (JST)
 */
export const formatToLocalTime = (
  utcString: string,
  dateFormat = "yyyy-MM-dd HH:mm:ss",
) => {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const utcIsoString = utcString.endsWith("Z") ? utcString : `${utcString}Z`;
  const utcDate = parseISO(utcIsoString); // Convert the UTC string to a Date object
  const zonedDate = toZonedTime(utcDate, timeZone); // Convert to local timezone
  return format(zonedDate, dateFormat); // Format the date
};
