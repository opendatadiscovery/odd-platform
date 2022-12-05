import {
  Configuration,
  DataEntityApi,
  type DataEntityApiGetDataEntityDownstreamLineageRequest,
  type DataEntityApiGetDataEntityUpstreamLineageRequest,
} from 'generated-sources';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';
import type {
  DataEntityLineageRequestParams,
  DataEntityLineageResponse,
} from 'redux/interfaces';
import { handleResponseAsyncThunk } from 'redux/lib/handleResponseThunk';

const apiClientConf = new Configuration(BASE_PARAMS);
const dataEntityApi = new DataEntityApi(apiClientConf);

export const fetchDataEntityDownstreamLineage = handleResponseAsyncThunk<
  DataEntityLineageResponse,
  DataEntityApiGetDataEntityDownstreamLineageRequest & DataEntityLineageRequestParams
>(
  actions.fetchDataEntityDownstreamLineageActionType,
  async ({ dataEntityId, lineageDepth, rootNodeId, expandGroups }) => {
    const dataEntityLineage = await dataEntityApi.getDataEntityDownstreamLineage({
      dataEntityId,
      lineageDepth,
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
  async ({ dataEntityId, lineageDepth, rootNodeId, expandGroups }) => {
    const dataEntityLineage = await dataEntityApi.getDataEntityUpstreamLineage({
      dataEntityId,
      lineageDepth,
    });
    return { rootNodeId, dataEntityId, dataEntityLineage, expandGroups };
  },
  { switchOffErrorMessage: true }
);
