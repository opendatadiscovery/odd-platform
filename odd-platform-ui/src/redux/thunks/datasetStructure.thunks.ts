import {
  Configuration,
  DataSetApi,
  type DataSetApiGetDataSetStructureByVersionIdRequest,
  type DataSetApiGetDataSetStructureLatestRequest,
  DatasetFieldApi,
  type DatasetFieldApiCreateEnumValueRequest,
  type DatasetFieldApiGetEnumValuesRequest,
} from 'generated-sources';
import type {
  DataSetFieldEnumsResponse,
  DataSetStructureResponse,
  UpdateDataSetFieldFormResponse,
} from 'redux/interfaces';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';
import { handleResponseAsyncThunk } from 'redux/lib/handleResponseThunk';

const apiClientConf = new Configuration(BASE_PARAMS);
const datasetApiClient = new DataSetApi(apiClientConf);
const datasetFieldApiClient = new DatasetFieldApi(apiClientConf);

export const fetchDataSetStructureLatest = handleResponseAsyncThunk<
  DataSetStructureResponse,
  DataSetApiGetDataSetStructureLatestRequest
>(
  actions.fetchDataSetStructureLatestActionType,
  async ({ dataEntityId }) => {
    const { dataSetVersion, fieldList } =
      await datasetApiClient.getDataSetStructureLatest({ dataEntityId });

    return {
      dataEntityId,
      dataSetVersionId: dataSetVersion.id,
      fieldList,
      isLatestVersion: true,
    };
  },
  { switchOffErrorMessage: true }
);

export const fetchDataSetStructure = handleResponseAsyncThunk<
  DataSetStructureResponse,
  DataSetApiGetDataSetStructureByVersionIdRequest
>(
  actions.fetchDataSetStructureActionType,
  async ({ dataEntityId, versionId }) => {
    const { dataSetVersion, fieldList } =
      await datasetApiClient.getDataSetStructureByVersionId({ dataEntityId, versionId });

    return {
      dataEntityId,
      dataSetVersionId: dataSetVersion.id,
      fieldList,
      isLatestVersion: false,
    };
  },
  { switchOffErrorMessage: true }
);

export const updateDataSetFieldFormData =
  handleResponseAsyncThunk<UpdateDataSetFieldFormResponse>(
    actions.updateDataSetFieldFormDataParamsActionType,
    async () => {
      // const { internalDescription, labels } =
      //   await datasetFieldApiClient.updateDatasetField({
      //     datasetFieldId,
      //     datasetFieldUpdateFormData,
      //   });
      console.log('aaaa');
      return { datasetFieldId: 1, internalDescription: '', labels: [] };
    },
    {
      setSuccessOptions: () => ({
        id: `DatasetField-form-updating`,
        message: `Dataset field labels and description successfully updated.`,
      }),
    }
  );

export const fetchDataSetFieldEnum = handleResponseAsyncThunk<
  DataSetFieldEnumsResponse,
  DatasetFieldApiGetEnumValuesRequest
>(
  actions.fetchDataSetFieldEnumActionType,
  async ({ datasetFieldId }) => {
    const { items } = await datasetFieldApiClient.getEnumValues({
      datasetFieldId,
    });

    return { datasetFieldId, enumValueList: items };
  },
  {}
);

export const createDataSetFieldEnum = handleResponseAsyncThunk<
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
  },
  {
    setSuccessOptions: ({ datasetFieldId }) => ({
      id: `DatasetField-form-enums-updating-${datasetFieldId}`,
      message: `Dataset field enums successfully updated.`,
    }),
  }
);
