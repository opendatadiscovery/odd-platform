import { createThunk } from './base.thunk';
import {
  Configuration,
  TermApi,
  TermDetails,
  TermApiGetTermDetailsRequest,
  DataEntityApiCreateDataEntityTagsRelationsRequest,
  Tag,
  DataEntityApi,
} from '../../generated-sources';
import * as actions from '../actions';
import { BASE_PARAMS } from '../../lib/constants';
import { PartialTermDetailsUpdateParams } from '../interfaces';

const apiClientConf = new Configuration(BASE_PARAMS);
const apiClient = new TermApi(apiClientConf);
const removeApiClient = new DataEntityApi(apiClientConf); // todo remove

export const fetchTermDetails = createThunk<
  TermApiGetTermDetailsRequest,
  TermDetails,
  TermDetails
>(
  (params: TermApiGetTermDetailsRequest) =>
    apiClient.getTermDetails(params),
  actions.fetchTermDetailsAction,
  (response: TermDetails) => response
);

export const updateTermDetailsTags = createThunk<
  DataEntityApiCreateDataEntityTagsRelationsRequest, // todo replace with Term API
  Tag[],
  PartialTermDetailsUpdateParams<Tag[]>
>(
  (params: DataEntityApiCreateDataEntityTagsRelationsRequest) =>
    removeApiClient.createDataEntityTagsRelations(params), // todo replace with Term API
  actions.updateTermDetailsTagsAction,
  (
    response: Tag[],
    request: DataEntityApiCreateDataEntityTagsRelationsRequest
  ) => ({
    termId: request.dataEntityId,
    value: response,
  })
);
