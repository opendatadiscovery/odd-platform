import {
  Configuration,
  DataEntity,
  DataEntityRef,
  MultipleFacetType,
  SearchApi,
  SearchApiGetFiltersForFacetRequest,
  SearchApiGetSearchFacetListRequest,
  SearchApiGetSearchResultsRequest,
  SearchApiGetSearchSuggestionsRequest,
  SearchApiSearchRequest,
  SearchApiUpdateSearchFacetsRequest,
  SearchFacetsData,
} from 'generated-sources';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';
import { CurrentPageInfo, FacetOptions } from 'redux/interfaces';
import { createAsyncThunk } from '@reduxjs/toolkit';

const apiClientConf = new Configuration(BASE_PARAMS);
const searchApi = new SearchApi(apiClientConf);

// export const createDataEntitiesSearch = createThunk<
//   SearchApiSearchRequest,
//   SearchFacetsData,
//   SearchFacetsData
// >(
//   (params: SearchApiSearchRequest) => searchApi.search(params),
//   actions.createDataEntitySearchAction,
//   (response: SearchFacetsData) => response
// );

export const createDataEntitiesSearch = createAsyncThunk<
  SearchFacetsData,
  SearchApiSearchRequest
>(actions.createDataEntitySearchActionType, async params =>
  searchApi.search(params)
);

// export const updateDataEntitiesSearch = createThunk<
//   SearchApiUpdateSearchFacetsRequest,
//   SearchFacetsData,
//   SearchFacetsData
// >(
//   (params: SearchApiUpdateSearchFacetsRequest) =>
//     searchApi.updateSearchFacets(params),
//   actions.updateDataEntitySearchAction,
//   (response: SearchFacetsData) => response
// );

export const updateDataEntitiesSearch = createAsyncThunk<
  SearchFacetsData,
  SearchApiUpdateSearchFacetsRequest
>(actions.updateDataEntitySearchActionType, async params =>
  searchApi.updateSearchFacets(params)
);

// export const getDataEntitiesSearchDetails = createThunk<
//   SearchApiGetSearchFacetListRequest,
//   SearchFacetsData,
//   SearchFacetsData
// >(
//   (params: SearchApiGetSearchFacetListRequest) =>
//     searchApi.getSearchFacetList(params),
//   actions.getDataEntitySearchAction,
//   (response: SearchFacetsData) => response
// );

export const getDataEntitiesSearch = createAsyncThunk<
  SearchFacetsData,
  SearchApiGetSearchFacetListRequest
>(actions.getDataEntitySearchActionType, async params =>
  searchApi.getSearchFacetList(params)
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

// export const getFacetOptions = createThunk<
//   SearchApiGetFiltersForFacetRequest,
//   CountableSearchFilter[],
//   FacetOptions
// >(
//   (params: SearchApiGetFiltersForFacetRequest) =>
//     searchApi.getFiltersForFacet(params),
//   actions.getSearchFacetOptionsAction,
//   (
//     response: CountableSearchFilter[],
//     request: SearchApiGetFiltersForFacetRequest
//   ) => ({
//     facetName: request.query
//       ? undefined
//       : (request.facetType.toLowerCase() as OptionalFacetNames),
//     facetOptions: response,
//     page: request.page,
//   })
// );

export const getDataEntitySearchFacetOptions = createAsyncThunk<
  FacetOptions,
  SearchApiGetFiltersForFacetRequest
>(actions.getDataEntitySearchFacetOptionsActionType, async params => {
  const countableSearchFilters = await searchApi.getFiltersForFacet(
    params
  );
  const { query, page, facetType } = params;

  return {
    facetName: query
      ? undefined
      : (facetType.toLowerCase() as MultipleFacetType),
    facetOptions: countableSearchFilters,
    page,
  };
});

export const fetchSearchSuggestions = createAsyncThunk<
  DataEntityRef[],
  SearchApiGetSearchSuggestionsRequest
>(actions.fetchDataEntitySearchSuggestionsActionType, async params =>
  searchApi.getSearchSuggestions(params)
);
