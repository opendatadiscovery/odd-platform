import {
  Configuration,
  CountableSearchFilter,
  DataEntity,
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
  CurrentPageInfo,
  FacetOptions,
  OptionalFacetNames,
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

// export const getDataEntitiesSearchResults = createThunk<
//   SearchApiGetSearchResultsRequest,
//   DataEntityList,
//   PaginatedResponse<DataEntityList>
// >(
//   (params: SearchApiGetSearchResultsRequest) =>
//     searchApi.getSearchResults(params),
//   actions.getDataEntitySearchResultsAction,
//   (
//     response: DataEntityList,
//     request: SearchApiGetSearchResultsRequest
//   ) => ({
//     ...response,
//     pageInfo: {
//       ...response.pageInfo,
//       page: request.page,
//       hasNext: request.size * request.page < response.pageInfo.total,
//     },
//   })
// );

export const fetchDataEntitySearchResults = createAsyncThunk<
  { items: DataEntity[]; pageInfo: CurrentPageInfo },
  SearchApiGetSearchResultsRequest
>(
  actions.fetchDataEntitySearchResultsActionType,
  async ({ searchId, page, size }) => {
    const { items, pageInfo } = await searchApi.getSearchResults({
      searchId,
      page,
      size,
    });

    return {
      items,
      pageInfo: {
        ...pageInfo,
        page,
        hasNext: page * size < pageInfo.total,
      },
    };
  }
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

export const getDataEntitySearchFacetOptions = createAsyncThunk<
  FacetOptions,
  SearchApiGetFiltersForFacetRequest
>(actions.getDataEntitySearchFacetOptionsActionType, async params => {
  const countableSearchFilters = await searchApi.getFiltersForFacet(
    params
  );
  const { query, page, facetType } = params;

  return {
    // TODO check for lowerCase
    facetName: query ? undefined : facetType,
    facetOptions: countableSearchFilters,
    page,
  };
});

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
