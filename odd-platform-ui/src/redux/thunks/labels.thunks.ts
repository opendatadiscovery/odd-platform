import {
  Configuration,
  type Label,
  LabelApi,
  type LabelApiCreateLabelRequest,
  type LabelApiDeleteLabelRequest,
  type LabelApiGetLabelListRequest,
  type LabelApiUpdateLabelRequest,
} from 'generated-sources';
import type { CurrentPageInfo } from 'redux/interfaces';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';
import { handleResponseAsyncThunk } from 'redux/lib/handleResponseThunk';

const apiClientConf = new Configuration(BASE_PARAMS);
const apiClient = new LabelApi(apiClientConf);

export const fetchLabelsList = handleResponseAsyncThunk<
  { items: Array<Label>; pageInfo: CurrentPageInfo },
  LabelApiGetLabelListRequest
>(
  actions.fetchLabelsActionType,
  async ({ page, size, query }) => {
    const { items, pageInfo } = await apiClient.getLabelList({
      page,
      size,
      query,
    });

    return { items, pageInfo: { ...pageInfo, page } };
  },
  {}
);

export const createLabel = handleResponseAsyncThunk<Label[], LabelApiCreateLabelRequest>(
  actions.createLabelsActionType,
  async ({ labelFormData }) => await apiClient.createLabel({ labelFormData }),
  {
    setSuccessOptions: ({ labelFormData }) => ({
      id: `Labels-creating-${labelFormData.length}`,
      message: `Label${labelFormData.length > 1 ? 's' : ''} ${labelFormData.map(
        label => ` ${label.name}`
      )} successfully created.`,
    }),
  }
);

export const updateLabel = handleResponseAsyncThunk<Label, LabelApiUpdateLabelRequest>(
  actions.updateLabelActionType,
  async ({ labelId, labelFormData }) =>
    await apiClient.updateLabel({ labelId, labelFormData }),
  {
    setSuccessOptions: ({ labelFormData }) => ({
      id: `Labels-updating-${labelFormData.name}`,
      message: `Label ${labelFormData.name} successfully updated.`,
    }),
  }
);

export const deleteLabel = handleResponseAsyncThunk<number, LabelApiDeleteLabelRequest>(
  actions.deleteLabelActionType,
  async ({ labelId }) => {
    await apiClient.deleteLabel({ labelId });
    return labelId;
  },
  {
    setSuccessOptions: ({ labelId }) => ({
      id: `Labels-deleting-${labelId}`,
      message: `Label successfully deleted.`,
    }),
  }
);
