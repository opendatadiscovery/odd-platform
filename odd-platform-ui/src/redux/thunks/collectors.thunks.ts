import type {
  Collector,
  CollectorApiDeleteCollectorRequest,
  CollectorApiGetCollectorsListRequest,
  CollectorApiRegenerateCollectorTokenRequest,
  CollectorApiRegisterCollectorRequest,
  CollectorApiUpdateCollectorRequest,
} from 'generated-sources';
import type { CurrentPageInfo } from 'redux/interfaces';
import * as actions from 'redux/actions';
import { handleResponseAsyncThunk } from 'redux/lib/handleResponseThunk';
import { collectorApi } from 'lib/api';

export const fetchCollectorsList = handleResponseAsyncThunk<
  { items: Array<Collector>; pageInfo: CurrentPageInfo },
  CollectorApiGetCollectorsListRequest
>(
  actions.fetchCollectorsActionType,
  async ({ page, size, query }) => {
    const { items, pageInfo } = await collectorApi.getCollectorsList({
      page,
      size,
      query,
    });

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
    await collectorApi.registerCollector({ collectorFormData }),
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
  async ({ collectorId, collectorFormData }) =>
    await collectorApi.updateCollector({ collectorId, collectorFormData }),
  {
    setSuccessOptions: ({ collectorFormData }) => ({
      id: `Collector-updating-${collectorFormData.name}`,
      message: `Collector ${collectorFormData.name} successfully updated.`,
    }),
  }
);

export const regenerateCollectorToken = handleResponseAsyncThunk<
  Collector,
  CollectorApiRegenerateCollectorTokenRequest
>(
  actions.regenerateCollectorTokenActionType,
  async ({ collectorId }) => await collectorApi.regenerateCollectorToken({ collectorId }),
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
    await collectorApi.deleteCollector({ collectorId });

    return collectorId;
  },
  {
    setSuccessOptions: ({ collectorId }) => ({
      id: `Collector-deleting-${collectorId}`,
      message: `Collector successfully deleted.`,
    }),
  }
);
