import { createSelector } from '@reduxjs/toolkit';
import { createStatusesSelector } from 'redux/selectors/loader-selectors';
import * as actions from 'redux/actions';
import type {
  CurrentPageInfo,
  RootState,
  SearchFacetStateById,
  SearchFilterStateSynced,
  TermSearchOptionalFacetNames,
  TermSearchState,
} from 'redux/interfaces';
import mapValues from 'lodash/mapValues';
import pickBy from 'lodash/pickBy';
import values from 'lodash/values';
import transform from 'lodash/transform';
import compact from 'lodash/compact';
import { emptyArr } from 'lib/constants';

export const getTermSearchCreateStatuses = createStatusesSelector(
  actions.createTermsSearchActType
);

export const getTermSearchFetchStatuses = createStatusesSelector(
  actions.getTermsSearchActType
);

export const getTermSearchUpdateStatuses = createStatusesSelector(
  actions.updateTermsSearchActType
);

export const getTermSearchResultsFetchStatuses = createStatusesSelector(
  actions.fetchTermsSearchResultsActType
);

export const getTermSearchSuggestionsFetchStatuses = createStatusesSelector(
  actions.fetchTermsSearchSuggestionsActType
);

// Term Search
const termSearchState = ({ termSearch }: RootState): TermSearchState => termSearch;

export const getTermSearchId = createSelector(
  termSearchState,
  termsSearch => termsSearch.termSearchId
);

export const getTermSearchFacetsSynced = createSelector(
  termSearchState,
  termsSearch => termsSearch.isFacetsStateSynced
);

export const getTermSearchResultsPage = createSelector(
  termSearchState,
  (termsSearch): CurrentPageInfo => termsSearch.results.pageInfo
);

export const getTermSearchResults = createSelector(
  termSearchState,
  termsSearch => termsSearch.results.items
);

export const getTermSearchIsFetching = createSelector(
  getTermSearchCreateStatuses,
  getTermSearchFetchStatuses,
  getTermSearchUpdateStatuses,
  getTermSearchResultsFetchStatuses,
  getTermSearchFacetsSynced,
  termSearchState,
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

export const getTermSearchQuery = createSelector(
  termSearchState,
  termsSearch => termsSearch.query
);

// Facets
export const getTermSearchFacetsParams = createSelector(termSearchState, termsSearch =>
  mapValues(termsSearch.facetState, facetState =>
    pickBy(facetState, facetOption => !facetOption.syncedState)
  )
);

export const getTermSearchFacetsByType = (facetName: TermSearchOptionalFacetNames) =>
  createSelector(
    termSearchState,
    termsSearch => values(termsSearch.facets[facetName]?.items) || []
  );

export const getSelectedTermSearchFacetOptions = (
  facetName: TermSearchOptionalFacetNames
) =>
  createSelector(termSearchState, termsSearch => {
    if (!termsSearch.facetState[facetName]) return emptyArr;
    return transform<SearchFacetStateById, SearchFilterStateSynced[]>(
      termsSearch.facetState[facetName] || {},
      (memo, facetOption) => {
        if (facetOption.selected) memo.push(facetOption);
        return memo;
      },
      []
    );
  });

export const getTermSearchSuggestions = createSelector(
  termSearchState,
  termsSearch => termsSearch.suggestions
);
