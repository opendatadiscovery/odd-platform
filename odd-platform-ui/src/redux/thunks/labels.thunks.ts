import {
  Configuration,
  LabelApi,
  LabelsResponse,
  Label,
  LabelApiCreateLabelRequest,
  LabelApiUpdateLabelRequest,
  LabelApiDeleteLabelRequest,
  LabelApiGetLabelListRequest,
} from 'generated-sources';
import { createThunk } from 'redux/thunks/base.thunk';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';
import { PaginatedResponse } from 'redux/interfaces/common';

const apiClientConf = new Configuration(BASE_PARAMS);
const apiClient = new LabelApi(apiClientConf);

export const fetchLabelsList = createThunk<
  LabelApiGetLabelListRequest,
  LabelsResponse,
  PaginatedResponse<LabelsResponse>
>(
  (params: LabelApiGetLabelListRequest) => apiClient.getLabelList(params),
  actions.fetchLabelsAction,
  (response: LabelsResponse, request: LabelApiGetLabelListRequest) => ({
    ...response,
    pageInfo: {
      ...response.pageInfo,
      page: request.page,
      hasNext: !!(request.size * request.page < response.pageInfo.total),
    },
  })
);

export const createLabel = createThunk<
  LabelApiCreateLabelRequest,
  Label[],
  Label[]
>(
  (params: LabelApiCreateLabelRequest) => apiClient.createLabel(params),
  actions.createLabelsAction,
  (result: Label[]) => result
);

export const updateLabel = createThunk<
  LabelApiUpdateLabelRequest,
  Label,
  Label
>(
  (params: LabelApiUpdateLabelRequest) => apiClient.updateLabel(params),
  actions.updateLabelAction,
  (result: Label) => result
);

export const deleteLabel = createThunk<
  LabelApiDeleteLabelRequest,
  void,
  number
>(
  (params: LabelApiDeleteLabelRequest) => apiClient.deleteLabel(params),
  actions.deleteLabelAction,
  (_, reqParams) => reqParams.labelId
);
