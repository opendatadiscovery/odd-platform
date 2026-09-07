import React from 'react';
import { endOfDay, startOfDay, subDays } from 'date-fns';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  buildSearchLink,
  useAppDateTime,
  useRecentlyViewedHistoryEmpty,
} from 'lib/hooks';
import { useAppInfo } from 'lib/hooks/api';
import {
  paramsToSearchState,
  type SearchRecentlyViewedScope,
} from 'lib/search/searchUrlState';
import AppDateRangePicker from 'components/shared/elements/AppDateRangePicker/AppDateRangePicker';
import RangeFacetShell from '../FilterItem/RangeFacetShell/RangeFacetShell';
import { presetWindow, windowFromPicker } from './recencyPresets';

/**
 * ST-10 (#1844) — the **Last viewed** scope (ADR unified-asset-search D3): narrows the catalog search to the assets
 * THIS user has opened, optionally within a date window.
 *
 * It is named for the DIMENSION, not the feature: the feature stays "Recently Viewed" (the home panel, the row
 * marker), while the facet heading is "Last viewed" because a range has a before-shape and "Recently viewed: before
 * 1 Sep" contradicts itself. The Popular tile / Popularity facet split is the same idea.
 *
 * CROSS-KIND, and no qualifier says otherwise: an asset missing from your history is one you genuinely have not
 * opened, whatever its kind — unlike Popularity, where terms and query examples are merely UNCOUNTED and so are
 * excluded outright. The qualifier here says whose views these are, which "Last viewed" alone does not.
 *
 * The body is the platform's ONE date-range control (the Activity/Alerts Period picker), not a slider: a date is
 * picked, not slid, and a 90-day retention window would be ninety stops on a 200px rail. Its own footer presets are
 * hidden here (`ranges={[]}`) because the rail carries them where the other facets keep theirs.
 *
 * Under `auth.type=DISABLED` there is no principal, so the history is one shared instance-wide bucket — exactly what
 * the home panel already shows as "Recently Viewed (shared)". The filter therefore WORKS there, labelled, with the
 * consequence spelled out; returning empty would contradict the panel this facet's own "View all" links from.
 *
 * The scope rides the URL-only `viewed_after` / `viewed_before` / `recently_viewed` params, written through the
 * canonical serialiser so a control-written URL is byte-identical to the mirror's. Cleared by the single Clear All.
 */
const RecentlyViewedFilter: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: appInfo } = useAppInfo();
  const { dataEntityFormattedDateTime } = useAppDateTime();
  const history = useRecentlyViewedHistoryEmpty();

  const isShared = appInfo?.authType === 'DISABLED';
  const scope = React.useMemo(
    () => paramsToSearchState(location.search).recentlyViewed,
    [location.search]
  );
  const { viewedAfter, viewedBefore } = scope ?? {};

  /**
   * The window the calendar SHOWS. Bounds set -> exactly them; otherwise a visible last-week window that is NOT
   * applied as a filter (the shipped Period-filter precedent) — the chip is what states the filter, and with no
   * bounds it reads "any time".
   *
   * ORDERED, and that is not defensive tidying: the picker takes whatever it is given as its value and its Done
   * button commits unconditionally, so an inverted seed would commit an inverted window, which the URL rule then
   * drops entirely — open a shared "before X" link, press Done, and the filter silently vanishes. Two shapes invert
   * if left alone: a `viewed_before` older than a week, and a hand-written future `viewed_after`.
   */
  const defaultRange = React.useMemo(() => {
    const end = viewedBefore ? new Date(viewedBefore) : endOfDay(new Date());
    const begin = viewedAfter ? new Date(viewedAfter) : startOfDay(subDays(end, 6));
    return begin <= end
      ? { beginDate: begin, endDate: end }
      : { beginDate: end, endDate: begin };
  }, [viewedAfter, viewedBefore]);

  const commit = React.useCallback(
    (next: SearchRecentlyViewedScope | undefined) => {
      // Re-read the LIVE URL rather than closing over parsed state, so every other dimension is preserved and only
      // this one changes (the sibling filters' pattern). Clearing the scope also clears a now-meaningless
      // `sort=last_viewed`: the server drops that token without the scope, so leaving it would show an ordering the
      // list does not have.
      const live = paramsToSearchState(location.search);
      navigate(
        buildSearchLink({
          ...live,
          recentlyViewed: next,
          sort: next ? live.sort : live.sort === 'last_viewed' ? undefined : live.sort,
        })
      );
    },
    [location.search, navigate]
  );

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const chipText = React.useMemo(() => {
    if (!scope) return '';
    const from = viewedAfter && dataEntityFormattedDateTime(new Date(viewedAfter));
    const to = viewedBefore && dataEntityFormattedDateTime(new Date(viewedBefore));
    if (from && to) return t('Last viewed: {{from}} - {{to}}', { from, to });
    if (from) return t('Last viewed: since {{from}}', { from });
    if (to) return t('Last viewed: before {{to}}', { to });
    return t('Last viewed: any time');
  }, [scope, viewedAfter, viewedBefore, dataEntityFormattedDateTime, t]);

  const isEmptyHistory = history === 'empty';

  return (
    <RangeFacetShell
      name={isShared ? t('Last viewed (shared)') : t('Last viewed')}
      filterId='recently_viewed'
      qualifier={isShared ? t('Assets anyone has opened') : t('Assets you have opened')}
      help={
        isShared
          ? t(
              "Authentication is disabled, so the viewing history is shared by everyone on this instance. Don't use disabled auth in production."
            )
          : t(
              "Narrows to assets you have opened. Dates are your local calendar days; a shared link carries the exact moments, which another time zone may show as different days. History is kept only as long as this deployment's retention settings allow."
            )
      }
      chipText={chipText}
      onClear={() => commit(undefined)}
      disabledReason={
        isEmptyHistory ? t("You haven't opened any assets yet.") : undefined
      }
      presets={
        isEmptyHistory
          ? undefined
          : [
              {
                label: t('Today'),
                onSelect: () => commit(presetWindow('today', new Date(), timeZone)),
              },
              {
                label: t('Last 7 days'),
                onSelect: () => commit(presetWindow('7d', new Date(), timeZone)),
              },
              {
                label: t('Last 30 days'),
                onSelect: () => commit(presetWindow('30d', new Date(), timeZone)),
              },
              { label: t('Any time'), onSelect: () => commit({}) },
            ]
      }
    >
      {isEmptyHistory ? null : (
        <AppDateRangePicker
          label={t('Custom range')}
          ranges={[]}
          defaultRange={defaultRange}
          setCurrentRange={(begin, end) => commit(windowFromPicker(begin, end))}
        />
      )}
    </RangeFacetShell>
  );
};

export default RecentlyViewedFilter;
