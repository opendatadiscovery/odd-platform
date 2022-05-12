import {
  Configuration,
  DataEntityApi,
  Tag,
  TermApi,
  TermApiCreateTermRequest,
  TermApiCreateTermTagsRelationsRequest,
  TermApiDeleteTermRequest,
  TermApiGetTermDetailsRequest,
  TermApiGetTermsListRequest,
  TermApiUpdateTermRequest,
  TermDetails,
  TermRefList,
} from 'generated-sources';
import { createThunk } from 'redux/thunks/base.thunk';
import {
  DeleteTerm,
  PaginatedResponse,
  PartialTermDetailsUpdateParams,
} from 'redux/interfaces';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';
import { createAsyncThunk } from '@reduxjs/toolkit';

const apiClientConf = new Configuration(BASE_PARAMS);
const termApi = new TermApi(apiClientConf);
const dataEntityApiClient = new DataEntityApi(apiClientConf);

export const updateTerm = createThunk<
  TermApiUpdateTermRequest,
  TermDetails,
  TermDetails
>(
  (params: TermApiUpdateTermRequest) => termApi.updateTerm(params),
  actions.updateTermAction,
  (result: TermDetails) => result
);

export const createTerm = createThunk<
  TermApiCreateTermRequest,
  TermDetails,
  TermDetails
>(
  (params: TermApiCreateTermRequest) => termApi.createTerm(params),
  actions.createTermAction,
  (result: TermDetails) => result
);

export const deleteTerm = createThunk<
  TermApiDeleteTermRequest,
  void,
  DeleteTerm
>(
  (params: TermApiDeleteTermRequest) => termApi.deleteTerm(params),
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
  (params: TermApiGetTermsListRequest) => termApi.getTermsList(params),
  actions.fetchTermsAction,
  (response: TermRefList, request: TermApiGetTermsListRequest) => ({
    ...response,
    pageInfo: {
      ...response.pageInfo,
      page: request.page,
    },
  })
);

export const fetchTermDetails = createAsyncThunk<
  TermDetails,
  TermApiGetTermDetailsRequest
>(actions.fetchTermDetailsAction, async ({ termId }) => {
  const termDetails = await termApi.getTermDetails({ termId });

  return termDetails;
});

export const updateTermDetailsTags = createThunk<
  TermApiCreateTermTagsRelationsRequest,
  Tag[],
  PartialTermDetailsUpdateParams<Tag[]>
>(
  (params: TermApiCreateTermTagsRelationsRequest) =>
    termApi.createTermTagsRelations(params),
  actions.updateTermDetailsTagsAction,
  (response: Tag[], request: TermApiCreateTermTagsRelationsRequest) => ({
    termId: request.termId,
    value: response,
  })
);
