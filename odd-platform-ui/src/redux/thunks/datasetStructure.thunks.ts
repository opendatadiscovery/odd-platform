import {
  Configuration,
  DataSetApi,
  DataSetApiGetDataSetStructureByVersionIdRequest,
  DataSetApiGetDataSetStructureLatestRequest,
  DatasetFieldApi,
  DatasetFieldApiCreateEnumValueRequest,
  DatasetFieldApiGetEnumValuesRequest,
  DatasetFieldApiUpdateDatasetFieldRequest,
  DataSetStructure,
  EnumValueList,
} from 'generated-sources';
import {
  PartialEntityUpdateParams,
  UpdateDataSetFieldFormDataParams,
} from 'redux/interfaces';
import { createAsyncThunk } from '@reduxjs/toolkit';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';

const apiClientConf = new Configuration(BASE_PARAMS);
const datasetApiClient = new DataSetApi(apiClientConf);
const datasetFieldApiClient = new DatasetFieldApi(apiClientConf);

export const fetchDataSetStructureLatest = createAsyncThunk<
  PartialEntityUpdateParams<{
    datasetStructure: DataSetStructure;
    latest?: boolean;
  }>,
  DataSetApiGetDataSetStructureLatestRequest
>(
  actions.fetchDataSetStructureLatestActionType,
  async ({ dataEntityId }) => {
    const response = await datasetApiClient.getDataSetStructureLatest({
      dataEntityId,
    });
    return {
      entityId: dataEntityId,
      value: {
        datasetStructure: response,
        latest: true,
      },
    };
  }
);

export const fetchDataSetStructure = createAsyncThunk<
  PartialEntityUpdateParams<{
    datasetStructure: DataSetStructure;
    latest?: boolean;
  }>,
  DataSetApiGetDataSetStructureByVersionIdRequest
>(
  actions.fetchDataSetStructureActionType,
  async ({ dataEntityId, versionId }) => {
    const response = await datasetApiClient.getDataSetStructureByVersionId(
      { dataEntityId, versionId }
    );
    return {
      entityId: dataEntityId,
      value: {
        datasetStructure: response,
      },
    };
  }
);

export const updateDataSetFieldFormData = createAsyncThunk<
  UpdateDataSetFieldFormDataParams,
  DatasetFieldApiUpdateDatasetFieldRequest
>(
  actions.updateDataSetFieldFormDataParamsActionType,
  async ({ datasetFieldId, datasetFieldUpdateFormData }) => {
    const response = await datasetFieldApiClient.updateDatasetField({
      datasetFieldId,
      datasetFieldUpdateFormData,
    });
    return {
      datasetFieldId,
      internalDescription: response.internalDescription,
      labels: response.labels,
    };
  }
);

export const fetchDataSetFieldEnum = createAsyncThunk<
  PartialEntityUpdateParams<EnumValueList>,
  DatasetFieldApiGetEnumValuesRequest
>(actions.fetchDataSetFieldEnumActionType, async ({ datasetFieldId }) => {
  const response = await datasetFieldApiClient.getEnumValues({
    datasetFieldId,
  });
  return {
    entityId: datasetFieldId,
    value: response,
  };
});

export const createDataSetFieldEnum = createAsyncThunk<
  PartialEntityUpdateParams<EnumValueList>,
  DatasetFieldApiCreateEnumValueRequest
>(
  actions.createDataSetFieldEnumActionType,
  async ({ datasetFieldId, bulkEnumValueFormData }) => {
    const response = await datasetFieldApiClient.createEnumValue({
      datasetFieldId,
      bulkEnumValueFormData,
    });
    return {
      entityId: datasetFieldId,
      value: response,
    };
  }
);
