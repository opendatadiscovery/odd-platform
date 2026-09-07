import { describe, expect, it } from 'vitest';
import { presetWindow, windowFromPicker } from '../recencyPresets';

/**
 * ST-10 (#1844) — the local-days-in / exact-instants-out rule.
 *
 * The maintainer's own note on the issue: "a 'viewed since yesterday' filter that's off by a timezone reads as
 * broken, and it's cheap to pin with one test now." This is that test. The zone is a parameter precisely so the
 * assertions do not depend on the machine running them.
 */
describe('recencyPresets (ST-10 / #1844)', () => {
  // A fixed instant: 2026-09-07T08:00:00Z. In Kiritimati (UTC+14) that is already the 7th at 22:00; in
  // Los Angeles (UTC-7) it is still the 7th at 01:00; both agree on the date here, which is what makes the
  // DIFFERENT midnights below the interesting part.
  const now = new Date('2026-09-07T08:00:00.000Z');

  it('resolves "today" to the start of the user\'s local day, expressed as a UTC instant', () => {
    // UTC+14: local midnight on the 7th is 2026-09-06T10:00Z — the previous UTC day.
    expect(presetWindow('today', now, 'Pacific/Kiritimati')).toEqual({
      viewedAfter: '2026-09-06T10:00:00.000Z',
    });
    // UTC: local midnight is the same instant as UTC midnight.
    expect(presetWindow('today', now, 'UTC')).toEqual({
      viewedAfter: '2026-09-07T00:00:00.000Z',
    });
    // UTC-7: local midnight on the 7th is 07:00Z the same day.
    expect(presetWindow('today', now, 'America/Los_Angeles')).toEqual({
      viewedAfter: '2026-09-07T07:00:00.000Z',
    });
  });

  it('counts "last 7 days" INCLUSIVE of today — seven local days, not seven days ago', () => {
    // 7 days back from the 7th, including the 7th, starts on the 1st.
    expect(presetWindow('7d', now, 'UTC')).toEqual({
      viewedAfter: '2026-09-01T00:00:00.000Z',
    });
    // 30 days likewise starts on 9 Aug, not 8 Aug.
    expect(presetWindow('30d', now, 'UTC')).toEqual({
      viewedAfter: '2026-08-09T00:00:00.000Z',
    });
  });

  it('leaves the upper end OPEN — a preset is "since then", never "until now"', () => {
    // Capping at `now` would exclude an asset opened while the user reads the results.
    expect(presetWindow('today', now, 'UTC').viewedBefore).toBeUndefined();
  });

  it('a picker selection covers the WHOLE of both local days', () => {
    // The picker hands back local Date objects; the window must run from the first day's 00:00:00.000 to the last
    // day's 23:59:59.999, or an asset opened in the afternoon of the end day falls outside the range the user drew.
    const begin = new Date(2026, 8, 1, 15, 30);
    const end = new Date(2026, 8, 3, 9, 15);
    const window = windowFromPicker(begin, end);
    expect(new Date(window.viewedAfter!).getTime()).toBe(
      new Date(2026, 8, 1, 0, 0, 0, 0).getTime()
    );
    expect(new Date(window.viewedBefore!).getTime()).toBe(
      new Date(2026, 8, 3, 23, 59, 59, 999).getTime()
    );
  });
});
