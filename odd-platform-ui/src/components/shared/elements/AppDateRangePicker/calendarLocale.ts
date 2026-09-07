/**
 * The calendar's month and weekday names in the user's language.
 *
 * `react-multi-date-picker` defaults to `gregorian_en`, so every ODD locale has been reading an ENGLISH calendar —
 * on the Activity and Alerts Period filters today, and on the Last-viewed search facet from ST-10 (#1844). The
 * library ships locale objects for `en / ar / fa / hi` (+ `pt_br`) only, which covers one of ODD's seven, and
 * `react-date-object` is a transitive dependency, so importing its files would mean adding a dependency to reach
 * five languages we still would not have. Building the object from `Intl` instead covers all seven with no new
 * dependency, and fixes the two shipped surfaces along with the new one.
 *
 * The object's shape is plain data, read from the library's own `gregorian_en`:
 * `{name, months: [[full, short] x 12], weekDays: [[full, short] x 7], digits, meridiems}`.
 */

/**
 * ODD's locale catalogs are keyed by the file names in `locales/translations/`, and THREE of those are not valid
 * BCP-47 language tags. Passing `i18n.language` straight to `Intl` is therefore silently wrong:
 *
 *   `br` -> Breton (the catalog is Brazilian PORTUGUESE)
 *   `ch` -> no such tag, falls back to en-US (the catalog is CHINESE)
 *   `ua` -> a COUNTRY code, falls back to en-US (the catalog is UKRAINIAN)
 *
 * Verified 2026-09-06 by formatting January in each: the bare `br` tag yields "Genver". Hence this map.
 */
export const BCP47: Record<string, string> = {
  en: 'en',
  es: 'es',
  fr: 'fr',
  hy: 'hy',
  br: 'pt-BR',
  ch: 'zh-CN',
  ua: 'uk',
};

/**
 * ODD's catalog key as a tag `Intl` actually understands. Exported because the calendar is not the only place a
 * DATE is rendered next to translated text: ST-10's Last-viewed chip names the window's resolved dates right under
 * this control, and formatting those through the app's shared date hook renders them in en-US on every locale
 * (`date-fns` defaults to en-US and `useAppDateTime` passes no `locale`), so a Ukrainian rail would read
 * "Останній перегляд: від 1 Sep 2026" beside a Ukrainian calendar. That app-wide gap is tracked upstream; this
 * export is what lets a surface be right today.
 */
export const bcp47 = (catalogKey: string): string => BCP47[catalogKey] ?? 'en';

/** The structural shape the picker's `locale` prop needs; declared locally so no transitive import is added. */
export interface CalendarLocale {
  name: string;
  months: [string, string][];
  weekDays: [string, string][];
  digits: string[];
  meridiems: [string, string][];
}

export function calendarLocale(catalogKey: string): CalendarLocale {
  const lang = bcp47(catalogKey);
  // `timeZone: 'UTC'` is LOAD-BEARING, not tidiness: a UTC instant formatted in the browser's own zone can fall on
  // the previous day, so a naive version returns "December" for January west of Greenwich. Pinning the zone and
  // using mid-month / midday reference dates makes the output identical in every timezone.
  const opts = { timeZone: 'UTC' } as const;
  const monthLong = new Intl.DateTimeFormat(lang, { month: 'long', ...opts });
  const monthShort = new Intl.DateTimeFormat(lang, { month: 'short', ...opts });
  const dayLong = new Intl.DateTimeFormat(lang, { weekday: 'long', ...opts });
  const dayShort = new Intl.DateTimeFormat(lang, { weekday: 'short', ...opts });
  const month = (i: number) => new Date(Date.UTC(2021, i, 15, 12));
  // WEEKDAYS START AT SATURDAY in this library's convention (its shipped gregorian_en lists Saturday first), and
  // 2021-01-02 was a Saturday. Getting this wrong shifts every column header by one day — the calendar still
  // renders and still looks plausible, so only the dedicated test catches it.
  const day = (i: number) => new Date(Date.UTC(2021, 0, 2 + i, 12));

  return {
    name: `gregorian_${lang}`,
    months: Array.from({ length: 12 }, (_, i) => [
      monthLong.format(month(i)),
      monthShort.format(month(i)),
    ]) as [string, string][],
    weekDays: Array.from({ length: 7 }, (_, i) => [
      dayLong.format(day(i)),
      dayShort.format(day(i)),
    ]) as [string, string][],
    digits: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    meridiems: [
      ['AM', 'am'],
      ['PM', 'pm'],
    ],
  };
}
