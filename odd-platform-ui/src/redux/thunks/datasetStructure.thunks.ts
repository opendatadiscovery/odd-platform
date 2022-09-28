import {
  Configuration,
  DataSetApi,
  DataSetApiGetDataSetStructureByVersionIdRequest,
  DataSetApiGetDataSetStructureLatestRequest,
  DatasetFieldApi,
  DatasetFieldApiCreateEnumValueRequest,
  DatasetFieldApiGetEnumValuesRequest,
  DatasetFieldApiUpdateDatasetFieldRequest,
} from 'generated-sources';
import {
  DataSetFieldEnumsResponse,
  DataSetStructureResponse,
  UpdateDataSetFieldFormResponse,
} from 'redux/interfaces';
import { createAsyncThunk } from '@reduxjs/toolkit';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';

const apiClientConf = new Configuration(BASE_PARAMS);
const datasetApiClient = new DataSetApi(apiClientConf);
const datasetFieldApiClient = new DatasetFieldApi(apiClientConf);

export const fetchDataSetStructureLatest = createAsyncThunk<
  DataSetStructureResponse,
  DataSetApiGetDataSetStructureLatestRequest
>(actions.fetchDataSetStructureLatestActionType, async ({ dataEntityId }) => {
  const { dataSetVersion, fieldList } = await datasetApiClient.getDataSetStructureLatest({
    dataEntityId,
  });

  return {
    dataEntityId,
    dataSetVersionId: dataSetVersion.id,
    fieldList,
    isLatestVersion: true,
  };
});

export const fetchDataSetStructure = createAsyncThunk<
  DataSetStructureResponse,
  DataSetApiGetDataSetStructureByVersionIdRequest
>(actions.fetchDataSetStructureActionType, async ({ dataEntityId, versionId }) => {
  const { dataSetVersion, fieldList } =
    await datasetApiClient.getDataSetStructureByVersionId({
      dataEntityId,
      versionId,
    });

  return {
    dataEntityId,
    dataSetVersionId: dataSetVersion.id,
    fieldList,
    isLatestVersion: false,
  };
});

export const updateDataSetFieldFormData = createAsyncThunk<
  UpdateDataSetFieldFormResponse,
  DatasetFieldApiUpdateDatasetFieldRequest
>(
  actions.updateDataSetFieldFormDataParamsActionType,
  async ({ datasetFieldId, datasetFieldUpdateFormData }) => {
    const { internalDescription, labels } =
      await datasetFieldApiClient.updateDatasetField({
        datasetFieldId,
        datasetFieldUpdateFormData,
      });

    return { datasetFieldId, internalDescription, labels };
  }
);

export const fetchDataSetFieldEnum = createAsyncThunk<
  DataSetFieldEnumsResponse,
  DatasetFieldApiGetEnumValuesRequest
>(actions.fetchDataSetFieldEnumActionType, async ({ datasetFieldId }) => {
  const { items } = await datasetFieldApiClient.getEnumValues({
    datasetFieldId,
  });

  return { datasetFieldId, enumValueList: items };
});

export const createDataSetFieldEnum = createAsyncThunk<
  DataSetFieldEnumsResponse,
  DatasetFieldApiCreateEnumValueRequest
>(
  actions.createDataSetFieldEnumActionType,
  async ({ datasetFieldId, bulkEnumValueFormData }) => {
    const { items } = await datasetFieldApiClient.createEnumValue({
      datasetFieldId,
      bulkEnumValueFormData,
    });

    return { datasetFieldId, enumValueList: items };
  }
);
