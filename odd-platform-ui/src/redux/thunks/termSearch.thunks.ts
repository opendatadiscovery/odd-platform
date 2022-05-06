import {
  TermApi,
  Configuration,
  TermSearchFacetsData,
  TermApiTermSearchRequest,
  TermApiGetTermSearchFacetListRequest,
  TermApiUpdateTermSearchFacetsRequest,
  TermList,
  TermApiGetTermSearchResultsRequest,
  TermApiGetTermFiltersForFacetRequest,
  CountableSearchFilter,
  TermApiGetTermSearchSuggestionsRequest,
  TermRefList,
} from 'generated-sources';
import {
  PaginatedResponse,
  TermSearchOptionalFacetNames,
  TermSearchFacetOptions,
} from 'redux/interfaces';
import { createThunk } from 'redux/thunks/base.thunk';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';

const apiClientConf = new Configuration(BASE_PARAMS);
const termSearchApiClient = new TermApi(apiClientConf);

export const createTermSearch = createThunk<
  TermApiTermSearchRequest,
  TermSearchFacetsData,
  TermSearchFacetsData
>(
  (params: TermApiTermSearchRequest) =>
    termSearchApiClient.termSearch(params),
  actions.createTermSearchAction,
  (response: TermSearchFacetsData) => response
);

export const getTermSearchDetails = createThunk<
  TermApiGetTermSearchFacetListRequest,
  TermSearchFacetsData,
  TermSearchFacetsData
>(
  (params: TermApiGetTermSearchFacetListRequest) =>
    termSearchApiClient.getTermSearchFacetList(params),
  actions.getTermSearchAction,
  (response: TermSearchFacetsData) => response
);

export const updateTermSearch = createThunk<
  TermApiUpdateTermSearchFacetsRequest,
  TermSearchFacetsData,
  TermSearchFacetsData
>(
  (params: TermApiUpdateTermSearchFacetsRequest) =>
    termSearchApiClient.updateTermSearchFacets(params),
  actions.updateTermSearchAction,
  (response: TermSearchFacetsData) => response
);

export const getTermSearchResults = createThunk<
  TermApiGetTermSearchResultsRequest,
  TermList,
  PaginatedResponse<TermList>
>(
  (params: TermApiGetTermSearchResultsRequest) =>
    termSearchApiClient.getTermSearchResults(params),
  actions.getTermSearchResultsAction,
  (response: TermList, request: TermApiGetTermSearchResultsRequest) => ({
    ...response,
    pageInfo: {
      ...response.pageInfo,
      page: request.page,
      hasNext: !!(request.size * request.page < response.pageInfo.total),
    },
  })
);

export const getTermSearchFacetOptions = createThunk<
  TermApiGetTermFiltersForFacetRequest,
  CountableSearchFilter[],
  TermSearchFacetOptions
>(
  (params: TermApiGetTermFiltersForFacetRequest) =>
    termSearchApiClient.getTermFiltersForFacet(params),
  actions.getTermSearchFacetOptionsAction,
  (
    response: CountableSearchFilter[],
    request: TermApiGetTermFiltersForFacetRequest
  ) => ({
    facetName: request.query
      ? undefined
      : (request.facetType.toLowerCase() as TermSearchOptionalFacetNames),
    facetOptions: response,
    page: request.page,
  })
);

export const fetchTermSearchSuggestions = createThunk<
  TermApiGetTermSearchSuggestionsRequest,
  TermRefList,
  TermRefList
>(
  (params: TermApiGetTermSearchSuggestionsRequest) =>
    termSearchApiClient.getTermSearchSuggestions(params),
  actions.getTermSearchSuggestionsAction,
  (response: TermRefList) => response
);
