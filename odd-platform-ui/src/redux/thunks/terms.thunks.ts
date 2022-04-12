import {
  Configuration,
  TermDetails,
  TermApiUpdateTermRequest,
  TermApiCreateTermRequest,
  TermApiDeleteTermRequest,
  TermApi,
  TermApiGetTermSearchResultsRequest,
  TermList,
} from 'generated-sources';
import { createThunk } from 'redux/thunks/base.thunk';
import { DeleteTerm } from 'redux/interfaces/terms';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';
import { PaginatedResponse } from '../interfaces';

const apiClientConf = new Configuration(BASE_PARAMS);
const apiClient = new TermApi(apiClientConf);

export const updateTerm = createThunk<
  TermApiUpdateTermRequest,
  TermDetails,
  TermDetails
>(
  (params: TermApiUpdateTermRequest) => apiClient.updateTerm(params),
  actions.updateTermAction,
  (result: TermDetails) => result
);

export const createTerm = createThunk<
  TermApiCreateTermRequest,
  TermDetails,
  TermDetails
>(
  (params: TermApiCreateTermRequest) => apiClient.createTerm(params),
  actions.createTermAction,
  (result: TermDetails) => result
);

export const deleteTerm = createThunk<
  TermApiDeleteTermRequest,
  void,
  DeleteTerm
>(
  (params: TermApiDeleteTermRequest) => apiClient.deleteTerm(params),
  actions.deleteTermAction,
  (_, request: TermApiDeleteTermRequest) => ({
    id: request.termId,
  })
);

export const getTermsSearchResults = createThunk<
  TermApiGetTermSearchResultsRequest,
  TermList,
  PaginatedResponse<TermList>
>(
  (params: TermApiGetTermSearchResultsRequest) =>
    apiClient.getTermSearchResults(params),
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
