import {
  DataSetApi,
  Configuration,
  DataSetStructure,
  DatasetFieldApi,
  InternalDescription,
  Label,
  DataSetApiGetDataSetStructureLatestRequest,
  DataSetApiGetDataSetStructureByVersionIdRequest,
  DatasetFieldApiUpsertDatasetFieldInternalDescriptionRequest,
  DatasetFieldApiUpsertDatasetFieldLabelsRequest,
} from 'generated-sources';
import { createThunk } from 'redux/thunks/base.thunk';
import { PartialDataEntityUpdateParams } from 'redux/interfaces/dataentities';
import {
  UpdateDataSetFieldInternalDescriptionParams,
  UpdateDataSetFieldLabelsParams,
} from 'redux/interfaces/datasetStructure';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';

const apiClientConf = new Configuration(BASE_PARAMS);
const datasetApiClient = new DataSetApi(apiClientConf);
const datasetFieldApiClient = new DatasetFieldApi(apiClientConf);

export const fetchDataSetStructureLatest = createThunk<
  DataSetApiGetDataSetStructureLatestRequest,
  DataSetStructure,
  PartialDataEntityUpdateParams<{
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
    dataEntityId: request.dataEntityId,
    value: {
      datasetStructure: response,
      latest: true,
    },
  })
);

export const fetchDataSetStructure = createThunk<
  DataSetApiGetDataSetStructureByVersionIdRequest,
  DataSetStructure,
  PartialDataEntityUpdateParams<{
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
    dataEntityId: request.dataEntityId,
    value: {
      datasetStructure: response,
    },
  })
);

export const updateDataSetFieldDescription = createThunk<
  DatasetFieldApiUpsertDatasetFieldInternalDescriptionRequest,
  InternalDescription,
  UpdateDataSetFieldInternalDescriptionParams
>(
  (params: DatasetFieldApiUpsertDatasetFieldInternalDescriptionRequest) =>
    datasetFieldApiClient.upsertDatasetFieldInternalDescription(params),
  actions.updateDataSetFieldInternalDescriptionParamsAction,
  (
    response: InternalDescription,
    request: DatasetFieldApiUpsertDatasetFieldInternalDescriptionRequest
  ) => ({
    datasetFieldId: request.datasetFieldId,
    internalDescription: response.internalDescription,
  })
);

export const updateDataSetFieldLabels = createThunk<
  DatasetFieldApiUpsertDatasetFieldLabelsRequest,
  Label[],
  UpdateDataSetFieldLabelsParams
>(
  (params: DatasetFieldApiUpsertDatasetFieldLabelsRequest) =>
    datasetFieldApiClient.upsertDatasetFieldLabels(params),
  actions.updateDataSetFieldLabelsParamsAction,
  (
    response: Label[],
    request: DatasetFieldApiUpsertDatasetFieldLabelsRequest
  ) => ({
    datasetFieldId: request.datasetFieldId,
    labels: response,
  })
);
