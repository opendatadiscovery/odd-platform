import {
  CollectorApi,
  Configuration,
  Collector,
  CollectorApiGetCollectorsListRequest,
  CollectorApiUpdateCollectorRequest,
  CollectorApiRegisterCollectorRequest,
  CollectorApiDeleteCollectorRequest,
  CollectorApiRegenerateCollectorTokenRequest,
} from 'generated-sources';
import { CurrentPageInfo } from 'redux/interfaces/common';
import { createAsyncThunk } from '@reduxjs/toolkit';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';

const apiClientConf = new Configuration(BASE_PARAMS);
const apiClient = new CollectorApi(apiClientConf);

export const fetchCollectorsList = createAsyncThunk<
  { items: Array<Collector>; pageInfo: CurrentPageInfo },
  CollectorApiGetCollectorsListRequest
>(actions.fetchCollectorsActionType, async ({ page, size, query }) => {
  const { items, pageInfo } = await apiClient.getCollectorsList({
    page,
    size,
    query,
  });

  return { items, pageInfo: { ...pageInfo, page } };
});

export const updateCollector = createAsyncThunk<
  Collector,
  CollectorApiUpdateCollectorRequest
>(
  actions.updateCollectorActionType,
  async ({ collectorId, collectorUpdateFormData }) => {
    const collector = await apiClient.updateCollector({
      collectorId,
      collectorUpdateFormData,
    });

    return collector;
  }
);

export const regenerateCollectorToken = createAsyncThunk<
  Collector,
  CollectorApiRegenerateCollectorTokenRequest
>(actions.regenerateCollectorTokenActionType, async ({ collectorId }) => {
  const collector = await apiClient.regenerateCollectorToken({
    collectorId,
  });

  return collector;
});

export const registerCollector = createAsyncThunk<
  Collector,
  CollectorApiRegisterCollectorRequest
>(actions.registerCollectorActionType, async ({ collectorFormData }) => {
  const collector = await apiClient.registerCollector({
    collectorFormData,
  });

  return collector;
});

export const deleteCollector = createAsyncThunk<
  number,
  CollectorApiDeleteCollectorRequest
>(actions.deleteCollectorActionType, async ({ collectorId }) => {
  await apiClient.deleteCollector({ collectorId });

  return collectorId;
});
