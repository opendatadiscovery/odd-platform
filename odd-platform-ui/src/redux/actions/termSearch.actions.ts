import { createAsyncAction, createAction } from 'typesafe-actions';
import {
  TermSearchFacetStateUpdate,
  PaginatedResponse,
  TermSearchFacetOptions,
} from 'redux/interfaces';
import {
  TermList,
  TermSearchFacetsData,
  TermRef,
} from 'generated-sources';

export const getTermSearchAction = createAsyncAction(
  'GET_TERM_SEARCH__REQUEST',
  'GET_TERM_SEARCH__SUCCESS',
  'GET_TERM_SEARCH__FAILURE'
)<undefined, TermSearchFacetsData, undefined>();

export const createTermSearchAction = createAsyncAction(
  'POST_TERM_SEARCH__REQUEST',
  'POST_TERM_SEARCH__SUCCESS',
  'POST_TERM_SEARCH__FAILURE'
)<undefined, TermSearchFacetsData, undefined>();

export const updateTermSearchAction = createAsyncAction(
  'PUT_TERM_SEARCH__REQUEST',
  'PUT_TERM_SEARCH__SUCCESS',
  'PUT_TERM_SEARCH__FAILURE'
)<undefined, TermSearchFacetsData, undefined>();

export const getTermSearchResultsAction = createAsyncAction(
  'GET_TERM_SEARCH_RESULTS__REQUEST',
  'GET_TERM_SEARCH_RESULTS__SUCCESS',
  'GET_TERM_SEARCH_RESULTS__FAILURE'
)<undefined, PaginatedResponse<TermList>, undefined>();

export const getTermSearchFacetOptionsAction = createAsyncAction(
  'GET_TERM_SEARCH_FACET_OPTIONS__REQUEST',
  'GET_TERM_SEARCH_FACET_OPTIONS__SUCCESS',
  'GET_TERM_SEARCH_FACET_OPTIONS__FAILURE'
)<undefined, TermSearchFacetOptions, undefined>();

export const getTermSearchSuggestionsAction = createAsyncAction(
  'GET_TERM_SEARCH_SUGGESTIONS__REQUEST',
  'GET_TERM_SEARCH_SUGGESTIONS__SUCCESS',
  'GET_TERM_SEARCH_SUGGESTIONS__FAILURE'
)<undefined, TermRef[], undefined>();

export const changeTermSearchFilterAction = createAction(
  'CHANGE_TERM_SEARCH_FILTER'
)<TermSearchFacetStateUpdate>();

export const clearTermSearchFiltersAction = createAction(
  'CLEAR_TERM_SEARCH_FILTER'
)<undefined>();
