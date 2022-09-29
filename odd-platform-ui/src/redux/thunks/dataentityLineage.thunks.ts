import {
  Configuration,
  DataEntityApi,
  DataEntityApiGetDataEntityDownstreamLineageRequest,
  DataEntityApiGetDataEntityUpstreamLineageRequest,
  DataEntityLineage,
} from 'generated-sources';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';
import { DataEntityLineageRootNodeId } from 'redux/interfaces/dataentityLineage';
import { createAsyncThunk } from '@reduxjs/toolkit';

const apiClientConf = new Configuration(BASE_PARAMS);
const dataEntityApi = new DataEntityApi(apiClientConf);

export const fetchDataEntityDownstreamLineage = createAsyncThunk<
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
  }
);

export const fetchDataEntityUpstreamLineage = createAsyncThunk<
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
  }
);
