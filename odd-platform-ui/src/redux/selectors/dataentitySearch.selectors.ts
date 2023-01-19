import { createSelector } from '@reduxjs/toolkit';
import findKey from 'lodash/findKey';
import omit from 'lodash/omit';
import values from 'lodash/values';
import mapValues from 'lodash/mapValues';
import pickBy from 'lodash/pickBy';
import transform from 'lodash/transform';
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
import compact from 'lodash/compact';
import { emptyArr } from 'lib/constants';

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
  searchState,
  (
    { isLoading: isSearchCreating },
    { isLoading: isSearchFetching },
    { isLoading: isSearchUpdating },
    { isLoading: isSearchResultsFetching },
    isSynced,
    search
  ) =>
    compact([
      isSearchCreating,
      isSearchFetching,
      isSearchUpdating,
      isSearchResultsFetching,
    ]).length > 0 ||
    !isSynced ||
    (!!search.results.pageInfo.total && !search.results.items.length)
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

export const getSearchEntityClass = createSelector(searchState, search => {
  if (search.myObjects) return 'my' as SearchClass;
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
