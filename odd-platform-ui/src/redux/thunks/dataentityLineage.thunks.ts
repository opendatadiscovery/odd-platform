import {
  DataEntityApi,
  Configuration,
  DataEntityLineage,
  DataEntityApiGetDataEntityLineageRequest,
} from 'generated-sources';
import { createThunk } from 'redux/thunks/base.thunk';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';
import { PartialEntityUpdateParams } from 'redux/interfaces';

const apiClientConf = new Configuration(BASE_PARAMS);
const apiClient = new DataEntityApi(apiClientConf);

export const fetchDataEntityLineage = createThunk<
  DataEntityApiGetDataEntityLineageRequest,
  DataEntityLineage,
  PartialEntityUpdateParams<DataEntityLineage>
>(
  (params: DataEntityApiGetDataEntityLineageRequest) =>
    apiClient.getDataEntityLineage(params),
  actions.fetchDataEntityLineageAction,
  (
    response: DataEntityLineage,
    request: DataEntityApiGetDataEntityLineageRequest
  ) => ({
    entityId: request.dataEntityId,
    value: response,
  })
);
