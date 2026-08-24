import { parseISO } from 'date-fns';
import { format, toZonedTime } from 'date-fns-tz';

/**
 * Converts a UTC datetime string to the user's local timezone and formats it.
 *
 * For example, a UTC value such as "2025-12-04 04:27:32" may render as
 * "2025-12-04 13:27:32" in the JST timezone.
 *
 * @param utcString - UTC datetime string to convert. It may already include a trailing Z.
 * @param dateFormat - Optional date-fns format string used for the final output.
 * @returns The formatted local-time datetime string.
 */
export const formatToLocalTime = (utcString: string, dateFormat = 'yyyy-MM-dd HH:mm:ss') => {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const utcIsoString = utcString.endsWith('Z') ? utcString : `${utcString}Z`;
  const utcDate = parseISO(utcIsoString); // Convert the UTC string to a Date object
  const zonedDate = toZonedTime(utcDate, timeZone); // Convert to local timezone
  return format(zonedDate, dateFormat); // Format the date
};
