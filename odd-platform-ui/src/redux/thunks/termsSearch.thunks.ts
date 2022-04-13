import {
  TermApi,
  Configuration,
  TermSearchFacetsData,
  TermApiTermSearchRequest,
  TermApiGetTermSearchFacetListRequest,
  TermApiUpdateTermSearchFacetsRequest,
  TermList,
  TermApiGetTermSearchResultsRequest,
} from 'generated-sources';
import { createThunk } from 'redux/thunks/base.thunk';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';
import { PaginatedResponse } from '../interfaces';

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
      hasNext: request.size * request.page < response.pageInfo.total,
    },
  })
);
