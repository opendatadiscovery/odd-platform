import { endOfDay, startOfDay, subDays } from 'date-fns';
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';

/**
 * The Last-viewed window vocabulary (ST-10 / #1844; the relative form, CTRIB-070).
 *
 * The user picks CALENDAR DAYS; the wire carries INSTANTS. The two are bridged here, and — this is the whole
 * point of the module — **at the moment of the query, never at the moment of the click**. A preset is carried as
 * the word the user chose (`{ within: 'today' }`), so a saved search or a shared link that says "today" means
 * the day it is OPENED. Resolving at click time is what made a saved "Today" quietly age into one specific past
 * date, which is the confusion this replaces.
 *
 * A hand-picked calendar range is the opposite and stays absolute: "3-9 September" is a statement about those
 * days, and {@link windowFromPicker} freezes it as two instants.
 *
 * Resolution takes `now` + `timeZone` as parameters rather than reading the clock itself — partly so it is
 * testable in a fixed zone, and mostly because only the client knows which calendar the reader is on. In
 * production the caller passes the browser's own, which is what makes "today" mean the user's today.
 *
 * This module owns the scope TYPE as well as the math, so `searchUrlState` (which re-exports the type under its
 * long-standing name) can use these functions without an import cycle.
 */
export type RecencyPresetKind = 'today' | '7d' | '30d';

/**
 * A recency scope. An object with NO window is a real, meaningful state — "every asset in my history" — which is
 * why the field's PRESENCE is the switch and `{}` is never collapsed to `undefined` (the opposite of a
 * popularity range, where no bounds means no filter at all).
 *
 * `within` and the two instants are two spellings of a window, not two windows: `within` is the LIVING one and
 * supersedes the bounds wherever both somehow appear.
 */
export interface SearchRecentlyViewedScope {
  viewedAfter?: string;
  viewedBefore?: string;
  within?: RecencyPresetKind;
}

/** The tokens as they ride the URL and the stored spec — the wire spelling of {@link RecencyPresetKind}. */
export const RECENCY_PRESET_TOKENS: Record<RecencyPresetKind, string> = {
  today: 'TODAY',
  '7d': 'LAST_7_DAYS',
  '30d': 'LAST_30_DAYS',
};

const RECENCY_PRESET_KINDS = Object.keys(RECENCY_PRESET_TOKENS) as RecencyPresetKind[];

/**
 * Read a wire token back to its kind, case-insensitively. Returns `undefined` for anything unrecognised, which
 * is the graceful-degradation posture `sort` and `my_data` already have: a stale or hand-edited URL loses the
 * living window and falls back to whatever bounds it carries — never a failed request.
 */
export function recencyPresetFromToken(raw: unknown): RecencyPresetKind | undefined {
  if (typeof raw !== 'string') return undefined;
  const upper = raw.trim().toUpperCase();
  return RECENCY_PRESET_KINDS.find(kind => RECENCY_PRESET_TOKENS[kind] === upper);
}

/** How many days back each preset reaches, INCLUDING today — "last 7 days" is today plus the six before it. */
const DAYS_BACK: Record<RecencyPresetKind, number> = {
  today: 0,
  '7d': 6,
  '30d': 29,
};

/**
 * What a preset click means: the WORD, not a date. Nothing here reads the clock, because the window this
 * declares is not resolved until something asks for it.
 */
export function presetWindow(kind: RecencyPresetKind): SearchRecentlyViewedScope {
  return { within: kind };
}

/**
 * The window a two-date calendar selection means: the whole of the first day through the whole of the last, in
 * the user's own zone. `startOfDay` / `endOfDay` run on the picker's local Date objects, exactly as the shipped
 * Period filter does, so the instants match what the user believes they picked. Absolute by design.
 */
export function windowFromPicker(begin: Date, end: Date): SearchRecentlyViewedScope {
  return {
    viewedAfter: startOfDay(begin).toISOString(),
    viewedBefore: endOfDay(end).toISOString(),
  };
}

/**
 * A preset as a lower bound only: everything from the start of that local day onwards. There is no upper bound
 * because "since then" is what the user means — capping it at "now" would exclude an asset opened seconds later
 * while they read the results.
 */
export function presetBounds(
  kind: RecencyPresetKind,
  now: Date,
  timeZone: string
): { viewedAfter: string } {
  const localNow = utcToZonedTime(now, timeZone);
  const localMidnight = startOfDay(subDays(localNow, DAYS_BACK[kind]));
  return { viewedAfter: zonedTimeToUtc(localMidnight, timeZone).toISOString() };
}

/**
 * Resolve a scope to the instants the API narrows by. A declared window supersedes any bounds that came with it,
 * and everything else passes through untouched — including `{}`, which is a real state ("any time") and must
 * never become `undefined`.
 *
 * Call this at the wire boundary, not when the user clicks: the answer is only true for the instant it is asked.
 */
export function resolveRecencyWindow(
  scope: SearchRecentlyViewedScope | undefined,
  now: Date,
  timeZone: string
): SearchRecentlyViewedScope | undefined {
  if (!scope || !scope.within) return scope;
  return presetBounds(scope.within, now, timeZone);
}

/** The reader's own zone, with a defined fallback — the argument every resolve call needs in production. */
export function browserTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
}
