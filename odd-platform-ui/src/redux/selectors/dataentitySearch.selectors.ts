import { createSelector } from '@reduxjs/toolkit';
import findKey from 'lodash/findKey';
import omit from 'lodash/omit';
import values from 'lodash/values';
import mapValues from 'lodash/mapValues';
import pickBy from 'lodash/pickBy';
import transform from 'lodash/transform';
import compact from 'lodash/compact';
import type {
  CurrentPageInfo,
  DataEntitySearchState,
  OptionalFacetNames,
  RootState,
  SearchClass,
  SearchFacetStateById,
  SearchFilterStateSynced,
} from 'redux/interfaces';
import type {
  DataEntityClassNameEnum,
  DataEntitySearchHighlight,
} from 'generated-sources';
import {
  createErrorSelector,
  createStatusesSelector,
} from 'redux/selectors/loader-selectors';
import * as actions from 'redux/actions';
import { emptyArr } from 'lib/constants';
import {
  SEARCH_FACET_PARAMS,
  type SearchUrlFacets,
  type SearchUrlState,
} from 'lib/search/searchUrlState';

const searchState = ({ dataEntitySearch }: RootState): DataEntitySearchState =>
  dataEntitySearch;

export const getSearchCreatingStatuses = createStatusesSelector(
  actions.createDataEntitySearchActionType
);

export const getSearchFetchStatuses = createStatusesSelector(
  actions.getDataEntitySearchActionType
);

export const getSearchUpdateStatuses = createStatusesSelector(
  actions.updateDataEntitySearchActionType
);

export const getSearchResultsFetchStatuses = createStatusesSelector(
  actions.fetchDataEntitySearchResultsActionType
);

export const getSearchSuggestionsFetchingStatuses = createStatusesSelector(
  actions.fetchDataEntitySearchSuggestionsActionType
);

export const getDataEntitySearchHighlightsFetchingStatuses = createStatusesSelector(
  actions.fetchDataEntitySearchHighlightsActionType
);

export const getSearchResultsError = createErrorSelector(
  actions.fetchDataEntitySearchResultsActionType
);

export const getSearchError = createErrorSelector(actions.getDataEntitySearchActionType);

export const getSearchFacetsSynced = createSelector(
  searchState,
  search => search.isFacetsStateSynced
);

export const getSearchIsFetching = createSelector(
  getSearchCreatingStatuses,
  getSearchFetchStatuses,
  getSearchUpdateStatuses,
  getSearchResultsFetchStatuses,
  getSearchFacetsSynced,
  (
    { isLoading: isSearchCreating },
    { isLoading: isSearchFetching },
    { isLoading: isSearchUpdating },
    { isLoading: isSearchResultsFetching },
    isSynced
  ) =>
    compact([
      isSearchCreating,
      isSearchFetching,
      isSearchUpdating,
      isSearchResultsFetching,
    ]).length > 0 || !isSynced
);

export const getSearchIsCreatingAndFetching = createSelector(
  getSearchCreatingStatuses,
  getSearchFetchStatuses,
  ({ isLoading: isSearchCreating }, { isLoading: isSearchFetching }) =>
    compact([isSearchCreating, isSearchFetching]).length > 0
);

export const getSearchId = createSelector(searchState, search => search.searchId);

export const getSearchQuery = createSelector(searchState, search => search.query);

export const getSearchMyObjects = createSelector(searchState, search => search.myObjects);

export const getSearchFacetsByType = (facetName: OptionalFacetNames) =>
  createSelector(
    searchState,
    search => values(search.facets[facetName]?.items) || emptyArr
  );

/**
 * The single entity class the DE session is scoped to, or `'all'`.
 *
 * <p>ST-8 (#1842) removed the `myObjects -> 'my'` short-circuit this used to open with. It existed to serve
 * the **My-Objects result TAB**, which was one option in a one-of-N strip and therefore mutually exclusive
 * with a class selection by construction. ST-8 retires that strip: "My Objects" is now one option in the
 * sidebar's My-data group, three rows from the **Data entity type** filter, so "My Objects + Datasets" is an
 * ordinary combination. Keeping the short-circuit made an unrelated filter silently suppress the `Type` facet
 * (`Filters.tsx`) and the Create-Data-Entity-Group button (`Results.tsx`) whenever the owned scope was
 * ticked. `search.myObjects` still rides the legacy `/api/search` session request unchanged (ADR D9) — it
 * simply no longer masquerades as an entity class here.
 */
export const getSearchEntityClass = createSelector(searchState, search => {
  const selectedClass = findKey(
    omit(search.totals, ['all', 'myObjectsTotal']),
    filterItem => filterItem?.selected
  );

  return (search.totals[selectedClass as DataEntityClassNameEnum]?.id ||
    'all') as SearchClass;
});

export const getSelectedSearchFacetOptions = (facetName: OptionalFacetNames) =>
  createSelector(searchState, search => {
    if (!search.facetState[facetName]) return emptyArr;
    return transform<SearchFacetStateById, SearchFilterStateSynced[]>(
      search.facetState[facetName] || {},
      (memo, facetOption) => {
        if (facetOption.selected) memo.push(facetOption);
        return memo;
      },
      []
    );
  });

export const getSearchFacetsData = createSelector(searchState, search =>
  mapValues(search.facetState, facetState =>
    pickBy(facetState, facetOption => !facetOption.syncedState)
  )
);

export const getSearchTotals = createSelector(searchState, search => search.totals);

export const getSearchResults = createSelector(
  searchState,
  search => search.results.items
);

export const getSearchResultsPageInfo = createSelector(
  searchState,
  (search): CurrentPageInfo => search.results.pageInfo
);

export const getSearchSuggestions = createSelector(
  searchState,
  search => search.suggestions || emptyArr
);

export const getDataEntitySearchHighlights = (dataEntityId: number) =>
  createSelector(
    searchState,
    (search): DataEntitySearchHighlight | undefined =>
      search.dataEntitySearchHighlightById[dataEntityId]
  );

/**
 * ST-1b / ADR D10 — project the current search slice onto the shareable URL state (the selected facet ids per
 * dimension + query + myObjects). The mirror in `Search.tsx` serialises this to the URL on a local facet
 * change. Only numeric, selected option ids are emitted — the `'my'`/`'all'` pseudo-classes are not facet ids
 * (`'my'` rides the separate `myObjects` boolean).
 */
export const getSearchUrlState = createSelector(searchState, (search): SearchUrlState => {
  const facets: SearchUrlFacets = {};
  SEARCH_FACET_PARAMS.forEach(name => {
    // entityClasses is driven DIRECTLY on the URL by DataEntityTypeFilter (like assetKinds), NOT mirrored from
    // the redux facet: the DE session is single-class, so its facetState echo collapses a multi-class selection
    // to one. The Search.tsx mirror re-merges entityClasses from the live URL, so other-facet toggles preserve
    // it instead of overwriting it with the collapsed value.
    if (name === 'entityClasses') return;
    const byId = search.facetState[name];
    if (!byId) return;
    const ids = values(byId)
      .filter(option => option.selected && typeof option.entityId === 'number')
      .map(option => option.entityId as number);
    if (ids.length > 0) facets[name] = ids;
  });
  // ST-8 (#1842): the My-data scope is a URL-ONLY dimension (like `sort` and `asset_kinds`) — it has no redux
  // facet to mirror, so it is deliberately absent here and re-merged from the live URL by the Search.tsx
  // mirror. Omitting that merge is the #1858 bug class: any sidebar toggle would silently drop the scope.
  return { query: search.query, facets };
});
