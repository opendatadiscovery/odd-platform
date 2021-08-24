import {
  DataEntityApi,
  Configuration,
  DataEntityLineage,
  DataEntityApiGetDataEntityDownstreamLineageRequest,
} from 'generated-sources';
import { createThunk } from 'redux/thunks/base.thunk';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';
import { PartialEntityUpdateParams } from 'redux/interfaces';

const apiClientConf = new Configuration(BASE_PARAMS);
const apiClient = new DataEntityApi(apiClientConf);

export const fetchDataEntityLineage = createThunk<
  DataEntityApiGetDataEntityDownstreamLineageRequest,
  DataEntityLineage,
  PartialEntityUpdateParams<DataEntityLineage>
>(
  (params: DataEntityApiGetDataEntityDownstreamLineageRequest) =>
    apiClient.getDataEntityDownstreamLineage(params),
  actions.fetchDataEntityLineageAction,
  (
    response: DataEntityLineage,
    request: DataEntityApiGetDataEntityDownstreamLineageRequest
  ) => ({
    entityId: request.dataEntityId,
    value: response,
  })
);
