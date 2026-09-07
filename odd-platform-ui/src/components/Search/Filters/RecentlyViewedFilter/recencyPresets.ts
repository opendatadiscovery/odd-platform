import { endOfDay, startOfDay, subDays } from 'date-fns';
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';
import type { SearchRecentlyViewedScope } from 'lib/search/searchUrlState';

/**
 * The Last-viewed facet's quick windows (ST-10 / #1844).
 *
 * The user picks CALENDAR DAYS; the URL carries INSTANTS. A preset resolves to a concrete instant at the moment it
 * is clicked and the chip then shows the resolved dates — the freeze is visible, so a shared or saved search always
 * reproduces the same result set. (A relative form, re-evaluated on every open, is a separate additive parameter
 * and deliberately not built here.)
 *
 * `timeZone` is a parameter rather than an implicit `new Date()` so this is testable in a fixed zone: in production
 * the caller passes the browser's own, which is what makes "today" mean the user's today.
 */
export type RecencyPresetKind = 'today' | '7d' | '30d';

/** How many days back each preset reaches, INCLUDING today — "last 7 days" is today plus the six before it. */
const DAYS_BACK: Record<RecencyPresetKind, number> = {
  today: 0,
  '7d': 6,
  '30d': 29,
};

/**
 * A preset window as a lower bound only: everything from the start of that local day onwards. There is no upper
 * bound because "since then" is what the user means — capping it at "now" would exclude an asset opened seconds
 * later while they read the results.
 */
export function presetWindow(
  kind: RecencyPresetKind,
  now: Date,
  timeZone: string
): SearchRecentlyViewedScope {
  const localNow = utcToZonedTime(now, timeZone);
  const localMidnight = startOfDay(subDays(localNow, DAYS_BACK[kind]));
  return { viewedAfter: zonedTimeToUtc(localMidnight, timeZone).toISOString() };
}

/**
 * The window a two-date calendar selection means: the whole of the first day through the whole of the last, in the
 * user's own zone. `startOfDay` / `endOfDay` run on the picker's local Date objects, exactly as the shipped Period
 * filter does, so the instants match what the user believes they picked.
 */
export function windowFromPicker(begin: Date, end: Date): SearchRecentlyViewedScope {
  return {
    viewedAfter: startOfDay(begin).toISOString(),
    viewedBefore: endOfDay(end).toISOString(),
  };
}
