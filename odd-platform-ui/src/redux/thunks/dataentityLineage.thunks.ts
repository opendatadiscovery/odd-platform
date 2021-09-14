import {
  DataEntityApi,
  Configuration,
  DataEntityLineage,
  DataEntityApiGetDataEntityDownstreamLineageRequest,
  DataEntityApiGetDataEntityUpstreamLineageRequest,
} from 'generated-sources';
import { createThunk } from 'redux/thunks/base.thunk';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';
import { PartialEntityUpdateParams } from 'redux/interfaces';
import {
  DataEntityLineageRootNodeId,
  LineageStreamParams,
} from 'redux/interfaces/dataentityLineage';

const apiClientConf = new Configuration(BASE_PARAMS);
const apiClient = new DataEntityApi(apiClientConf);

export const fetchDataEntityDownstreamLineage = createThunk<
  DataEntityApiGetDataEntityDownstreamLineageRequest &
    DataEntityLineageRootNodeId,
  DataEntityLineage,
  PartialEntityUpdateParams<LineageStreamParams>
>(
  (
    params: DataEntityApiGetDataEntityDownstreamLineageRequest &
      DataEntityLineageRootNodeId
  ) => apiClient.getDataEntityDownstreamLineage(params),
  actions.fetchDataEntityDownstreamLineageAction,
  (
    response: DataEntityLineage,
    request: DataEntityApiGetDataEntityDownstreamLineageRequest &
      DataEntityLineageRootNodeId
  ) => ({
    entityId: request.dataEntityId,
    value: { dataEntityLineage: response, rootNodeId: request.rootNodeId },
  })
);

export const fetchDataEntityUpstreamLineage = createThunk<
  DataEntityApiGetDataEntityDownstreamLineageRequest &
    DataEntityLineageRootNodeId,
  DataEntityLineage,
  PartialEntityUpdateParams<LineageStreamParams>
>(
  (
    params: DataEntityApiGetDataEntityUpstreamLineageRequest &
      DataEntityLineageRootNodeId
  ) => apiClient.getDataEntityUpstreamLineage(params),
  actions.fetchDataEntityUpstreamLineageAction,
  (
    response: DataEntityLineage,
    request: DataEntityApiGetDataEntityUpstreamLineageRequest &
      DataEntityLineageRootNodeId
  ) => ({
    entityId: request.dataEntityId,
    value: { dataEntityLineage: response, rootNodeId: request.rootNodeId },
  })
);
