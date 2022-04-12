import { createSelector } from 'reselect';
import {
  createErrorSelector,
  createFetchingSelector,
} from 'redux/selectors/loader-selectors';
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

const termsState = ({ termSearch }: RootState): TermSearchState =>
  termSearch;

export const getTermSearchId = createSelector(
  termsState,
  terms => terms.termSearchId
);

export const getTermSearchFiltersSynced = createSelector(
  termsState,
  terms => terms.isFacetsStateSynced
);

export const getTermSearchResultsPage = createSelector(
  termsState,
  terms => terms.results.pageInfo
);

export const getTermSearchResults = createSelector(
  termsState,
  terms => terms.results.items
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
  termsState,
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
