import { createAsyncAction, createAction } from 'typesafe-actions';
import {
  FacetStateUpdate,
  PaginatedResponse,
  FacetOptions,
} from 'redux/interfaces';
import { DataEntityList, SearchFacetsData } from 'generated-sources';

export const getDataEntitySearchAction = createAsyncAction(
  'GET_DATA_ENTITIES_SEARCH__REQUEST',
  'GET_DATA_ENTITIES_SEARCH__SUCCESS',
  'GET_DATA_ENTITIES_SEARCH__FAILURE'
)<undefined, SearchFacetsData, undefined>();

export const createDataEntitySearchAction = createAsyncAction(
  'POST_DATA_ENTITIES_SEARCH__REQUEST',
  'POST_DATA_ENTITIES_SEARCH__SUCCESS',
  'POST_DATA_ENTITIES_SEARCH__FAILURE'
)<undefined, SearchFacetsData, undefined>();

export const updateDataEntitySearchAction = createAsyncAction(
  'PUT_DATA_ENTITIES_SEARCH__REQUEST',
  'PUT_DATA_ENTITIES_SEARCH__SUCCESS',
  'PUT_DATA_ENTITIES_SEARCH__FAILURE'
)<undefined, SearchFacetsData, undefined>();

export const getDataEntitySearchResultsAction = createAsyncAction(
  'GET_DATA_ENTITIES_SEARCH_RESULTS__REQUEST',
  'GET_DATA_ENTITIES_SEARCH_RESULTS__SUCCESS',
  'GET_DATA_ENTITIES_SEARCH_RESULTS__FAILURE'
)<undefined, PaginatedResponse<DataEntityList>, undefined>();

export const getSearchFacetOptionsAction = createAsyncAction(
  'GET_SEARCH_FACET_OPTIONS__REQUEST',
  'GET_SEARCH_FACET_OPTIONS__SUCCESS',
  'GET_SEARCH_FACET_OPTIONS__FAILURE'
)<undefined, FacetOptions, undefined>();

export const changeDataEntitySearchFilterAction = createAction(
  'CHANGE_DATA_ENTITIES_SEARCH_FILTER'
)<FacetStateUpdate>();

export const clearDataEntitySearchFiltersAction = createAction(
  'CLEAR_DATA_ENTITIES_SEARCH_FILTER'
)<undefined>();
