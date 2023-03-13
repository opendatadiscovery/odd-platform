import type {
  DatasetFieldApiUpdateDatasetFieldDescriptionRequest,
  DataSetFieldDescription,
  DatasetFieldApiUpdateDatasetFieldLabelsRequest,
  Label,
  DataSetApiGetDataSetStructureByVersionIdRequest,
  DataSetApiGetDataSetStructureLatestRequest,
  DatasetFieldApiCreateEnumValueRequest,
  DatasetFieldApiGetEnumValuesRequest,
} from 'generated-sources';
import type {
  DataSetFieldEnumsResponse,
  DataSetStructureResponse,
  RelatedToEntityId,
} from 'redux/interfaces';
import * as actions from 'redux/actions';
import { handleResponseAsyncThunk } from 'redux/lib/handleResponseThunk';
import { datasetApiClient, datasetFieldApiClient } from 'lib/api';

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

export const updateDataSetFieldDescription = handleResponseAsyncThunk<
  RelatedToEntityId<DataSetFieldDescription>,
  DatasetFieldApiUpdateDatasetFieldDescriptionRequest
>(
  actions.updateDataSetFieldDescriptionActionType,
  async params => {
    const { description } = await datasetFieldApiClient.updateDatasetFieldDescription(
      params
    );

    return { entityId: params.datasetFieldId, description };
  },
  {
    setSuccessOptions: ({ datasetFieldId }) => ({
      id: `DatasetField-description-updating-${datasetFieldId}`,
      message: `Dataset field description successfully updated.`,
    }),
  }
);

export const updateDataSetFieldLabels = handleResponseAsyncThunk<
  RelatedToEntityId<{ labels: Label[] }>,
  DatasetFieldApiUpdateDatasetFieldLabelsRequest
>(
  actions.updateDataSetFieldLabelsActionType,
  async params => {
    const labels = await datasetFieldApiClient.updateDatasetFieldLabels(params);

    return { entityId: params.datasetFieldId, labels };
  },
  {
    setSuccessOptions: ({ datasetFieldId }) => ({
      id: `DatasetField-labels-updating-${datasetFieldId}`,
      message: `Dataset field labels successfully updated.`,
    }),
  }
);

export const fetchDataSetFieldEnum = handleResponseAsyncThunk<
  DataSetFieldEnumsResponse,
  DatasetFieldApiGetEnumValuesRequest
>(
  actions.fetchDataSetFieldEnumActionType,
  async ({ datasetFieldId }) => {
    const enumValueList = await datasetFieldApiClient.getEnumValues({ datasetFieldId });

    return { datasetFieldId, enumValueList };
  },
  {}
);

export const createDataSetFieldEnum = handleResponseAsyncThunk<
  DataSetFieldEnumsResponse,
  DatasetFieldApiCreateEnumValueRequest
>(
  actions.createDataSetFieldEnumActionType,
  async ({ datasetFieldId, bulkEnumValueFormData }) => {
    const enumValueList = await datasetFieldApiClient.createEnumValue({
      datasetFieldId,
      bulkEnumValueFormData,
    });

    return { datasetFieldId, enumValueList };
  },
  {
    setSuccessOptions: ({ datasetFieldId }) => ({
      id: `DatasetField-form-enums-updating-${datasetFieldId}`,
      message: `Dataset field enums successfully updated.`,
    }),
  }
);
