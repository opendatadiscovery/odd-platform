import {
  Configuration,
  type DataEntity,
  type DataEntityRef,
  type MultipleFacetType,
  SearchApi,
  type SearchApiGetFiltersForFacetRequest,
  type SearchApiGetSearchFacetListRequest,
  type SearchApiGetSearchResultsRequest,
  type SearchApiGetSearchSuggestionsRequest,
  type SearchApiSearchRequest,
  type SearchApiUpdateSearchFacetsRequest,
  type SearchFacetsData,
} from 'generated-sources';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';
import type { CurrentPageInfo, FacetOptions } from 'redux/interfaces';
import { createAsyncThunk } from '@reduxjs/toolkit';

const apiClientConf = new Configuration(BASE_PARAMS);
const searchApi = new SearchApi(apiClientConf);

// TODO handle
export const createDataEntitiesSearch = createAsyncThunk<
  SearchFacetsData,
  SearchApiSearchRequest
>(actions.createDataEntitySearchActionType, async params => searchApi.search(params));
// TODO handle
export const updateDataEntitiesSearch = createAsyncThunk<
  SearchFacetsData,
  SearchApiUpdateSearchFacetsRequest
>(actions.updateDataEntitySearchActionType, async params =>
  searchApi.updateSearchFacets(params)
);
// TODO handle
export const getDataEntitiesSearch = createAsyncThunk<
  SearchFacetsData,
  SearchApiGetSearchFacetListRequest
>(actions.getDataEntitySearchActionType, async params =>
  searchApi.getSearchFacetList(params)
);
// TODO handle
export const fetchDataEntitySearchResults = createAsyncThunk<
  { items: DataEntity[]; pageInfo: CurrentPageInfo },
  SearchApiGetSearchResultsRequest
>(actions.fetchDataEntitySearchResultsActionType, async params => {
  const { items, pageInfo } = await searchApi.getSearchResults(params);
  const { page, size } = params;

  return {
    items,
    pageInfo: {
      ...pageInfo,
      page,
      hasNext: page * size < pageInfo.total,
    },
  };
});
// TODO handle
export const getDataEntitySearchFacetOptions = createAsyncThunk<
  FacetOptions,
  SearchApiGetFiltersForFacetRequest
>(actions.getDataEntitySearchFacetOptionsActionType, async params => {
  const countableSearchFilters = await searchApi.getFiltersForFacet(params);
  const { query, page, facetType } = params;

  return {
    facetName: query ? undefined : (facetType.toLowerCase() as MultipleFacetType),
    facetOptions: countableSearchFilters,
    page,
  };
});
// TODO handle
export const fetchSearchSuggestions = createAsyncThunk<
  DataEntityRef[],
  SearchApiGetSearchSuggestionsRequest
>(actions.fetchDataEntitySearchSuggestionsActionType, async params =>
  searchApi.getSearchSuggestions(params)
);
