import { DateTime } from "luxon";

/**
 * Convert any UTC Date to a "YYYY-MM-DD" calendar date string
 * in the given IANA timezone.
 *
 * This is THE authoritative local-day computation. All check-in
 * validation and streak math calls this or functions derived from it.
 */
export function toLocalDay(utcInstant: Date, ianaTimezone: string): string {
  return DateTime.fromJSDate(utcInstant, { zone: ianaTimezone }).toISODate()!;
}

/** Today's calendar date in a given IANA timezone. */
export function todayInZone(ianaTimezone: string): string {
  return DateTime.now().setZone(ianaTimezone).toISODate()!;
}

/** Yesterday's calendar date in a given IANA timezone. */
export function yesterdayInZone(ianaTimezone: string): string {
  return DateTime.now().setZone(ianaTimezone).minus({ days: 1 }).toISODate()!;
}

/** Returns true if the given localDay string is in the user's local future. */
export function isInLocalFuture(localDay: string, ianaTimezone: string): boolean {
  return localDay > todayInZone(ianaTimezone);
}

/** Returns true if localDay is before the day the habit was created. */
export function isBeforeHabitCreation(
  localDay: string,
  habitCreatedAt: Date,
  ianaTimezone: string
): boolean {
  return localDay < toLocalDay(habitCreatedAt, ianaTimezone);
}

/** Validate that a string is a valid IANA timezone identifier. */
export function isValidIANATimezone(tz: string): boolean {
  return DateTime.now().setZone(tz).isValid;
}
