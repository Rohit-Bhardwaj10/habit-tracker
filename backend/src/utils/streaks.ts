/**
 * Compute currentStreak and longestStreak from a list of check-in local days.
 *
 * Accepts todayStr and yesterdayStr as parameters so this function is
 * completely pure (no system clock access) and trivially testable.
 *
 * @param localDays  - Array of "YYYY-MM-DD" strings (any order, may have dupes)
 * @param todayStr   - "YYYY-MM-DD" for today in the user's timezone
 * @param yesterdayStr - "YYYY-MM-DD" for yesterday in the user's timezone
 */
export function computeStreaks(
  localDays: string[],
  _todayStr: string,
  yesterdayStr: string
): { currentStreak: number; longestStreak: number } {
  if (localDays.length === 0) return { currentStreak: 0, longestStreak: 0 };

  // Deduplicate and sort ascending
  const days = [...new Set(localDays)].sort();
  const last = days[days.length - 1];

  // Current streak is dead if last check-in was before yesterday
  const currentStreak =
    last >= yesterdayStr ? countTrailingConsecutive(days) : 0;

  return {
    currentStreak,
    longestStreak: computeLongest(days),
  };
}

/** Walk backwards from the last element; count consecutive days. */
function countTrailingConsecutive(days: string[]): number {
  let count = 1;
  for (let i = days.length - 1; i > 0; i--) {
    if (daysBetween(days[i - 1], days[i]) === 1) {
      count++;
    } else {
      break;
    }
  }
  return count;
}

/** Find the longest consecutive run in the full history. */
function computeLongest(days: string[]): number {
  let longest = 1;
  let run = 1;
  for (let i = 1; i < days.length; i++) {
    if (daysBetween(days[i - 1], days[i]) === 1) {
      run++;
      if (run > longest) longest = run;
    } else {
      run = 1;
    }
  }
  return longest;
}

/**
 * Difference in whole calendar days between two "YYYY-MM-DD" strings.
 * Uses UTC midnight to avoid DST shifts during the diff itself.
 */
function daysBetween(earlier: string, later: string): number {
  const msPerDay = 86_400_000;
  return (
    (new Date(`${later}T00:00:00Z`).getTime() -
      new Date(`${earlier}T00:00:00Z`).getTime()) /
    msPerDay
  );
}
