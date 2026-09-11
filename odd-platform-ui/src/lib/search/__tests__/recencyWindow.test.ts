import { describe, expect, it } from 'vitest';
import {
  presetWindow,
  recencyPresetFromToken,
  resolveRecencyWindow,
  windowFromPicker,
} from '../recencyWindow';

/**
 * ST-10 (#1844) — the local-days-in / exact-instants-out rule; CTRIB-070 — and the rule that the resolution
 * happens at QUERY time, so the window keeps moving.
 *
 * The maintainer's own note on the issue: "a 'viewed since yesterday' filter that's off by a timezone reads as
 * broken, and it's cheap to pin with one test now." The zone is a parameter precisely so the assertions do not
 * depend on the machine running them; `now` is one too, which is what lets the day actually turn over below.
 */
describe('recencyWindow (ST-10 / #1844, living windows CTRIB-070)', () => {
  // A fixed instant: 2026-09-07T08:00:00Z. In Kiritimati (UTC+14) that is already the 7th at 22:00; in
  // Los Angeles (UTC-7) it is still the 7th at 01:00; both agree on the date here, which is what makes the
  // DIFFERENT midnights below the interesting part.
  const now = new Date('2026-09-07T08:00:00.000Z');
  const resolve = (kind: 'today' | '7d' | '30d', at: Date, zone: string) =>
    resolveRecencyWindow(presetWindow(kind), at, zone);

  it('stores a preset as the WORD, reading no clock at all', () => {
    // The whole fix in one assertion: a click records what was asked for, not what it happened to mean then.
    expect(presetWindow('today')).toEqual({ within: 'today' });
    expect(presetWindow('7d')).toEqual({ within: '7d' });
    expect(presetWindow('30d')).toEqual({ within: '30d' });
  });

  it('resolves "today" to the start of the user\'s local day, expressed as a UTC instant', () => {
    // UTC+14: local midnight on the 7th is 2026-09-06T10:00Z — the previous UTC day.
    expect(resolve('today', now, 'Pacific/Kiritimati')).toEqual({
      viewedAfter: '2026-09-06T10:00:00.000Z',
    });
    // UTC: local midnight is the same instant as UTC midnight.
    expect(resolve('today', now, 'UTC')).toEqual({
      viewedAfter: '2026-09-07T00:00:00.000Z',
    });
    // UTC-7: local midnight on the 7th is 07:00Z the same day.
    expect(resolve('today', now, 'America/Los_Angeles')).toEqual({
      viewedAfter: '2026-09-07T07:00:00.000Z',
    });
  });

  it('counts "last 7 days" INCLUSIVE of today — seven local days, not seven days ago', () => {
    // 7 days back from the 7th, including the 7th, starts on the 1st.
    expect(resolve('7d', now, 'UTC')).toEqual({
      viewedAfter: '2026-09-01T00:00:00.000Z',
    });
    // 30 days likewise starts on 9 Aug, not 8 Aug.
    expect(resolve('30d', now, 'UTC')).toEqual({
      viewedAfter: '2026-08-09T00:00:00.000Z',
    });
  });

  it('leaves the upper end OPEN — a preset is "since then", never "until now"', () => {
    // Capping at `now` would exclude an asset opened while the user reads the results.
    expect(resolve('today', now, 'UTC')?.viewedBefore).toBeUndefined();
  });

  /**
   * THE case this module exists for. One stored scope, two days, two answers — which is exactly what a saved
   * search called "Today" has to do and what the shipped code could not, because the preset had already been
   * flattened into an instant before anything was stored.
   */
  it('resolves the SAME stored window to a different day tomorrow — the window keeps moving', () => {
    const saved = presetWindow('today');
    const tomorrow = new Date('2026-09-08T08:00:00.000Z');
    expect(resolveRecencyWindow(saved, now, 'UTC')).toEqual({
      viewedAfter: '2026-09-07T00:00:00.000Z',
    });
    expect(resolveRecencyWindow(saved, tomorrow, 'UTC')).toEqual({
      viewedAfter: '2026-09-08T00:00:00.000Z',
    });
    // And the stored thing never changed: it is the word, not either of those instants.
    expect(saved).toEqual({ within: 'today' });
  });

  it('a declared window SUPERSEDES any bounds it arrives with, and everything else passes through', () => {
    expect(
      resolveRecencyWindow(
        { within: '7d', viewedAfter: '2020-01-01T00:00:00.000Z' },
        now,
        'UTC'
      )
    ).toEqual({ viewedAfter: '2026-09-01T00:00:00.000Z' });
    // An absolute window is returned as it is — a hand-picked range must never drift.
    const absolute = {
      viewedAfter: '2026-09-01T00:00:00.000Z',
      viewedBefore: '2026-09-03T23:59:59.999Z',
    };
    expect(resolveRecencyWindow(absolute, now, 'UTC')).toEqual(absolute);
    // `{}` is a REAL state ("any time") and must survive as itself, never collapse to undefined.
    expect(resolveRecencyWindow({}, now, 'UTC')).toEqual({});
    expect(resolveRecencyWindow(undefined, now, 'UTC')).toBeUndefined();
  });

  it('reads the wire tokens case-insensitively and drops anything else', () => {
    expect(recencyPresetFromToken('TODAY')).toBe('today');
    expect(recencyPresetFromToken('last_7_days')).toBe('7d');
    expect(recencyPresetFromToken('  Last_30_Days  ')).toBe('30d');
    // Unrecognised degrades to undefined — the `sort` / `my_data` posture: lose the word, never the request.
    expect(recencyPresetFromToken('LAST_90_DAYS')).toBeUndefined();
    expect(recencyPresetFromToken('')).toBeUndefined();
    expect(recencyPresetFromToken(7)).toBeUndefined();
    expect(recencyPresetFromToken(undefined)).toBeUndefined();
  });

  it('a picker selection covers the WHOLE of both local days, and stays absolute', () => {
    // The picker hands back local Date objects; the window must run from the first day's 00:00:00.000 to the last
    // day's 23:59:59.999, or an asset opened in the afternoon of the end day falls outside the range the user drew.
    const begin = new Date(2026, 8, 1, 15, 30);
    const end = new Date(2026, 8, 3, 9, 15);
    const window = windowFromPicker(begin, end);
    expect(window.within).toBeUndefined();
    expect(new Date(window.viewedAfter!).getTime()).toBe(
      new Date(2026, 8, 1, 0, 0, 0, 0).getTime()
    );
    expect(new Date(window.viewedBefore!).getTime()).toBe(
      new Date(2026, 8, 3, 23, 59, 59, 999).getTime()
    );
  });
});
