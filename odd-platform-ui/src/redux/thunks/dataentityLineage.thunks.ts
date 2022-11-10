import {
  Configuration,
  DataEntityApi,
  type DataEntityApiGetDataEntityDownstreamLineageRequest,
  type DataEntityApiGetDataEntityUpstreamLineageRequest,
  type DataEntityLineage,
} from 'generated-sources';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';
import type { DataEntityLineageRootNodeId } from 'redux/interfaces';
import { handleResponseAsyncThunk } from 'redux/lib/handleResponseThunk';

const apiClientConf = new Configuration(BASE_PARAMS);
const dataEntityApi = new DataEntityApi(apiClientConf);

export const fetchDataEntityDownstreamLineage = handleResponseAsyncThunk<
  { rootNodeId: number; dataEntityId: number; dataEntityLineage: DataEntityLineage },
  DataEntityApiGetDataEntityDownstreamLineageRequest & DataEntityLineageRootNodeId
>(
  actions.fetchDataEntityDownstreamLineageActionType,
  async ({ dataEntityId, lineageDepth, rootNodeId }) => {
    const dataEntityLineage = await dataEntityApi.getDataEntityDownstreamLineage({
      dataEntityId,
      lineageDepth,
    });

    return { rootNodeId, dataEntityId, dataEntityLineage };
  },
  { switchOffErrorMessage: true }
);

export const fetchDataEntityUpstreamLineage = handleResponseAsyncThunk<
  { rootNodeId: number; dataEntityId: number; dataEntityLineage: DataEntityLineage },
  DataEntityApiGetDataEntityUpstreamLineageRequest & DataEntityLineageRootNodeId
>(
  actions.fetchDataEntityUpstreamLineageActionType,
  async ({ dataEntityId, lineageDepth, rootNodeId }) => {
    const dataEntityLineage = await dataEntityApi.getDataEntityUpstreamLineage({
      dataEntityId,
      lineageDepth,
    });
    return { rootNodeId, dataEntityId, dataEntityLineage };
  },
  { switchOffErrorMessage: true }
);
