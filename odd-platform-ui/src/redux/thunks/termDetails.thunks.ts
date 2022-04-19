import { createThunk } from './base.thunk';
import {
  Configuration,
  TermApi,
  TermDetails,
  TermApiGetTermDetailsRequest,
  Tag,
  TermApiCreateTermTagsRelationsRequest,
} from '../../generated-sources';
import * as actions from '../actions';
import { BASE_PARAMS } from '../../lib/constants';
import { PartialTermDetailsUpdateParams } from '../interfaces';

const apiClientConf = new Configuration(BASE_PARAMS);
const apiClient = new TermApi(apiClientConf);

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
  TermApiCreateTermTagsRelationsRequest,
  Tag[],
  PartialTermDetailsUpdateParams<Tag[]>
>(
  (params: TermApiCreateTermTagsRelationsRequest) =>
    apiClient.createTermTagsRelations(params),
  actions.updateTermDetailsTagsAction,
  (response: Tag[], request: TermApiCreateTermTagsRelationsRequest) => ({
    termId: request.termId,
    value: response,
  })
);
