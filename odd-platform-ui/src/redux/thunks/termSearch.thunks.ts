import {
  Configuration,
  Term,
  TermApi,
  TermApiGetTermFiltersForFacetRequest,
  TermApiGetTermSearchFacetListRequest,
  TermApiGetTermSearchResultsRequest,
  TermApiGetTermSearchSuggestionsRequest,
  TermApiTermSearchRequest,
  TermApiUpdateTermSearchFacetsRequest,
  TermRef,
  TermSearchFacetsData,
} from 'generated-sources';
import {
  CurrentPageInfo,
  TermSearchFacetOptions,
  TermSearchOptionalFacetNames,
} from 'redux/interfaces';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';
import { createAsyncThunk } from '@reduxjs/toolkit';

const apiClientConf = new Configuration(BASE_PARAMS);
const termApi = new TermApi(apiClientConf);

export const createTermSearch = createAsyncThunk<
  TermSearchFacetsData,
  TermApiTermSearchRequest
>(actions.createTermsSearchActType, async params => termApi.termSearch(params));

export const updateTermSearch = createAsyncThunk<
  TermSearchFacetsData,
  TermApiUpdateTermSearchFacetsRequest
>(actions.updateTermsSearchActType, async params =>
  termApi.updateTermSearchFacets(params)
);

export const getTermsSearch = createAsyncThunk<
  TermSearchFacetsData,
  TermApiGetTermSearchFacetListRequest
>(actions.getTermsSearchActType, async params => termApi.getTermSearchFacetList(params));

export const fetchTermsSearchResults = createAsyncThunk<
  { items: Term[]; pageInfo: CurrentPageInfo },
  TermApiGetTermSearchResultsRequest
>(actions.fetchTermsSearchResultsActType, async params => {
  const { items, pageInfo } = await termApi.getTermSearchResults(params);
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

export const getTermsSearchFacetOptions = createAsyncThunk<
  TermSearchFacetOptions,
  TermApiGetTermFiltersForFacetRequest
>(actions.getTermsSearchFacetOptionsActType, async params => {
  const facetOptions = await termApi.getTermFiltersForFacet(params);
  const { query, page, facetType } = params;
  const facetName = query
    ? undefined
    : (facetType.toLowerCase() as TermSearchOptionalFacetNames);

  return { facetName, facetOptions, page };
});

export const fetchTermSearchSuggestions = createAsyncThunk<
  TermRef[],
  TermApiGetTermSearchSuggestionsRequest
>(actions.fetchTermsSearchSuggestionsActType, async params => {
  const { items } = await termApi.getTermSearchSuggestions(params);

  return items;
});
