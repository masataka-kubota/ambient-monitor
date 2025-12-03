import { parseISO } from "date-fns";
import { format, toZonedTime } from "date-fns-tz";

/**
 * Converts a UTC datetime string to the local timezone and formats it.
 * @param utcString A UTC datetime string, e.g., "2025-12-03 04:54:08"
 * @param dateFormat The output format (date-fns format string, default is "yyyy-MM-dd HH:mm:ss")
 * @returns A string representing the datetime in the local timezone
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
