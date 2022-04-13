import { createSelector } from 'reselect';
import {
  createErrorSelector,
  createFetchingSelector,
} from 'redux/selectors/loader-selectors';
import mapValues from 'lodash/mapValues';
import pickBy from 'lodash/pickBy';
import { RootState, TermSearchState } from '../interfaces';

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

const termsSearchState = ({ termSearch }: RootState): TermSearchState =>
  termSearch;

export const getTermSearchId = createSelector(
  termsSearchState,
  termsSearch => termsSearch.termSearchId
);

export const getTermSearchFiltersSynced = createSelector(
  termsSearchState,
  termsSearch => termsSearch.isFacetsStateSynced
);

export const getTermSearchResultsPage = createSelector(
  termsSearchState,
  termsSearch => termsSearch.results.pageInfo
);

export const getTermSearchResultsItems = createSelector(
  termsSearchState,
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
  termsSearchState,
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
  termsSearchState,
  termsSearch =>
    mapValues(termsSearch.facetState, facetState =>
      pickBy(facetState, facetOption => !facetOption.syncedState)
    )
);

export const getTermSearchQuery = createSelector(
  termsSearchState,
  termsSearch => termsSearch.query
);
