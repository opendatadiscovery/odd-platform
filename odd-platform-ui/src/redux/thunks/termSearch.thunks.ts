import {
  Configuration,
  type Term,
  TermApi,
  type TermApiGetTermFiltersForFacetRequest,
  type TermApiGetTermSearchFacetListRequest,
  type TermApiGetTermSearchResultsRequest,
  type TermApiGetTermSearchSuggestionsRequest,
  type TermApiTermSearchRequest,
  type TermApiUpdateTermSearchFacetsRequest,
  type TermRef,
  type TermSearchFacetsData,
} from 'generated-sources';
import type {
  CurrentPageInfo,
  TermSearchFacetOptions,
  TermSearchOptionalFacetNames,
} from 'redux/interfaces';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';
import { handleResponseAsyncThunk } from 'redux/lib/handleResponseThunk';

const apiClientConf = new Configuration(BASE_PARAMS);
const termApi = new TermApi(apiClientConf);

export const createTermSearch = handleResponseAsyncThunk<
  TermSearchFacetsData,
  TermApiTermSearchRequest
>(actions.createTermsSearchActType, async params => await termApi.termSearch(params), {});

export const updateTermSearch = handleResponseAsyncThunk<
  TermSearchFacetsData,
  TermApiUpdateTermSearchFacetsRequest
>(
  actions.updateTermsSearchActType,
  async params => await termApi.updateTermSearchFacets(params),
  {}
);

export const getTermsSearch = handleResponseAsyncThunk<
  TermSearchFacetsData,
  TermApiGetTermSearchFacetListRequest
>(
  actions.getTermsSearchActType,
  async params => await termApi.getTermSearchFacetList(params),
  {}
);

export const fetchTermsSearchResults = handleResponseAsyncThunk<
  { items: Term[]; pageInfo: CurrentPageInfo },
  TermApiGetTermSearchResultsRequest
>(
  actions.fetchTermsSearchResultsActType,
  async params => {
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
  },
  {}
);

export const getTermsSearchFacetOptions = handleResponseAsyncThunk<
  TermSearchFacetOptions,
  TermApiGetTermFiltersForFacetRequest
>(
  actions.getTermsSearchFacetOptionsActType,
  async params => {
    const facetOptions = await termApi.getTermFiltersForFacet(params);
    const { query, page, facetType } = params;
    const facetName = query
      ? undefined
      : (facetType.toLowerCase() as TermSearchOptionalFacetNames);

    return { facetName, facetOptions, page };
  },
  {}
);

export const fetchTermSearchSuggestions = handleResponseAsyncThunk<
  TermRef[],
  TermApiGetTermSearchSuggestionsRequest
>(
  actions.fetchTermsSearchSuggestionsActType,
  async params => {
    const { items } = await termApi.getTermSearchSuggestions(params);

    return items;
  },
  {}
);
