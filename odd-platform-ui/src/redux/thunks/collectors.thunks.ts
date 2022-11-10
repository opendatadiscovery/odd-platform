import {
  type Collector,
  CollectorApi,
  type CollectorApiDeleteCollectorRequest,
  type CollectorApiGetCollectorsListRequest,
  type CollectorApiRegenerateCollectorTokenRequest,
  type CollectorApiRegisterCollectorRequest,
  type CollectorApiUpdateCollectorRequest,
  Configuration,
} from 'generated-sources';
import type { CurrentPageInfo } from 'redux/interfaces';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';
import { handleResponseAsyncThunk } from 'redux/lib/handleResponseThunk';

const apiClientConf = new Configuration(BASE_PARAMS);
const apiClient = new CollectorApi(apiClientConf);

export const fetchCollectorsList = handleResponseAsyncThunk<
  { items: Array<Collector>; pageInfo: CurrentPageInfo },
  CollectorApiGetCollectorsListRequest
>(
  actions.fetchCollectorsActionType,
  async ({ page, size, query }) => {
    const { items, pageInfo } = await apiClient.getCollectorsList({ page, size, query });

    return { items, pageInfo: { ...pageInfo, page } };
  },
  {}
);

export const registerCollector = handleResponseAsyncThunk<
  Collector,
  CollectorApiRegisterCollectorRequest
>(
  actions.registerCollectorActionType,
  async ({ collectorFormData }) =>
    await apiClient.registerCollector({ collectorFormData }),
  {
    setSuccessOptions: ({ collectorFormData }) => ({
      id: `Collector-creating-${collectorFormData.name}`,
      message: `Collector ${collectorFormData.name} successfully created.`,
    }),
  }
);

export const updateCollector = handleResponseAsyncThunk<
  Collector,
  CollectorApiUpdateCollectorRequest
>(
  actions.updateCollectorActionType,
  async ({ collectorId, collectorUpdateFormData }) =>
    await apiClient.updateCollector({ collectorId, collectorUpdateFormData }),
  {
    setSuccessOptions: ({ collectorUpdateFormData }) => ({
      id: `Collector-updating-${collectorUpdateFormData.name}`,
      message: `Collector ${collectorUpdateFormData.name} successfully updated.`,
    }),
  }
);

export const regenerateCollectorToken = handleResponseAsyncThunk<
  Collector,
  CollectorApiRegenerateCollectorTokenRequest
>(
  actions.regenerateCollectorTokenActionType,
  async ({ collectorId }) => await apiClient.regenerateCollectorToken({ collectorId }),
  {
    setSuccessOptions: ({ collectorId }) => ({
      id: `Collector-token-updating-${collectorId}`,
      message: `Collector's token successfully regenerated.`,
    }),
  }
);

export const deleteCollector = handleResponseAsyncThunk<
  number,
  CollectorApiDeleteCollectorRequest
>(
  actions.deleteCollectorActionType,
  async ({ collectorId }) => {
    await apiClient.deleteCollector({ collectorId });

    return collectorId;
  },
  {
    setSuccessOptions: ({ collectorId }) => ({
      id: `Collector-deleting-${collectorId}`,
      message: `Collector successfully deleted.`,
    }),
  }
);
