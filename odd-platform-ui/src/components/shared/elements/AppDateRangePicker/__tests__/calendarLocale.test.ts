import { describe, expect, it } from 'vitest';
import { calendarLocale } from '../calendarLocale';

/**
 * ST-10 (#1844) — the calendar's month and weekday names, in the user's language.
 *
 * Two failure modes this pins, both silent: the calendar renders and looks plausible either way.
 *  - ODD's catalog keys are NOT BCP-47 tags. `br` handed straight to Intl yields BRETON ("Genver") for a
 *    Brazilian-Portuguese catalog; `ch` and `ua` fall back to English.
 *  - A UTC instant formatted in the browser's zone can land on the previous day, so a naive implementation
 *    returns "December" for January west of Greenwich. The suite runs in whatever TZ the machine has, so the
 *    values below must be timezone-independent by construction.
 */
describe('calendarLocale (ST-10 / #1844)', () => {
  // Read from the library's own shipped gregorian_en — the object this replaces for non-English locales.
  const EN_MONTHS_LONG = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const EN_MONTHS_SHORT = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const EN_WEEKDAYS_LONG = [
    'Saturday',
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
  ];

  it("reproduces the library's shipped gregorian_en exactly, including the Saturday-first weekday order", () => {
    const en = calendarLocale('en');
    expect(en.months.map(m => m[0])).toEqual(EN_MONTHS_LONG);
    expect(en.months.map(m => m[1])).toEqual(EN_MONTHS_SHORT);
    // Saturday first is the library's convention, not ours. Off by one here shifts every column header.
    expect(en.weekDays.map(d => d[0])).toEqual(EN_WEEKDAYS_LONG);
    expect(en.digits).toHaveLength(10);
    expect(en.meridiems).toEqual([
      ['AM', 'am'],
      ['PM', 'pm'],
    ]);
  });

  it('maps the three catalog keys that are not language tags — br is Portuguese, NOT Breton', () => {
    // The whole reason the map exists: `br` is Brazilian Portuguese in ODD, but a valid tag for BRETON.
    expect(calendarLocale('br').months[0][0]).toBe('janeiro');
    expect(calendarLocale('br').months[0][0]).not.toBe('Genver');
    // `ch` and `ua` are not language tags at all and silently fall back to English without the map.
    expect(calendarLocale('ch').months[0][0]).not.toBe('January');
    expect(calendarLocale('ua').months[0][0]).toBe('січень');
    // `hy` IS a valid tag and needs no mapping.
    expect(calendarLocale('hy').months[0][0]).toBe('հունվար');
  });

  it('falls back to English for an unknown catalog key, never throwing', () => {
    expect(() => calendarLocale('zz')).not.toThrow();
    expect(calendarLocale('zz').months[0][0]).toBe('January');
  });

  it('is timezone-independent: the month names do not shift with the machine clock', () => {
    // Reference dates are mid-month/midday and the formatters are pinned to UTC, so no offset can move them.
    // (A naive implementation using Date.UTC(y, m, 1) formatted in the local zone fails this west of Greenwich.)
    const months = calendarLocale('en').months.map(m => m[0]);
    expect(months[0]).toBe('January');
    expect(months[11]).toBe('December');
    expect(new Set(months).size).toBe(12);
  });
});
