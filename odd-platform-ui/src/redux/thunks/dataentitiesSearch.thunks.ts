import {
  Configuration,
  CountableSearchFilter,
  DataEntityList,
  DataEntityRef,
  SearchApi,
  SearchApiGetFiltersForFacetRequest,
  SearchApiGetSearchFacetListRequest,
  SearchApiGetSearchResultsRequest,
  SearchApiGetSearchSuggestionsRequest,
  SearchApiSearchRequest,
  SearchApiUpdateSearchFacetsRequest,
  SearchFacetsData,
} from 'generated-sources';
import { createThunk } from 'redux/thunks/base.thunk';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';
import {
  FacetOptions,
  OptionalFacetNames,
  PaginatedResponse,
} from 'redux/interfaces';
import { createAsyncThunk } from '@reduxjs/toolkit';

const apiClientConf = new Configuration(BASE_PARAMS);
const searchApi = new SearchApi(apiClientConf);

export const createDataEntitiesSearch = createThunk<
  SearchApiSearchRequest,
  SearchFacetsData,
  SearchFacetsData
>(
  (params: SearchApiSearchRequest) => searchApi.search(params),
  actions.createDataEntitySearchAction,
  (response: SearchFacetsData) => response
);

export const updateDataEntitiesSearch = createThunk<
  SearchApiUpdateSearchFacetsRequest,
  SearchFacetsData,
  SearchFacetsData
>(
  (params: SearchApiUpdateSearchFacetsRequest) =>
    searchApi.updateSearchFacets(params),
  actions.updateDataEntitySearchAction,
  (response: SearchFacetsData) => response
);

export const getDataEntitiesSearchDetails = createThunk<
  SearchApiGetSearchFacetListRequest,
  SearchFacetsData,
  SearchFacetsData
>(
  (params: SearchApiGetSearchFacetListRequest) =>
    searchApi.getSearchFacetList(params),
  actions.getDataEntitySearchAction,
  (response: SearchFacetsData) => response
);

export const getDataEntitiesSearchResults = createThunk<
  SearchApiGetSearchResultsRequest,
  DataEntityList,
  PaginatedResponse<DataEntityList>
>(
  (params: SearchApiGetSearchResultsRequest) =>
    searchApi.getSearchResults(params),
  actions.getDataEntitySearchResultsAction,
  (
    response: DataEntityList,
    request: SearchApiGetSearchResultsRequest
  ) => ({
    ...response,
    pageInfo: {
      ...response.pageInfo,
      page: request.page,
      hasNext: !!(request.size * request.page < response.pageInfo.total),
    },
  })
);

export const getFacetOptions = createThunk<
  SearchApiGetFiltersForFacetRequest,
  CountableSearchFilter[],
  FacetOptions
>(
  (params: SearchApiGetFiltersForFacetRequest) =>
    searchApi.getFiltersForFacet(params),
  actions.getSearchFacetOptionsAction,
  (
    response: CountableSearchFilter[],
    request: SearchApiGetFiltersForFacetRequest
  ) => ({
    facetName: request.query
      ? undefined
      : (request.facetType.toLowerCase() as OptionalFacetNames),
    facetOptions: response,
    page: request.page,
  })
);

export const fetchSearchSuggestions = createAsyncThunk<
  DataEntityRef[],
  SearchApiGetSearchSuggestionsRequest
>(
  actions.fetchDataEntitySearchSuggestionsActionType,
  async ({ query, entityClassId, manuallyCreated }) => {
    const searchSuggestions = await searchApi.getSearchSuggestions({
      query,
      entityClassId,
      manuallyCreated,
    });

    return searchSuggestions;
  }
);
