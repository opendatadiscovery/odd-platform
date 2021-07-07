import {
  DataEntityApi,
  Configuration,
  DataEntityLineage,
  DataEntityApiGetDataEntityLineageRequest,
} from 'generated-sources';
import { createThunk } from 'redux/thunks/base.thunk';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';
import { PartialDataEntityUpdateParams } from '../interfaces/dataentities';

const apiClientConf = new Configuration(BASE_PARAMS);
const apiClient = new DataEntityApi(apiClientConf);

export const fetchDataEntityLineage = createThunk<
  DataEntityApiGetDataEntityLineageRequest,
  DataEntityLineage,
  PartialDataEntityUpdateParams<DataEntityLineage>
>(
  (params: DataEntityApiGetDataEntityLineageRequest) =>
    apiClient.getDataEntityLineage(params),
  actions.fetchDataEntityLineageAction,
  (
    response: DataEntityLineage,
    request: DataEntityApiGetDataEntityLineageRequest
  ) => ({
    dataEntityId: request.dataEntityId,
    value: response,
  })
);
