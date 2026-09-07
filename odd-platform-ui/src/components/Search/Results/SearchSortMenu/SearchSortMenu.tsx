import React from 'react';
import { Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useQueryParams } from 'lib/hooks';
import { searchPath } from 'routes';
import AppSelect from 'components/shared/elements/AppSelect/AppSelect';
import AppMenuItem from 'components/shared/elements/AppMenuItem/AppMenuItem';
import {
  SEARCH_SORT_OPTIONS,
  paramsToSearchState,
  resolveActiveSort,
  type SearchSortValue,
} from 'lib/search/searchUrlState';

/**
 * ST-2b / #1836 — the GLOBAL sort control for the data-entity search results. A single-select dropdown of the four
 * named orderings the server-side `sort` contract ships (ST-2a). ADR D12 §1G: the global sort is a dropdown (the
 * per-column ▾ matrix is a later slice, ST-13). ADR D10: the URL is the source of truth — the control reads `?sort=`
 * and writes it via `useQueryParams`, which PRESERVES the active query + facet params through the spread (exactly like
 * `MainSearchInput` writes `q`); the Search page reader then re-queries server-side off the new URL. Sort is URL-only
 * (no redux): it has no optimistic-render need, so there is nothing to hold in the slice.
 */
const SearchSortMenu: React.FC = () => {
  const { t } = useTranslation();
  // useQueryParams parses with parseNumbers/parseBooleans, so `q`/`sort` can arrive as a number or boolean
  // (e.g. ?q=123 → 123, ?sort=2024 → 2024) — the generic reflects that reality, and resolveActiveSort coerces, so a
  // numeric/boolean query renders normally instead of throwing (review B1: a throw here white-screens the app).
  const { queryParams, setQueryParams } = useQueryParams<{
    q?: string | number | boolean;
    sort?: string | number | boolean;
  }>({});

  // ST-10 (#1844) — "Recently viewed" is meaningful ONLY while the recency scope is on: without it the caller's
  // history is not joined, so the server drops the token to the per-context default. Offering a dead option would
  // let the control claim an ordering the list does not have (the FE-contradicts-BE class). Read through the
  // canonical parser rather than useQueryParams so the ON rule is defined in exactly one place.
  const location = useLocation();
  const hasRecencyScope = React.useMemo(
    () => paramsToSearchState(location.search).recentlyViewed !== undefined,
    [location.search]
  );
  const options = React.useMemo(
    () =>
      SEARCH_SORT_OPTIONS.filter(
        option => option.value !== 'last_viewed' || hasRecencyScope
      ),
    [hasRecencyScope]
  );

  // The active ordering: the URL's `sort` when it is a known token, else the per-context default (fail-closed on
  // absent/garbage/non-string — R6, B1). The default MIRRORS the server so the control never misrepresents the order.
  const activeSort: SearchSortValue = resolveActiveSort(
    queryParams.sort,
    queryParams.q,
    hasRecencyScope
  );

  // Merge into the CURRENT params (spread) so choosing a sort PRESERVES the active query + facet params — never a
  // clobber (the `MainSearchInput` `q` precedent). PUSH a history entry so browser back/forward moves between sorts.
  const handleSortSelect = React.useCallback(
    (sort: SearchSortValue) => () => {
      setQueryParams(prev => ({ ...prev, sort }), { pathname: searchPath() });
    },
    [setQueryParams]
  );

  return (
    <Grid
      container
      justifyContent='flex-end'
      alignItems='center'
      wrap='nowrap'
      sx={{ mt: 2 }}
    >
      <Typography variant='body2' sx={{ mr: 1, whiteSpace: 'nowrap' }}>
        {t('Sort by')}
      </Typography>
      <AppSelect
        id='search-sort'
        dataQAId='search-sort-menu'
        fullWidth={false}
        value={activeSort}
        sx={{ minWidth: 200 }}
      >
        {options.map(({ value, labelKey }) => (
          <AppMenuItem key={value} value={value} onClick={handleSortSelect(value)}>
            {t(labelKey)}
          </AppMenuItem>
        ))}
      </AppSelect>
    </Grid>
  );
};

export default SearchSortMenu;
