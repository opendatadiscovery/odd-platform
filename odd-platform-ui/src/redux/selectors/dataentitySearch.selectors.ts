import { createSelector } from 'reselect';
import {
  findKey,
  omit,
  values,
  mapValues,
  pickBy,
  transform,
} from 'lodash';
import {
  RootState,
  OptionalFacetNames,
  SearchState,
  SearchFilterStateSynced,
  SearchFacetStateById,
  SearchType,
} from 'redux/interfaces';
import { DataEntityTypeNameEnum } from 'generated-sources';
import { createFetchingSelector } from 'redux/selectors/loader-selectors';

const searchState = ({ search }: RootState): SearchState => search;

export const getSearchCreationStatus = createFetchingSelector(
  'POST_DATA_ENTITIES_SEARCH'
);

export const getSearchFetchStatus = createFetchingSelector(
  'GET_DATA_ENTITIES_SEARCH'
);

export const getSearchUpdateStatus = createFetchingSelector(
  'PUT_DATA_ENTITIES_SEARCH'
);

export const getSearchResultsFetchStatus = createFetchingSelector(
  'GET_DATA_ENTITIES_SEARCH_RESULTS'
);

export const getSearchFiltersSynced = createSelector(
  searchState,
  search => search.isFacetsStateSynced
);

export const getSearchIsFetching = createSelector(
  getSearchFetchStatus,
  getSearchUpdateStatus,
  getSearchFiltersSynced,
  getSearchResultsFetchStatus,
  searchState,
  (statusFetch, statusUpdate, isSynced, statusResults, search) =>
    [statusFetch, statusUpdate, statusResults].includes('fetching') ||
    !isSynced ||
    (!!search.results.pageInfo.total && !search.results.items.length)
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

export const getSearchEntityType = createSelector(searchState, search => {
  if (search.myObjects) return 'my' as SearchType;
  const selectedType = findKey(
    omit(search.totals, ['all', 'myObjectsTotal']),
    filterItem => filterItem?.selected
  );
  return (search.totals[selectedType as DataEntityTypeNameEnum]?.id ||
    'all') as SearchType;
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

export const getSearchFiltersData = createSelector(searchState, search =>
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
