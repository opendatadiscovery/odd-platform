import {
  Configuration,
  TermApiUpdateTermRequest,
  TermApiCreateTermRequest,
  TermApiDeleteTermRequest,
  TermApiGetTermsListRequest,
  TermApi,
  TermDetails,
  TermRefList,
  TermRef,
  DataEntityApiDeleteTermFromDataEntityRequest,
  DataEntityApi,
  DataEntityApiAddTermToDataEntityRequest,
} from 'generated-sources';
import { createThunk } from 'redux/thunks/base.thunk';
import {
  PaginatedResponse,
  DeleteTerm,
  PartialEntityUpdateParams,
} from 'redux/interfaces';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';

const apiClientConf = new Configuration(BASE_PARAMS);
const apiClient = new TermApi(apiClientConf);
const dataEntityApiClient = new DataEntityApi(apiClientConf);

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

export const fetchTermsList = createThunk<
  TermApiGetTermsListRequest,
  TermRefList,
  PaginatedResponse<TermRefList>
>(
  (params: TermApiGetTermsListRequest) => apiClient.getTermsList(params),
  actions.fetchTermsAction,
  (response: TermRefList, request: TermApiGetTermsListRequest) => ({
    ...response,
    pageInfo: {
      ...response.pageInfo,
      page: request.page,
    },
  })
);

// Data entity terms

export const createDataEntityTerm = createThunk<
  DataEntityApiAddTermToDataEntityRequest,
  TermRef,
  PartialEntityUpdateParams<TermRef>
>(
  (params: DataEntityApiAddTermToDataEntityRequest) =>
    dataEntityApiClient.addTermToDataEntity(params),
  actions.createDataEntityTermAction,
  (
    response: TermRef,
    request: DataEntityApiAddTermToDataEntityRequest
  ) => ({
    entityId: request.dataEntityId,
    value: response,
  })
);

export const deleteDataEntityTerm = createThunk<
  DataEntityApiDeleteTermFromDataEntityRequest,
  void,
  PartialEntityUpdateParams<number>
>(
  (params: DataEntityApiDeleteTermFromDataEntityRequest) =>
    dataEntityApiClient.deleteTermFromDataEntity(params),
  actions.deleteDataEntityTermAction,
  (_, request: DataEntityApiDeleteTermFromDataEntityRequest) => ({
    entityId: request.dataEntityId,
    value: request.termId,
  })
);
