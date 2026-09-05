import type { PopularityBucket } from 'generated-sources';
import type { TFunction } from 'i18next';

/**
 * ST-9 (#1843) — the 21 popularity bands, as the server defines them (`PopularityBands.java`): band `s` covers the
 * view counts `[2^s − 1, 2^(s+1) − 2]`, the top band (20) is open. The server's facet response carries every band's
 * boundaries; this table is the FALLBACK rail used only while that response is loading or if it failed, so the
 * control stays usable without bars. A vitest locks it against a captured server response, so the two can never
 * drift silently.
 */
export const POPULARITY_MAX_SCORE = 20;

export const POPULARITY_BANDS_FALLBACK: ReadonlyArray<PopularityBucket> = Array.from(
  { length: POPULARITY_MAX_SCORE + 1 },
  (_, score) => ({
    score,
    minViews: 2 ** score - 1,
    // the open top band has NO upper bound — the wire omits max_views there (never a sentinel)
    maxViews: score >= POPULARITY_MAX_SCORE ? undefined : 2 ** (score + 1) - 2,
    count: 0,
  })
);

export type FormatViews = (views: number) => string;

/** The thumb's value label for a band: `0`, `1 – 2`, `3 – 6`, …, `1,048,575+`. Exact boundaries, never rounded. */
export function bandLabel(band: PopularityBucket, fmt: FormatViews): string {
  if (band.maxViews == null) return `${fmt(band.minViews)}+`; // absent (or null) = the open top band
  if (band.minViews === band.maxViews) return fmt(band.minViews);
  return `${fmt(band.minViews)} – ${fmt(band.maxViews)}`;
}

/** What a screen reader speaks for a band — the label in views, or the teaching "Never viewed" for band 0. */
export function bandAriaText(
  band: PopularityBucket,
  t: TFunction,
  fmt: FormatViews
): string {
  if (band.score === 0) return t('Never viewed');
  if (band.maxViews == null) return t('{{min}}+ views', { min: fmt(band.minViews) });
  return t('{{min}} – {{max}} views', {
    min: fmt(band.minViews),
    max: fmt(band.maxViews),
  });
}

/**
 * The chip's range text for a selection in scores: `never viewed` ([0,0]) · `up to 6 views` (no lower bound) ·
 * `1,023+ views` (no upper bound) · `15 – 62 views`. The boundaries come from the bands, so the chip always names
 * exactly what the predicate applies.
 */
export function rangeText(
  range: { min?: number; max?: number },
  bands: ReadonlyArray<PopularityBucket>,
  t: TFunction,
  fmt: FormatViews
): string {
  const lo = bands.find(band => band.score === (range.min ?? 0));
  const hi = bands.find(band => band.score === (range.max ?? POPULARITY_MAX_SCORE));
  if (!lo || !hi) return '';
  if (range.min === undefined && range.max === undefined) return '';
  if ((range.min ?? 0) === 0 && range.max === 0) return t('Never viewed').toLowerCase();
  if (range.min === undefined || range.min === 0) {
    return hi.maxViews == null
      ? t('{{min}}+ views', { min: fmt(0) })
      : t('up to {{max}} views', { max: fmt(hi.maxViews) });
  }
  if (range.max === undefined || hi.maxViews == null) {
    return t('{{min}}+ views', { min: fmt(lo.minViews) });
  }
  return t('{{min}} – {{max}} views', { min: fmt(lo.minViews), max: fmt(hi.maxViews) });
}
