import {
  Configuration,
  LabelApi,
  Label,
  LabelApiCreateLabelRequest,
  LabelApiUpdateLabelRequest,
  LabelApiDeleteLabelRequest,
  LabelApiGetLabelListRequest,
} from 'generated-sources';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { CurrentPageInfo } from 'redux/interfaces/common';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';

const apiClientConf = new Configuration(BASE_PARAMS);
const apiClient = new LabelApi(apiClientConf);

export const fetchLabelsList = createAsyncThunk<
  { items: Array<Label>; pageInfo: CurrentPageInfo },
  LabelApiGetLabelListRequest
>(actions.fetchLabelsActionType, async ({ page, size, query }) => {
  const { items, pageInfo } = await apiClient.getLabelList({
    page,
    size,
    query,
  });

  return { items, pageInfo: { ...pageInfo, page } };
});

export const createLabel = createAsyncThunk<
  Label[],
  LabelApiCreateLabelRequest
>(actions.createLabelsActionType, async ({ labelFormData }) => {
  const label = await apiClient.createLabel({
    labelFormData,
  });

  return label;
});

export const updateLabel = createAsyncThunk<
  Label,
  LabelApiUpdateLabelRequest
>(actions.updateLabelActionType, async ({ labelId, labelFormData }) => {
  const label = await apiClient.updateLabel({
    labelId,
    labelFormData,
  });

  return label;
});

export const deleteLabel = createAsyncThunk<
  number,
  LabelApiDeleteLabelRequest
>(actions.deleteLabelActionType, async ({ labelId }) => {
  await apiClient.deleteLabel({ labelId });
  return labelId;
});
