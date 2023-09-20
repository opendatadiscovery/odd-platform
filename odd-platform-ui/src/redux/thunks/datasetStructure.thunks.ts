import type {
  DataSetApiGetDataSetStructureByVersionIdRequest,
  DataSetApiGetDataSetStructureLatestRequest,
  DatasetFieldApiCreateEnumValueRequest,
  DatasetFieldApiGetEnumValuesRequest,
  DatasetFieldApiUpdateDatasetFieldDescriptionRequest,
  DatasetFieldApiUpdateDatasetFieldTagsRequest,
  DataSetFieldDescription,
  Tag,
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
  RelatedToEntityId<{ dataSetFieldDescription: DataSetFieldDescription }>,
  DatasetFieldApiUpdateDatasetFieldDescriptionRequest
>(
  actions.updateDataSetFieldDescriptionActionType,
  async params => {
    const dataSetFieldDescription =
      await datasetFieldApiClient.updateDatasetFieldDescription(params);

    return { entityId: params.datasetFieldId, dataSetFieldDescription };
  },
  {
    setSuccessOptions: ({ datasetFieldId }) => ({
      id: `DatasetField-description-updating-${datasetFieldId}`,
      message: `Dataset field description successfully updated.`,
    }),
  }
);

export const updateDataSetFieldTags = handleResponseAsyncThunk<
  RelatedToEntityId<{ tags: Tag[] }>,
  DatasetFieldApiUpdateDatasetFieldTagsRequest
>(
  actions.updateDataSetFieldLabelsActionType,
  async params => {
    const tags = await datasetFieldApiClient.updateDatasetFieldTags(params);

    return { entityId: params.datasetFieldId, tags };
  },
  {
    setSuccessOptions: ({ datasetFieldId }) => ({
      id: `DatasetField-tags-updating-${datasetFieldId}`,
      message: `Dataset field tags successfully updated.`,
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
