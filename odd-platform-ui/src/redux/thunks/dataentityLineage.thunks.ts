import type {
  DataEntityApiGetDataEntityDownstreamLineageRequest,
  DataEntityApiGetDataEntityUpstreamLineageRequest,
} from 'generated-sources';
import * as actions from 'redux/actions';
import type {
  DataEntityLineageRequestParams,
  DataEntityLineageResponse,
} from 'redux/interfaces';
import { handleResponseAsyncThunk } from 'redux/lib/handleResponseThunk';
import { dataEntityApi } from 'lib/api';

export const fetchDataEntityDownstreamLineage = handleResponseAsyncThunk<
  DataEntityLineageResponse,
  DataEntityApiGetDataEntityDownstreamLineageRequest & DataEntityLineageRequestParams
>(
  actions.fetchDataEntityDownstreamLineageActionType,
  async ({ dataEntityId, lineageDepth, rootNodeId, expandGroups, expandedEntityIds }) => {
    const dataEntityLineage = await dataEntityApi.getDataEntityDownstreamLineage({
      dataEntityId,
      lineageDepth,
      expandedEntityIds,
    });

    return { rootNodeId, dataEntityId, dataEntityLineage, expandGroups };
  },
  { switchOffErrorMessage: true }
);

export const fetchDataEntityUpstreamLineage = handleResponseAsyncThunk<
  DataEntityLineageResponse,
  DataEntityApiGetDataEntityUpstreamLineageRequest & DataEntityLineageRequestParams
>(
  actions.fetchDataEntityUpstreamLineageActionType,
  async ({ dataEntityId, lineageDepth, rootNodeId, expandGroups, expandedEntityIds }) => {
    const dataEntityLineage = await dataEntityApi.getDataEntityUpstreamLineage({
      dataEntityId,
      lineageDepth,
      expandedEntityIds,
    });
    return { rootNodeId, dataEntityId, dataEntityLineage, expandGroups };
  },
  { switchOffErrorMessage: true }
);
