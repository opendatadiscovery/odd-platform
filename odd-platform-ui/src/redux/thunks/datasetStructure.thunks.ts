import {
  Configuration,
  DataSetApi,
  DataSetApiGetDataSetStructureByVersionIdRequest,
  DataSetApiGetDataSetStructureLatestRequest,
  DataSetField,
  DatasetFieldApi,
  DatasetFieldApiUpdateDatasetFieldRequest,
  DataSetStructure,
} from 'generated-sources';
import { createThunk } from 'redux/thunks/base.thunk';
import {
  PartialEntityUpdateParams,
  UpdateDataSetFieldFormDataParams,
} from 'redux/interfaces';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';

const apiClientConf = new Configuration(BASE_PARAMS);
const datasetApiClient = new DataSetApi(apiClientConf);
const datasetFieldApiClient = new DatasetFieldApi(apiClientConf);

export const fetchDataSetStructureLatest = createThunk<
  DataSetApiGetDataSetStructureLatestRequest,
  DataSetStructure,
  PartialEntityUpdateParams<{
    datasetStructure: DataSetStructure;
    latest?: boolean;
  }>
>(
  (params: DataSetApiGetDataSetStructureLatestRequest) =>
    datasetApiClient.getDataSetStructureLatest(params),
  actions.fetchDataSetStructureAction,
  (
    response: DataSetStructure,
    request: DataSetApiGetDataSetStructureLatestRequest
  ) => ({
    entityId: request.dataEntityId,
    value: {
      datasetStructure: response,
      latest: true,
    },
  })
);

export const fetchDataSetStructure = createThunk<
  DataSetApiGetDataSetStructureByVersionIdRequest,
  DataSetStructure,
  PartialEntityUpdateParams<{
    datasetStructure: DataSetStructure;
    latest?: boolean;
  }>
>(
  (params: DataSetApiGetDataSetStructureByVersionIdRequest) =>
    datasetApiClient.getDataSetStructureByVersionId(params),
  actions.fetchDataSetStructureAction,
  (
    response: DataSetStructure,
    request: DataSetApiGetDataSetStructureByVersionIdRequest
  ) => ({
    entityId: request.dataEntityId,
    value: {
      datasetStructure: response,
    },
  })
);

export const updateDataSetFieldFormData = createThunk<
  DatasetFieldApiUpdateDatasetFieldRequest,
  DataSetField,
  UpdateDataSetFieldFormDataParams
>(
  (params: DatasetFieldApiUpdateDatasetFieldRequest) =>
    datasetFieldApiClient.updateDatasetField(params),
  actions.updateDataSetFieldFormDataParamsAction,
  (
    response: DataSetField,
    request: DatasetFieldApiUpdateDatasetFieldRequest
  ) => ({
    datasetFieldId: request.datasetFieldId,
    internalDescription: response.internalDescription,
    labels: response.labels,
  })
);
