import { createSelector } from 'reselect';
import {
  createErrorSelector,
  createFetchingSelector,
} from 'redux/selectors/loader-selectors';
import {
  RootState,
  TermSearchState,
  TermSearchOptionalFacetNames,
  TermSearchFacetStateById,
  TermSearchFilterStateSynced,
} from 'redux/interfaces';
import mapValues from 'lodash/mapValues';
import pickBy from 'lodash/pickBy';
import values from 'lodash/values';
import transform from 'lodash/transform';

export const getTermSearchCreationStatus =
  createFetchingSelector('POST_TERM_SEARCH');

export const getTermSearchFetchStatus =
  createFetchingSelector('GET_TERM_SEARCH');

export const getTermSearchFetchError =
  createErrorSelector('GET_TERM_SEARCH');

export const getTermSearchUpdateStatus =
  createFetchingSelector('PUT_TERM_SEARCH');

export const getTermSearchResultsFetchStatus = createFetchingSelector(
  'GET_TERM_SEARCH_RESULTS'
);

const termSearchState = ({ termSearch }: RootState): TermSearchState =>
  termSearch;

export const getTermSearchId = createSelector(
  termSearchState,
  termsSearch => termsSearch.termSearchId
);

export const getTermSearchFiltersSynced = createSelector(
  termSearchState,
  termsSearch => termsSearch.isFacetsStateSynced
);

export const getTermSearchResultsPage = createSelector(
  termSearchState,
  termsSearch => termsSearch.results.pageInfo
);

export const getTermSearchResultsItems = createSelector(
  termSearchState,
  termsSearch => termsSearch.results.items
);

export const getTermSearchIsCreating = createSelector(
  getTermSearchCreationStatus,
  statusCreate => statusCreate === 'fetching'
);

export const getTermSearchIsFetching = createSelector(
  getTermSearchCreationStatus,
  getTermSearchFetchStatus,
  getTermSearchUpdateStatus,
  getTermSearchFiltersSynced,
  getTermSearchResultsFetchStatus,
  termSearchState,
  (
    statusCreate,
    statusFetch,
    statusUpdate,
    isSynced,
    statusResults,
    search
  ) =>
    [statusCreate, statusFetch, statusUpdate, statusResults].includes(
      'fetching'
    ) ||
    !isSynced ||
    (!!search.results.pageInfo.total && !search.results.items.length)
);

export const getTermSearchFacetsData = createSelector(
  termSearchState,
  termsSearch =>
    mapValues(termsSearch.facetState, facetState =>
      pickBy(facetState, facetOption => !facetOption.syncedState)
    )
);

export const getTermSearchQuery = createSelector(
  termSearchState,
  termsSearch => termsSearch.query
);

const getTermSearchFacetName = (
  _: RootState,
  termsSearchFacet: TermSearchOptionalFacetNames
) => termsSearchFacet;

export const getTermSearchFacetsByType = createSelector(
  termSearchState,
  getTermSearchFacetName,
  (termsSearch, termsSearchFacet) =>
    values(termsSearch.facets[termsSearchFacet]?.items) || []
);

export const getSelectedTermSearchSearchFacetOptions = createSelector(
  termSearchState,
  getTermSearchFacetName,
  (search, facetName) => {
    if (!search.facetState[facetName]) return [];
    return transform<
      TermSearchFacetStateById,
      TermSearchFilterStateSynced[]
    >(
      search.facetState[facetName] || {},
      (memo, facetOption) => {
        if (facetOption.selected) memo.push(facetOption);
        return memo;
      },
      []
    );
  }
);

export const getTermSearchIsUpdated = createSelector(
  getTermSearchUpdateStatus,
  statusUpdate => statusUpdate === 'fetching'
);
