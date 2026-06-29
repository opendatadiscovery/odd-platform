import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import useAppDateTime from '../useAppDateTime';

/**
 * dateTimeWithTimezone (#1816 / CTRIB-043): the recency marker on a detail page records-on-open, so a
 * relative "x ago" is always ~"0 seconds ago" and resets on every refresh. This formatter renders the
 * absolute open time in the browser timezone with an EXPLICIT UTC offset (UTC fallback) so the value is
 * meaningful. The assertions are timezone-shape based, so they hold whatever timezone the runner is in.
 */
describe('useAppDateTime().dateTimeWithTimezone', () => {
  it('renders an absolute date-time with an explicit UTC offset, not a relative "ago"', () => {
    const { result } = renderHook(() => useAppDateTime());
    const out = result.current.dateTimeWithTimezone(new Date('2026-06-29T12:34:00Z'));

    expect(out, 'an explicit UTC offset is shown (e.g. "UTC+02:00")').toMatch(
      /UTC[+-]\d{2}:\d{2}/
    );
    expect(out, 'an absolute calendar value (the year), not a relative "x ago"').toContain(
      '2026'
    );
    expect(out).not.toMatch(/\bago\b/);
  });

  it('is stable for a fixed instant — it does not drift like the relative form', () => {
    const { result } = renderHook(() => useAppDateTime());
    const ts = new Date('2020-01-02T03:04:00Z');
    expect(result.current.dateTimeWithTimezone(ts)).toEqual(
      result.current.dateTimeWithTimezone(ts)
    );
  });
});
