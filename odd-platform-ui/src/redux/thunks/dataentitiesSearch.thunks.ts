import {
  SearchApi,
  Configuration,
  SearchApiGetSearchResultsRequest,
  SearchApiGetFiltersForFacetRequest,
  DataEntityList,
  SearchFacetsData,
  SearchApiSearchRequest,
  SearchApiUpdateSearchFacetsRequest,
  SearchApiGetSearchFacetListRequest,
  CountableSearchFilter,
} from 'generated-sources';
import { createThunk } from 'redux/thunks/base.thunk';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';
import {
  FacetOptions,
  OptionalFacetNames,
  PaginatedResponse,
} from 'redux/interfaces';

const apiClientConf = new Configuration(BASE_PARAMS);
const searchApiClient = new SearchApi(apiClientConf);

export const createDataEntitiesSearch = createThunk<
  SearchApiSearchRequest,
  SearchFacetsData,
  SearchFacetsData
>(
  (params: SearchApiSearchRequest) => searchApiClient.search(params),
  actions.createDataEntitySearchAction,
  (response: SearchFacetsData) => response
);

export const updateDataEntitiesSearch = createThunk<
  SearchApiUpdateSearchFacetsRequest,
  SearchFacetsData,
  SearchFacetsData
>(
  (params: SearchApiUpdateSearchFacetsRequest) =>
    searchApiClient.updateSearchFacets(params),
  actions.updateDataEntitySearchAction,
  (response: SearchFacetsData) => response
);

export const getDataEntitiesSearchDetails = createThunk<
  SearchApiGetSearchFacetListRequest,
  SearchFacetsData,
  SearchFacetsData
>(
  (params: SearchApiGetSearchFacetListRequest) =>
    searchApiClient.getSearchFacetList(params),
  actions.getDataEntitySearchAction,
  (response: SearchFacetsData) => response
);

export const getDataEntitiesSearchResults = createThunk<
  SearchApiGetSearchResultsRequest,
  DataEntityList,
  PaginatedResponse<DataEntityList>
>(
  (params: SearchApiGetSearchResultsRequest) =>
    searchApiClient.getSearchResults(params),
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
    searchApiClient.getFiltersForFacet(params),
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
