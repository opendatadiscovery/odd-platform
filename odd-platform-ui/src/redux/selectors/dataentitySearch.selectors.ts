import { createSelector } from '@reduxjs/toolkit';
import findKey from 'lodash/findKey';
import omit from 'lodash/omit';
import values from 'lodash/values';
import mapValues from 'lodash/mapValues';
import pickBy from 'lodash/pickBy';
import transform from 'lodash/transform';
import {
  OptionalFacetNames,
  RootState,
  SearchClass,
  SearchFacetStateById,
  SearchFilterStateSynced,
  SearchState,
} from 'redux/interfaces';
import { DataEntityClassNameEnum } from 'generated-sources';
import {
  createLegacyErrorSelector,
  createLegacyFetchingSelector,
  createStatusesSelector,
} from 'redux/selectors/loader-selectors';
import * as actions from 'redux/actions';

const searchState = ({ dataEntitySearch }: RootState): SearchState =>
  dataEntitySearch;

export const getSearchCreationStatus = createLegacyFetchingSelector(
  'POST_DATA_ENTITIES_SEARCH'
);

export const getSearchFetchStatus = createLegacyFetchingSelector(
  'GET_DATA_ENTITIES_SEARCH'
);

export const getSearchFetchError = createLegacyErrorSelector(
  'GET_DATA_ENTITIES_SEARCH'
);

export const getSearchUpdateStatus = createLegacyFetchingSelector(
  'PUT_DATA_ENTITIES_SEARCH'
);

export const getSearchResultsFetchStatuses = createStatusesSelector(
  actions.fetchDataEntitySearchResultsActionType
);

export const getSearchFiltersSynced = createSelector(
  searchState,
  search => search.isFacetsStateSynced
);

// export const getIsMainOverviewContentFetching = createSelector(
//   getTagsListFetchingStatuses,
//   getIdentityFetchingStatuses,
//   getMyDataEntitiesFetchingStatuses,
//   getMyUpstreamDataEntitiesFetchingStatuses,
//   getMyDownstreamFetchingStatuses,
//   getPopularDataEntitiesFetchingStatuses,
//   getIdentityFetchingStatuses,
//   (...isFetchingFlags) =>
//     compact(isFetchingFlags.map(({ isLoading }) => isLoading)).length > 0
// );

export const getSearchIsFetching = createSelector(
  getSearchCreationStatus,
  getSearchFetchStatus,
  getSearchUpdateStatus,
  getSearchFiltersSynced,
  getSearchResultsFetchStatuses,
  searchState,
  (
    statusCreate,
    statusFetch,
    statusUpdate,
    isSynced,
    statusResults,
    search
  ) =>
    [
      statusCreate,
      statusFetch,
      statusUpdate,
      statusResults.isLoading,
    ].includes('fetching') ||
    !isSynced ||
    (!!search.results.pageInfo.total && !search.results.items.length)
);

export const getSearchIsCreatingAndFetching = createSelector(
  getSearchCreationStatus,
  getSearchFetchStatus,
  (statusCreate, statusFetch) =>
    [statusCreate, statusFetch].includes('fetching')
);

export const getSearchIsCreating = createSelector(
  getSearchCreationStatus,
  statusCreate => statusCreate === 'fetching'
);

export const getSearchIsUpdated = createSelector(
  getSearchUpdateStatus,
  statusUpdate => statusUpdate === 'fetching'
);

export const getSearchId = createSelector(
  searchState,
  search => search.searchId
);

export const getSearchQuery = createSelector(
  searchState,
  search => search.query
);

export const getSearchMyObjects = createSelector(
  searchState,
  search => search.myObjects
);

const getSearchFacetName = (
  _: RootState,
  searchFacet: OptionalFacetNames
) => searchFacet;

export const getSearchFacetsByType = createSelector(
  searchState,
  getSearchFacetName,
  (search, searchFacet) => values(search.facets[searchFacet]?.items) || []
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

export const getSelectedSearchFacetOptions = createSelector(
  searchState,
  getSearchFacetName,
  (search, facetName) => {
    if (!search.facetState[facetName]) return [];
    return transform<SearchFacetStateById, SearchFilterStateSynced[]>(
      search.facetState[facetName] || {},
      (memo, facetOption) => {
        if (facetOption.selected) memo.push(facetOption);
        return memo;
      },
      []
    );
  }
);

export const getSearchFacetsData = createSelector(searchState, search =>
  mapValues(search.facetState, facetState =>
    pickBy(facetState, facetOption => !facetOption.syncedState)
  )
);

export const getSearchTotals = createSelector(
  searchState,
  search => search.totals
);

export const getSearchResults = createSelector(
  searchState,
  search => search.results.items
);

export const getSearchResultsPage = createSelector(
  searchState,
  search => search.results.pageInfo
);

export const getSearchSuggestions = createSelector(
  searchState,
  search => search.suggestions || []
);

export const getSearchSuggestionsFetchingStatuses = createStatusesSelector(
  actions.fetchDataEntitySearchSuggestionsActionType
);
