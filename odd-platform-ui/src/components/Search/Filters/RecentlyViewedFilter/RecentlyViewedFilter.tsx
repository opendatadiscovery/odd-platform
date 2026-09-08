import React from 'react';
import { endOfDay, startOfDay, subDays } from 'date-fns';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { buildSearchLink, useRecentlyViewedHistoryEmpty } from 'lib/hooks';
import { useAppInfo } from 'lib/hooks/api';
import {
  paramsToSearchState,
  type SearchRecentlyViewedScope,
} from 'lib/search/searchUrlState';
import AppDateRangePicker from 'components/shared/elements/AppDateRangePicker/AppDateRangePicker';
import { bcp47 } from 'components/shared/elements/AppDateRangePicker/calendarLocale';
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
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: appInfo } = useAppInfo();
  const history = useRecentlyViewedHistoryEmpty();

  const isShared = appInfo?.authType === 'DISABLED';
  const scope = React.useMemo(
    () => paramsToSearchState(location.search).recentlyViewed,
    [location.search]
  );
  const { viewedAfter, viewedBefore } = scope ?? {};

  /**
   * The window the calendar SHOWS — and ONLY when one is actually in force. With no bounds the input stays EMPTY
   * behind its placeholder, because a date box displaying "1 Sep ~ 7 Sep" while the chip says "any time" states a
   * filter the search is not applying, and the user has no way to tell which of the two is telling the truth.
   * (Found by reading the rendered pixels, not by a test: every assertion was green while the box lied.)
   *
   * ORDERED, and that is not defensive tidying: the picker takes whatever it is given as its value and its Done
   * button commits unconditionally, so an inverted seed would commit an inverted window, which the URL rule then
   * drops entirely — open a shared "before X" link, press Done, and the filter silently vanishes. Two shapes invert
   * if left alone: a `viewed_before` older than a week, and a hand-written future `viewed_after`.
   */
  const defaultRange = React.useMemo(() => {
    if (!viewedAfter && !viewedBefore) return undefined;
    // One bound set: the other end of the SHOWN range is the open side's natural edge — today for a missing
    // `before`, a week back for a missing `after` — so the calendar opens somewhere useful without inventing a
    // filter. The chip, not this, is what states what is applied.
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

  /**
   * The chip's dates, in the reader's LANGUAGE and their own TIMEZONE.
   *
   * Not the app's shared `useAppDateTime`: `date-fns` defaults to en-US and that hook passes no locale, so every
   * date it renders is English on every locale — which put "від 1 Sep 2026" on the chip directly beneath a
   * calendar that reads "1 вер." (seen in a `ua` screenshot, invisible to a key-parity sweep). `Intl` with the
   * catalog key mapped to a real tag is right for all seven, and deliberately does NOT pin a timezone: the whole
   * point of the window is that the instant is fixed and the DATE is the reader's own.
   */
  const formatBound = React.useMemo(() => {
    const fmt = new Intl.DateTimeFormat(bcp47(i18n.language), {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    return (iso: string) => fmt.format(new Date(iso));
  }, [i18n.language]);

  const chipText = React.useMemo(() => {
    if (!scope) return '';
    const from = viewedAfter && formatBound(viewedAfter);
    const to = viewedBefore && formatBound(viewedBefore);
    if (from && to) return t('Last viewed: {{from}} - {{to}}', { from, to });
    if (from) return t('Last viewed: since {{from}}', { from });
    if (to) return t('Last viewed: before {{to}}', { to });
    return t('Last viewed: any time');
  }, [scope, viewedAfter, viewedBefore, formatBound, t]);

  const isEmptyHistory = history === 'empty';

  return (
    <RangeFacetShell
      name={isShared ? t('Last viewed (shared)') : t('Last viewed')}
      filterId='recently_viewed'
      qualifier={isShared ? t('Assets anyone has opened') : t('Assets you have opened')}
      // ONE SHORT RECORD PER FACT. This was a single 235-character sentence that the tooltip rendered as one
      // unwrapped line straight across the results table. The width is fixed in AppTooltip now, but a wall of
      // prose in a filter rail is still the wrong shape: a reader wants three facts they can scan, not a
      // paragraph they have to parse while holding a dropdown open.
      help={
        isShared
          ? [
              t('Narrows to assets anyone on this instance has opened.'),
              t(
                'Authentication is disabled, so the viewing history is shared by everyone.'
              ),
              t("Don't use disabled auth in production."),
            ]
          : [
              t('Narrows to the assets you have opened.'),
              t(
                'You pick local calendar days; the link carries the exact moments, so another time zone may show them as different days.'
              ),
              t(
                "History is kept only as long as this deployment's retention settings allow."
              ),
            ]
      }
      // The four windows are what almost everyone wants; the calendar is the exception. Presets first.
      presetsPlacement='before'
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
          // No label: "Custom range" was a third stacked text line above the input, saying what the input's own
          // placeholder ("Pick two dates") already says. Three lines of chrome before any control is what makes
          // a filter rail feel heavy.
          label=''
          placeholder={t('Pick two dates')}
          // Sideways, not up: measured at 1280x720, a two-month calendar opening upward from this control (~350px
          // down the rail) overflows the viewport top and takes the month header and its arrows with it, so the
          // user cannot see or change the month. The rail has ~1000px to its right and nothing in it.
          calendarPosition='right-start'
          ranges={[]}
          defaultRange={defaultRange}
          setCurrentRange={(begin, end) => commit(windowFromPicker(begin, end))}
        />
      )}
    </RangeFacetShell>
  );
};

export default RecentlyViewedFilter;
