import {
  CollectorApi,
  Configuration,
  CollectorList,
  Collector,
  CollectorApiGetCollectorsListRequest,
  CollectorApiUpdateCollectorRequest,
  CollectorApiRegisterCollectorRequest,
  CollectorApiDeleteCollectorRequest,
  CollectorApiRegenerateCollectorTokenRequest,
} from 'generated-sources';
import { createThunk } from 'redux/thunks/base.thunk';
import { DeleteCollector } from 'redux/interfaces/collectors';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';
import { PaginatedResponse } from 'redux/interfaces/common';

const apiClientConf = new Configuration(BASE_PARAMS);
const apiClient = new CollectorApi(apiClientConf);

export const fetchCollectorsList = createThunk<
  CollectorApiGetCollectorsListRequest,
  CollectorList,
  PaginatedResponse<CollectorList>
>(
  (params: CollectorApiGetCollectorsListRequest) =>
    apiClient.getCollectorsList(params),
  actions.fetchCollectorsAction,
  (
    response: CollectorList,
    request: CollectorApiGetCollectorsListRequest
  ) => ({
    ...response,
    pageInfo: {
      ...response.pageInfo,
      page: request.page,
      hasNext: request.size * request.page < response.pageInfo.total,
    },
  })
);

export const updateCollector = createThunk<
  CollectorApiUpdateCollectorRequest,
  Collector,
  Collector
>(
  (params: CollectorApiUpdateCollectorRequest) =>
    apiClient.updateCollector(params),
  actions.updateCollectorAction,
  (result: Collector) => result
);

export const regenerateCollectorToken = createThunk<
  CollectorApiRegenerateCollectorTokenRequest,
  Collector,
  Collector
>(
  (params: CollectorApiRegenerateCollectorTokenRequest) =>
    apiClient.regenerateCollectorToken(params),
  actions.regenerateCollectorTokenAction,
  (result: Collector) => result
);

export const registerCollector = createThunk<
  CollectorApiRegisterCollectorRequest,
  Collector,
  Collector
>(
  (params: CollectorApiRegisterCollectorRequest) =>
    apiClient.registerCollector(params),
  actions.registerCollectorAction,
  (result: Collector) => result
);

export const deleteCollector = createThunk<
  CollectorApiDeleteCollectorRequest,
  void,
  DeleteCollector
>(
  (params: CollectorApiDeleteCollectorRequest) =>
    apiClient.deleteCollector(params),
  actions.deleteCollectorAction,
  (_, request: CollectorApiDeleteCollectorRequest) => ({
    collectorId: request.collectorId,
  })
);
