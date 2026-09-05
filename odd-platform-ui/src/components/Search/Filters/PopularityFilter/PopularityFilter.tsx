import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { buildSearchLink } from 'lib/hooks';
import { usePopularityFacet } from 'lib/hooks/api';
import {
  paramsToSearchState,
  searchUrlStateToAssetSearchFormData,
  type SearchPopularityRange,
} from 'lib/search/searchUrlState';
import RangeFacetFilter, {
  type RangeFacetStop,
} from '../FilterItem/RangeFacetFilter/RangeFacetFilter';
import {
  POPULARITY_BANDS_FALLBACK,
  bandAriaText,
  bandLabel,
  rangeText,
} from './popularityBands';

/**
 * ST-9 (#1843) — the **Popularity** range facet (ADR unified-asset-search D5): the first numeric facet in the rail,
 * an instance of {@link RangeFacetFilter} over the 21 view-count bands of the snapshotted `popularity_score`.
 *
 * What the user sees is VIEWS, never the score: every stop, thumb label, chip and assistive text names the exact
 * boundary of a band (`15 – 30`, `1,023+`), taken from the server's facet response so the FE never re-derives the
 * band formula (the fallback table is locked against a captured response by a test). The rail spans only the bands
 * the current result set actually occupies (∪ the selection) — on a catalog whose busiest table has 30 views, 16 of
 * 21 stops would otherwise be dead — and it is DISABLED WITH ITS REASON when there is nothing to slide over: no data
 * entity matches the other filters (e.g. Asset type = Terms), every one is unviewed, or every one sits in a single
 * band. A FAILED facet request is different: the range predicate does not depend on it, so the control stays usable
 * over the full 21-band rail, just without bars.
 *
 * Data entities only: terms and query examples have no view count, so an active range excludes them — the qualifier
 * says so, and the inline help (ADR-0076) carries the sentence + the 15-minute snapshot disclosure. Popularity is
 * catalog-wide (no identity involved), so unlike the two personal scopes it never degrades under DISABLED auth.
 *
 * The selection rides the URL-only `popularity_min` / `popularity_max` params in scores, written through the
 * canonical serialiser (`buildSearchLink`) so the URL is byte-identical to the mirror's; a commit re-reads the LIVE
 * URL so every other dimension is preserved. Cleared by the single Clear All.
 */
const PopularityFilter: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const urlState = React.useMemo(
    () => paramsToSearchState(location.search),
    [location.search]
  );
  const selected = urlState.popularity;
  const formData = React.useMemo(
    () => searchUrlStateToAssetSearchFormData(urlState),
    [urlState]
  );
  const { data, isError } = usePopularityFacet(formData);

  const fmt = React.useCallback(
    (views: number) => views.toLocaleString(i18n.language),
    [i18n.language]
  );

  // The bands to reason over: the server's when they arrived; the fixed fallback (no counts) while loading or on error.
  const bands = data?.buckets ?? POPULARITY_BANDS_FALLBACK;
  const distributionKnown = Boolean(data);

  const { stops, disabledReason } = React.useMemo(() => {
    const nonEmpty = bands.filter(band => band.count > 0);
    const selectedScores = new Set<number>();
    if (selected?.min !== undefined) selectedScores.add(selected.min);
    if (selected?.max !== undefined) selectedScores.add(selected.max);

    // The rail: while the distribution is unknown (loading / failed) every band is a stop and the control is usable
    // without bars; once known, only the occupied bands plus the selected bounds.
    const railBands = distributionKnown
      ? bands.filter(band => band.count > 0 || selectedScores.has(band.score))
      : bands;
    const railStops: RangeFacetStop[] = railBands.map(band => ({
      value: band.score,
      label: bandLabel(band, fmt),
      ariaText: bandAriaText(band, t, fmt),
      count: distributionKnown ? band.count : undefined,
    }));

    let reason: string | undefined;
    if (distributionKnown && nonEmpty.length <= 1 && selectedScores.size === 0) {
      if (nonEmpty.length === 0) reason = t('No data entities match your other filters');
      else if (nonEmpty[0].score === 0) reason = t('No views recorded yet');
      else
        reason = t('All {{total}} data entities have {{band}} views', {
          total: fmt(nonEmpty[0].count),
          band: bandLabel(nonEmpty[0], fmt),
        });
    }
    return { stops: railStops, disabledReason: reason };
  }, [bands, distributionKnown, selected, fmt, t]);

  const chipText = React.useMemo(
    () =>
      selected
        ? t('Popularity: {{range}}', { range: rangeText(selected, bands, t, fmt) })
        : '',
    [selected, bands, t, fmt]
  );

  const handleCommit = React.useCallback(
    (range: SearchPopularityRange | undefined) => {
      // Re-read the LIVE URL rather than closing over parsed state: every other dimension is preserved and only this
      // one changes — the AssetTypeFilter / FavoritesFilter pattern.
      navigate(
        buildSearchLink({ ...paramsToSearchState(location.search), popularity: range })
      );
    },
    [location.search, navigate]
  );

  return (
    <RangeFacetFilter
      name={t('Popularity')}
      filterId='popularity'
      qualifier={t('Data entities only')}
      help={`${t(
        'Terms and query examples have no view count, so they are excluded while a Popularity range is active.'
      )} ${t(
        "Based on each data entity's view count, grouped into ranges and refreshed every 15 minutes."
      )}`}
      stops={stops}
      selected={selected}
      onCommit={handleCommit}
      chipText={chipText}
      presets={[{ label: t('Never viewed'), range: [0, 0] }]}
      disabledReason={isError ? undefined : disabledReason}
      barsLabel={t('Distribution of data entities by view count')}
      thumbLabels={[t('Minimum views'), t('Maximum views')]}
    />
  );
};

export default PopularityFilter;
